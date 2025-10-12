'use client'
import React, { FormEvent, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { inviteUserToDocument } from '@/actions/actions'
import { toast } from 'sonner'
import { Input } from './ui/input'


function InviteUser() {
  const [isPending, startTransition] = useTransition()
  const [email,setEmail] = useState("")
  const [isOpen , setIsOpen] = useState(false)
  const pathname = usePathname();

  const handleInvite = async(e:FormEvent) => {
    e.preventDefault()

    const roomId = pathname.split('/').pop()
    if (!roomId) return;
    
    startTransition(async()=>{
      try {
        const result = await inviteUserToDocument(roomId,email)
        if(result.success){
          setIsOpen(false)
          setEmail('')
          toast.success("Use Added Successfully")
        }
        else{
          console.error("Failed to add user:", result.error);
          toast.error(result.error || "Failed To Add User")
        }
      } catch (error) {
        console.error("Unexpected error during user addition:", error);
        toast.error("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <Dialog open = {isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant='outline'>
      <DialogTrigger>Invite</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a user to collaborate</DialogTitle>
          <DialogDescription>
            Enter the emial of the user you want to invite
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className='flex-gap-2'>
            <Input 
            type='email'
            placeholder='Email'
            className='w-full'
            value={email}
            onChange ={(e) =>setEmail(e.currentTarget.value)} />
            <Button type='submit' disabled={!email|| isPending} className='mt-5'>
                {isPending ? "Inviting..." : "Invite"}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InviteUser
