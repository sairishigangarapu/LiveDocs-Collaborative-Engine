import { usePathname } from 'next/navigation'
import React from 'react'

function BreadCrumbs() {
    const path = usePathname();
    const segments  = path.split("/");
  return (
    <div>
      
    </div>
  )
}

export default BreadCrumbs
