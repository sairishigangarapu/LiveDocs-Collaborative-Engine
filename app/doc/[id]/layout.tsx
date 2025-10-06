import { auth } from '@clerk/nextjs/server'
import RoomProvider from '@/components/RoomProvider';
import React from 'react'

async function DocLayout({children, params}:
    {children:React.ReactNode,
    params: Promise<{id:string}>}) 
{
    auth.protect();
    const { id } = await params;
    return (
        <RoomProvider 
        roomID = {id}>
        {children}
        </RoomProvider>
    )
}

export default DocLayout
