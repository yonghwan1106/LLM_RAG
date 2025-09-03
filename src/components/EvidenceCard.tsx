'use client'

import { EvidenceChunk } from '@/types'
import { File, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EvidenceCardProps {
  evidence: EvidenceChunk
}

export default function EvidenceCard({ evidence }: EvidenceCardProps) {
  const similarityPercentage = Math.round(evidence.similarity * 100)
  
  return (
    <div className="border rounded-lg p-3 bg-card text-card-foreground hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <File className="h-3 w-3" />
          <span className="font-medium truncate max-w-[200px]">
            {evidence.filename}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs">
          <TrendingUp className="h-3 w-3" />
          <span className={cn(
            "font-medium",
            similarityPercentage >= 80 ? "text-green-600" :
            similarityPercentage >= 60 ? "text-yellow-600" :
            "text-gray-600"
          )}>
            {similarityPercentage}%
          </span>
        </div>
      </div>
      
      <p className="text-sm leading-relaxed">
        {evidence.content}
      </p>
    </div>
  )
}