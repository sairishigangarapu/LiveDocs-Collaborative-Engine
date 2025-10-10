'use client'
import { useRoom, useSelf } from '@liveblocks/react/suspense'
import React, { useEffect, useState, useMemo } from 'react'
import * as Y from "yjs";
import {LiveblocksYjsProvider} from '@liveblocks/yjs';
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import {BlockNoteView} from "@blocknote/shadcn"
// import {BlockNoteEditor} from "@blocknote/core"
import {useCreateBlockNote} from "@blocknote/react"

// BlockNote CSS imports
import "@blocknote/core/fonts/inter.css"
import "@blocknote/shadcn/style.css"
import stringToColor from '@/lib/stringToColor';

type EditorProps={
    doc:Y.Doc;
    provider: LiveblocksYjsProvider;
    DarkMode: boolean;
}

    function BlockNote({doc,provider,DarkMode}:EditorProps){
        const userInfo = useSelf((me)=>me.info);
        const [isReady, setIsReady] = useState(false);
        
        // Memoize collaboration config to prevent recreating editor
        const collaborationConfig = useMemo(() => {
            if (!doc || !provider || !userInfo) return undefined;
            
            return {
                provider,
                fragment: doc.getXmlFragment("document-store"),
                user: {
                    name: userInfo?.name || 'Anonymous',
                    color: stringToColor(userInfo?.email || '')
                }
            };
        }, [doc, provider, userInfo]);

        // Call useCreateBlockNote at the top level with stable config
        const editor = useCreateBlockNote({
            collaboration: collaborationConfig
        });

        // Wait for provider to be synced before rendering
        useEffect(() => {
            if (!provider) return;

            const handleSync = () => {
                setIsReady(true);
            };

            if (provider.synced) {
                setIsReady(true);
            } else {
                provider.on('sync', handleSync);
            }

            return () => {
                provider.off('sync', handleSync);
            };
        }, [provider]);

        if (!isReady || !editor) {
            return (
                <div className='relative max-w-6xl mx-auto flex items-center justify-center' style={{ minHeight: '200px' }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            );
        }

        return(
            <div className='relative max-w-6xl mx-auto'>
                <div className="blocknote-editor-wrapper" style={{
                    minHeight: '100vh',
                    backgroundColor: DarkMode ? '#1a1a1a' : '#ffffff',
                    color: DarkMode ? '#ffffff' : '#000000'
                }}>
                    <BlockNoteView
                        className='min-h-screen'
                        editor={editor}
                        theme={DarkMode ? "dark" : "light"}
                    />
                </div>
            </div>
        )
    }

function Editor() {
    const room = useRoom();
    const [doc,setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<LiveblocksYjsProvider>();
    const [DarkMode,setDarkMode] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    const style = `hover:text-white ${
        DarkMode
        ? "text-gray-300 bg-gray-800 hover:bg-gray-100 hover:text-gray-700"
        : "text-gray-700 bg-gray-600 hover:bg-gray-300 hover:text-gray-700"
    }`;

    useEffect(() => {
        if (!room) return;

        let yDoc: Y.Doc | null = null;
        let yProvider: LiveblocksYjsProvider | null = null;
        let mounted = true;

        const initializeEditor = async () => {
            try {
                yDoc = new Y.Doc();
                yProvider = new LiveblocksYjsProvider(room, yDoc);
                
                // Wait a bit for provider to initialize
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (mounted) {
                    setDoc(yDoc);
                    setProvider(yProvider);
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error('Error initializing editor:', error);
            }
        };

        initializeEditor();

        return () => {
            mounted = false;
            setIsInitialized(false);
            
            // Clean up in reverse order
            if (yProvider) {
                try {
                    yProvider.destroy();
                } catch (e) {
                    console.error('Error destroying provider:', e);
                }
            }
            if (yDoc) {
                try {
                    yDoc.destroy();
                } catch (e) {
                    console.error('Error destroying doc:', e);
                }
            }
        };
    }, [room]);

    if (!doc || !provider || !isInitialized) {
        return (
            <div className='max-w-6xl mx-auto flex items-center justify-center py-10'>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className='max-w-6xl mx-auto'>
            <div className='flex items-center gap-2 justify-end'>
                {/* Translation of document */}

                {/* ChatToCocument*/}

                {/* DarkMode*/}
                <Button 
                    className={style} 
                    onClick={() => setDarkMode(!DarkMode)}
                >
                    {DarkMode ? <SunIcon/> : <MoonIcon/>}
                </Button>
            </div>

            <div className='my-10'>
                {/*BlockNote */}
                <BlockNote doc={doc} provider={provider} DarkMode={DarkMode} />
            </div>
        </div>
    );
}

export default Editor
