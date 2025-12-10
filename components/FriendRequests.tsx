"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Check, X, UserPlus } from 'lucide-react';

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  message?: string;
  sentAt: Date;
  sender?: {
    id: string;
    name: string;
    image?: string;
    bio?: string;
  };
  receiver?: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function FriendRequests() {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch initial friend requests
  useEffect(() => {
    if (session?.user?.id) {
      fetchFriendRequests();
    }
  }, [session?.user?.id]);

  // Listen for real-time friend requests
  useEffect(() => {
    if (!socket || !isConnected) return;

    if (session?.user?.id) {
      socket.emit('join', String(session.user.id));
    }

    // Listen for new friend requests
    socket.on('friend-request-received', ({ friendRequest }) => {
      
      setRequests(prev => [friendRequest, ...prev]);
    });

    // Listen for accepted friend requests (if user sent request)
    socket.on('friend-request-accepted', ({ friendRequestId }) => {
      console.log('✅ Friend request accepted:', friendRequestId);
      
      // Remove from list if it was in sent requests
      setRequests(prev => prev.filter(r => r.id !== friendRequestId));
    });

    return () => {
      socket.off('friend-request-received');
      socket.off('friend-request-accepted');
    };
  }, [socket, isConnected, session?.user?.id]);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends/request?type=received');
      const data = await response.json();

      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading(requestId);

      const response = await fetch(`/api/friends/request/${requestId}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        alert(data.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      setActionLoading(requestId);

      const response = await fetch(`/api/friends/request/${requestId}/decline`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        alert(data.error || 'Failed to decline friend request');
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert('Failed to decline friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = requests.length;

  return (
    <div className="relative">
      {/* Friend Requests Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Users className="w-6 h-6 text-gray-700" />
        
        {/* Pending Count Badge */}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}

        {/* Connection Status */}
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Friend Requests Panel */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Friend Requests</h3>
                  <p className="text-xs text-gray-500">
                    {pendingCount} pending
                  </p>
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No pending requests</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={request.sender?.image || ''} alt={request.sender?.name || ''} />
                        <AvatarFallback className="bg-purple-100 text-purple-600 font-bold">
                          {request.sender?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">
                          {request.sender?.name}
                        </p>
                        {request.message && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            &ldquo;{request.message}&rdquo;
                          </p>
                        )}
                        {request.sender?.bio && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {request.sender.bio}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(request.sentAt).toLocaleDateString()}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleAccept(request.id)}
                            disabled={actionLoading === request.id}
                            size="sm"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full h-8 text-xs font-semibold"
                          >
                            {actionLoading === request.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            ) : (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => handleDecline(request.id)}
                            disabled={actionLoading === request.id}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full h-8 text-xs font-semibold"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
