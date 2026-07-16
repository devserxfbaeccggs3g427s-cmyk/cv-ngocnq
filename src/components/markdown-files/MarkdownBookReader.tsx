'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import Link from 'next/link';
import { MarkdownPreview } from '@/components/markdown';
import { readStoredMarkdownFiles } from '@/lib/roadmap';
import type { MarkdownFile } from '@/types';

type ViewportSize = {
  width: number;
  height: number;
};

type ReaderSource = {
  title: string;
  content: string;
  progressKey: string;
  backHref: string;
};

type TurnState = {
  direction: 'next' | 'previous';
  fromIndex: number;
  toIndex: number;
};

const fallbackViewport: ViewportSize = {
  width: 390,
  height: 844,
};

export function MarkdownBookReader({
  fileId,
  readerId,
}: {
  fileId?: string;
  readerId?: string;
}) {
  const [source, setSource] = useState<ReaderSource | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [pageWidth, setPageWidth] = useState(1);
  const [loadedProgressKey, setLoadedProgressKey] = useState<string | null>(null);
  const [turnState, setTurnState] = useState<TurnState | null>(null);
  const [viewport, setViewport] = useState<ViewportSize>(fallbackViewport);
  const pageViewportRef = useRef<HTMLDivElement | null>(null);
  const pageFlowRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressTapRef = useRef(false);
  const turnTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const nextSource = fileId
        ? readMarkdownFileSource(fileId)
        : readerId
          ? readStoredReaderSource(readerId)
          : null;

      setSource(nextSource);
      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [fileId, readerId]);

  useEffect(() => {
    function updateViewport() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  const pageGap = getPageGap(viewport.width);
  const lastPageIndex = Math.max(0, pageCount - 1);
  const visiblePageIndex = Math.min(pageIndex, lastPageIndex);

  useEffect(() => {
    return () => {
      if (turnTimeoutRef.current) {
        window.clearTimeout(turnTimeoutRef.current);
      }

    };
  }, []);

  const measurePages = useCallback(() => {
    const pageViewport = pageViewportRef.current;
    const pageFlow = pageFlowRef.current;

    if (!pageViewport || !pageFlow) {
      return;
    }

    const nextPageWidth = Math.max(1, pageViewport.clientWidth);
    const nextPageCount = Math.max(
      1,
      Math.ceil((pageFlow.scrollWidth + pageGap) / (nextPageWidth + pageGap))
    );

    setPageWidth(nextPageWidth);
    setPageCount(nextPageCount);
  }, [pageGap]);

  useEffect(() => {
    if (!loaded || !source) {
      return;
    }

    let frameId = window.requestAnimationFrame(measurePages);
    const pageViewport = pageViewportRef.current;
    const pageFlow = pageFlowRef.current;

    const requestMeasure = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measurePages);
    };

    const resizeObserver = new ResizeObserver(requestMeasure);
    const mutationObserver = new MutationObserver(requestMeasure);

    if (pageViewport) {
      resizeObserver.observe(pageViewport);
    }

    if (pageFlow) {
      resizeObserver.observe(pageFlow);
      mutationObserver.observe(pageFlow, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [loaded, measurePages, source]);

  useEffect(() => {
    if (!loaded || !source) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      try {
        const storedPage = window.localStorage.getItem(source.progressKey);
        const nextPage = storedPage ? Number(storedPage) : 0;

        if (Number.isFinite(nextPage)) {
          setPageIndex(Math.min(Math.max(0, nextPage), lastPageIndex));
        }
        setLoadedProgressKey(source.progressKey);
      } catch {
        setPageIndex(0);
        setLoadedProgressKey(source.progressKey);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [lastPageIndex, loaded, source]);

  useEffect(() => {
    if (!loaded || !source || loadedProgressKey !== source.progressKey) {
      return;
    }

    try {
      window.localStorage.setItem(source.progressKey, String(visiblePageIndex));
    } catch {
      // Reading progress is a convenience only; the reader still works without storage.
    }
  }, [loaded, loadedProgressKey, source, visiblePageIndex]);

  const turnPage = useCallback((direction: 'next' | 'previous') => {
    if (turnState) {
      return;
    }

    const nextPageIndex =
      direction === 'next'
        ? Math.min(lastPageIndex, visiblePageIndex + 1)
        : Math.max(0, visiblePageIndex - 1);

    if (nextPageIndex === visiblePageIndex) {
      return;
    }

    if (turnTimeoutRef.current) {
      window.clearTimeout(turnTimeoutRef.current);
    }

    setTurnState({
      direction,
      fromIndex: visiblePageIndex,
      toIndex: nextPageIndex,
    });
    setPageIndex(nextPageIndex);
    turnTimeoutRef.current = window.setTimeout(() => {
      setTurnState(null);
      turnTimeoutRef.current = null;
    }, 880);
  }, [lastPageIndex, turnState, visiblePageIndex]);

  const goPrevious = useCallback(() => {
    turnPage('previous');
  }, [turnPage]);

  const goNext = useCallback(() => {
    turnPage('next');
  }, [turnPage]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    suppressTapRef.current = false;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (!start) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
      return;
    }

    suppressTapRef.current = true;

    if (deltaX > 0) {
      goPrevious();
    } else {
      goNext();
    }

    window.setTimeout(() => {
      suppressTapRef.current = false;
    }, 0);
  }

  function handleTap(direction: 'previous' | 'next') {
    if (suppressTapRef.current) {
      return;
    }

    if (direction === 'previous') {
      goPrevious();
    } else {
      goNext();
    }
  }

  function handleReaderClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest('a, button, input, textarea, select, summary, .markdown-code, .markdown-table-wrap, .markdown-mermaid')
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    handleTap(event.clientX - bounds.left < bounds.width / 2 ? 'previous' : 'next');
  }

  if (loaded && !source) {
    return (
      <main className="book-reader-shell flex items-center justify-center p-5">
        <div className="book-page mx-auto max-w-md p-7 text-center">
          <h1 className="text-xl font-bold text-stone-950">Không tìm thấy nội dung Markdown</h1>
          <p className="mt-3 text-sm leading-6 text-stone-700">
            Nội dung này chưa có trong bộ nhớ trình duyệt hiện tại.
          </p>
          <Link
            href="/workspace"
            className="mt-5 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-800"
          >
            Về Workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="book-reader-shell"
      aria-label={source?.title ? `Đọc sách ${source.title}` : 'Đọc Markdown dạng sách'}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="book-reader-stage" onClick={handleReaderClick}>
        <section className="book-cover" aria-live="polite">
          <div className={`book-page${turnState ? ` is-turning-${turnState.direction}` : ''}`}>
            <div
              ref={pageViewportRef}
              className="book-page-content"
              style={getPageStyle(visiblePageIndex, pageWidth, pageGap)}
            >
              {loaded ? (
                <div ref={pageFlowRef} className="book-page-flow">
                  <MarkdownPreview content={source?.content ?? '# Chưa có nội dung'} theme="light" enableBookReader={false} />
                </div>
              ) : (
                <div className="h-full animate-pulse rounded-2xl bg-stone-200/60" />
              )}
            </div>

            {turnState && loaded && source && (
              <div className="book-turn-sheet" aria-hidden="true">
                <div className="book-turn-face book-turn-face-front">
                  <div className="book-page-content book-page-content-turn" style={getPageStyle(turnState.fromIndex, pageWidth, pageGap)}>
                    <div className="book-page-flow">
                      <MarkdownPreview content={source.content} theme="light" enableBookReader={false} />
                    </div>
                  </div>
                </div>
                <div className="book-turn-face book-turn-face-back">
                  <div className="book-page-content book-page-content-turn" style={getPageStyle(turnState.toIndex, pageWidth, pageGap)}>
                    <div className="book-page-flow">
                      <MarkdownPreview content={source.content} theme="light" enableBookReader={false} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function getPageStyle(pageIndex: number, pageWidth: number, pageGap: number) {
  return {
    '--book-page-index': pageIndex,
    '--book-page-width': `${pageWidth}px`,
    '--book-page-gap': `${pageGap}px`,
  } as CSSProperties;
}

function getReaderProgressKey(fileId: string) {
  return `markdown-book-reader:${fileId}:page`;
}

function getGenericReaderProgressKey(readerId: string) {
  return `markdown-book-reader:preview:${readerId}:page`;
}

function getReaderContentKey(readerId: string) {
  return `markdown-book-reader-content:${readerId}`;
}

function readMarkdownFileSource(fileId: string): ReaderSource | null {
  const storedFile = readStoredMarkdownFiles().find(
    (entry): entry is MarkdownFile => entry.type === 'file' && entry.id === fileId
  );

  if (!storedFile) {
    return null;
  }

  return {
    title: storedFile.title || 'Markdown',
    content: storedFile.content,
    progressKey: getReaderProgressKey(fileId),
    backHref: '/markdown-files',
  };
}

function readStoredReaderSource(readerId: string): ReaderSource | null {
  const storageKey = getReaderContentKey(readerId);
  const raw = window.sessionStorage.getItem(storageKey) ?? window.localStorage.getItem(storageKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed.content !== 'string') {
      return null;
    }

    return {
      title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : 'Markdown',
      content: parsed.content,
      progressKey: getGenericReaderProgressKey(readerId),
      backHref: typeof parsed.backHref === 'string' && parsed.backHref ? parsed.backHref : '/workspace',
    };
  } catch {
    return null;
  }
}

function getPageGap(width: number) {
  return width < 640 ? 20 : 48;
}
