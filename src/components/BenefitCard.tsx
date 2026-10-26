import type { Benefit } from "../api/types";
import { amountView, cleanText, ddayLabel, ddayTone } from "../utils/format";

export function DdayBadge({ benefit }: { benefit: Benefit }) {
  return <span className={`badge badge-${ddayTone(benefit)}`}>{ddayLabel(benefit)}</span>;
}

interface Props {
  benefit: Benefit;
  onClick: (b: Benefit) => void;
}

export function BenefitCard({ benefit, onClick }: Props) {
  const lead = cleanText(benefit.summary).split("\n")[0];
  const amount = amountView(benefit);
  return (
    <button type="button" className="benefit-card" onClick={() => onClick(benefit)}>
      <div className="benefit-card-top">
        <DdayBadge benefit={benefit} />
        <span className="benefit-category">{benefit.category}</span>
      </div>
      <p className="benefit-name">{benefit.name}</p>
      <p className={`benefit-amount ${amount.known ? "" : "benefit-amount-muted"}`}>{amount.headline}</p>
      <p className="benefit-lead">{lead}</p>
      <p className="benefit-meta">
        {benefit.agency} · {benefit.source}
      </p>
    </button>
  );
}

export function BenefitList({ benefits, onSelect }: { benefits: Benefit[]; onSelect: (b: Benefit) => void }) {
  return (
    <ul className="benefit-list">
      {benefits.map((b) => (
        <li key={`${b.source}-${b.service_id}`}>
          <BenefitCard benefit={b} onClick={onSelect} />
        </li>
      ))}
    </ul>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return <p className="disclaimer">{text}</p>;
}
