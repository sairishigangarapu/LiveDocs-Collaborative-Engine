'use client'
import { usePathname } from 'next/navigation'
import React, { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function BreadCrumbs() {
    const path = usePathname();
    const segments  = path.split("/");
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment,index)=>{
            if(!segment || index === 0) return null;
            const href = segments.slice(0,index+1).join("/");
            return (
              <Fragment key = {segment}>
                <BreadcrumbSeparator/>
              <BreadcrumbItem>
                <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
              </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

export default BreadCrumbs
