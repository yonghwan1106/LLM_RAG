'use client'

import { useState } from 'react'
import { ChatMessage } from '@/types'
import FileUploader from '@/components/FileUploader'
import QuestionInput from '@/components/QuestionInput'
import AnswerOutput from '@/components/AnswerOutput'
import { BookOpen } from 'lucide-react'

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasDocument, setHasDocument] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<{id: string, filename: string} | null>(null)

  const handleUploadSuccess = (documentId: string, filename: string) => {
    setHasDocument(true)
    setCurrentDocument({ id: documentId, filename })
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  const handleQuestionSubmit = async (question: string) => {
    if (!hasDocument) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          evidence: data.evidence,
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `죄송합니다. 오류가 발생했습니다: ${data.message}`,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error getting answer:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">LLM RAG Chatbot</h1>
          </div>
          <p className="text-muted-foreground">
            PDF 논문을 업로드하고 AI와 대화하며 핵심 정보를 빠르게 찾아보세요
          </p>
        </div>

        {/* Current Document Status */}
        {currentDocument && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">현재 문서:</span>
              <span>{currentDocument.filename}</span>
            </div>
          </div>
        )}

        {/* File Upload */}
        {!hasDocument && (
          <FileUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {/* Chat Interface */}
        {hasDocument && (
          <div className="space-y-4">
            <AnswerOutput messages={messages} isLoading={isLoading} />
            <QuestionInput
              onSubmit={handleQuestionSubmit}
              isLoading={isLoading}
              disabled={!hasDocument}
            />
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {!hasDocument 
              ? "PDF를 업로드하면 AI가 문서를 분석하고 질문에 답변합니다" 
              : "논문의 내용에 대해 자유롭게 질문해보세요"}
          </p>
        </div>
      </div>
    </main>
  )
}