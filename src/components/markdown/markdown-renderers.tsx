import { useEffect, useId, useState, type ReactNode } from 'react';
import type { MarkdownBlock, MarkdownReferenceDefinitions } from './markdown-types';
import { mermaidLanguages } from './markdown-types';
import { tokenizeCodeLine } from './syntax-tokenizers';

export function renderBlock(
  block: MarkdownBlock,
  index: number,
  headingId?: string,
  theme: 'light' | 'dark' = 'light',
  referenceDefinitions: MarkdownReferenceDefinitions = {}
) {
  switch (block.type) {
    case 'heading':
      return renderHeading(block.level, block.text, index, headingId, referenceDefinitions);

    case 'paragraph':
      return <p key={index}>{renderInlineMarkdown(block.text, referenceDefinitions)}</p>;

    case 'quote':
      return (
        <blockquote
          key={index}
          className={block.callout ? 'markdown-callout' : undefined}
          data-callout={block.callout}
        >
          {block.lines.map((line, lineIndex) => (
            <p key={lineIndex}>{renderInlineMarkdown(line, referenceDefinitions)}</p>
          ))}
        </blockquote>
      );

    case 'code':
      return <CodeBlock key={index} language={block.language} code={block.code} theme={theme} />;

    case 'table':
      return (
        <div key={index} className="markdown-table-wrap">
          <table>
            <thead>
              <tr>
                {block.headers.map((header, cellIndex) => (
                  <th key={cellIndex}>{renderInlineMarkdown(header, referenceDefinitions)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {block.headers.map((_, cellIndex) => (
                    <td key={cellIndex}>
                      {renderInlineMarkdown(row[cellIndex] ?? '', referenceDefinitions)}
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
              <span>{renderInlineMarkdown(item.text, referenceDefinitions)}</span>
            </li>
          ))}
        </ListTag>
      );
    }

    case 'details':
      return (
        <details key={index} className="markdown-details" open={block.open}>
          <summary>{renderInlineMarkdown(block.summary, referenceDefinitions)}</summary>
          <div className="markdown-details-content">
            {block.blocks.length ? (
              block.blocks.map((childBlock, childIndex) =>
                renderBlock(childBlock, childIndex, undefined, theme, referenceDefinitions)
              )
            ) : (
              <p>{renderInlineMarkdown('_Khong co noi dung._', referenceDefinitions)}</p>
            )}
          </div>
        </details>
      );

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

export function renderReferenceDefinitions(referenceDefinitions: MarkdownReferenceDefinitions) {
  const references = Object.entries(referenceDefinitions);

  if (!references.length) {
    return null;
  }

  return (
    <section className="markdown-references" aria-labelledby="markdown-references-title">
      <div className="markdown-references-heading">
        <h2 id="markdown-references-title">Tài liệu tham khảo</h2>
        <span>{references.length} nguồn</span>
      </div>
      <ol>
        {references.map(([id, definition]) => {
          const href = sanitizeUrl(definition.href);
          const isPageAnchor = href.startsWith('#');
          const displayTitle = definition.title || definition.href;
          const displayUrl = formatReferenceUrl(definition.href);

          return (
            <li key={id}>
              <a
                href={href}
                title={definition.title}
                target={isPageAnchor ? undefined : '_blank'}
                rel={isPageAnchor ? undefined : 'noreferrer'}
              >
                <span className="markdown-reference-index">[{definition.label ?? id}]</span>
                <span className="markdown-reference-body">
                  <span className="markdown-reference-title">{displayTitle}</span>
                  <span className="markdown-reference-url">{displayUrl}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function renderHeading(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  text: string,
  key: number,
  id?: string,
  referenceDefinitions: MarkdownReferenceDefinitions = {}
) {
  const children = renderInlineMarkdown(text, referenceDefinitions);

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

function CodeBlock({
  language,
  code,
  theme = 'light',
}: {
  language: string;
  code: string;
  theme?: 'light' | 'dark';
}) {
  const normalizedLanguage = language.trim().toLowerCase();
  const effectiveLanguage = normalizedLanguage || 'text';
  const isPlainText = effectiveLanguage === 'text' || effectiveLanguage === 'plain';

  if (mermaidLanguages.has(effectiveLanguage)) {
    return <MermaidBlock code={code} theme={theme} />;
  }

  const label = getLanguageLabel(effectiveLanguage);
  const lines = code.split('\n');

  return (
    <figure
      className={isPlainText ? 'markdown-code markdown-code-plain' : 'markdown-code'}
      data-language={isPlainText ? 'text' : effectiveLanguage}
    >
      {!isPlainText && (
        <figcaption>
          <span>{label}</span>
          <span>{lines.length} dòng</span>
        </figcaption>
      )}
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

function MermaidBlock({ code, theme }: { code: string; theme: 'light' | 'dark' }) {
  const reactId = useId();
  const diagramId = `markdown-mermaid-${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`;
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: theme === 'dark' ? 'dark' : 'default',
          themeVariables: {
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          },
        });

        const result = await mermaid.render(diagramId, code);

        if (!cancelled) {
          setSvg(result.svg);
          setError('');
        }
      } catch (reason) {
        if (!cancelled) {
          setSvg('');
          setError(reason instanceof Error ? reason.message : 'Cannot render Mermaid diagram.');
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, diagramId, theme]);

  if (error) {
    return <CodeBlock language="text" code={code} />;
  }

  return (
    <figure className="markdown-mermaid">
      <figcaption>
        <span>Mermaid</span>
        <span>{svg ? 'Đã render sơ đồ' : 'Đang render...'}</span>
      </figcaption>
      <div
        className="markdown-mermaid-canvas"
        aria-live="polite"
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
    </figure>
  );
}

function renderCodeLine(line: string, language: string) {
  if (language === 'text' || language === 'plain') {
    return line;
  }

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

function renderInlineMarkdown(
  text: string,
  referenceDefinitions: MarkdownReferenceDefinitions = {}
) {
  const pattern =
    /(!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\[([^\]]*)\]|\[([^\]]+)\]|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|~~([^~]+)~~|\*([^*]+)\*|_([^_]+)_)/g;
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
          {renderInlineMarkdown(match[4], referenceDefinitions)}
        </a>
      );
    } else if (match[6] !== undefined && match[7] !== undefined) {
      const referenceId = match[7].trim() ? match[7] : match[6];
      const definition = referenceDefinitions[normalizeReferenceId(referenceId)];

      if (definition) {
        nodes.push(renderReferenceLink(nodes.length, definition.href, match[6], definition.title, referenceDefinitions));
      } else {
        nodes.push(match[0]);
      }
    } else if (match[8] !== undefined) {
      const definition = referenceDefinitions[normalizeReferenceId(match[8])];

      if (definition) {
        nodes.push(renderReferenceLink(nodes.length, definition.href, match[8], definition.title, referenceDefinitions));
      } else {
        nodes.push(match[0]);
      }
    } else if (match[9] !== undefined) {
      nodes.push(<code key={nodes.length}>{match[9]}</code>);
    } else if (match[10] !== undefined || match[11] !== undefined) {
      nodes.push(
        <strong key={nodes.length}>
          {renderInlineMarkdown(match[10] ?? match[11], referenceDefinitions)}
        </strong>
      );
    } else if (match[12] !== undefined) {
      nodes.push(<del key={nodes.length}>{renderInlineMarkdown(match[12], referenceDefinitions)}</del>);
    } else if (match[13] !== undefined || match[14] !== undefined) {
      nodes.push(
        <em key={nodes.length}>
          {renderInlineMarkdown(match[13] ?? match[14], referenceDefinitions)}
        </em>
      );
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

function renderReferenceLink(
  key: number,
  href: string,
  label: string,
  title: string | undefined,
  referenceDefinitions: MarkdownReferenceDefinitions
) {
  const sanitizedHref = sanitizeUrl(href);
  const isPageAnchor = sanitizedHref.startsWith('#');

  return (
    <a
      key={key}
      href={sanitizedHref}
      title={title}
      target={isPageAnchor ? undefined : '_blank'}
      rel={isPageAnchor ? undefined : 'noreferrer'}
    >
      {renderInlineMarkdown(label, referenceDefinitions)}
    </a>
  );
}

function normalizeReferenceId(id: string) {
  return id.trim().replace(/\s+/g, ' ').toLowerCase();
}

function formatReferenceUrl(href: string) {
  try {
    const url = new URL(href);
    const path = `${url.pathname}${url.hash}`.replace(/\/$/, '');

    return `${url.hostname}${path}`;
  } catch {
    return href;
  }
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
    .replace(/^\s*\[[^\]]+\]:\s+.*$/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
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
