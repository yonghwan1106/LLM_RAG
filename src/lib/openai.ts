import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

export async function generateAnswer(
  question: string,
  context: string[]
): Promise<string> {
  try {
    const systemPrompt = `당신은 논문 분석 전문가입니다. 사용자의 질문에 대해 제공된 논문 내용을 바탕으로 정확하고 상세한 답변을 제공해주세요.

답변 가이드라인:
1. 제공된 컨텍스트에서 질문과 관련된 정보만 사용하세요
2. 정보가 부족하면 "제공된 논문에서는 해당 내용을 찾을 수 없습니다"라고 명시하세요
3. 답변은 한국어로 작성하되, 전문 용어는 영문 병기하세요
4. 가능한 경우 구체적인 예시나 수치를 포함하세요
5. 답변은 4096 토큰을 넘지 않도록 간결하게 작성하세요`

    const userPrompt = `질문: ${question}

관련 논문 내용:
${context.map((chunk, index) => `[${index + 1}] ${chunk}`).join('\n\n')}

위의 논문 내용을 바탕으로 질문에 답변해주세요.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.3,
    })

    return response.choices[0].message?.content || '답변을 생성할 수 없습니다.'
  } catch (error) {
    console.error('Error generating answer:', error)
    throw new Error('Failed to generate answer')
  }
}