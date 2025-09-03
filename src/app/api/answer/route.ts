import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { generateEmbedding, generateAnswer } from '@/lib/openai'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { 
      question, 
      sessionId,
      matchThreshold = 0.78, 
      matchCount = 5 
    } = await request.json()
    
    if (!question || question.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Question is required' },
        { status: 400 }
      )
    }

    console.log('Processing question:', question)
    
    // Generate or use provided session ID
    const currentSessionId = sessionId || `session_${uuidv4()}`
    const client = await db.connect()

    try {
      // Create or get session
      await client.query(
        `INSERT INTO chat_sessions (session_id, title) 
         VALUES ($1, $2) 
         ON CONFLICT (session_id) DO NOTHING`,
        [currentSessionId, question.substring(0, 100)]
      )

      // Save user question to chat history
      await client.query(
        'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)',
        [currentSessionId, 'user', question]
      )

      // Generate embedding for the question
      const questionEmbedding = await generateEmbedding(question.trim())

      // Search for similar documents using the match_documents function
      console.log(`Searching for similar documents with threshold ${matchThreshold}...`)
      const searchResult = await client.query(
        'SELECT * FROM match_documents($1::vector, $2, $3)',
        [
          `[${questionEmbedding.join(',')}]`,
          matchThreshold,
          matchCount
        ]
      )
      
      const matches = searchResult.rows

      if (!matches || matches.length === 0) {
        const noResultAnswer = '죄송합니다. 업로드된 문서에서 관련된 내용을 찾을 수 없습니다. 다른 질문을 시도해보시거나 관련 문서를 업로드해주세요.'
        
        // Save assistant response to chat history
        await client.query(
          'INSERT INTO chat_messages (session_id, role, content, metadata) VALUES ($1, $2, $3, $4)',
          [currentSessionId, 'assistant', noResultAnswer, JSON.stringify({ evidence: [] })]
        )

        return NextResponse.json({
          success: true,
          sessionId: currentSessionId,
          answer: noResultAnswer,
          evidence: [],
          message: 'No relevant content found',
        })
      }

      // Prepare context for GPT
      const contextChunks = matches.map(match => match.content)
      
      // Generate answer using GPT-4o
      console.log(`Generating answer using ${matches.length} relevant documents`)
      const answer = await generateAnswer(question, contextChunks)

      // Prepare evidence
      const evidence = matches.map(match => ({
        id: match.id,
        title: match.title,
        content: match.content.substring(0, 300) + '...',
        source: match.source,
        similarity: match.similarity,
      }))

      // Save assistant response to chat history with evidence
      await client.query(
        'INSERT INTO chat_messages (session_id, role, content, metadata) VALUES ($1, $2, $3, $4)',
        [currentSessionId, 'assistant', answer, JSON.stringify({ evidence, documentCount: matches.length })]
      )

      console.log('Answer generated and saved successfully')
      return NextResponse.json({
        success: true,
        sessionId: currentSessionId,
        answer,
        evidence,
        message: 'Answer generated successfully',
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
    console.error('Error in answer API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}