import {
  compactText,
  isNonEmptyString,
  jsonError,
  resolveApiKey,
  resolveBaseUrl,
  usesEnvApiKey,
} from '@/lib/api';
import type { ChatCompletionResponse } from '@/lib/api';
import { validateEnvAiPassword } from '../env-confirmation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ImageAnalysisKind = 'stock' | 'technical' | 'table' | 'document' | 'general';

type ImageInput = {
  dataUrl?: unknown;
  name?: unknown;
  mimeType?: unknown;
};

type ImageAnalysisRequest = {
  provider?: unknown;
  apiKey?: unknown;
  confirmPassword?: unknown;
  model?: unknown;
  baseUrl?: unknown;
  prompt?: unknown;
  analysisKind?: unknown;
  images?: unknown;
};

const analysisKindLabels: Record<ImageAnalysisKind, string> = {
  stock: 'chứng khoán / biểu đồ tài chính',
  technical: 'kỹ thuật / sơ đồ / hệ thống',
  table: 'bảng dữ liệu / dashboard / báo cáo số liệu',
  document: 'tài liệu / screenshot / nội dung văn bản',
  general: 'tổng quát',
};

const supportedImageMimeTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const maxImages = 4;
const maxImageBytes = 8 * 1024 * 1024;

function buildProviderHeaders(provider: string, apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...(provider === 'openrouter'
      ? {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'CV Image Analysis',
        }
      : {}),
  };
}

function resolveDefaultModel(provider: string, model: unknown) {
  if (isNonEmptyString(model)) {
    return model.trim();
  }

  if (provider === 'kilo') {
    return (
      process.env.AI_IMAGE_ANALYSIS_MODEL?.trim() ??
      process.env.AI_COMMENT_KILO_MODEL?.trim() ??
      process.env.AI_COMMENT_MODEL?.trim() ??
      process.env.AI_FLASHCARD_MODEL?.trim() ??
      ''
    );
  }

  return '';
}

function readAnalysisKind(value: unknown): ImageAnalysisKind {
  return value === 'stock' ||
    value === 'technical' ||
    value === 'table' ||
    value === 'document' ||
    value === 'general'
    ? value
    : 'general';
}

function estimateDataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.ceil((base64.length * 3) / 4);
}

function readImages(value: unknown) {
  if (!Array.isArray(value)) {
    return { images: [], error: 'Vui lòng upload ít nhất một hình ảnh.' };
  }

  const images = value.slice(0, maxImages).flatMap((entry): Array<{
    dataUrl: string;
    name: string;
    mimeType: string;
  }> => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const image = entry as ImageInput;
    const dataUrl = isNonEmptyString(image.dataUrl) ? image.dataUrl.trim() : '';
    const name = isNonEmptyString(image.name) ? image.name.trim() : 'uploaded-image';
    const mimeType = isNonEmptyString(image.mimeType) ? image.mimeType.trim() : '';

    if (!dataUrl || !mimeType) {
      return [];
    }

    return [{ dataUrl, name, mimeType }];
  });

  if (!images.length) {
    return { images: [], error: 'Vui lòng upload ít nhất một hình ảnh hợp lệ.' };
  }

  for (const image of images) {
    if (!supportedImageMimeTypes.has(image.mimeType)) {
      return { images: [], error: 'Chỉ hỗ trợ ảnh PNG, JPG hoặc WebP.' };
    }

    if (!image.dataUrl.startsWith(`data:${image.mimeType};base64,`)) {
      return { images: [], error: `Ảnh "${image.name}" không đúng định dạng data URL.` };
    }

    if (estimateDataUrlBytes(image.dataUrl) > maxImageBytes) {
      return { images: [], error: `Ảnh "${image.name}" vượt quá giới hạn 8MB.` };
    }
  }

  return { images, error: null };
}

