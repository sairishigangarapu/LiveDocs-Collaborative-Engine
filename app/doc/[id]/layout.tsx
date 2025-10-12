import { auth } from '@clerk/nextjs/server'
import RoomProvider from '@/components/RoomProvider';
import React from 'react'
import { redirect } from 'next/navigation';

async function DocLayout({children, params}:
    {children:React.ReactNode,
    params: Promise<{id:string}>}) 
{
    const { userId } = await auth();
    if (!userId) {
        redirect('/');
    }
    const { id } = await params;
    return (
        <RoomProvider 
        roomID = {id}>
        {children}
        </RoomProvider>
    )
}

export default DocLayout
