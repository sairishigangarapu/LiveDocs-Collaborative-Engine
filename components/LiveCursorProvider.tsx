'use client'
import React from 'react'
import { useMyPresence , useOthers } from '@liveblocks/react/suspense'
import {type PointerEvent} from 'react'
import FollowPointer from './FollowPointer'

function LiveCursorProvider({children}:{children:React.ReactNode}) {
    const [myPresence , UpdateMyPresence] = useMyPresence();
    const others = useOthers();

    function handlePointerMove(e:PointerEvent<HTMLDivElement>){
        const cursor = {x:Math.floor(e.clientX),y:Math.floor(e.clientY)}
        UpdateMyPresence({cursor})
    }

    function handlePointerLeave(){
        UpdateMyPresence({cursor: null})
    }

    return (
    <div onPointerMove={handlePointerMove}
    onPointerLeave={handlePointerLeave}>
      {/* rendering the cursors */}

      {others
      .filter((other)=> other.presence.cursor !== null)
      .map((other)=>(
        <FollowPointer
        key = {other.connectionId}
        info = {other.info}
        x = {other.presence.cursor!.x}
        y = {other.presence.cursor!.y}
        />
      ))}

      {children}
    </div>
  )
}

export default LiveCursorProvider
