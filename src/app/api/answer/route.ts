import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateEmbedding, generateAnswer } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { question, matchThreshold = 0.5, matchCount = 5 } = await request.json()
    
    if (!question || question.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Question is required' },
        { status: 400 }
      )
    }

    console.log('Processing question:', question)

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question.trim())

    // Search for similar chunks
    const { data: matches, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: questionEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (searchError) {
      console.error('Error searching documents:', searchError)
      return NextResponse.json(
        { success: false, message: 'Failed to search documents' },
        { status: 500 }
      )
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        success: true,
        answer: '죄송합니다. 업로드된 논문에서 관련된 내용을 찾을 수 없습니다. 다른 질문을 시도해보시거나 관련 논문을 업로드해주세요.',
        evidence: [],
        message: 'No relevant content found',
      })
    }

    // Get document information for evidence
    const documentIds = [...new Set(matches.map(match => match.document_id))]
    const { data: documents } = await supabase
      .from('documents')
      .select('id, filename')
      .in('id', documentIds)

    // Prepare context for GPT
    const contextChunks = matches.map(match => match.content)
    
    // Generate answer using GPT-4o
    console.log(`Generating answer using ${matches.length} relevant chunks`)
    const answer = await generateAnswer(question, contextChunks)

    // Prepare evidence
    const evidence = matches.map(match => ({
      content: match.content,
      document_id: match.document_id,
      filename: documents?.find(doc => doc.id === match.document_id)?.filename || 'Unknown',
      similarity: match.similarity,
    }))

    console.log('Answer generated successfully')
    return NextResponse.json({
      success: true,
      answer,
      evidence,
      message: 'Answer generated successfully',
    })

  } catch (error) {
    console.error('Error in answer API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}