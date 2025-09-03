'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionInputProps {
  onSubmit: (question: string) => void
  isLoading: boolean
  disabled: boolean
}

export default function QuestionInput({ onSubmit, isLoading, disabled }: QuestionInputProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isLoading && !disabled) {
      onSubmit(question.trim())
      setQuestion('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 p-4 border rounded-lg bg-background">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={disabled ? "먼저 PDF를 업로드해주세요" : "논문에 대해 질문해보세요..."}
          disabled={disabled || isLoading}
          className={cn(
            "flex-1 bg-transparent outline-none",
            "placeholder:text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading || disabled}
          className={cn(
            "p-2 rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            !disabled && question.trim() && !isLoading && "text-primary"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {disabled && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          질문하려면 먼저 PDF 파일을 업로드해주세요
        </p>
      )}
    </form>
  )
}