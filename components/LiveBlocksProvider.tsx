'use client'
import React from 'react'
import {LiveblocksProvider} from '@liveblocks/react/suspense'

function LiveBlocksProvider({children}:{
    children:React.ReactNode
}) {
    // Using server-side auth endpoint; public key not required
  return (
    <LiveblocksProvider
      authEndpoint={'/auth-endpoint'}
      throttle={16}
    >
      {children}
    </LiveblocksProvider>
  )
}

export default LiveBlocksProvider
