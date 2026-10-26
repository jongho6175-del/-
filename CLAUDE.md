# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

"지원금 찾기" — 정부 지원금을 찾아 주는 **앱인토스(Apps in Toss)** 미니앱입니다 (React 19 + TypeScript + Vite, `@apps-in-toss/web-framework`). UI 문구와 코드 주석은 한글로 작성하고, 이 방식을 유지합니다.

## 명령어

```bash
npm run dev       # Vite 개발 서버 :5173 (../.claude/launch.json의 "subsidy-finder" 항목과 동일)
npm run build     # tsc -b && vite build && ait build  (타입 검사 → dist/로 번들 → .ait 패키징)
npm run lint      # oxlint (설정: .oxlintrc.json)
npm run deploy    # ait deploy — 앱인토스에 배포함. 외부에 공개되므로 실행 전 반드시 확인
```

테스트 코드는 없습니다. 타입 검사는 `tsc -b`(`npm run build`에 포함)로 합니다. `tsconfig.app.json`에서 `noUnusedLocals`/`noUnusedParameters`, `verbatimModuleSyntax`(타입은 `import type`으로 가져올 것), `erasableSyntaxOnly`(enum·namespace·생성자 매개변수 프로퍼티 사용 불가)가 켜져 있습니다.

플랫폼 설정(앱 이름, 브랜드 색상, 권한, `webBundleDir`)은 `apps-in-toss.config.ts`에서 관리합니다. `vite.config.ts`는 React 플러그인과 함께 `@apps-in-toss/devtools` 플러그인을 불러옵니다.

## 구조

**데이터 계층 — `src/api/`.** `benefits.ts`는 지원금봇(카카오 jiwongumBot) MCP 도구와 이름·인자가 같은 함수 5개를 가진 클라이언트입니다: `setProfile`, `findBenefits`, `searchBenefits`, `benefitDetail`, `deadlineBriefing` (그리고 `getProfile`). 지금은 `sampleData.ts`(`SAMPLE_DATE` 시점의 실제 지원금봇 응답을 추린 샘플)를 인위적인 지연과 함께 돌려줍니다. 실제 서버를 붙일 때는 함수 시그니처는 그대로 두고 각 함수 안만 `fetch`로 바꾸면 됩니다. `types.ts`는 MCP 응답 구조를 그대로 따르지만, `Benefit.max_amount`만은 예외로 공고 본문에서 사람이 직접 정리한 값이며 원본 데이터에는 없습니다. 지역 필터에서 중앙행정기관·공공기관 사업은 전국 대상으로 취급하고, 결과는 `dday` 순(값이 없거나 상시인 것은 뒤로)으로 정렬합니다.

**화면 이동 — `src/App.tsx`.** 라우터가 없습니다. `App`이 `tab` 상태로 네 화면(`home`/`find`/`search`/`profile`, `src/screens/`)과 하단 탭 바를 관리합니다. `DetailScreen`은 현재 탭 위에 겹쳐 띄우는 오버레이라서, 닫아도 목록의 스크롤 위치와 검색 결과가 그대로 남습니다. 상세를 열 때 `history`에 항목을 추가하고 닫을 때 `history.back()`을 호출하므로, 휴대폰 뒤로가기 제스처가 `popstate`를 통해 상세를 닫습니다. `ProfileScreen`은 직렬화한 프로필을 `key`로 받아, 프로필이 바뀌면 폼이 초기화됩니다.

**저장.** `localStorage` 키는 `subsidy-finder:` 접두사를 씁니다(`profile`, `theme`). 모든 접근은 try/catch로 감싸고, 저장소를 못 쓰면 이번 실행 동안만 메모리에 유지합니다.

**테마.** 디자인 토큰은 `src/index.css`의 CSS 변수입니다(토스 스타일 색상, 폰트는 `index.html`에서 CDN으로 불러오는 Pretendard). 다크 모드는 `html[data-theme]`로 전환합니다. 깜빡임을 막기 위해 `index.html`의 인라인 스크립트가 첫 렌더 전에 `data-theme`을 정하고, 이후로는 `ThemeToggle`이 이를 관리하며 `theme-color` 메타도 함께 바꿉니다. 컴포넌트 스타일은 `src/App.css`에 있습니다.

**포맷 — `src/utils/format.ts`.** 원화 표기(`formatWon`: 억/만원), D-day 라벨과 색상, 그리고 `amountView`가 있습니다. `amountView`는 정리된 `max_amount`를 우선 쓰고, 없을 때만 공고 본문에서 "최대 N원"을 정규식으로 찾아냅니다("5천만원 이하" 같은 자격 조건 금액은 일부러 무시).
