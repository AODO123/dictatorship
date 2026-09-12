const langNames = new Intl.DisplayNames(['en'], { type: 'language' });

const legacyLangCodes = {
  iw: 'Hebrew',
  jw: 'Javanese',
  in: 'Indonesian',
  ji: 'Yiddish'
};

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function getLanguageName(code) {
  if (!code || code === 'auto') return 'Unknown';
  const lower = code.toLowerCase().trim();
  if (legacyLangCodes[lower]) return legacyLangCodes[lower];

  try {
    return langNames.of(lower) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

async function translateText(text) {
  const clean = text.trim();
  if (!clean) {
    return { success: false, reason: 'empty_text' };
  }

  // Primary: Google Translate endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=en&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item) => item[0]).filter(Boolean).join('');
        const detectedCode = data[2] || (data[8] && data[8][0] && data[8][0][0]) || 'auto';

        if (translated) {
          return {
            success: true,
            text: decodeHtml(translated),
            fromCode: detectedCode,
            from: getLanguageName(detectedCode)
          };
        }
      }
    }
  } catch {}

  // Fallback: MyMemory API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=Autodetect|en`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3500),
      headers: { 'User-Agent': 'DictatorshipBot/1.0' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        const detectedCode = data.responseData.detectedLanguage || 'auto';
        return {
          success: true,
          text: decodeHtml(data.responseData.translatedText),
          fromCode: detectedCode,
          from: getLanguageName(detectedCode)
        };
      }
    }
  } catch {}

  return { success: false, reason: 'api_error' };
}

module.exports = { translateText };
