## 제품 개요
LLM-기반 RAG(검색 증강 생성) 챗봇으로, 사용자가 업로드한 논문 PDF를 벡터화하여 질문-답변·요약·비교 분석을 지원한다. 2일 안에 동작하는 MVP를 웹 앱(Next.js 15)으로 구축한다.

## 목표
1. 논문 핵심 정보를 몇 분 안에 획득하게 해 연구 속도를 50% 이상 단축
2. 답변 근거(문단) 노출로 정확도 신뢰성 점수 80% 이상 확보
3. 공개 웹앱 출시 48시간 이내 30명 베타 사용자 확보

## 주요 사용자
- 국내외 대학원생 연구자(석·박사 과정)

## 핵심 Pain Point
- 논문을 전부 읽을 시간이 부족하다
- 필요한 정보 위치를 찾기 어렵다
- 여러 논문을 비교·정리하기 번거롭다

## 사용자 목표
- 연구 주제 관련 핵심 정보를 신속하게 확보하여 논문 작성 시간 단축

## 핵심 사용 시나리오
1. PDF 업로드 후 Q&A로 깊이 탐구
2. 긴 논문 빠른 요약
3. 여러 논문 비교·분석

## MVP 범위
필수 기능(Core)
1. PDF 업로드 & 텍스트 추출
2. 임베딩 생성 + Supabase 벡터 DB 저장
3. 질의 기반 유사도 검색 & 관련 문단 반환
4. GPT-4o 기반 자연어 답변 생성

부가 기능(Nice to have)
A. 답변 내 근거 문단 하이라이트
B. 대화 내용 Markdown/PDF 내보내기
C. 한국어·영어 다국어 질문 지원

## 기능 상세
| 기능 | 설명 | 우선순위 |
| --- | --- | --- |
| 파일 업로드 | 1개 또는 다중 PDF drag & drop | P0 |
| 텍스트 추출 | pdfjs + langchain-document-loader | P0 |
| 임베딩 | OpenAI Embeddings → Supabase pgvector | P0 |
| 검색 | cosine similarity top-k (k=5) | P0 |
| 답변 생성 | 답변 + 근거 문단 포함, 4096 토큰 제한 | P0 |
| 다국어 입력 | ko/en 자동 감지 | P1 |
| 근거 하이라이트 | UI에 문단 카드 강조 | P1 |
| 대화 내보내기 | Markdown / PDF 다운로드 | P2 |

## 비기능 요구사항
- 정확도: Top-5 recall 90% 이상
- 성능: 평균 응답 ≤ 8초
- 안전성: 99% 가동률, 서버리소스 무리 없는 free tier
- 보안: 파일은 사용자 세션에만 매핑, 7일 후 자동 삭제

## 기술 스택
- 프론트: Next.js 15, Typescript, shadcn/ui, tailwindcss, lucide-react, @tanstack/react-query
- 백엔드: Next.js Route Handler(API), Supabase(postgres + pgvector), LangChain JS
- AI: OpenAI GPT-4o(answers), OpenAI Embeddings(text-embedding-3-small)
- 기타: date-fns, es-toolkit

## 개발 전략
- MVP → 공개 → 사용자 피드백 → 1주 단위 기능 추가(인크리멘털)

## 일정(48h)
Day 1 AM: 프로젝트 셋업, 업로드/추출 완료
Day 1 PM: 임베딩, 벡터 DB 연동, 검색 완료
Day 2 AM: 답변 생성 UI, 근거 노출
Day 2 PM: 다국어 처리, QA, 배포(Vercel)

## 성공 지표
- 첫 주 내 DAU 20명, 세션당 평균 질문 5회
- 답변 만족도(구글 설문) 4/5 이상

## 위험 & 대응
- LLM 비용 급증 → daily usage cap, token limit 설정
- PDF 파싱 실패 → 예외 처리, Txt 추출 실패 알림
- 답변 오류 → 근거 문단 항상 동봉, 신뢰도 score 표시

## 릴리즈 & 배포
- Vercel 프리 티어, Supabase 프리 티어 사용
- 도메인: paper-chat.xyz (가안)

## 향후 로드맵(기회)
- 인용문 자동 생성, Zotero 연동
- 실시간 협업(공유 룸)
- 기관용 SSO, 요금제