import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth-context';
import { Compass, User, LogOut, LogIn, UserPlus, Network, Video, MessageSquare, CalendarDays } from 'lucide-react';
import { InstallPrompt } from '@/components/install-prompt';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background text-text-primary flex flex-col overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-text-primary hover:opacity-90">
            <span className="text-primary">BridgeUp</span>
            <Network className="h-5 w-5 text-blue-400" />
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/explorer" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${router.pathname === '/explorer' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                  <Compass className="h-4 w-4" />
                  Explorer
                </Link>
                <Link href="/live-match" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${router.pathname === '/live-match' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                  <Video className="h-4 w-4" />
                  Live Match
                </Link>
                <Link href="/discussions" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${router.pathname === '/discussions' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                  <MessageSquare className="h-4 w-4" />
                  Discussions
                </Link>
                <Link href="/events" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${router.pathname === '/events' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                  <CalendarDays className="h-4 w-4" />
                  Events
                </Link>
                <Link href="/profile" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${router.pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); router.push('/'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  <LogIn className="h-4 w-4" />
                  Log In
                </Link>
                <Link href="/signup" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-white rounded-lg transition-all shadow-md shadow-primary/20">
                  <UserPlus className="h-4 w-4" />
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background py-6 mt-12 text-center text-text-muted text-xs">
        <p>© {new Date().getFullYear()} BridgeUp. Designed for global peer connections, collaboration, and mentorship. Not a dating app.</p>
      </footer>

      <InstallPrompt />
    </div>
  );
};
