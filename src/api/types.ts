// 지원금봇 MCP 응답 구조를 그대로 따른 타입

export type Source = "보조금24" | "기업마당";

export type DeadlineStatus = "오늘마감" | "임박" | "진행중" | "상시" | "미상" | "마감";

export type AmountKind = "현금" | "대출" | "보증" | "바우처" | "현물";

// 최대 지원금액. 지원금봇 원본에는 없고, 공고 본문에서 정리한 값이다.
export interface MaxAmount {
  won: number | null; // 원 단위. 금액으로 환산할 수 없으면 null
  kind: AmountKind;
  label?: string; // 기본 "최대 N원" 대신 보여줄 문구 (예: "임대료 50%", "월 최대 150만원")
  note?: string; // 산정 근거 (예: "월 60만원 × 12개월")
}

export interface Benefit {
  service_id: string;
  name: string;
  category: string;
  agency: string;
  exec_agency?: string;
  agency_type?: string;
  apply_period: string;
  target: string;
  summary: string;
  support?: string;
  criteria?: string | null;
  apply_method: string;
  contact?: string;
  phone?: string;
  hashtags?: string;
  detail_url: string;
  source: Source;
  dday: number | null;
  deadline_status: DeadlineStatus;
  max_amount?: MaxAmount;
}

// set_profile
export interface Profile {
  age: number | null;
  region_sido: string;
  region_sigungu: string;
  targets: string[];
  interests: string[];
}

// find_benefits / search_benefits
export interface BenefitList {
  count: number;
  benefits: Benefit[];
  disclaimer: string;
}

// deadline_briefing
export interface Briefing {
  briefing_date: string;
  headline: string;
  urgent: Benefit[];
  upcoming: Benefit[];
  also_open: Benefit[];
  disclaimer: string;
}
