export type MarkdownFolder = {
  id: string;
  type: 'folder';
  title: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarkdownFile = {
  id: string;
  type: 'file';
  title: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MarkdownEntry = MarkdownFolder | MarkdownFile;
