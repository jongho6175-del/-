import { useState } from "react";
import type { FormEvent } from "react";
import { searchBenefits } from "../api/benefits";
import type { Benefit, BenefitList as BenefitListData } from "../api/types";
import { BenefitList, Disclaimer } from "../components/BenefitCard";

const SUGGESTIONS = ["청년", "월세", "창업", "소상공인", "주거", "임차료", "심리 상담"];

export function SearchScreen({ onSelect }: { onSelect: (b: Benefit) => void }) {
  const [keyword, setKeyword] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [result, setResult] = useState<BenefitListData | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(word: string, open = onlyOpen) {
    if (!word.trim()) return;
    setKeyword(word);
    setLoading(true);
    setResult(await searchBenefits({ keyword: word, only_open: open }));
    setLoading(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    run(keyword);
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <h1 className="screen-title">지원금 검색</h1>
        <p className="screen-subtitle">내 조건과 상관없이 키워드로 찾아요</p>
      </header>

      <form className="search-form" onSubmit={onSubmit} role="search">
        <input
          className="search-input"
          type="search"
          enterKeyHint="search"
          placeholder="예: 청년 월세, 전기차 보조금"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          autoFocus
        />
        <button type="submit" className="search-submit" disabled={!keyword.trim()}>
          검색
        </button>
      </form>

      <div className="chip-row">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => run(s)}>
            {s}
          </button>
        ))}
      </div>

      <label className="toggle-row">
        <span>접수 중인 것만</span>
        <input
          type="checkbox"
          className="switch"
          checked={onlyOpen}
          onChange={(e) => {
            setOnlyOpen(e.target.checked);
            if (result) run(keyword, e.target.checked);
          }}
        />
      </label>

      {loading && <p className="empty">검색 중…</p>}
      {!loading && result && (
        <>
          <p className="result-count">
            ‘{keyword}’ 검색 결과 <strong>{result.count}건</strong>
          </p>
          {result.count === 0 && <p className="empty">검색 결과가 없어요. 다른 단어로 찾아보세요.</p>}
          <BenefitList benefits={result.benefits} onSelect={onSelect} />
          {result.count > 0 && <Disclaimer text={result.disclaimer} />}
        </>
      )}
    </div>
  );
}
