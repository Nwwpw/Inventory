// utils/translator.ts

/**
 * ฟังก์ชันตรวจสอบว่าเป็นภาษาไทยหรือไม่
 */
export const isThaiText = (text: string): boolean => {
  return /[\u0E00-\u0E7F]/.test(text);
};

/**
 * ฟังก์ชันแปลภาษาผ่าน MyMemory Translation API (ฟรี ไม่ต้องใช้ API Key)
 */
export const autoTranslate = async (text: string, targetLang: 'en' | 'th' = 'en'): Promise<string> => {
  const trimmed = text.trim();
  if (!trimmed) return '';

  try {
    const langPair = targetLang === 'en' ? 'th|en' : 'en|th';
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${langPair}`
    );

    if (!response.ok) return trimmed;

    const data = await response.json();
    const translatedText = data?.responseData?.translatedText;

    // ถ้าแปลได้ ให้ส่งข้อความแปลกลับมา ถ้าไม่ได้ให้ใช้ข้อความเดิม
    return translatedText && translatedText !== trimmed ? translatedText : trimmed;
  } catch (error) {
    console.warn('Auto translation error:', error);
    return trimmed; // ถ้า API มีปัญหา ให้ fallback กลับมาใช้ค่าเดิม
  }
};

/**
 * ช่วยประมวลผลคำศัพท์ทั้งสองภาษา (TH & EN)
 */
export const processTranslations = async (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return { th: '', en: '' };

  const isThai = isThaiText(trimmed);

  if (isThai) {
    // ถ้านำเข้าเป็นไทย ให้แปลเป็นอังกฤษ
    const translatedEn = await autoTranslate(trimmed, 'en');
    return {
      th: trimmed,
      en: translatedEn,
    };
  } else {
    // ถ้านำเข้าเป็นอังกฤษ ให้แปลเป็นไทย
    const translatedTh = await autoTranslate(trimmed, 'th');
    return {
      th: translatedTh,
      en: trimmed,
    };
  }
};