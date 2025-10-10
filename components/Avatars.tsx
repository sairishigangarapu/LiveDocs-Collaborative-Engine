'use client'
import { useOthers, useSelf } from '@liveblocks/react/suspense'
import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function Avatars() {
    const others = useOthers()
    const self = useSelf()
    const all = [self,...others]
  return (
    <div className='flex gap-2 items-center'>
      <p className='font-linght text-sm'>Users Currently editing the page</p>
      <div className="flex -space-x-5">
        {all.map((other,i)=>(
            <Tooltip key={other.id+i}>
            <TooltipTrigger>
                <Avatar className='border-2 hover:z-50'>
                    <AvatarImage src={other?.info.avatar} />
                    <AvatarFallback>{other?.info.name}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent>
                <p>{self?.id === other?.id ? "You":other?.info.name}</p>
            </TooltipContent>
            </Tooltip>
        ))}
      </div>
    </div>
  )
}

export default Avatars
