# LLM RAG Chatbot

PDF 논문 분석 및 질의응답을 위한 LLM 기반 RAG(검색 증강 생성) 챗봇입니다.

## 주요 기능

- **PDF 업로드 및 분석**: PDF 논문을 업로드하면 자동으로 텍스트를 추출하고 벡터화
- **지능형 질의응답**: 업로드된 논문을 바탕으로 GPT-4o가 정확한 답변 제공
- **근거 문단 제시**: 답변과 함께 관련 논문 구간을 근거로 표시
- **유사도 기반 검색**: 벡터 임베딩을 활용한 정확한 내용 검색
- **실시간 채팅 인터페이스**: 직관적인 대화형 UI

## 기술 스택

### 프론트엔드
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성 제공
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Lucide React**: 아이콘 라이브러리

### 백엔드
- **Next.js API Routes**: 서버리스 API 엔드포인트
- **Supabase**: PostgreSQL + pgvector 벡터 데이터베이스
- **OpenAI API**: GPT-4o 및 text-embedding-3-small

### AI/ML
- **LangChain**: LLM 통합 프레임워크
- **PDF.js**: PDF 텍스트 추출
- **OpenAI Embeddings**: 텍스트 벡터화

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd LLM_RAG
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.example` 파일을 `.env`로 복사하고 필요한 값들을 설정합니다:

```bash
cp .env.example .env
```

`.env` 파일에 다음 값들을 입력:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase 데이터베이스 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL 편집기에서 `supabase_schema.sql` 파일의 내용을 실행
3. pgvector 확장이 활성화되었는지 확인

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속

## API 엔드포인트

### POST `/api/upload`
PDF 파일을 업로드하고 벡터화하여 데이터베이스에 저장

**Request:**
- `file`: PDF 파일 (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "document_id": "uuid",
  "message": "Successfully processed N chunks from filename.pdf"
}
```

### POST `/api/search`
질의에 대한 유사 문서 청크 검색

**Request:**
```json
{
  "query": "검색할 질문",
  "matchThreshold": 0.5,
  "matchCount": 5
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "content": "문서 내용",
      "similarity": 0.85,
      "filename": "document.pdf"
    }
  ]
}
```

### POST `/api/answer`
질의에 대한 GPT-4o 기반 답변 생성

**Request:**
```json
{
  "question": "질문 내용",
  "matchThreshold": 0.5,
  "matchCount": 5
}
```

**Response:**
```json
{
  "success": true,
  "answer": "생성된 답변",
  "evidence": [
    {
      "content": "근거 문단",
      "filename": "document.pdf",
      "similarity": 0.85
    }
  ]
}
```

## 주요 컴포넌트

- `FileUploader`: PDF 파일 업로드 컴포넌트
- `QuestionInput`: 질문 입력 폼
- `AnswerOutput`: 대화 내역 표시
- `EvidenceCard`: 근거 문단 카드

## 배포

### Vercel 배포
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정
4. 배포 완료

### 환경 변수 (Vercel)
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 라이센스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request