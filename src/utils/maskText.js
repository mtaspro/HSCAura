import paragraphs from '../data/paragraphs.json';

const SHORT_THRESHOLD = 15;
const MEDIUM_THRESHOLD = 70;

const STAGES = ['paragraph', 'scramble', 'plain'];

const EMPTY_OR_PUNCT_OR_EMOJI = /^[\s\p{P}\p{S}\p{M}]*$/u;

function bucketForLength(length) {
  if (length <= SHORT_THRESHOLD) return 'short';
  if (length <= MEDIUM_THRESHOLD) return 'medium';
  return 'long';
}

function bucketParagraphs(bucket) {
  const arr = paragraphs[bucket];
  return Array.isArray(arr) && arr.length > 0 ? arr : null;
}

function fnv1a32(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash >>> 0;
}

function isEmptyText(text) {
  if (!text) return true;
  return EMPTY_OR_PUNCT_OR_EMOJI.test(text);
}

export function pickParagraph(id, plain, used) {
  const len = plain ? plain.length : 0;
  const isEmpty = isEmptyText(plain);

  let bucketName;
  if (isEmpty) {
    bucketName = 'short';
  } else {
    bucketName = bucketForLength(len);
  }

  const buckets = ['short', 'medium', 'long'];
  let currentBucket = bucketName;

  for (let attempt = 0; attempt < buckets.length; attempt++) {
    const paras = bucketParagraphs(currentBucket);
    if (!paras) {
      currentBucket = buckets[(buckets.indexOf(currentBucket) + 1) % buckets.length];
      continue;
    }

    const startIdx = fnv1a32(id) % paras.length;
    let idx = startIdx;
    let steps = 0;

    while (steps < paras.length) {
      const candidate = paras[idx];
      if (!used.has(candidate)) {
        return candidate;
      }
      idx = (idx + 1) % paras.length;
      steps++;
    }

    return paras[startIdx];
  }

  return null;
}

export { STAGES };
