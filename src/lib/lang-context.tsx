"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { dict, type Lang } from "./i18n";

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict.en) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (key) => dict.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ym_lang");
    if (saved === "am" || saved === "en") setLangState(saved);
    document.documentElement.lang = saved === "am" ? "am" : "en";
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("ym_lang", l);
    document.documentElement.lang = l;
  };

  const t = (key: keyof typeof dict.en) => dict[lang][key] ?? dict.en[key] ?? String(key);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);