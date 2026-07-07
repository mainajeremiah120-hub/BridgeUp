import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private waitingQueue: { socketId: string; userId: string; country: string; interests: string[] }[] = [];
  private activeMatches = new Map<string, { partnerSocketId: string; room: string }>();
  private connectedSockets = new Set<string>();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Socket client connected: ${client.id}`);
    this.connectedSockets.add(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket client disconnected: ${client.id}`);
    this.connectedSockets.delete(client.id);
    this.waitingQueue = this.waitingQueue.filter((u) => u.socketId !== client.id);
    this.cleanUpMatch(client.id);
  }

  getStats() {
    return {
      onlineNow: this.connectedSockets.size,
      searchingNow: this.waitingQueue.length,
      activeMatches: Math.floor(this.activeMatches.size / 2),
    };
  }

  private cleanUpMatch(socketId: string) {
    const match = this.activeMatches.get(socketId);
    if (match) {
      const partnerSocketId = match.partnerSocketId;
      const roomId = match.room;
      console.log(`Cleaning up match: ${socketId} <-> ${partnerSocketId}`);

      // Notify the partner
      this.server.to(partnerSocketId).emit('partnerDisconnected');

      // Leave socket rooms
      const clientSocket = this.server.sockets.sockets.get(socketId);
      if (clientSocket) {
        clientSocket.leave(roomId);
      }
      const partnerSocket = this.server.sockets.sockets.get(partnerSocketId);
      if (partnerSocket) {
        partnerSocket.leave(roomId);
      }

      this.activeMatches.delete(socketId);
      this.activeMatches.delete(partnerSocketId);
    }
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(client: Socket, channelId: string) {
    client.join(channelId);
    console.log(`Client ${client.id} joined channel room: ${channelId}`);
    return { status: 'joined', channelId };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { channelId: string; senderId: string; content: string }
  ) {
    const { channelId, senderId, content } = payload;

    // Save message to database
    const savedMessage = await this.prisma.message.create({
      data: {
        channelId,
        senderId,
        content,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });

    const broadcastPayload = {
      id: savedMessage.id,
      content: savedMessage.content,
      senderName: savedMessage.sender?.profile?.fullName || 'Anonymous',
      createdAt: savedMessage.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Broadcast message to everyone in the channel room
    this.server.to(channelId).emit('messageReceived', broadcastPayload);
    
    console.log(`Message broadcasted to room ${channelId}: "${content}"`);
  }

  @SubscribeMessage('requestMatch')
  handleRequestMatch(
    client: Socket,
    payload: { userId: string; country: string; interests?: string[] }
  ) {
    const { userId, country } = payload;
    const interests = Array.isArray(payload.interests) ? payload.interests.filter(Boolean) : [];
    console.log(
      `Match requested by ${client.id} (user: ${userId}) for country: ${country}, interests: ${interests.join(', ') || 'none'}`
    );

    // Remove client if already in queue
    this.waitingQueue = this.waitingQueue.filter((u) => u.socketId !== client.id);

    // Eligible candidates follow the existing country rule: Global can match with
    // anyone, otherwise same country or a Global searcher.
    const eligible = this.waitingQueue.filter((u) => {
      if (u.socketId === client.id) return false;
      if (country === 'Global') return true;
      return u.country === country || u.country === 'Global';
    });

    // Among eligible candidates, prefer whoever shares the most interests (the
    // "smart match" that differentiates BridgeUp from a plain random Ome.tv queue).
    // Falls back to plain country/global matching when nobody shares an interest.
    let bestMatch: (typeof this.waitingQueue)[number] | null = null;
    let bestShared: string[] = [];

    for (const candidate of eligible) {
      const shared = candidate.interests.filter((interest) => interests.includes(interest));
      if (!bestMatch || shared.length > bestShared.length) {
        bestMatch = candidate;
        bestShared = shared;
      }
    }

    if (bestMatch) {
      const partner = bestMatch;
      this.waitingQueue = this.waitingQueue.filter((u) => u.socketId !== partner.socketId);

      const roomId = `match_${client.id}_${partner.socketId}`;
      client.join(roomId);

      const partnerSocket = this.server.sockets.sockets.get(partner.socketId);
      if (partnerSocket) {
        partnerSocket.join(roomId);
      }

      this.activeMatches.set(client.id, { partnerSocketId: partner.socketId, room: roomId });
      this.activeMatches.set(partner.socketId, { partnerSocketId: client.id, room: roomId });

      console.log(
        `Match found: ${client.id} <-> ${partner.socketId} in room ${roomId}, shared interests: ${bestShared.join(', ') || 'none'}`
      );

      // Notify caller
      client.emit('matchFound', {
        role: 'caller',
        room: roomId,
        partnerId: partner.userId,
        sharedInterests: bestShared,
      });

      // Notify callee
      this.server.to(partner.socketId).emit('matchFound', {
        role: 'callee',
        room: roomId,
        partnerId: userId,
        sharedInterests: bestShared,
      });
    } else {
      // Put in queue
      this.waitingQueue.push({
        socketId: client.id,
        userId,
        country,
        interests,
      });
      console.log(`User ${client.id} added to waiting queue. Size: ${this.waitingQueue.length}`);
    }
  }

  @SubscribeMessage('webrtcSignal')
  handleWebRtcSignal(
    client: Socket,
    payload: { room: string; signal: any }
  ) {
    const match = this.activeMatches.get(client.id);
    if (match && match.room === payload.room) {
      this.server.to(match.partnerSocketId).emit('webrtcSignalReceived', {
        signal: payload.signal,
      });
    }
  }

  @SubscribeMessage('sendMatchMessage')
  handleMatchMessage(
    client: Socket,
    payload: { room: string; content: string; senderName: string }
  ) {
    const match = this.activeMatches.get(client.id);
    if (match && match.room === payload.room) {
      this.server.to(match.partnerSocketId).emit('matchMessageReceived', {
        content: payload.content,
        senderName: payload.senderName,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  }

  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(client: Socket) {
    this.cleanUpMatch(client.id);
  }
}
