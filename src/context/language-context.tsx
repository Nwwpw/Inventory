import React, { createContext, useContext, useState } from 'react';

type Locale = 'en' | 'th';

interface LanguageContextType {
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const toggleLanguage = () => {
    setLocale((prev) => (prev === 'en' ? 'th' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}