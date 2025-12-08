"use client";

import { useEffect, useCallback } from 'react';

export function useSocketEvent(
  eventName: 'friend-request-received' | 'friend-request-accepted' | 'event-joined' | 'event-left' | 'notification',
  callback: (data: any) => void
) {
  const handleEvent = useCallback((event: CustomEvent) => {
    callback(event.detail);
  }, [callback]);

  useEffect(() => {
    window.addEventListener(eventName as any, handleEvent as any);
    
    return () => {
      window.removeEventListener(eventName as any, handleEvent as any);
    };
  }, [eventName, handleEvent]);
}

export function useFriendRequestEvents({
  onReceived,
  onAccepted,
}: {
  onReceived?: (data: { friendRequest: any }) => void;
  onAccepted?: (data: { friendRequestId: string; friendship: any }) => void;
}) {
  useEffect(() => {
    const handleReceived = (event: CustomEvent) => {
      onReceived?.(event.detail);
    };

    const handleAccepted = (event: CustomEvent) => {
      onAccepted?.(event.detail);
    };

    if (onReceived) {
      window.addEventListener('friend-request-received' as any, handleReceived as any);
    }
    if (onAccepted) {
      window.addEventListener('friend-request-accepted' as any, handleAccepted as any);
    }

    return () => {
      window.removeEventListener('friend-request-received' as any, handleReceived as any);
      window.removeEventListener('friend-request-accepted' as any, handleAccepted as any);
    };
  }, [onReceived, onAccepted]);
}

export function useEventParticipationEvents({
  onJoined,
  onLeft,
}: {
  onJoined?: (data: { eventId: string; userId: string; userName: string; participantCount: number }) => void;
  onLeft?: (data: { eventId: string; userId: string; userName: string; participantCount: number }) => void;
}) {
  useEffect(() => {
    const handleJoined = (event: CustomEvent) => {
      onJoined?.(event.detail);
    };

    console.log("onLeft", onLeft);
    console.log("onJoined", onJoined);


    const handleLeft = (event: CustomEvent) => {
      onLeft?.(event.detail);
    };

    if (onJoined) {
      window.addEventListener('event-joined' as any, handleJoined as any);
    }
    if (onLeft) {
      window.addEventListener('event-left' as any, handleLeft as any);
    }

    return () => {
      window.removeEventListener('event-joined' as any, handleJoined as any);
      window.removeEventListener('event-left' as any, handleLeft as any);
    };
  }, [onJoined, onLeft]);
}
