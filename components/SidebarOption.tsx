'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

type SidebarOptionProps = {
  href: string;
  id: string;
  title?: string;
};

function SidebarOption({ href, id, title }: SidebarOptionProps) {
const pathname = usePathname();
const isActive = href.includes(pathname) && pathname !== "/";

  return (
    <Link
      href={href}
      className={`block w-full border p-3 rounded-lg transition-colors duration-150 text-left ${
        isActive ? "bg-gray-300 font-bold border-black" : "border-gray-400 bg-white hover:bg-gray-100"
      }`}
    >
      <span className="w-full block text-black">{title || "Untitled"}</span>
    </Link>
  );
}

export default SidebarOption
