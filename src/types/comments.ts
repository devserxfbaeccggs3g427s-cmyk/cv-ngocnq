export type NoteComment = {
  id: string;
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  createdAt: string;
  model?: string;
  provider?: string;
  title?: string;
};

export type CommentNode = NoteComment & {
  children: CommentNode[];
};
