'use client'

import { ChatMessage } from '@/types'
import { User, Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import EvidenceCard from './EvidenceCard'

interface AnswerOutputProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export default function AnswerOutput({ messages, isLoading }: AnswerOutputProps) {
  return (
    <div className="w-full max-h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-background">
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-8">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>아직 대화가 없습니다.</p>
          <p className="text-sm mt-1">PDF를 업로드하고 질문을 입력해보세요.</p>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3 max-w-4xl",
            message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
          )}
        >
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          )}>
            {message.role === 'user' ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
          
          <div className={cn(
            "flex-1 space-y-2",
            message.role === 'user' ? 'text-right' : 'text-left'
          )}>
            <div className={cn(
              "inline-block p-3 rounded-lg max-w-lg",
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            )}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </div>
            
            {message.evidence && message.evidence.length > 0 && (
              <div className="space-y-2 mt-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  참고 문단 ({message.evidence.length}개)
                </h4>
                <div className="space-y-2">
                  {message.evidence.map((evidence, index) => (
                    <EvidenceCard key={index} evidence={evidence} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-3 mr-auto max-w-4xl">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="inline-block p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>답변을 생성하고 있습니다...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}