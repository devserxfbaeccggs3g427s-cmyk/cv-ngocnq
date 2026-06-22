import type { ReactNode } from 'react';
import type { MarkdownBlock } from './markdown-types';
import { detectCodeLanguage, tokenizeCodeLine } from './syntax-tokenizers';

export function renderBlock(block: MarkdownBlock, index: number, headingId?: string) {
  switch (block.type) {
    case 'heading':
      return renderHeading(block.level, block.text, index, headingId);

    case 'paragraph':
      return <p key={index}>{renderInlineMarkdown(block.text)}</p>;

    case 'quote':
      return (
        <blockquote
          key={index}
          className={block.callout ? 'markdown-callout' : undefined}
          data-callout={block.callout}
        >
          {block.lines.map((line, lineIndex) => (
            <p key={lineIndex}>{renderInlineMarkdown(line)}</p>
          ))}
        </blockquote>
      );

    case 'code':
      return <CodeBlock key={index} language={block.language} code={block.code} />;

    case 'table':
      return (
        <div key={index} className="markdown-table-wrap">
          <table>
            <thead>
              <tr>
                {block.headers.map((header, cellIndex) => (
                  <th key={cellIndex}>{renderInlineMarkdown(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {block.headers.map((_, cellIndex) => (
                    <td key={cellIndex}>
                      {renderInlineMarkdown(row[cellIndex] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';

      return (
        <ListTag key={index} className={block.ordered ? 'markdown-ordered-list' : undefined}>
          {block.items.map((item, itemIndex) => (
            <li
              key={itemIndex}
              className={item.checked === undefined ? undefined : 'markdown-task-list-item'}
              style={{ marginLeft: `${item.depth * 1.25}rem` }}
            >
              {item.checked !== undefined && (
                <input type="checkbox" checked={item.checked} readOnly aria-label="Task item" />
              )}
              <span>{renderInlineMarkdown(item.text)}</span>
            </li>
          ))}
        </ListTag>
      );
    }

    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={sanitizeUrl(block.src)}
          alt={block.alt}
          loading="lazy"
          className="markdown-image"
        />
      );

    case 'hr':
      return <hr key={index} />;

    default:
      return null;
  }
}

function renderHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string, key: number, id?: string) {
  const children = renderInlineMarkdown(text);

  switch (level) {
    case 1:
      return <h1 key={key} id={id}>{children}</h1>;
    case 2:
      return <h2 key={key} id={id}>{children}</h2>;
    case 3:
      return <h3 key={key} id={id}>{children}</h3>;
    case 4:
      return <h4 key={key} id={id}>{children}</h4>;
    case 5:
      return <h5 key={key} id={id}>{children}</h5>;
    case 6:
      return <h6 key={key} id={id}>{children}</h6>;
    default:
      return <h3 key={key} id={id}>{children}</h3>;
  }
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const normalizedLanguage = language.trim().toLowerCase();
  const effectiveLanguage = normalizedLanguage || detectCodeLanguage(code);
  const label = getLanguageLabel(effectiveLanguage);
  const lines = code.split('\n');

  return (
    <figure className="markdown-code" data-language={effectiveLanguage || 'text'}>
      <figcaption>
        <span>{label}</span>
        <span>{lines.length} dòng</span>
      </figcaption>
      <pre>
        <code>
          {lines.map((line, index) => (
            <span key={index} className="markdown-code-line">
              {line ? renderCodeLine(line, effectiveLanguage) : ' '}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

function renderCodeLine(line: string, language: string) {
  return tokenizeCodeLine(line, language).map((token, index) => {
    if (token.type === 'plain') {
      return token.text;
    }

    return (
      <span key={index} className={`markdown-token markdown-token-${token.type}`}>
        {token.text}
      </span>
    );
  });
}

function renderInlineMarkdown(text: string) {
  const pattern =
    /(!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|~~([^~]+)~~|\*([^*]+)\*|_([^_]+)_)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      nodes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={nodes.length}
          src={sanitizeUrl(match[3])}
          alt={match[2]}
          loading="lazy"
          className="markdown-inline-image"
        />
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      const href = sanitizeUrl(match[5]);
      const isPageAnchor = href.startsWith('#');

      nodes.push(
        <a
          key={nodes.length}
          href={href}
          target={isPageAnchor ? undefined : '_blank'}
          rel={isPageAnchor ? undefined : 'noreferrer'}
        >
          {renderInlineMarkdown(match[4])}
        </a>
      );
    } else if (match[6] !== undefined) {
      nodes.push(<code key={nodes.length}>{match[6]}</code>);
    } else if (match[7] !== undefined || match[8] !== undefined) {
      nodes.push(<strong key={nodes.length}>{renderInlineMarkdown(match[7] ?? match[8])}</strong>);
    } else if (match[9] !== undefined) {
      nodes.push(<del key={nodes.length}>{renderInlineMarkdown(match[9])}</del>);
    } else if (match[10] !== undefined || match[11] !== undefined) {
      nodes.push(<em key={nodes.length}>{renderInlineMarkdown(match[10] ?? match[11])}</em>);
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export function slugifyHeading(text: string) {
  return stripInlineMarkdown(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function stripInlineMarkdown(text: string) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim();
}

function getLanguageLabel(language: string) {
  const labels: Record<string, string> = {
    bash: 'Shell',
    sh: 'Shell',
    zsh: 'Shell',
    ts: 'TypeScript',
    tsx: 'TSX',
    js: 'JavaScript',
    jsx: 'JSX',
    java: 'Java',
    kotlin: 'Kotlin',
    sql: 'SQL / Database',
    mysql: 'MySQL',
    pgsql: 'PostgreSQL',
    postgresql: 'PostgreSQL',
    oracle: 'Oracle SQL',
    plsql: 'PL/SQL',
    ddl: 'Database DDL',
    dbml: 'Database Model',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    xml: 'XML',
    dockerfile: 'Dockerfile',
    mermaid: 'Mermaid',
  };

  return labels[language] ?? (language ? language.toUpperCase() : 'Plain text');
}

export function sanitizeUrl(url: string) {
  const trimmed = url.trim();

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }

  return '#';
}
