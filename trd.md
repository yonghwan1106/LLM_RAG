# Technical Requirements Document (TRD)

## 1. Executive Technical Summary
- **Project Overview**: Next.js 15 기반의 웹 앱으로, 사용자가 업로드한 논문 PDF를 벡터화하여 질문-답변, 요약, 비교 분석 기능을 제공하는 LLM 기반 RAG 챗봇을 구축합니다. 핵심은 빠른 개발 및 배포를 위해 최소한의 기술 스택을 사용하여 48시간 내에 MVP를 완성하는 것입니다.
- **Core Technology Stack**: Next.js 15, Typescript, Tailwindcss, shadcn/ui, lucide-react, @tanstack/react-query, date-fns, langchain-js, openai-sdk, supabase-js
- **Key Technical Objectives**:
    - **성능**: 평균 응답 시간 8초 이내
    - **정확도**: Top-5 recall 90% 이상
    - **안전성**: 99% 가동률 유지, 무료 티어 리소스 내 운영
- **Critical Technical Assumptions**:
    - Vercel 및 Supabase 무료 티어의 제한 내에서 시스템 운영 가능
    - OpenAI API의 안정적인 가용성 및 비용 예측 가능
    - 초기 사용자 트래픽은 무료 티어 리소스로 충분히 감당 가능

## 2. Tech Stack

