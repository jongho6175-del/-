import { useEffect, useState } from "react";
import "./App.css";
import { getProfile } from "./api/benefits";
import type { Benefit, Profile } from "./api/types";
import { Icon } from "./components/Icon";
import type { IconName } from "./components/Icon";
import { ThemeToggle } from "./components/ThemeToggle";
import { DetailScreen } from "./screens/DetailScreen";
import { FindScreen } from "./screens/FindScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SearchScreen } from "./screens/SearchScreen";

export type Tab = "home" | "find" | "search" | "profile";

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: "home", label: "홈", icon: "home" },
  { id: "find", label: "맞춤", icon: "target" },
  { id: "search", label: "검색", icon: "search" },
  { id: "profile", label: "내 조건", icon: "user" },
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [selected, setSelected] = useState<Benefit | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getProfile().then(setProfileState);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // 휴대폰 뒤로가기(제스처·하드웨어 버튼)로 상세 화면을 닫는다
  useEffect(() => {
    const onPop = () => setSelected(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 상세가 열려 있는 동안 뒤 화면이 같이 스크롤되지 않게 고정
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
  }, [selected]);

  const openDetail = (b: Benefit) => {
    window.history.pushState({ detail: b.service_id }, "");
    setSelected(b);
  };

  const closeDetail = () => window.history.back();

  const navigate = (next: Tab) => {
    setTab(next);
    window.scrollTo(0, 0);
  };

  const onSaved = (p: Profile) => {
    setProfileState(p);
    setToast("내 조건을 저장했어요");
    navigate("find");
  };

  return (
    <main className="app">
      <ThemeToggle />
      {tab === "home" && <HomeScreen profile={profile} onSelect={openDetail} onNavigate={navigate} />}
      {tab === "find" && <FindScreen profile={profile} onSelect={openDetail} onNavigate={navigate} />}
      {tab === "search" && <SearchScreen onSelect={openDetail} />}
      {tab === "profile" && <ProfileScreen key={JSON.stringify(profile)} profile={profile} onSaved={onSaved} />}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <nav className="tab-bar" aria-label="메인 메뉴">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? "tab-on" : ""}`}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => navigate(t.id)}
          >
            <Icon name={t.icon} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* 상세는 목록 위에 겹쳐 띄워서, 닫으면 보던 스크롤 위치·검색 결과가 그대로 남는다 */}
      {selected && <DetailScreen benefit={selected} onBack={closeDetail} />}
    </main>
  );
}

export default App;
