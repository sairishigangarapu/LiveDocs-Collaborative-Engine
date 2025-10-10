'use client'
import React from 'react'
import { ClientSideSuspense, RoomProvider as RoomProviderWrapper } from '@liveblocks/react/suspense'
import LoadingSpinner from './LoadingSpinner'
import LiveCursorProvider from './LiveCursorProvider'
function RoomProvider({roomID,children}:
    {roomID:string,children:React.ReactNode}) {
  const [showCursors, setShowCursors] = React.useState(false);

  React.useEffect(() => {
    // Defer mounting LiveCursorProvider until after first commit
    // Use a small timeout to ensure we're not in the render cycle
    const timer = setTimeout(() => {
      setShowCursors(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  return (
    <RoomProviderWrapper
    id = {roomID}
    initialPresence={{cursor:null}}
    >
        <ClientSideSuspense fallback={<LoadingSpinner/>}>
        {showCursors ? (
          <LiveCursorProvider>
            {children}
          </LiveCursorProvider>
        ) : (
          children
        )}
        </ClientSideSuspense>
    </RoomProviderWrapper>
  )
}

export default RoomProvider
