import { useEffect, useState } from "react";
import { deadlineBriefing } from "../api/benefits";
import type { Benefit, Briefing, Profile } from "../api/types";
import { BenefitList, Disclaimer } from "../components/BenefitCard";
import { Icon } from "../components/Icon";
import type { Tab } from "../App";

interface Props {
  profile: Profile | null;
  onSelect: (b: Benefit) => void;
  onNavigate: (tab: Tab) => void;
}

function profileSummary(p: Profile) {
  return [p.age ? `만 ${p.age}세` : "", p.region_sido, p.region_sigungu, ...p.targets].filter(Boolean).join(" · ");
}

export function HomeScreen({ profile, onSelect, onNavigate }: Props) {
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    let alive = true;
    deadlineBriefing(profile).then((b) => alive && setBriefing(b));
    return () => {
      alive = false;
    };
  }, [profile]);

  const deadlineItems = briefing ? (briefing.urgent.length ? briefing.urgent : briefing.upcoming) : [];
  const nearest = deadlineItems[0];

  return (
    <div className="screen">
      <header className="screen-header">
        <p className="eyebrow">{profile ? profileSummary(profile) || "내 조건" : "전체 지원금 기준"}</p>
        <h1 className="screen-title">놓치면 손해인 지원금,{"\n"}마감 전에 챙겨요</h1>
      </header>

      {/* FinanceCard: 카드 하나에 숫자 하나 */}
      <section className="finance-card">
        <p className="finance-label">2주 안에 마감되는 지원금</p>
        <p className="finance-amount">
          {briefing ? briefing.urgent.length : "–"}
          <span className="finance-unit">건</span>
        </p>
        <p className="finance-desc">
          {nearest ? `가장 빠른 마감 ${nearest.dday === 0 ? "오늘" : `D-${nearest.dday}`}` : "불러오는 중…"}
        </p>
      </section>

      {!profile && (
        <button type="button" className="link-row" onClick={() => onNavigate("profile")}>
          <span>
            <strong>내 조건을 등록하면</strong>
            <br />
            나에게 맞는 지원금만 골라드려요
          </span>
          <span className="link-text">
            등록하기 <Icon name="chevron" size={16} />
          </span>
        </button>
      )}

      <button type="button" className="search-entry" onClick={() => onNavigate("search")}>
        <Icon name="search" size={20} />
        청년 월세, 소상공인 대출…
      </button>

      <section className="section">
        <h2 className="section-title">마감 임박</h2>
        {briefing && deadlineItems.length === 0 && <p className="empty">2주 안에 마감되는 지원금이 없어요</p>}
        {briefing && briefing.urgent.length === 0 && deadlineItems.length > 0 && (
          <p className="section-note">7일 내 마감은 없지만 다가오는 마감이에요</p>
        )}
        <BenefitList benefits={deadlineItems.slice(0, 5)} onSelect={onSelect} />
      </section>

      {briefing && briefing.also_open.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">언제든 신청할 수 있어요</h2>
            <button type="button" className="link-text" onClick={() => onNavigate("find")}>
              전체보기 <Icon name="chevron" size={16} />
            </button>
          </div>
          <BenefitList benefits={briefing.also_open.slice(0, 3)} onSelect={onSelect} />
        </section>
      )}

      {briefing && <Disclaimer text={briefing.disclaimer} />}
    </div>
  );
}
