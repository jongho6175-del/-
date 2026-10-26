import type { Benefit, MaxAmount } from "../api/types";

// 7_200_000 → "720만원", 20_000_000 → "2,000만원", 150_000_000 → "1억 5,000만원"
export function formatWon(won: number) {
  const eok = Math.floor(won / 100_000_000);
  const man = Math.round((won % 100_000_000) / 10_000);
  if (eok && man) return `${eok}억 ${man.toLocaleString("ko-KR")}만원`;
  if (eok) return `${eok}억원`;
  if (man) return `${man.toLocaleString("ko-KR")}만원`;
  return `${won.toLocaleString("ko-KR")}원`;
}

const UNIT: Record<string, number> = { 억: 100_000_000, 천만: 10_000_000, 백만: 1_000_000, 만: 10_000, "": 1 };

// 정리된 값이 없을 때만 쓰는 보조 추출: 본문의 "최대 N원" 중 가장 큰 값.
// "5천만원 이하" 같은 자격 조건을 금액으로 오인하지 않도록 '최대'가 붙은 것만 본다.
export function extractMaxAmount(b: Benefit): MaxAmount | null {
  const text = [b.support, b.summary].filter(Boolean).join(" ");
  const re = /최대\s*([\d,]+(?:\.\d+)?)\s*(억|천만|백만|만)?\s*원/g;
  let best = 0;
  for (const m of text.matchAll(re)) {
    best = Math.max(best, Number(m[1].replace(/,/g, "")) * UNIT[m[2] ?? ""]);
  }
  return best ? { won: best, kind: "현금", note: "공고문에서 자동으로 찾은 금액이에요" } : null;
}

export interface AmountView {
  headline: string; // "최대 720만원", "임대료 50%", "금액 공고문 확인"
  kind?: MaxAmount["kind"];
  note?: string;
  known: boolean;
}

const KIND_PREFIX: Partial<Record<MaxAmount["kind"], string>> = { 대출: "대출 ", 보증: "보증 " };

export function amountView(b: Benefit): AmountView {
  const amount = b.max_amount ?? extractMaxAmount(b);
  if (!amount) return { headline: "금액 공고문 확인", known: false };
  if (amount.won === null) {
    return { headline: amount.label ?? "현물·서비스 지원", kind: amount.kind, note: amount.note, known: false };
  }
  const suffix = amount.kind === "바우처" ? " 상당" : "";
  return {
    headline: amount.label ?? `${KIND_PREFIX[amount.kind] ?? ""}최대 ${formatWon(amount.won)}${suffix}`,
    kind: amount.kind,
    note: amount.note,
    known: true,
  };
}

export function ddayLabel(b: Benefit) {
  if (b.deadline_status === "상시") return "상시";
  if (b.deadline_status === "마감") return "마감";
  if (b.dday === null) return "기간 확인";
  return b.dday === 0 ? "오늘 마감" : `D-${b.dday}`;
}

export function ddayTone(b: Benefit) {
  if (b.dday !== null && b.dday <= 3) return "urgent";
  if (b.dday !== null && b.dday <= 14) return "soon";
  return "calm";
}

// "2026-10-13 ~ 2026-10-21" → "2026.10.13 ~ 10.21" (좁은 화면에서 날짜 중간이 끊기지 않게 짧게)
export function formatPeriod(period: string) {
  const m = period.match(/^(\d{4})-(\d{2})-(\d{2})\s*~\s*(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return period;
  const [, y1, m1, d1, y2, m2, d2] = m;
  return y1 === y2 ? `${y1}.${m1}.${d1} ~ ${m2}.${d2}` : `${y1}.${m1}.${d1} ~ ${y2}.${m2}.${d2}`;
}

// 원문 요약의 HTML 엔티티와 ☞ 구분자를 정리
export function cleanText(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\r/g, "")
    .replace(/☞\s*/g, "\n• ")
    .trim();
}
