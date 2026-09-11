const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function cleanHtml(raw) {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseDictionaryApi(data, word) {
  const entry = data[0];
  const phonetic = entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || null;
  const audio = entry.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio || null;

  // Filter and limit to top 2 parts of speech, top 2 definitions each
  const meanings = (entry.meanings || [])
    .filter((m) => m.definitions && m.definitions.length > 0)
    .slice(0, 2)
    .map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 2).map((d) => ({
        definition: d.definition,
        example: d.example || null
      }))
    }));

  return {
    word: entry.word || word,
    phonetic,
    audio,
    sourceUrl: entry.sourceUrls?.[0] || `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
    meanings
  };
}

function parseWiktionary(data, word) {
  // Ignore symbol or irrelevant non-standard entries if normal speech parts exist
  const standardParts = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Interjection', 'Pronoun', 'Preposition'];
  let entries = data.filter((e) => standardParts.includes(e.partOfSpeech));
  if (entries.length === 0) entries = data;

  const meanings = entries.slice(0, 2).map((entry) => ({
    partOfSpeech: entry.partOfSpeech || 'Definition',
    definitions: (entry.definitions || []).slice(0, 2).map((d) => ({
      definition: cleanHtml(d.definition),
      example: d.examples && d.examples.length > 0 ? cleanHtml(d.examples[0]) : null
    }))
  }));

  return {
    word: word,
    phonetic: null,
    audio: null,
    sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
    meanings
  };
}

async function fetchFromDictionaryApi(word) {
  const endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(1800),
    headers: { 'User-Agent': 'DictatorshipBot/1.0' }
  });

  if (res.status === 404) return { notFound: true };
  if (!res.ok) throw new Error(`Status ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return { notFound: true };

  return parseDictionaryApi(data, word);
}

async function fetchFromWiktionary(word) {
  const endpoint = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
  const res = await fetch(endpoint, {
    signal: AbortSignal.timeout(2000),
    headers: { 'User-Agent': 'DictatorshipBot/1.0 (https://github.com/Costa/dictatorship)' }
  });

  if (res.status === 404) return { notFound: true };
  if (!res.ok) throw new Error(`Status ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data.en) || data.en.length === 0) return { notFound: true };

  return parseWiktionary(data.en, word);
}

async function fetchDefinition(word) {
  const sanitized = word.trim().toLowerCase();
  if (!sanitized) {
    return { success: false, reason: 'empty_word' };
  }

  const cached = cache.get(sanitized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  let finalResult = null;

  try {
    // Run both in parallel and take whichever responds successfully first
    const result = await Promise.any([
      fetchFromDictionaryApi(sanitized),
      fetchFromWiktionary(sanitized)
    ]);

    if (result.notFound) {
      finalResult = { success: false, reason: 'not_found' };
    } else {
      finalResult = { success: true, data: result };
    }
  } catch {
    finalResult = { success: false, reason: 'not_found' };
  }

  if (finalResult.success || finalResult.reason === 'not_found') {
    cache.set(sanitized, { result: finalResult, timestamp: Date.now() });
  }

  return finalResult;
}

module.exports = { fetchDefinition };
