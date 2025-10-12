'use client'
import React, { FormEvent, useState, useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Input } from './ui/input'
import * as Y from 'yjs'
import { BotIcon } from 'lucide-react'
import Markdown from 'react-markdown'


function ChatToDocument({doc}:{doc:Y.Doc}) {
  const [input , setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isOpen , setIsOpen] = useState(false)
  const [summary,setSummary] = useState("")
  const [question,setQuestion] = useState("")

  const handleAskQuestion = async(e:FormEvent) => {
    e.preventDefault();
    setQuestion(input);
    startTransition(async ()=>{
        const documentData = doc.get('document-store').toJSON();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatToDocument`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentData, question: input }),
            }
        )

        if(res.ok){
            const {message} = await res.json();
            setInput("");
            setSummary(message);

            toast.success("Question Answered Successfully")
        }
    })

  }

  return (
    <Dialog open = {isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant='outline'>
      <DialogTrigger>Chat to Document</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ask About the Document</DialogTitle>
          <DialogDescription>
            Ask anything about the document
          </DialogDescription>
          <hr className='mt-5'/>
          {question && <p className='mt-5 text-gray-500'>Q:{question}</p>}
        </DialogHeader>

        {summary && (
            <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100">
              <div className="flex items-center gap-2">
                <BotIcon className="w-10 flex-shrink-0" />
                <p className="font-bold">GPT {isPending ? 'is thinking...' : 'Says:'}</p>
              </div>
              <div className="mt-2 w-full">
                {isPending ? 'Thinking...' : <Markdown>{summary}</Markdown>}
              </div>
            </div>
          )}
        <form onSubmit={handleAskQuestion} className='flex-gap-2'>
            <Input 
            type='text'
            placeholder='i.e. what is this about'
            className='w-full'
            value={input}
            onChange ={(e) =>setInput(e.currentTarget.value)} />
            <Button type='submit' disabled={!input|| isPending} className='mt-5'>
                {isPending ? "Asking..." : "Ask"}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChatToDocument
