import { useState } from "react";
import { EMPTY_PROFILE, INTEREST_OPTIONS, setProfile, SIDO_LIST, TARGET_OPTIONS } from "../api/benefits";
import type { Profile } from "../api/types";

interface Props {
  profile: Profile | null;
  onSaved: (p: Profile) => void;
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="chip-wrap">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value.includes(o)}
          className={`chip ${value.includes(o) ? "chip-on" : ""}`}
          onClick={() => onChange(toggle(value, o))}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function ProfileScreen({ profile, onSaved }: Props) {
  const [form, setForm] = useState<Profile>(profile ?? EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<Profile>) => setForm((f) => ({ ...f, ...patch }));

  async function save() {
    setSaving(true);
    onSaved(await setProfile(form));
    setSaving(false);
  }

  return (
    <div className="screen screen-with-cta">
      <header className="screen-header">
        <h1 className="screen-title">내 조건</h1>
        <p className="screen-subtitle">저장한 조건으로 나에게 해당되는 지원금만 골라드려요</p>
      </header>

      <div className="field">
        <label className="field-label" htmlFor="age">
          나이 (만)
        </label>
        <input
          id="age"
          className="text-input"
          type="number"
          inputMode="numeric"
          min={0}
          max={120}
          placeholder="예: 29"
          value={form.age ?? ""}
          onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="sido">
          시/도
        </label>
        <select
          id="sido"
          className="text-input"
          value={form.region_sido}
          onChange={(e) => update({ region_sido: e.target.value })}
        >
          <option value="">선택 안 함 (전국)</option>
          {SIDO_LIST.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="sigungu">
          시/군/구
        </label>
        <input
          id="sigungu"
          className="text-input"
          placeholder="예: 강남구, 성남시"
          value={form.region_sigungu}
          onChange={(e) => update({ region_sigungu: e.target.value })}
        />
      </div>

      <div className="field">
        <span className="field-label">대상</span>
        <ChipGroup options={TARGET_OPTIONS} value={form.targets} onChange={(targets) => update({ targets })} />
      </div>

      <div className="field">
        <span className="field-label">관심 분야</span>
        <ChipGroup options={INTEREST_OPTIONS} value={form.interests} onChange={(interests) => update({ interests })} />
      </div>

      <div className="bottom-cta">
        <button type="button" className="primary-button" onClick={save} disabled={saving}>
          {saving ? "저장 중…" : "저장하고 맞춤 지원금 보기"}
        </button>
      </div>
    </div>
  );
}
