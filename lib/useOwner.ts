'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRoom } from '@liveblocks/react/suspense'
import { checkRoomOwnership } from '@/actions/actions'

export default function useOwner() {
  const { user } = useUser();
  const room = useRoom();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Don't fetch if user or room is not available
    if (!user || !room?.id) {
      setIsOwner(false);
      return;
    }

    let mounted = true;

    const checkOwnership = async () => {
      try {
        const result = await checkRoomOwnership(room.id);
        
        if (mounted) {
          if (result.success) {
            setIsOwner(result.isOwner);
          } else {
            console.error('❌ Error checking ownership:', result.error);
            setIsOwner(false);
          }
        }
      } catch (error) {
        console.error('❌ Failed to check ownership:', error);
        if (mounted) {
          setIsOwner(false);
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
