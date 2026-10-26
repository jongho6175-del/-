import { useEffect, useState } from "react";
import { findBenefits, INTEREST_OPTIONS } from "../api/benefits";
import type { Benefit, BenefitList as BenefitListData, Profile } from "../api/types";
import { BenefitList, Disclaimer } from "../components/BenefitCard";
import { Icon } from "../components/Icon";
import type { Tab } from "../App";

interface Props {
  profile: Profile | null;
  onSelect: (b: Benefit) => void;
  onNavigate: (tab: Tab) => void;
}

const CATEGORIES = ["전체", ...INTEREST_OPTIONS, "인력", "생활안정"];

export function FindScreen({ profile, onSelect, onNavigate }: Props) {
  const [category, setCategory] = useState("전체");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [loaded, setLoaded] = useState<{ key: string; data: BenefitListData } | null>(null);

  // 조건이 바뀌면 이전 결과는 숨기고 새 결과를 기다린다
  const queryKey = JSON.stringify([profile, category, onlyOpen]);
  const result = loaded?.key === queryKey ? loaded.data : null;

  useEffect(() => {
    let alive = true;
    findBenefits(profile, { category: category === "전체" ? "" : category, only_open: onlyOpen }).then(
      (data) => alive && setLoaded({ key: queryKey, data }),
    );
    return () => {
      alive = false;
    };
  }, [profile, category, onlyOpen, queryKey]);

  return (
    <div className="screen">
      <header className="screen-header">
        <h1 className="screen-title">나에게 맞는 지원금</h1>
        <p className="screen-subtitle">
          {profile ? "내 조건으로 거른 뒤 마감 임박순으로 보여드려요" : "조건을 등록하면 더 정확하게 골라드려요"}
        </p>
      </header>

      {!profile && (
        <button type="button" className="link-row" onClick={() => onNavigate("profile")}>
          <span>지금은 전체 지원금을 보여주고 있어요</span>
          <span className="link-text">
            조건 등록 <Icon name="chevron" size={16} />
          </span>
        </button>
      )}

      <div className="chip-row" role="tablist" aria-label="분야">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            className={`chip ${category === c ? "chip-on" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <label className="toggle-row">
        <span>
          {result ? `${result.count}건` : "…"} · 접수 중인 것만
        </span>
        <input type="checkbox" className="switch" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
      </label>

      {!result && <p className="empty">찾는 중…</p>}
      {result && result.count === 0 && <p className="empty">조건에 맞는 지원금이 없어요. 분야를 바꿔보세요.</p>}
      {result && <BenefitList benefits={result.benefits} onSelect={onSelect} />}
      {result && result.count > 0 && <Disclaimer text={result.disclaimer} />}
    </div>
  );
}
