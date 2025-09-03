import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractTextFromPDF, splitTextIntoChunks } from '@/lib/pdf'
import { generateEmbedding } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are supported' },
        { status: 400 }
      )
    }
    
    // Extract text from PDF
    console.log('Extracting text from PDF...')
    const text = await extractTextFromPDF(file)
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Could not extract text from PDF' },
        { status: 400 }
      )
    }
    
    // Save document to database
    console.log('Saving document to database...')
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        content: text,
      })
      .select()
      .single()
    
    if (docError) {
      console.error('Error saving document:', docError)
      return NextResponse.json(
        { success: false, message: 'Failed to save document' },
        { status: 500 }
      )
    }
    
    // Split text into chunks
    console.log('Splitting text into chunks...')
    const chunks = splitTextIntoChunks(text)
    
    // Generate embeddings and save chunks
    console.log(`Generating embeddings for ${chunks.length} chunks...`)
    const chunkPromises = chunks.map(async (chunk, index) => {
      try {
        const embedding = await generateEmbedding(chunk)
        
        const { error: chunkError } = await supabase
          .from('document_chunks')
          .insert({
            document_id: document.id,
            content: chunk,
            embedding: embedding,
            chunk_index: index,
          })
        
        if (chunkError) {
          console.error('Error saving chunk:', chunkError)
          throw chunkError
        }
        
        return true
      } catch (error) {
        console.error(`Error processing chunk ${index}:`, error)
        throw error
      }
    })
    
    await Promise.all(chunkPromises)
    
    console.log('Document processing completed successfully')
    return NextResponse.json({
      success: true,
      document_id: document.id,
      message: `Successfully processed ${chunks.length} chunks from ${file.name}`,
    })
    
  } catch (error) {
    console.error('Error in upload API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}