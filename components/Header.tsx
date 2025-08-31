"use client";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { ReactNode } from 'react'

interface HeaderProps {
    children?: ReactNode
    className?: string
}

function Header({children, className }: HeaderProps) {
    const {user} = useUser();
    return (
        <div className="flex items-center justify-between p-5">
            {
                user && (
                    <h1 className='text-2xl'>{user.firstName}{`'s`} Space</h1>
                )
            }
            {children}
            {/* Breadcrumbs */}
            <div>
                <SignedOut>
                    <SignInButton>Sign In</SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton/>
                </SignedIn>
            </div>
        </div>
    )
}
export default Header