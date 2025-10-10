'use client'
import React from 'react'
import { useMyPresence , useOthers } from '@liveblocks/react/suspense'
import FollowPointer from './FollowPointer'

function LiveCursorProvider({children}:{children:React.ReactNode}) {
    const [myPresence , UpdateMyPresence] = useMyPresence();
    const others = useOthers();

    React.useEffect(() => {
        function handleWindowPointerMove(e:PointerEvent){
            const cursor = { x: Math.floor(e.clientX), y: Math.floor(e.clientY) };
            UpdateMyPresence({ cursor });
        }

        function handleWindowPointerLeave(){
            UpdateMyPresence({ cursor: null });
        }

        window.addEventListener('pointermove', handleWindowPointerMove as any, { passive: true });
        window.addEventListener('pointerleave', handleWindowPointerLeave as any);
        window.addEventListener('blur', handleWindowPointerLeave as any);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') {
                handleWindowPointerLeave();
            }
        });

        return () => {
            window.removeEventListener('pointermove', handleWindowPointerMove as any);
            window.removeEventListener('pointerleave', handleWindowPointerLeave as any);
            window.removeEventListener('blur', handleWindowPointerLeave as any);
        };
    }, [UpdateMyPresence]);

    return (
    <>
      {/* Full-page non-interactive overlay to render remote cursors */}
      <div className="pointer-events-none fixed inset-0 z-[60]">
        {others
          .filter((other)=> other.presence.cursor !== null)
          .map((other)=>(
            <FollowPointer
              key={other.connectionId}
              info={other.info}
              x={other.presence.cursor!.x}
              y={other.presence.cursor!.y}
            />
          ))}
      </div>

      {children}
    </>
  )
}

export default LiveCursorProvider
