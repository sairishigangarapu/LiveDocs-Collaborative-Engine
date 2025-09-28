"use client";
import { MenuIcon } from "lucide-react";
import NewDocumentButton from "./NewDocumentButton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import SidebarOption from "./SidebarOption";
import { getUserDocuments } from "@/actions/actions";

interface UserDocument {
    id: string;
    userId: string;
    role: "owner" | "editor";
    createdAt: Date;
    roomID: string;
    title?: string;
}

function Sidebar() {
    const { user } = useUser();
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!user?.id || fetchingRef.current) return;
            
            console.log('🔍 Sidebar useEffect triggered - user:', user?.id);
            fetchingRef.current = true;
            setLoading(true);
            setError(null);
            
            try {
                const result = await getUserDocuments();
                if (result.success && result.documents) {
                    setDocuments(result.documents);
                    console.log('✅ Documents loaded in sidebar:', result.documents);
                } else {
                    setError(result.error || "Failed to load documents");
                    console.error('❌ Failed to load documents:', result.error);
                }
            } catch (error) {
                console.error('❌ Error fetching documents:', error);
                setError("Failed to load documents. Please try again.");
            } finally {
                setLoading(false);
                fetchingRef.current = false;
            }
        };

        fetchDocuments();
    }, [user?.id]); // Only depend on user ID, not the entire user object

    // Group documents by role
    const groupedData = {
        owner: documents.filter(doc => doc.role === "owner"),
        editor: documents.filter(doc => doc.role === "editor")
    };
    const Menuoptions = (
        <div className="flex flex-col gap-y-4 w-full">
            <div className="w-full">
                <NewDocumentButton />
            </div>
            
            {loading ? (
                <div className="flex flex-col gap-y-2 w-full">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-300 rounded mb-2"></div>
                        <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                </div>
            ) : error ? (
                <div className="flex flex-col gap-y-2 w-full">
                    <h2 className="text-red-500 font-semibold text-sm">Error Loading Documents</h2>
                    <p className="text-gray-500 text-xs">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="text-blue-500 text-xs hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-y-2 w-full">
                        {/*My docs */}
                        {groupedData.owner.length === 0 ? (
                            <h2 className="text-gray-500 font-semibold text-sm">No Documents Found</h2>
                        ) : (
                            <>
                                <h2 className="text-gray-500 font-semibold text-sm">My Documents</h2>
                                <div className="flex flex-col gap-y-2 w-full">
                                    {groupedData.owner.map((doc) => (
                                        <SidebarOption 
                                            key={doc.id} 
                                            id={doc.roomID} 
                                            href={`/doc/${doc.roomID}`}
                                            title={doc.title}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/*Shared with me*/}
                    {groupedData.editor.length > 0 && (
                        <>
                            <h2 className="text-gray-500 font-semibold text-sm">Shared with me</h2>
                            <div className="flex flex-col gap-y-2 w-full">
                                {groupedData.editor.map((doc) => (
                                    <SidebarOption 
                                        key={doc.id} 
                                        id={doc.roomID} 
                                        href={`/doc/${doc.roomID}`}
                                        title={doc.title}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
    return (
    <div className="p-2 md:p-5 bg-gray-200 relative h-full min-h-screen flex flex-col w-[300px] md:w-[340px]">
            <div className="md:hidden">
                <Sheet  >
                    <SheetTrigger>
                        <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40}/>
                    </SheetTrigger>
                    <SheetContent side='left'>
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                            <div className="mt-4">{Menuoptions}</div>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="hidden md:flex flex-col w-full h-full">
                {Menuoptions}
            </div>
        </div>
    )
}
export default Sidebar;