function buildFocusInstruction(kind: ImageAnalysisKind) {
  if (kind === 'stock') {
    return [
      'Tập trung vào biểu đồ chứng khoán/tài chính: xu hướng, vùng hỗ trợ/kháng cự, momentum, volume, pattern kỹ thuật, kịch bản có xác suất cao và các rủi ro.',
      'Không đưa khuyến nghị mua/bán chắc chắn; nếu thiếu timeframe, ticker, volume hoặc indicator, hãy nói rõ cần bổ sung gì.',
    ].join(' ');
  }

  if (kind === 'technical') {
    return 'Tập trung vào cấu trúc kỹ thuật: thành phần, luồng dữ liệu/tín hiệu, lỗi thiết kế, điểm nghẽn, rủi ro vận hành và bước kiểm chứng.';
  }

  if (kind === 'table') {
    return 'Tập trung vào số liệu: cột/hàng quan trọng, outlier, xu hướng, sai lệch, giá trị cần đối chiếu và kết luận có thể rút ra từ bảng/dashboard.';
  }

  if (kind === 'document') {
    return 'Tập trung đọc nội dung trong ảnh: tóm tắt, thông tin quan trọng, bất thường, câu hỏi còn mở và việc cần làm tiếp theo.';
  }

  return 'Phân tích tổng quát nhưng ưu tiên các chi tiết có thể quan sát trực tiếp trong ảnh, không suy diễn quá mức.';
}

export async function POST(request: Request) {
  let body: ImageAnalysisRequest;

  try {
    body = (await request.json()) as ImageAnalysisRequest;
  } catch {
    return jsonError('Payload không phải JSON hợp lệ.', 400);
  }

  const provider = isNonEmptyString(body.provider) ? body.provider.trim() : 'kilo';
  const shouldValidateEnvPassword = usesEnvApiKey(provider, body.apiKey);
  const passwordError = shouldValidateEnvPassword
    ? validateEnvAiPassword(body.confirmPassword)
    : null;

  if (passwordError) {
    return jsonError(passwordError.message, passwordError.status);
  }

  const apiKey = resolveApiKey(provider, body.apiKey);
  const baseUrl = resolveBaseUrl(provider, body.baseUrl);
  const model = resolveDefaultModel(provider, body.model);
  const prompt = isNonEmptyString(body.prompt) ? compactText(body.prompt, 4000) : '';
  const analysisKind = readAnalysisKind(body.analysisKind);
  const { images, error: imageError } = readImages(body.images);

  if (!apiKey) {
    return jsonError(
      provider === 'kilo'
        ? 'Chưa cấu hình API key Kilo AI trong env.'
        : 'Vui lòng nhập API key trước khi phân tích ảnh.',
      provider === 'kilo' ? 500 : 400
    );
  }

  if (!baseUrl) {
    return jsonError('Vui lòng nhập Base URL cho kênh AI tương thích OpenAI.', 400);
  }

  if (!model) {
    return jsonError('Vui lòng nhập hoặc chọn model vision/multimodal.', 400);
  }

  if (!prompt) {
    return jsonError('Vui lòng nhập prompt phân tích.', 400);
  }

  if (imageError) {
    return jsonError(imageError, 400);
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: buildProviderHeaders(provider, apiKey),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: [
              'Bạn là trợ lý phân tích hình ảnh và dữ liệu. Trả lời bằng tiếng Việt, có cấu trúc, ưu tiên bằng chứng nhìn thấy trong ảnh.',
              'Nếu thông tin không đọc được hoặc ảnh mờ, nói rõ mức độ tin cậy và dữ liệu cần bổ sung. Không bịa số liệu không nhìn thấy.',
              buildFocusInstruction(analysisKind),
            ].join(' '),
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: [
                  `Loại phân tích cần tập trung: ${analysisKindLabels[analysisKind]}.`,
                  '',
                  'Prompt người dùng:',
                  prompt,
                  '',
                  'Hãy trả lời theo format:',
                  '1. Nhận định chính',
                  '2. Bằng chứng quan sát được',
                  '3. Phân tích chi tiết',
                  '4. Rủi ro/giới hạn dữ liệu',
                  '5. Việc nên làm tiếp theo',
                ].join('\n'),
              },
              ...images.map((image) => ({
                type: 'image_url',
                image_url: {
                  url: image.dataUrl,
                },
              })),
            ],
          },
        ],
        temperature: 0.2,
        stream: false,
      }),
    });

    const responseBody = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

    if (!response.ok) {
      return jsonError(
        responseBody.error?.message ??
          `Không gọi được AI provider. HTTP status: ${response.status}.`,
        502
      );
    }

    const content = responseBody.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return jsonError('AI provider không trả về nội dung phân tích.', 502);
    }

    return Response.json({ analysis: content });
  } catch (error) {
    console.error('AI image analysis request failed:', error);
    return jsonError('Không kết nối được tới AI provider. Kiểm tra Base URL, API key hoặc mạng.', 502);
  }
}
