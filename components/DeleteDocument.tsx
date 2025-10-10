'use client'
import React, { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteDocument } from '@/actions/actions'
import { toast } from 'sonner'


function DeleteDocument() {
  const router = useRouter()
  const params = useParams()
  const [isDeleting, startTransition] = useTransition()
  const docId = params.id as string
  const [isOpen , setIsOpen] = useState(false)
  const pathname = usePathname();

  const handleDelete = async() => {
    const roomId = pathname.split("/").pop();
    if(!roomId) return;

    startTransition(async()=>{
      try {
        const result = await deleteDocument(roomId)
        if(result.success){
          setIsOpen(false)
          router.replace("/");
          toast.success("Document Deleted Successfully")
        }
        else{
          console.error("Failed to delete document:", result.error);
          toast.error(result.error || "Failed To Delete the document")
        }
      } catch (error) {
        console.error("Unexpected error during deletion:", error);
        toast.error("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <Dialog open = {isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant='destructive'>
      <DialogTrigger>Delete</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete the document and all its contents, 
            removing all users from the document. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type = "button"
          variant = "destructive"
          onClick={handleDelete}
          disabled = {isDeleting}>
            {isDeleting ? "Deleting...":"Delete"}
          </Button>
          <DialogClose asChild>
            <Button type = "button" variant = "secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteDocument
