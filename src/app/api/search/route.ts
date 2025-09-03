import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { query, matchThreshold = 0.78, matchCount = 5 } = await request.json()
    
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    console.log('Generating embedding for query:', query)
    const queryEmbedding = await generateEmbedding(query.trim())

    // Search for similar documents using the match_documents function
    console.log(`Searching for similar documents with threshold ${matchThreshold}...`)
    const client = await db.connect()
    
    try {
      const result = await client.query(
        'SELECT * FROM match_documents($1::vector, $2, $3)',
        [
          `[${queryEmbedding.join(',')}]`,
          matchThreshold,
          matchCount
        ]
      )
      
      const matches = result.rows
      
      console.log(`Found ${matches.length} similar documents`)
      
      return NextResponse.json({
        success: true,
        query: query,
        results: matches.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          source: doc.source,
          similarity: doc.similarity
        })),
        message: `Found ${matches.length} relevant documents`,
        count: matches.length
      })
      
    } catch (dbError) {
      console.error('Database search error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Search failed' },
        { status: 500 }
      )
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const matchThreshold = Number(searchParams.get('threshold')) || 0.78
    const matchCount = Number(searchParams.get('count')) || 5
    
    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }
    
    console.log('Generating query embedding...')
    const queryEmbedding = await generateEmbedding(query)
    
    console.log('Searching for similar documents...')
    const client = await db.connect()
    
    try {
      const result = await client.query(
        'SELECT * FROM match_documents($1::vector, $2, $3)',
        [
          `[${queryEmbedding.join(',')}]`,
          matchThreshold,
          matchCount
        ]
      )
      
      const documents = result.rows
      
      console.log(`Found ${documents.length} similar documents`)
      
      return NextResponse.json({
        success: true,
        query: query,
        results: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content.substring(0, 500) + (doc.content.length > 500 ? '...' : ''), // Truncate for preview
          source: doc.source,
          similarity: doc.similarity
        })),
        count: documents.length
      })
      
    } catch (dbError) {
      console.error('Database search error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Search failed' },
        { status: 500 }
      )
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}