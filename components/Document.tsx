'use client'
import React, { FormEvent, useState, useTransition, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useAuth } from '@clerk/nextjs';
import { getDocument, updateDocument } from '@/actions/actions';


interface DocumentProps {
  id: string;
}

function Document({ id }: DocumentProps) {
    const [input, setInput] = useState("");
    const [isUpdating, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isSignedIn, isLoaded, userId } = useAuth();

    // Fetch document data using server action
    useEffect(() => {
        const fetchDocument = async () => {
            if (!isLoaded) return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                const result = await getDocument(id);
                if (result.success && result.data) {
                    setInput(result.data.title || "");
                    console.log('✅ Document loaded successfully:', result.data);
                } else {
                    setError(result.error || "Failed to load document");
                    console.error('❌ Failed to load document:', result.error);
                }
            } catch (error) {
                console.error('❌ Error fetching document:', error);
                setError("Failed to load document. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [id, isLoaded]);

    // Debug authentication state
    useEffect(() => {
        console.log('🔍 Authentication Debug:', {
            isSignedIn,
            isLoaded,
            userId,
            isLoading,
            error
        });
    }, [isSignedIn, isLoaded, userId, isLoading, error]);

    const updateTitle = (e: FormEvent) => {
        e.preventDefault();
        if (!isSignedIn) {
            alert("Please sign in to update the document");
            return;
        }
        
        startTransition(async () => {
            try {
                const result = await updateDocument(id, { title: input });
                if (result.success) {
                    console.log('✅ Document updated successfully');
                } else {
                    console.error('❌ Failed to update document:', result.error);
                    alert(result.error || "Failed to update document. Please try again.");
                }
            } catch (error) {
                console.error("Error updating document:", error);
                alert("Failed to update document. Please try again.");
            }
        });
    };

    // Show loading state while auth is loading
    if (!isLoaded) {
        return <div>Loading authentication...</div>;
    }

    // Show sign-in prompt if not authenticated
    if (!isSignedIn) {
        return (
            <div className="flex flex-col max-w-6xl mx-auto justify-center items-center py-20">
                <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
                <p className="text-gray-600 mb-6">You need to be signed in to view and edit this document.</p>
                <Button onClick={() => window.location.href = '/sign-in'}>
                    Sign In
                </Button>
            </div>
        );
    }

    // Show error state if Firebase error occurs
    if (error) {
        return (
            <div className="flex flex-col max-w-6xl mx-auto justify-center items-center py-20">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Document</h2>
                <p className="text-gray-600 mb-6">
                    {error.includes('permission') 
                        ? "You don't have permission to access this document." 
                        : "Failed to load document. Please try again later."}
                </p>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    // Show loading state while document is loading
    if (isLoading) {
        return (
            <div className="flex flex-col max-w-6xl mx-auto justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Loading document...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col max-w-6xl mx-auto justify-between pb-5">
            <form onSubmit={updateTitle} className="flex flex-1 flex-row items-center gap-2">
                {/* Update title */}
                <div className="flex-grow">
                    <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter document title..." className='border-black border-2'/>
                </div>
                <Button disabled={isUpdating} type="submit">
                    {isUpdating ? "Updating" : "Update"}
                </Button>
                {/* IF */}
                {/* isOwner && invite and delete */}
            </form>
            <div className="mt-6">
                {/* ManageUsers */}
                {/* Avatars */}
            </div>
            {/* Collaborative Editor */}
        </div>
    );
}

export default Document
