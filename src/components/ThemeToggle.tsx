import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type Theme = "light" | "dark";

const THEME_KEY = "subsidy-finder:theme";

// index.html의 인라인 스크립트가 첫 렌더 전에 data-theme을 이미 정해 둔다
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#17171c" : "#ffffff");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // 저장소를 못 쓰면 이번 실행 동안만 유지
    }
  }, [theme]);

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={next === "dark" ? "다크 모드로 전환" : "라이트 모드로 전환"}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={22} />
    </button>
  );
}
