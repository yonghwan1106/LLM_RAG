import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

// GET: 채팅 히스토리 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = Number(searchParams.get('limit')) || 50
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      )
    }

    const client = await db.connect()
    
    try {
      // 세션 정보 조회
      const sessionResult = await client.query(
        'SELECT * FROM chat_sessions WHERE session_id = $1',
        [sessionId]
      )
      
      if (sessionResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Session not found' },
          { status: 404 }
        )
      }
      
      const session = sessionResult.rows[0]

      // 채팅 메시지 조회
      const messagesResult = await client.query(
        `SELECT id, role, content, metadata, created_at 
         FROM chat_messages 
         WHERE session_id = $1 
         ORDER BY created_at ASC 
         LIMIT $2`,
        [sessionId, limit]
      )
      
      const messages = messagesResult.rows

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          sessionId: session.session_id,
          title: session.title,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        },
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          createdAt: msg.created_at
        })),
        count: messages.length
      })
      
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      )
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error in chat history API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: 새 채팅 세션 생성
export async function POST(request: NextRequest) {
  try {
    const { sessionId, title, userId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      )
    }

    const client = await db.connect()
    
    try {
      const result = await client.query(
        `INSERT INTO chat_sessions (session_id, title, user_id) 
         VALUES ($1, $2, $3) 
         RETURNING id, session_id, title, user_id, created_at, updated_at`,
        [sessionId, title || 'New Chat', userId || null]
      )
      
      const session = result.rows[0]

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          sessionId: session.session_id,
          title: session.title,
          userId: session.user_id,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        },
        message: 'Session created successfully'
      })
      
    } catch (dbError: any) {
      if (dbError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { success: false, message: 'Session already exists' },
          { status: 409 }
        )
      }
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      )
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error in chat session creation API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: 채팅 세션 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      )
    }

    const client = await db.connect()
    
    try {
      const result = await client.query(
        'DELETE FROM chat_sessions WHERE session_id = $1 RETURNING session_id',
        [sessionId]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Session not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Session deleted successfully',
        sessionId: result.rows[0].session_id
      })
      
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      )
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error in chat session deletion API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}