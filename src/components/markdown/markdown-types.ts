export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; lines: string[]; callout?: CalloutType }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: ListItem[] }
  | { type: 'image'; alt: string; src: string }
  | { type: 'hr' };

export type ListItem = {
  text: string;
  depth: number;
  checked?: boolean;
};

export type CalloutType = 'note' | 'tip' | 'warning' | 'danger' | 'info';
export type SyntaxTokenType =
  | 'plain'
  | 'keyword'
  | 'function'
  | 'variable'
  | 'string'
  | 'number'
  | 'comment'
  | 'operator'
  | 'type'
  | 'property'
  | 'entity'
  | 'boolean'
  | 'class-name'
  | 'decorator'
  | 'regex'
  | 'tag'
  | 'attribute';

export type SyntaxToken = {
  text: string;
  type: SyntaxTokenType;
};

export const emptyMessage = '_Chưa có note._';
export const headingLevels = [1, 2, 3, 4, 5, 6] as const;
export const sqlLanguages = new Set(['sql', 'mysql', 'pgsql', 'postgresql', 'oracle', 'plsql', 'ddl']);
export const shellLanguages = new Set(['bash', 'sh', 'shell', 'zsh']);
export const jsonLanguages = new Set(['json', 'jsonc']);
export const yamlLanguages = new Set(['yaml', 'yml']);
export const xmlLanguages = new Set(['html', 'xml', 'tsx', 'jsx']);
