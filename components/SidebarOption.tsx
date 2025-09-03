'use client'
import { db } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore';

type SidebarOptionProps = {
  href: string;
  id: string;
};

function SidebarOption({ href, id }: SidebarOptionProps) {

const [data,loading,error] = useDocumentData(doc(db,"documents",id));
const pathname = usePathname();
const isActive = href.includes(pathname) && pathname !== "/";

if(!data) return null;
  return (
    <Link
      href={href}
      className={`block w-full border p-3 rounded-lg transition-colors duration-150 text-left ${
        isActive ? "bg-gray-300 font-bold border-black" : "border-gray-400 bg-white hover:bg-gray-100"
      }`}
    >
  <span className="w-full block text-black">{data?.title}</span>
    </Link>
  );
}

export default SidebarOption
