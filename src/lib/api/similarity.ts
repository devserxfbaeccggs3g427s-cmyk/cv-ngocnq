export function normalizeForSimilarity(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenSet(value: string) {
  return new Set(
    normalizeForSimilarity(value)
      .split(' ')
      .filter((token) => token.length > 2)
  );
}

export function jaccardSimilarity(left: string, right: string) {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  return intersection / (leftTokens.size + rightTokens.size - intersection);
}

export function isSimilarToExisting(text: string, existingItems: string[], threshold = 0.5) {
  return existingItems.some((existingItem) => jaccardSimilarity(text, existingItem) >= threshold);
}

export function hasTooMuchOverlap<T>(
  items: T[],
  accessor: (item: T) => string,
  existingItems: string[],
  overlapThreshold = 0.5
) {
  if (items.length === 0 || existingItems.length === 0) {
    return false;
  }

  const similarCount = items.filter((item) => isSimilarToExisting(accessor(item), existingItems)).length;

  return similarCount / items.length > overlapThreshold;
}
