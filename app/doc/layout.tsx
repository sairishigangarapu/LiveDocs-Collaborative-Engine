import React from 'react'
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LiveBlocksProvider from '@/components/LiveBlocksProvider';

async function PageLayout({children}:{children:React.ReactNode}) {
  // Server-side authentication check - auth() is async in Clerk v6
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }
  
  return (
    <LiveBlocksProvider>
        {children}
    </LiveBlocksProvider>
  )
}

export default PageLayout;
