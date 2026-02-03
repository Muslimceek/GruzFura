
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language } from './translations';

type TranslationKey = keyof typeof translations.ru;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'gruzfura_preferred_language';

export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  useEffect(() => {
    const detectRegion = async () => {
      if (localStorage.getItem(STORAGE_KEY)) return;

      const regionMapping: Record<string, Language> = {
        'UZ': 'uz',
        'RU': 'ru',
        'KZ': 'kk',
        'KG': 'kg'
      };

      try {
        const response = await fetch('https://ipapi.co/json/', { mode: 'cors' });
        if (response.ok) {
          const data = await response.json();
          if (data.country_code && regionMapping[data.country_code]) {
            setLanguage(regionMapping[data.country_code]);
            return;
          }
        }
      } catch (e) {
        // Silent fail on first attempt, try fallback
      }

      try {
        const cfResponse = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
        if (cfResponse.ok) {
          const text = await cfResponse.text();
          const countryMatch = text.match(/loc=([A-Z]{2})/);
          if (countryMatch && countryMatch[1] && regionMapping[countryMatch[1]]) {
            setLanguage(regionMapping[countryMatch[1]]);
          }
        }
      } catch (e) {
        // Fallback default
      }
    };

    detectRegion();
  }, []);

  const t = (key: TranslationKey) => {
    const langDict = translations[language] as any;
    const defaultDict = translations.ru as any;
    return langDict[key] || defaultDict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
