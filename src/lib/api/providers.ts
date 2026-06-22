import { isNonEmptyString, normalizeBaseUrl } from './parsers';

export type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export type ChatCompletionChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export const providerBaseUrls: Record<string, string> = {
  kilo: 'https://api.kilo.ai/api/gateway',
  openrouter: 'https://openrouter.ai/api/v1',
};

export function resolveBaseUrl(provider: string, baseUrl: unknown) {
  if (provider === 'custom') {
    return isNonEmptyString(baseUrl) ? normalizeBaseUrl(baseUrl) : null;
  }

  if (provider === 'kilo') {
    return normalizeBaseUrl(process.env.AI_COMMENT_KILO_BASE_URL ?? providerBaseUrls.kilo);
  }

  return providerBaseUrls[provider] ?? null;
}

export function resolveApiKey(provider: string, apiKey: unknown) {
  if (isNonEmptyString(apiKey)) {
    return apiKey.trim();
  }

  if (provider === 'kilo') {
    return (
      process.env.AI_COMMENT_KILO_API_KEY?.trim() ??
      process.env.AI_COMMENT_API_KEY?.trim() ??
      process.env.AI_FLASHCARD_API_KEY?.trim() ??
      ''
    );
  }

  return '';
}

export function usesEnvApiKey(provider: string, apiKey: unknown) {
  return provider === 'kilo' && !isNonEmptyString(apiKey);
}
