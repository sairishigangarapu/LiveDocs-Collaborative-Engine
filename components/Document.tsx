'use client'
import React, { FormEvent, useState, useTransition, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { doc, updateDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '@/firebase';


interface DocumentProps {
  id: string;
}

function Document({ id }: DocumentProps) {
    const [input, setInput] = useState("");
    const [isUpdating, startTransition] = useTransition();
    const [data, loading, error] = useDocumentData(doc(db, "documents", id));

    useEffect(() => {
        if (data && data.title) {
            setInput(data.title);
        }
    }, [data]);

    const updateTitle = (e: FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await updateDoc(doc(db, "documents", id), {
                title: input,
            });
        });
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow border">
            <form onSubmit={updateTitle} className="flex flex-col gap-4">
                {/* Update title */}
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter document title..." />
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
