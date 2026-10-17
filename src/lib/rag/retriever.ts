/**
 * Hybrid Retriever: BM25 (sparse) + Fuzzy Trigram (dense-lite) + Reciprocal Rank Fusion.
 * Handles kid typos via trigram correction before BM25 re-ranking.
 */
import { type Chunk, buildKnowledgeBase } from "./knowledge";
import { tokenize, normalize, trigramSimilarity } from "./text";

// ── BM25 index ──────────────────────────────────────────────────────────

type BM25Index = {
  docs: { chunk: Chunk; tokens: string[]; len: number }[];
  df: Map<string, number>;
  avgDl: number;
  vocab: Set<string>;
};

let _index: BM25Index | null = null;

function buildIndex(): BM25Index {
  if (_index) return _index;
  const kb = buildKnowledgeBase();
  const docs = kb.map((chunk) => {
    const tokens = tokenize(chunk.text + " " + chunk.keywords);
    return { chunk, tokens, len: tokens.length };
  });

  const df = new Map<string, number>();
  const vocab = new Set<string>();
  for (const doc of docs) {
    const seen = new Set<string>();
    for (const t of doc.tokens) {
      vocab.add(t);
      if (!seen.has(t)) {
        seen.add(t);
        df.set(t, (df.get(t) ?? 0) + 1);
      }
    }
  }

  const avgDl = docs.reduce((s, d) => s + d.len, 0) / (docs.length || 1);
  _index = { docs, df, avgDl, vocab };
  return _index;
}

const K1 = 1.5;
const B = 0.75;

function bm25Score(queryTokens: string[], idx: BM25Index): Map<string, number> {
  const N = idx.docs.length;
  const scores = new Map<string, number>();

  for (const doc of idx.docs) {
    let score = 0;
    const tf = new Map<string, number>();
    for (const t of doc.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    for (const qt of queryTokens) {
      const termFreq = tf.get(qt) ?? 0;
      if (termFreq === 0) continue;
      const docFreq = idx.df.get(qt) ?? 0;
      const idf = Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1);
      const tfNorm = (termFreq * (K1 + 1)) / (termFreq + K1 * (1 - B + B * (doc.len / idx.avgDl)));
      score += idf * tfNorm;
    }
    if (score > 0) scores.set(doc.chunk.id, score);
  }
  return scores;
}

// ── Fuzzy token correction ──────────────────────────────────────────────

function fuzzyCorrect(queryTokens: string[], idx: BM25Index): string[] {
  const corrected: string[] = [];
  for (const qt of queryTokens) {
    if (idx.vocab.has(qt)) {
      corrected.push(qt);
      continue;
    }
    // Find best trigram match in vocabulary
    let bestToken = qt;
    let bestSim = 0.6; // threshold
    for (const vt of idx.vocab) {
      const sim = trigramSimilarity(qt, vt);
      if (sim > bestSim) {
        bestSim = sim;
        bestToken = vt;
      }
    }
    corrected.push(bestToken);
  }
  return corrected;
}

// ── Reciprocal Rank Fusion ──────────────────────────────────────────────

const RRF_K = 60;

function rrfFuse(rankings: Map<string, number>[]): Map<string, number> {
  // Convert score maps to ranked lists, then fuse
  const fused = new Map<string, number>();

  for (const scoreMap of rankings) {
    const sorted = [...scoreMap.entries()].sort((a, b) => b[1] - a[1]);
    sorted.forEach(([id], rank) => {
      fused.set(id, (fused.get(id) ?? 0) + 1 / (RRF_K + rank + 1));
    });
  }

  return fused;
}

// ── Public API ──────────────────────────────────────────────────────────

export type RetrievedChunk = { chunk: Chunk; score: number };

export function retrieve(query: string, topK = 5): RetrievedChunk[] {
  const idx = buildIndex();
  const rawTokens = tokenize(query);
  if (rawTokens.length === 0) return [];

  // Channel A: BM25 on raw tokens
  const rawScores = bm25Score(rawTokens, idx);

  // Channel B: BM25 on fuzzy-corrected tokens
  const correctedTokens = fuzzyCorrect(rawTokens, idx);
  const fuzzyScores = bm25Score(correctedTokens, idx);

  // Also add trigram similarity bonus per chunk text
  for (const doc of idx.docs) {
    const sim = trigramSimilarity(query, normalize(doc.chunk.text).slice(0, 200));
    if (sim > 0.15) {
      fuzzyScores.set(doc.chunk.id, (fuzzyScores.get(doc.chunk.id) ?? 0) + sim * 3);
    }
  }

  // Fuse with RRF
  const fused = rrfFuse([rawScores, fuzzyScores]);

  // Build result
  const chunkMap = new Map<string, Chunk>();
  for (const doc of idx.docs) chunkMap.set(doc.chunk.id, doc.chunk);

  return [...fused.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id, score]) => ({ chunk: chunkMap.get(id)!, score }));
}
