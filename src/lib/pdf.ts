// Dynamic import to avoid SSR issues
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamic import of pdfjs-dist for server-side compatibility
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    
    // Configure worker for server environment
    if (typeof window === 'undefined') {
      // Server-side: use local worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.min.js'
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    }).promise
    
    let fullText = ''
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += pageText + '\n\n'
    }
    
    if (!fullText.trim()) {
      throw new Error('No text content found in PDF')
    }
    
    return fullText.trim()
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