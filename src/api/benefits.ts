import { DISCLAIMER, SAMPLE_BENEFITS, SAMPLE_DATE } from "./sampleData";
import type { Benefit, BenefitList, Briefing, Profile, Source } from "./types";

// 지원금봇 MCP 도구 5개와 같은 이름·인자를 가진 클라이언트.
// 지금은 샘플 데이터로 동작하고, 서버를 붙이면 각 함수 안만 fetch로 바꾸면 된다.

const PROFILE_KEY = "subsidy-finder:profile";

export const EMPTY_PROFILE: Profile = {
  age: null,
  region_sido: "",
  region_sigungu: "",
  targets: [],
  interests: [],
};

export const SIDO_LIST: { name: string; short: string }[] = [
  { name: "서울특별시", short: "서울" },
  { name: "부산광역시", short: "부산" },
  { name: "대구광역시", short: "대구" },
  { name: "인천광역시", short: "인천" },
  { name: "광주광역시", short: "광주" },
  { name: "대전광역시", short: "대전" },
  { name: "울산광역시", short: "울산" },
  { name: "세종특별자치시", short: "세종" },
  { name: "경기도", short: "경기" },
  { name: "강원특별자치도", short: "강원" },
  { name: "충청북도", short: "충북" },
  { name: "충청남도", short: "충남" },
  { name: "전북특별자치도", short: "전북" },
  { name: "전라남도", short: "전남" },
  { name: "경상북도", short: "경북" },
  { name: "경상남도", short: "경남" },
  { name: "제주특별자치도", short: "제주" },
];

export const TARGET_OPTIONS = ["청년", "소상공인", "육아", "신혼", "고령", "구직"];
export const INTEREST_OPTIONS = ["금융", "창업", "주거", "교육", "기술"];

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const isOpen = (b: Benefit) => b.deadline_status !== "마감";

// 마감 임박순: D-day 있는 것 먼저(작은 순), 그다음 상시/미상
const byDeadline = (a: Benefit, b: Benefit) =>
  (a.dday ?? Number.MAX_SAFE_INTEGER) - (b.dday ?? Number.MAX_SAFE_INTEGER);

const haystack = (b: Benefit) =>
  [b.name, b.category, b.agency, b.exec_agency, b.target, b.summary, b.support, b.hashtags].join(" ");

function matchesRegion(b: Benefit, sido: string) {
  if (!sido) return true;
  // 중앙부처·공공기관 사업은 전국 대상
  if (b.agency_type === "중앙행정기관" || b.agency_type === "공공기관") return true;
  const short = SIDO_LIST.find((s) => s.name === sido)?.short ?? sido;
  return haystack(b).includes(short) || b.agency.includes(sido);
}

function matchesTargets(b: Benefit, targets: string[]) {
  if (targets.length === 0) return true;
  const text = haystack(b);
  return targets.some((t) => text.includes(t));
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

// set_profile
export async function setProfile(profile: Profile): Promise<Profile> {
  await wait();
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // 저장소를 못 쓰는 환경에서는 이번 실행 동안만 유지
  }
  return profile;
}

// find_benefits
export async function findBenefits(
  profile: Profile | null,
  { category = "", only_open = true }: { category?: string; only_open?: boolean } = {},
): Promise<BenefitList> {
  await wait();
  const benefits = SAMPLE_BENEFITS.filter((b) => !only_open || isOpen(b))
    .filter((b) => matchesRegion(b, profile?.region_sido ?? ""))
    .filter((b) => matchesTargets(b, profile?.targets ?? []))
    .filter((b) => !category || haystack(b).includes(category))
    .sort(byDeadline);
  return { count: benefits.length, benefits, disclaimer: DISCLAIMER };
}

// search_benefits
export async function searchBenefits({
  keyword,
  only_open = true,
}: {
  keyword: string;
  only_open?: boolean;
}): Promise<BenefitList> {
  await wait();
  const words = keyword.trim().split(/\s+/).filter(Boolean);
  const benefits = SAMPLE_BENEFITS.filter((b) => !only_open || isOpen(b))
    .filter((b) => words.every((w) => haystack(b).includes(w)))
    .sort(byDeadline);
  return { count: benefits.length, benefits, disclaimer: DISCLAIMER };
}

// benefit_detail
export async function benefitDetail(service_id: string, source: Source = "보조금24"): Promise<Benefit | null> {
  await wait(150);
  return SAMPLE_BENEFITS.find((b) => b.service_id === service_id && b.source === source) ?? null;
}

// deadline_briefing
export async function deadlineBriefing(profile: Profile | null, days = 14): Promise<Briefing> {
  await wait();
  const pool = SAMPLE_BENEFITS.filter(isOpen)
    .filter((b) => matchesRegion(b, profile?.region_sido ?? ""))
    .filter((b) => matchesTargets(b, profile?.targets ?? []));
  const dated = pool.filter((b) => b.dday !== null).sort(byDeadline);
  const urgent = dated.filter((b) => b.dday! <= days);
  const upcoming = urgent.length ? [] : dated.slice(0, 3);
  const also_open = pool.filter((b) => b.deadline_status === "상시");
  return {
    briefing_date: SAMPLE_DATE,
    headline: urgent.length ? `마감 임박 지원금 ${urgent.length}건 (D-${days} 이내)` : "다가오는 마감",
    urgent,
    upcoming,
    also_open,
    disclaimer: DISCLAIMER,
  };
}
