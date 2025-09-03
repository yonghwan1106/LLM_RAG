import pdf from 'pdf-parse'

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const data = await pdf(buffer)
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF')
    }
    
    return data.text.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
  
  let currentChunk = ''
  let currentSize = 0
  
  for (const sentence of sentences) {
    const sentenceLength = sentence.trim().length
    
    if (currentSize + sentenceLength > chunkSize && currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim())
      
      // Create overlap by including the last few words
      const words = currentChunk.trim().split(' ')
      const overlapWords = words.slice(-Math.floor(overlap / 10))
      currentChunk = overlapWords.join(' ') + ' '
      currentSize = currentChunk.length
    }
    
    currentChunk += sentence.trim() + '. '
    currentSize = currentChunk.length
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks.filter(chunk => chunk.length > 50) // Filter out very small chunks
}