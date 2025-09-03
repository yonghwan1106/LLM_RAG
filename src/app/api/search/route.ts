import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { query, matchThreshold = 0.5, matchCount = 5 } = await request.json()
    
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    console.log('Generating embedding for query:', query)
    const queryEmbedding = await generateEmbedding(query.trim())

    // Search for similar chunks using the match_documents function
    console.log(`Searching for similar chunks with threshold ${matchThreshold}...`)
    const { data: matches, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) {
      console.error('Error searching documents:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to search documents' },
        { status: 500 }
      )
    }

    // Get document information for the matched chunks
    const documentIds = [...new Set(matches.map(match => match.document_id))]
    const { data: documents } = await supabase
      .from('documents')
      .select('id, filename')
      .in('id', documentIds)

    // Enhance matches with document information
    const enhancedResults = matches.map(match => ({
      ...match,
      filename: documents?.find(doc => doc.id === match.document_id)?.filename || 'Unknown',
    }))

    console.log(`Found ${matches.length} similar chunks`)
    return NextResponse.json({
      success: true,
      results: enhancedResults,
      message: `Found ${matches.length} relevant chunks`,
    })

  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}