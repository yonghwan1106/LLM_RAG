export interface PaperDocument {
  id: string
  filename: string
  content: string
  created_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  content: string
  embedding: number[]
  chunk_index: number
  created_at: string
}

export interface SearchResult {
  chunk: DocumentChunk
  similarity: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  evidence?: EvidenceChunk[]
}

export interface EvidenceChunk {
  content: string
  document_id: string
  filename: string
  similarity: number
}

export interface UploadResponse {
  success: boolean
  document_id?: string
  message: string
}

export interface SearchResponse {
  success: boolean
  results?: SearchResult[]
  message: string
}

export interface AnswerResponse {
  success: boolean
  answer?: string
  evidence?: EvidenceChunk[]
  message: string
}