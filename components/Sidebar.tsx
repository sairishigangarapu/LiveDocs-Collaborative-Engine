"use client";
import { MenuIcon } from "lucide-react";
import NewDocumentButton from "./NewDocumentButton";
//import SidebarOption from "./SidebarOption";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import {useCollection} from "react-firebase-hooks/firestore"
import { useUser } from "@clerk/nextjs";
import { collectionGroup, query, where ,DocumentData} from "firebase/firestore";
import {db} from "@/firebase";
import { useEffect, useState } from "react";
import SidebarOption from "./SidebarOption";

interface RoomDocument extends DocumentData{
    createdAt : string;
    role: "owner"|"editor";
    roomID : string;
    userID : string;
}

function Sidebar() {
    const {user}=useUser();

    const[groupedData,setGroupedData]=useState<{ owner: RoomDocument[]; editor: RoomDocument[] }>(
        {
            owner: [],
            editor: [],
        }
    );

    const [data,loading,error] = useCollection(
        user &&(
            query(collectionGroup(db,'rooms'),
            where('userId','==',user.emailAddresses[0].toString()))
        )
    );
    useEffect(() => {
        if (!data) return;

        const grouped = data.docs.reduce<{ owner: RoomDocument[]; editor: RoomDocument[] }>(
            (acc, curr) => {
                const roomData = curr.data() as RoomDocument;
                if (roomData.role === "owner") {
                    acc.owner.push({
                        id:curr.id,
                        ...roomData,
                    });
                } else if (roomData.role === "editor") {
                    acc.editor.push({
                        id:curr.id,
                        ...roomData,
                    });
                }
                return acc;
            },
            { owner: [], editor: [] }
        );
        setGroupedData(grouped)
    }, [data]);
    const Menuoptions =(
        <div className="flex flex-col gap-y-4 w-full">
            <div className="w-full">
                <NewDocumentButton />
            </div>
            <div className="flex flex-col gap-y-2 w-full">
                {/*My docs */}
                {groupedData.owner.length === 0 ? (
                    <h2 className="text-gray-500 font-semibold text-sm">No Documents Found</h2>
                ) : (
                    <>
                        <h2 className="text-gray-500 font-semibold text-sm">My Documents</h2>
                        <div className="flex flex-col gap-y-2 w-full">
                            {groupedData.owner.map((doc) => (
                                <SidebarOption key={doc.id} id={doc.id} href={`/doc/${doc.id}`} />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {/*List.... */}
            {/*Shared with me*/}
            {groupedData.editor.length > 0 &&(
                <>
                    <h2 className="text-gray-500 font-semibold text-sm">No Documents Found</h2>
                    <div className="flex flex-col gap-y-2 w-full">
                        {groupedData.owner.map((doc) => (
                            <SidebarOption key={doc.id} id={doc.id} href={`/doc/${doc.id}`} />
                        ))}
                    </div>
                </>
            )}
            {/*List.... */}
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