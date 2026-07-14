"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatGateway = class ChatGateway {
    constructor(prisma) {
        this.prisma = prisma;
        this.waitingQueue = [];
        this.activeMatches = new Map();
        this.connectedSockets = new Set();
    }
    handleConnection(client) {
        console.log(`Socket client connected: ${client.id}`);
        this.connectedSockets.add(client.id);
    }
    handleDisconnect(client) {
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
    cleanUpMatch(socketId) {
        const match = this.activeMatches.get(socketId);
        if (match) {
            const partnerSocketId = match.partnerSocketId;
            const roomId = match.room;
            console.log(`Cleaning up match: ${socketId} <-> ${partnerSocketId}`);
            this.server.to(partnerSocketId).emit('partnerDisconnected');
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
    async handleJoinChannel(client, channelId) {
        client.join(channelId);
        console.log(`Client ${client.id} joined channel room: ${channelId}`);
        return { status: 'joined', channelId };
    }
    async handleMessage(client, payload) {
        const { channelId, senderId, content } = payload;
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
        this.server.to(channelId).emit('messageReceived', broadcastPayload);
        console.log(`Message broadcasted to room ${channelId}: "${content}"`);
    }
    handleRequestMatch(client, payload) {
        const { userId, country } = payload;
        const interests = Array.isArray(payload.interests) ? payload.interests.filter(Boolean) : [];
        console.log(`Match requested by ${client.id} (user: ${userId}) for country: ${country}, interests: ${interests.join(', ') || 'none'}`);
        this.waitingQueue = this.waitingQueue.filter((u) => u.socketId !== client.id);
        const eligible = this.waitingQueue.filter((u) => {
            if (u.socketId === client.id)
                return false;
            if (country === 'Global')
                return true;
            return u.country === country || u.country === 'Global';
        });
        let bestMatch = null;
        let bestShared = [];
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
            console.log(`Match found: ${client.id} <-> ${partner.socketId} in room ${roomId}, shared interests: ${bestShared.join(', ') || 'none'}`);
            client.emit('matchFound', {
                role: 'caller',
                room: roomId,
                partnerId: partner.userId,
                sharedInterests: bestShared,
            });
            this.server.to(partner.socketId).emit('matchFound', {
                role: 'callee',
                room: roomId,
                partnerId: userId,
                sharedInterests: bestShared,
            });
        }
        else {
            this.waitingQueue.push({
                socketId: client.id,
                userId,
                country,
                interests,
            });
            console.log(`User ${client.id} added to waiting queue. Size: ${this.waitingQueue.length}`);
        }
    }
    handleWebRtcSignal(client, payload) {
        const match = this.activeMatches.get(client.id);
        if (match && match.room === payload.room) {
            this.server.to(match.partnerSocketId).emit('webrtcSignalReceived', {
                signal: payload.signal,
            });
        }
    }
    handleMatchMessage(client, payload) {
        const match = this.activeMatches.get(client.id);
        if (match && match.room === payload.room) {
            this.server.to(match.partnerSocketId).emit('matchMessageReceived', {
                content: payload.content,
                senderName: payload.senderName,
                createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
        }
    }
    handleLeaveMatch(client) {
        this.cleanUpMatch(client.id);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestMatch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleRequestMatch", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtcSignal'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleWebRtcSignal", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMatchMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleMatchMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveMatch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveMatch", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map