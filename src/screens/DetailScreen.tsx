import { useEffect, useState } from "react";
import { benefitDetail } from "../api/benefits";
import type { Benefit } from "../api/types";
import { DdayBadge } from "../components/BenefitCard";
import { Icon } from "../components/Icon";
import { amountView, cleanText, ddayLabel, formatPeriod } from "../utils/format";

interface Props {
  benefit: Benefit;
  onBack: () => void;
}

// AmountRow: 항목명 왼쪽, 값 오른쪽 끝
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Block({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <section className="detail-block">
      <h2>{label}</h2>
      <p>{cleanText(value)}</p>
    </section>
  );
}

export function DetailScreen({ benefit, onBack }: Props) {
  const [detail, setDetail] = useState<Benefit>(benefit);
  const amount = amountView(detail);

  useEffect(() => {
    benefitDetail(benefit.service_id, benefit.source).then((d) => d && setDetail(d));
  }, [benefit]);

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={detail.name}>
      <div className="detail-nav">
        <button type="button" className="icon-button" onClick={onBack} aria-label="뒤로가기">
          <Icon name="back" />
        </button>
      </div>

      <div className="screen screen-with-cta">
        <header className="detail-header">
          <DdayBadge benefit={detail} />
          <h1 className="detail-title">{detail.name}</h1>
          <p className="detail-agency">{detail.agency}</p>
        </header>

        <section className="finance-card amount-card">
          <p className="finance-label">
            최대 지원금액
            {amount.kind && amount.kind !== "현금" && <span className="kind-tag">{amount.kind}</span>}
          </p>
          <p className={`amount-headline ${amount.known ? "" : "amount-headline-muted"}`}>{amount.headline}</p>
          {amount.note && <p className="finance-desc">{amount.note}</p>}
        </section>

        <dl className="info-card">
          <InfoRow label="마감" value={ddayLabel(detail)} />
          <InfoRow label="신청 기간" value={formatPeriod(detail.apply_period)} />
          <InfoRow label="분야" value={detail.category} />
          <InfoRow label="출처" value={detail.source} />
          {detail.exec_agency && detail.exec_agency !== detail.agency && (
            <InfoRow label="수행기관" value={detail.exec_agency} />
          )}
        </dl>

        <Block label="지원 내용" value={detail.support ?? detail.summary} />
        <Block label="지원 대상" value={detail.target} />
        <Block label="선정 기준" value={detail.criteria} />
        <Block label="신청 방법" value={detail.apply_method} />
        <Block label="문의" value={detail.contact ?? detail.phone} />

        <p className="disclaimer">신청 전 반드시 원문에서 자격요건과 신청기간을 확인하세요.</p>

        <div className="bottom-cta">
          <a className="primary-button" href={detail.detail_url} target="_blank" rel="noopener noreferrer">
            {detail.source}에서 신청하러 가기
          </a>
        </div>
      </div>
    </div>
  );
}
