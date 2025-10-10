'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRoom } from '@liveblocks/react/suspense'
import { checkRoomOwnership } from '@/actions/actions'

export default function useOwner() {
  const { user } = useUser();
  const room = useRoom();
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if user or room is not available
    if (!user || !room?.id) {
      setIsOwner(false);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const checkOwnership = async () => {
      setIsLoading(true);
      
      try {
        const result = await checkRoomOwnership(room.id);
        
        if (mounted) {
          if (result.success) {
            setIsOwner(result.isOwner);
          } else {
            console.error('❌ Error checking ownership:', result.error);
            setIsOwner(false);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Failed to check ownership:', error);
        if (mounted) {
          setIsOwner(false);
          setIsLoading(false);
        }
      }
    };

    checkOwnership();

    return () => {
      mounted = false;
    };
  }, [user, room?.id]);

  return isOwner;
}
