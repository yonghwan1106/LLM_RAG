import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
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
    
    // Generate embedding for the entire document
    console.log('Generating document embedding...')
    const documentEmbedding = await generateEmbedding(text.substring(0, 8000)) // Limit text length for embedding
    
    // Save document to database with embedding
    console.log('Saving document to database...')
    const client = await db.connect()
    
    try {
      const documentResult = await client.query(
        `INSERT INTO documents (title, content, source, metadata, embedding) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, title, content, source, created_at`,
        [
          file.name, 
          text, 
          'pdf_upload',
          JSON.stringify({
            filename: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          }),
          `[${documentEmbedding.join(',')}]` // PostgreSQL vector format
        ]
      )
      
      const document = documentResult.rows[0]
    
      console.log('Document processing completed successfully')
      return NextResponse.json({
        success: true,
        document_id: document.id,
        message: `Successfully processed document: ${file.name}`,
        document: {
          id: document.id,
          title: document.title,
          source: document.source,
          created_at: document.created_at
        }
      })
      
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      )
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error in upload API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}