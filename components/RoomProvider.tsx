'use client'
import React from 'react'
import { ClientSideSuspense, RoomProvider as RoomProviderWrapper } from '@liveblocks/react/suspense'
import LoadingSpinner from './LoadingSpinner'
import LiveCursorProvider from './LiveCursorProvider'
function RoomProvider({roomID,children}:
    {roomID:string,children:React.ReactNode}) {
  return (
    <RoomProviderWrapper
    id = {roomID}
    initialPresence={{cursor:null}}
    >
        <ClientSideSuspense fallback={<LoadingSpinner/>}>
        <LiveCursorProvider>
            {children}
        </LiveCursorProvider>
        </ClientSideSuspense>
    </RoomProviderWrapper>
  )
}

export default RoomProvider
