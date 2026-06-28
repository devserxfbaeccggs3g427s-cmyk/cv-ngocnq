'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  Home,
  Pencil,
  Save,
  Trash2,
} from 'lucide-react';
import type { MarkdownEntry, MarkdownFile, MarkdownFolder } from '@/types';
import { Card, CardContent } from '@/components/ui';
import { MarkdownPreview } from '@/components/markdown';
import {
  hasStoredMarkdownFiles,
  normalizeRoadmapBackup,
  readStoredMarkdownFiles,
  storeMarkdownFiles,
} from '@/lib/roadmap';
import { cn } from '@/lib/utils';

const emptyMarkdown = `# Ghi chú mới

Viết nội dung Markdown ở đây.

## Checklist

- [ ] Ý chính cần viết
- [ ] Ví dụ thực tế
- [ ] Kết luận
`;

type TreeNode = MarkdownEntry & {
  children: TreeNode[];
};

export function MarkdownFilesClient() {
  const [entries, setEntries] = useState<MarkdownEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    let ignore = false;

    async function loadFiles() {
      const stored = readStoredMarkdownFiles();

      if (stored.length > 0 || hasStoredMarkdownFiles()) {
        setEntries(stored);
        setExpandedFolderIds(new Set(stored.filter(isFolder).map((entry) => entry.id)));
        setActiveEntryId(stored[0]?.id ?? null);
        return;
      }

      try {
        const response = await fetch('/api/skill-roadmap/progress', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const seed = normalizeRoadmapBackup(await response.json());

        if (!seed || ignore) {
          return;
        }

        storeMarkdownFiles(seed.markdownFiles);
        setEntries(seed.markdownFiles);
        setExpandedFolderIds(new Set(seed.markdownFiles.filter(isFolder).map((entry) => entry.id)));
        setActiveEntryId(seed.markdownFiles[0]?.id ?? null);
      } catch {
        // This tool can still create local files when seed hydration is unavailable.
      }
    }

    void loadFiles();

    return () => {
      ignore = true;
    };
  }, []);

  const activeEntry = useMemo(
    () => (activeEntryId ? entries.find((entry) => entry.id === activeEntryId) ?? null : null),
    [activeEntryId, entries]
  );

  const activeFile = activeEntry && isFile(activeEntry) ? activeEntry : null;
  const activeFolder = activeEntry && isFolder(activeEntry) ? activeEntry : null;
  const tree = useMemo(() => buildTree(entries), [entries]);
  const activePath = useMemo(
    () => (activeEntry ? getEntryPath(entries, activeEntry.id) : []),
    [activeEntry, entries]
  );
  const selectedFolderId = activeFolder?.id ?? activeEntry?.parentId ?? null;
  const childEntries = useMemo(
    () => entries.filter((entry) => entry.parentId === (activeFolder?.id ?? null)).sort(sortEntries),
    [activeFolder, entries]
  );

  const persistEntries = useCallback((nextEntries: MarkdownEntry[]) => {
    setEntries(nextEntries);
    storeMarkdownFiles(nextEntries);
  }, []);

  function createFolder() {
    const now = new Date().toISOString();
    const parentId = selectedFolderId;
    const nextFolder: MarkdownFolder = {
      id: crypto.randomUUID(),
      type: 'folder',
      title: `Thư mục ${entries.filter(isFolder).length + 1}`,
      parentId,
      createdAt: now,
      updatedAt: now,
    };

    persistEntries([nextFolder, ...entries]);
    setActiveEntryId(nextFolder.id);
    setExpandedFolderIds((current) => new Set([...current, nextFolder.id, ...(parentId ? [parentId] : [])]));
  }

  function createFile() {
    const now = new Date().toISOString();
    const parentId = selectedFolderId;
    const nextFile: MarkdownFile = {
      id: crypto.randomUUID(),
      type: 'file',
      title: `File Markdown ${entries.filter(isFile).length + 1}`,
      parentId,
      content: emptyMarkdown,
      createdAt: now,
      updatedAt: now,
    };

    persistEntries([nextFile, ...entries]);
    setActiveEntryId(nextFile.id);
    setMode('edit');
    if (parentId) {
      setExpandedFolderIds((current) => new Set([...current, parentId]));
    }
  }

  function updateActiveEntry(patch: Partial<Pick<MarkdownEntry, 'title' | 'parentId'> & Pick<MarkdownFile, 'content'>>) {
    if (!activeEntry) {
      return;
    }

    const now = new Date().toISOString();
    const nextEntries = entries.map((entry) =>
      entry.id === activeEntry.id
        ? {
            ...entry,
            ...patch,
            updatedAt: now,
          } as MarkdownEntry
        : entry
    );

    persistEntries(nextEntries);

    if (typeof patch.parentId === 'string') {
      setExpandedFolderIds((current) => new Set([...current, patch.parentId as string]));
    }
  }

  function deleteActiveEntry() {
    if (!activeEntry) {
      return;
    }

    const descendants = collectDescendantIds(entries, activeEntry.id);
    const itemCount = descendants.size + 1;
    const confirmed = window.confirm(
      activeEntry.type === 'folder'
        ? `Xoá thư mục "${activeEntry.title}" và ${itemCount - 1} mục bên trong khỏi trình duyệt?`
        : `Xoá file Markdown "${activeEntry.title}" khỏi trình duyệt?`
    );

    if (!confirmed) {
      return;
    }

    const idsToDelete = new Set([activeEntry.id, ...descendants]);
    const nextEntries = entries.filter((entry) => !idsToDelete.has(entry.id));
    persistEntries(nextEntries);
    setActiveEntryId(nextEntries[0]?.id ?? null);
  }

  function toggleFolder(folderId: string) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }

  const availableParentFolders = useMemo(() => {
    const blockedIds = activeEntry && isFolder(activeEntry)
      ? new Set([activeEntry.id, ...collectDescendantIds(entries, activeEntry.id)])
      : new Set<string>();

    return entries
      .filter((entry): entry is MarkdownFolder => isFolder(entry) && !blockedIds.has(entry.id))
      .sort(sortEntries);
  }, [activeEntry, entries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white md:text-3xl">
            Kho tài liệu Markdown
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
            Tổ chức tài liệu thành thư mục cha con, tạo file Markdown ở bất kỳ cấp nào và preview nội dung độc lập với lộ trình ôn tập.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={createFolder}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:text-blue-300"
          >
            <FolderPlus className="h-4 w-4" />
            Tạo thư mục
          </button>
          <button
            type="button"
            onClick={createFile}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <FilePlus2 className="h-4 w-4" />
            Tạo file
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-950/60">
              <button
                type="button"
                onClick={() => setActiveEntryId(null)}
                className={cn(
                  'mb-2 flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold transition',
                  !activeEntry
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-white hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white'
                )}
              >
                <Home className="h-4 w-4" />
                Tất cả tài liệu
              </button>

              {entries.length === 0 ? (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 px-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <Folder className="mb-2 h-5 w-5" />
                  Chưa có thư mục hoặc file.
                </div>
              ) : (
                <div className="max-h-[620px] overflow-y-auto pr-1">
                  {tree.map((node) => (
                    <TreeItem
                      key={node.id}
                      node={node}
                      level={0}
                      activeEntryId={activeEntry?.id ?? null}
                      expandedFolderIds={expandedFolderIds}
                      onSelect={setActiveEntryId}
                      onToggleFolder={toggleFolder}
                    />
                  ))}
                </div>
              )}
            </aside>

            <section className="min-w-0">
              {activeEntry ? (
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                    <div className="mb-3 flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <button type="button" onClick={() => setActiveEntryId(null)} className="font-semibold hover:text-blue-700 dark:hover:text-blue-300">
                        Gốc
                      </button>
                      {activePath.map((entry) => (
                        <span key={entry.id} className="flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" />
                          <button
                            type="button"
                            onClick={() => setActiveEntryId(entry.id)}
                            className={cn(
                              'max-w-40 truncate hover:text-blue-700 dark:hover:text-blue-300',
                              entry.id === activeEntry.id && 'font-semibold text-gray-800 dark:text-gray-100'
                            )}
                          >
                            {entry.title || 'Chưa đặt tên'}
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <label className="min-w-0 flex-1">
                        <span className="sr-only">Tên mục</span>
                        <input
                          value={activeEntry.title}
                          onChange={(event) => updateActiveEntry({ title: event.target.value })}
                          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <select
                          value={activeEntry.parentId ?? ''}
                          onChange={(event) => updateActiveEntry({ parentId: event.target.value || null })}
                          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                          <option value="">Gốc</option>
                          {availableParentFolders.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {getEntryPath(entries, folder.id).map((entry) => entry.title || 'Chưa đặt tên').join(' / ')}
                            </option>
                          ))}
                        </select>

                        {activeFile && (
                          <>
                            <button
                              type="button"
                              onClick={() => setMode('edit')}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition',
                                mode === 'edit'
                                  ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                              )}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setMode('preview')}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition',
                                mode === 'preview'
                                  ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                              )}
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={deleteActiveEntry}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xoá
                        </button>
                      </div>
                    </div>
                  </div>

                  {activeFile ? (
                    <div className="grid min-h-[520px] gap-0 lg:grid-cols-2">
                      <div className={cn('border-gray-200 dark:border-gray-800 lg:border-r', mode === 'preview' && 'hidden lg:block')}>
                        <div className="flex h-11 items-center gap-2 border-b border-gray-200 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          <Save className="h-4 w-4" />
                          Editor
                        </div>
                        <textarea
                          value={activeFile.content}
                          onChange={(event) => updateActiveEntry({ content: event.target.value })}
                          spellCheck={false}
                          className="min-h-[476px] w-full resize-y border-0 bg-white p-4 font-mono text-sm leading-6 text-gray-900 outline-none dark:bg-gray-950 dark:text-gray-100"
                        />
                      </div>

                      <div className={cn(mode === 'edit' && 'hidden lg:block')}>
                        <div className="flex h-11 items-center gap-2 border-b border-gray-200 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          <Eye className="h-4 w-4" />
                          Preview
                        </div>
                        <div className="min-h-[476px] overflow-x-auto p-4">
                          <MarkdownPreview content={activeFile.content} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <FolderDetail
                      folder={activeFolder}
                      childEntries={childEntries}
                      onCreateFolder={createFolder}
                      onCreateFile={createFile}
                      onSelect={setActiveEntryId}
                    />
                  )}
                </div>
              ) : (
                <FolderDetail
                  folder={null}
                  childEntries={entries.filter((entry) => entry.parentId === null).sort(sortEntries)}
                  onCreateFolder={createFolder}
                  onCreateFile={createFile}
                  onSelect={setActiveEntryId}
                />
              )}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TreeItem({
  node,
  level,
  activeEntryId,
  expandedFolderIds,
  onSelect,
  onToggleFolder,
}: {
  node: TreeNode;
  level: number;
  activeEntryId: string | null;
  expandedFolderIds: Set<string>;
  onSelect: (entryId: string) => void;
  onToggleFolder: (folderId: string) => void;
}) {
  const expanded = node.type === 'folder' && expandedFolderIds.has(node.id);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md border border-transparent text-sm transition',
          activeEntryId === node.id
            ? 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100'
            : 'text-gray-700 hover:border-gray-200 hover:bg-white hover:text-gray-950 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-900 dark:hover:text-white'
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {node.type === 'folder' ? (
          <button
            type="button"
            onClick={() => onToggleFolder(node.id)}
            className="flex h-8 w-6 shrink-0 items-center justify-center text-gray-500 dark:text-gray-400"
            aria-label={expanded ? 'Thu gọn thư mục' : 'Mở thư mục'}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="h-8 w-6 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left"
        >
          {node.type === 'folder' ? <Folder className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
          <span className="truncate font-semibold">{node.title || 'Chưa đặt tên'}</span>
        </button>
      </div>

      {node.type === 'folder' && expanded && node.children.length > 0 && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              activeEntryId={activeEntryId}
              expandedFolderIds={expandedFolderIds}
              onSelect={onSelect}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FolderDetail({
  folder,
  childEntries,
  onCreateFolder,
  onCreateFile,
  onSelect,
}: {
  folder: MarkdownFolder | null;
  childEntries: MarkdownEntry[];
  onCreateFolder: () => void;
  onCreateFile: () => void;
  onSelect: (entryId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950 dark:text-white">
            {folder ? folder.title || 'Chưa đặt tên' : 'Tất cả tài liệu'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {childEntries.length} mục trực tiếp
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreateFolder}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
          >
            <FolderPlus className="h-4 w-4" />
            Thư mục con
          </button>
          <button
            type="button"
            onClick={onCreateFile}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <FilePlus2 className="h-4 w-4" />
            File con
          </button>
        </div>
      </div>

      {childEntries.length === 0 ? (
        <div className="mt-5 flex min-h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          Thư mục này chưa có tài liệu.
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {childEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.id)}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
            >
              <div className="flex items-start gap-3">
                {entry.type === 'folder' ? (
                  <Folder className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
                ) : (
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
                )}
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
                    {entry.title || 'Chưa đặt tên'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {entry.type === 'folder' ? 'Thư mục' : 'Markdown'} · {new Date(entry.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function isFolder(entry: MarkdownEntry): entry is MarkdownFolder {
  return entry.type === 'folder';
}

function isFile(entry: MarkdownEntry): entry is MarkdownFile {
  return entry.type === 'file';
}

function sortEntries(a: MarkdownEntry, b: MarkdownEntry) {
  if (a.type !== b.type) {
    return a.type === 'folder' ? -1 : 1;
  }

  return a.title.localeCompare(b.title, 'vi');
}

function buildTree(entries: MarkdownEntry[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>();

  entries.forEach((entry) => {
    nodes.set(entry.id, { ...entry, children: [] });
  });

  const roots: TreeNode[] = [];

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      const parent = nodes.get(node.parentId);
      parent?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortTree = (items: TreeNode[]) => {
    items.sort(sortEntries);
    items.forEach((item) => sortTree(item.children));
  };

  sortTree(roots);

  return roots;
}

function collectDescendantIds(entries: MarkdownEntry[], entryId: string) {
  const descendants = new Set<string>();
  const visit = (parentId: string) => {
    entries
      .filter((entry) => entry.parentId === parentId)
      .forEach((entry) => {
        descendants.add(entry.id);
        visit(entry.id);
      });
  };

  visit(entryId);

  return descendants;
}

function getEntryPath(entries: MarkdownEntry[], entryId: string) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const path: MarkdownEntry[] = [];
  let current = byId.get(entryId);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}