| Category          | Technology / Library        | Reasoning (Why it's chosen for this project) |
| ----------------- | --------------------------- | -------------------------------------------- |
| 프레임워크        | Next.js 15                  | 서버 사이드 렌더링(SSR) 및 API 라우팅을 위한 최적의 선택. 빠른 개발과 배포 지원. |
| 언어              | Typescript                  | 타입 안정성 및 개발 생산성 향상. |
| UI 라이브러리       | shadcn/ui                   | 재사용 가능한 UI 컴포넌트 제공, Tailwindcss와 통합 용이. |
| 스타일링          | Tailwindcss                 | 유틸리티 기반 CSS 프레임워크로 빠른 스타일링 가능. |
| 아이콘            | lucide-react                | 고품질 아이콘 제공, React 컴포넌트로 사용 편리. |
| 데이터 페칭       | @tanstack/react-query       | 서버 상태 관리 및 데이터 페칭 효율성 증대. 캐싱 및 재시도 기능 제공. |
| 날짜 처리         | date-fns                    | 가볍고 강력한 날짜 처리 라이브러리. |
| LLM 프레임워크     | langchain-js                | LLM 통합 및 RAG 파이프라인 구축 간소화. |
| LLM API           | openai-sdk                  | OpenAI API 연동을 위한 공식 SDK. |
| 데이터베이스        | Supabase                    | Postgres 기반 벡터 데이터베이스. 무료 티어 제공 및 Next.js와 통합 용이. |
| 벡터 데이터베이스 | pgvector                    | Supabase Postgres 확장으로 벡터 임베딩 저장 및 유사도 검색 지원. |

## 3. System Architecture Design

### Top-Level building blocks
- **Frontend (Next.js 15)**
    - 사용자 인터페이스 및 사용자 상호 작용 처리
    - 컴포넌트: 파일 업로드 컴포넌트, 질문 입력 컴포넌트, 답변 출력 컴포넌트, 근거 문단 표시 컴포넌트
- **Backend (Next.js API Routes)**
    - API 엔드포인트 제공 및 비즈니스 로직 처리
    - 컴포넌트: 파일 처리 API, 임베딩 생성 API, 검색 API, 답변 생성 API
- **Database (Supabase)**
    - 논문 텍스트 및 벡터 임베딩 저장
    - 컴포넌트: Postgres 데이터베이스, pgvector 확장
- **AI Services (OpenAI)**
    - 임베딩 생성 및 자연어 답변 생성
    - 컴포넌트: OpenAI Embeddings API, OpenAI GPT-4o API

### Top-Level Component Interaction Diagram

```mermaid
graph TD
    A[Frontend (Next.js)] --> B[Backend (Next.js API)]
    B --> C[Supabase (Postgres + pgvector)]
    B --> D[OpenAI Embeddings API]
    B --> E[OpenAI GPT-4o API]
```

- **Frontend (Next.js) → Backend (Next.js API)**: 사용자의 파일 업로드 및 질문을 백엔드 API로 전송합니다.
- **Backend (Next.js API) → Supabase**: 백엔드 API는 Supabase 데이터베이스에 임베딩을 저장하고 유사도 검색을 수행합니다.
- **Backend (Next.js API) → OpenAI Embeddings API**: 백엔드 API는 OpenAI Embeddings API를 사용하여 텍스트 임베딩을 생성합니다.
- **Backend (Next.js API) → OpenAI GPT-4o API**: 백엔드 API는 OpenAI GPT-4o API를 사용하여 질문에 대한 답변을 생성합니다.

### Code Organization & Convention
**Domain-Driven Organization Strategy**
- **Domain Separation**: 사용자 관리, 파일 처리, LLM 통합 등 도메인별로 코드 분리
- **Layer-Based Architecture**: Presentation (UI), Business Logic, Data Access, Infrastructure 레이어로 분리
- **Feature-Based Modules**: 파일 업로드, 질문 답변, 요약, 비교 분석 기능별 모듈 구성
- **Shared Components**: 공통 유틸리티, 타입, 재사용 가능한 컴포넌트는 `shared` 모듈에 위치

**Universal File & Folder Structure**
```
/
├── components/             # React 컴포넌트
│   ├── FileUploader.tsx    # 파일 업로드 컴포넌트
│   ├── QuestionInput.tsx   # 질문 입력 컴포넌트
│   ├── AnswerOutput.tsx    # 답변 출력 컴포넌트
│   ├── EvidenceCard.tsx    # 근거 문단 표시 컴포넌트
│   └── ...
├── pages/                  # Next.js 페이지
│   ├── api/                # Next.js API Routes
│   │   ├── upload.ts       # 파일 업로드 API
│   │   ├── embed.ts        # 임베딩 생성 API
│   │   ├── search.ts       # 검색 API
│   │   └── answer.ts       # 답변 생성 API
│   └── index.tsx           # 메인 페이지
├── lib/                    # 유틸리티 함수 및 라이브러리
│   ├── supabase.ts         # Supabase 클라이언트 설정
│   ├── openai.ts           # OpenAI 클라이언트 설정
│   ├── pdf.ts              # PDF 처리 관련 함수
│   └── utils.ts            # 기타 유틸리티 함수
├── types/                  # Typescript 타입 정의
│   ├── paper.ts            # 논문 관련 타입
│   ├── embedding.ts        # 임베딩 관련 타입
│   └── ...
├── styles/                 # 스타일 관련 파일
│   └── globals.css        # 전역 스타일
├── public/                 # 정적 파일
│   └── ...
├── next.config.js          # Next.js 설정 파일
└── tsconfig.json           # Typescript 설정 파일
```

### Data Flow & Communication Patterns
- **Client-Server Communication**: API request/response 패턴 사용. Frontend에서 Backend로 HTTP 요청을 보내고, Backend에서 결과를 JSON 형태로 반환.
- **Database Interaction**: Supabase 클라이언트를 사용하여 데이터베이스와 상호 작용. pgvector 확장을 활용하여 벡터 유사도 검색 수행.
- **External Service Integration**: OpenAI API를 사용하여 임베딩 생성 및 답변 생성. API 키를 사용하여 인증.
- **Data Synchronization**: 데이터 일관성을 위해 트랜잭션 처리 및 낙관적 잠금(optimistic locking) 고려.

## 4. Performance & Optimization Strategy
- **캐싱**: @tanstack/react-query를 사용하여 API 응답 및 자주 사용되는 데이터를 캐싱하여 응답 시간 단축.
- **벡터 검색 최적화**: pgvector 인덱싱을 활용하여 유사도 검색 성능 최적화.
- **GPT-4o 토큰 제한**: 답변 생성 시 토큰 제한을 설정하여 API 비용 절감 및 응답 시간 예측 가능성 확보.
- **코드 분할**: Next.js의 코드 분할 기능을 활용하여 초기 로딩 시간 단축.

## 5. Implementation Roadmap & Milestones
### Phase 1: Foundation (MVP Implementation)
- **Core Infrastructure**: Next.js 프로젝트 셋업, Supabase 및 OpenAI 연동
- **Essential Features**: PDF 업로드, 텍스트 추출, 임베딩 생성, 벡터 DB 저장, 질의 기반 유사도 검색, GPT-4o 기반 자연어 답변 생성
- **Basic Security**: API 키 보호, 사용자 세션 관리
- **Development Setup**: 개발 환경 설정, CI/CD 파이프라인 구축 (Vercel)
- **Timeline**: 2일 (48시간)

### Phase 2: Feature Enhancement
- **Advanced Features**: 답변 내 근거 문단 하이라이트, 대화 내용 Markdown/PDF 내보내기, 한국어/영어 다국어 질문 지원
- **Performance Optimization**: 캐싱 전략 개선, 벡터 검색 최적화, 코드 분할
- **Enhanced Security**: Rate limiting, 입력 유효성 검사, 데이터 암호화
- **Monitoring Implementation**: Vercel 및 Supabase 모니터링 도구 설정
- **Timeline**: 1주일 단위 스프린트

## 6. Risk Assessment & Mitigation Strategies
### Technical Risk Analysis
- **Technology Risks**:
    - LLM 비용 급증: daily usage cap, token limit 설정
    - PDF 파싱 실패: 예외 처리, Txt 추출 실패 알림
    - 답변 오류: 근거 문단 항상 동봉, 신뢰도 score 표시
- **Performance Risks**:
    - 벡터 DB 검색 성능 저하: 인덱싱 최적화, 데이터베이스 튜닝
    - API 응답 시간 지연: 캐싱 전략 개선, 코드 최적화
- **Security Risks**:
    - API 키 노출: 환경 변수 관리, 보안 정책 적용
    - 입력 데이터 유효성 검사 미흡: 입력 유효성 검사 강화
- **Integration Risks**:
    - OpenAI API 장애: 재시도 로직 구현, 대체 API 고려
    - Supabase 장애: 백업 및 복구 전략 수립
- **Mitigation Strategies**:
    - 모니터링 및 로깅 강화
    - 자동화된 테스트 및 코드 리뷰
    - 비상 연락망 및 대응 프로세스 구축

### Project Delivery Risks
- **Timeline Risks**:
    - 개발 일정 지연: 우선순위 조정, 범위 축소
    - 인력 부족: 추가 인력 확보, 외부 전문가 활용
- **Resource Risks**:
    - Vercel 및 Supabase 무료 티어 제한 초과: 유료 티어 전환, 리소스 사용량 최적화
- **Quality Risks**:
    - 코드 품질 저하: 코드 리뷰 강화, 자동화된 테스트
    - 테스트 부족: 테스트 케이스 확대, 사용자 테스트
- **Deployment Risks**:
    - 배포 실패: 롤백 전략 수립, 배포 자동화
    - 환경 설정 오류: 환경 설정 관리 자동화
- **Contingency Plans**:
    - 기술 스택 변경: 대체 기술 검토
    - 기능 축소: 핵심 기능 우선 구현
    - 추가 예산 확보: 유료 서비스 전환
