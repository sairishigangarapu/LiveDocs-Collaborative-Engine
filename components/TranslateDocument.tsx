"use client"
import React, { FormEvent, startTransition, useState } from 'react'
import * as Y from 'yjs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from './ui/button'
// import { Input } from './ui/input'
import { BotIcon, LanguagesIcon } from 'lucide-react'
import Markdown from 'react-markdown'
import { toast } from 'sonner'

type Language =
  | "english"
  | "spanish"
  | "portuguese"
  | "french"
  | "german"
  | "chinese"
  | "arabic"
  | "hindi"
  | "russian"
  | "japanese";

const languages: Language[] = [
  "english",
  "spanish",
  "portuguese",
  "french",
  "german",
  "chinese",
  "arabic",
  "hindi",
  "russian",
  "japanese",
];

export default function TranslateDocument({ doc }: { doc: Y.Doc }) {
  const [isOpen, setIsOpen] = useState(false)
  const [summary, setSummary] = useState("")
  const [language, setLanguage] = useState<string>("")
  const [isPending, setIsPending] = useState(false)

  const handleAskQuestion = async (e: FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    await startTransition(async () => {
      try {
        const documentData = (doc.get('document-store'))?.toJSON?.() ?? {}
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/translateDocument`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentData, targetLang: language }),
          }
        )

        if (res.ok) {
          const { translated_text } = await res.json()
          setSummary(translated_text)
          toast.success('Translated Document Successfully!')
        } else {
          toast.error('Failed to translate document')
        }
      } catch {
        toast.error('Unexpected error')
      }
    })
    setIsPending(false)
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button asChild variant="outline">
          <DialogTrigger>
            <LanguagesIcon /> Translate
          </DialogTrigger>
        </Button>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Translate the document</DialogTitle>
            <DialogDescription>
              Translate the document to any of the following languages
            </DialogDescription>
            <hr className="mt-5" />
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

          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <Select value={language} onValueChange={(value) => setLanguage(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" disabled={!language || isPending} className="mt-5">
              {isPending ? 'Translating...' : 'Translate'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
