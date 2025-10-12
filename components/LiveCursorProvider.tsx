'use client'
import React from 'react'
import { useMyPresence , useOthers } from '@liveblocks/react/suspense'
import FollowPointer from './FollowPointer'

function LiveCursorProvider({children}:{children:React.ReactNode}) {
    const [, UpdateMyPresence] = useMyPresence();
    const others = useOthers();

    React.useEffect(() => {
        function handleWindowPointerMove(e:PointerEvent){
            const cursor = { x: Math.floor(e.clientX), y: Math.floor(e.clientY) };
            UpdateMyPresence({ cursor });
        }

        function handleWindowPointerLeave(){
            UpdateMyPresence({ cursor: null });
        }

        const pointerMoveHandler = handleWindowPointerMove as EventListener;
        const pointerLeaveHandler = handleWindowPointerLeave as EventListener;
        const blurHandler = handleWindowPointerLeave as EventListener;

        window.addEventListener('pointermove', pointerMoveHandler, { passive: true });
        window.addEventListener('pointerleave', pointerLeaveHandler);
        window.addEventListener('blur', blurHandler);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') {
                handleWindowPointerLeave();
            }
        });

        return () => {
            window.removeEventListener('pointermove', pointerMoveHandler);
            window.removeEventListener('pointerleave', pointerLeaveHandler);
            window.removeEventListener('blur', blurHandler);
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
