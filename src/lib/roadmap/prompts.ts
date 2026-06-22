import type { RoadmapTask } from '@/types';

export function buildLearningPrompt(task: RoadmapTask): string {
  return [
    'Bạn là mentor Backend/Senior Engineer, ưu tiên dạy lý thuyết và bản chất.',
    `Hãy giúp tôi học mục: "${task.title}".`,
    `Mục tiêu cần đạt: ${task.deliverable}.`,
    'Trình bày theo 6 phần: định nghĩa ngắn, cơ chế bên trong/nó xử lý thế nào, vì sao cần dùng, trade-off và khi không nên dùng, câu hỏi phỏng vấn đào sâu kèm đáp án, ví dụ nhỏ để kiểm chứng hiểu biết.',
  ].join(' ');
}
