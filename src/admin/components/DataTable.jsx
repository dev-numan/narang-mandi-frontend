import { useEffect, useMemo, useState } from 'react';

// Lightweight generic table. columns: [{ key, header, render?, className? }]
// Renders a real table on md+ screens, and stacked cards on small screens.
// Client-side pagination when pageSize > 0 (default 10). Pass pageSize={0} to disable.
// Optional typo: { header, cell, empty, pagination } class names for font-size tokens.
// Optional onRowClick(row) makes rows clickable (cursor + keyboard).
export default function DataTable({
  columns,
  rows,
  rowKey = '_id',
  empty = 'No records',
  pageSize = 10,
  labels = {},
  typo = {},
  onRowClick,
}) {
  const [page, setPage] = useState(1);
  const enabled = pageSize > 0;
  const total = rows.length;
  const totalPages = enabled ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const th = typo.header || 'text-xs';
  const td = typo.cell || 'text-sm';
  const emptyCls = typo.empty || '';
  const pageCls = typo.pagination || 'text-sm';

  useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    if (!enabled) return rows;
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize, enabled]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const prevLabel = labels.prev || 'Previous';
  const nextLabel = labels.next || 'Next';
  const showingLabel =
    labels.showing ||
    ((f, t, n) => (n === 0 ? 'No records' : `Showing ${f}–${t} of ${n}`));

  const goTo = (p) => setPage(Math.min(totalPages, Math.max(1, p)));

  const pageButtons = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className={`w-full text-left ${td}`}>
          <thead className={`border-b bg-gray-50 uppercase tracking-wide text-gray-500 ${th}`}>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold ${c.className || ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={`px-4 py-10 text-center text-gray-400 ${emptyCls}`}>
                  {empty}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row[rowKey]}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'link' : undefined}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 ${c.className || ''}`}
                      onClick={c.stopRowClick ? (e) => e.stopPropagation() : undefined}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {pageRows.length === 0 ? (
          <div className={`rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400 shadow-sm ${emptyCls}`}>
            {empty}
          </div>
        ) : (
          pageRows.map((row) => (
            <div
              key={row[rowKey]}
              className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${onRowClick ? 'cursor-pointer hover:border-brand/40' : ''}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'link' : undefined}
            >
              {columns.map((c) => (
                <div
                  key={c.key}
                  className="flex items-center justify-between gap-3 border-b border-gray-50 py-2 last:border-0"
                  onClick={c.stopRowClick ? (e) => e.stopPropagation() : undefined}
                >
                  <span className={`font-semibold uppercase tracking-wide text-gray-400 ${th}`}>{c.header}</span>
                  <span className={`min-w-0 text-right ${td}`}>{c.render ? c.render(row) : row[c.key]}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {enabled && total > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className={`text-gray-500 ${pageCls}`}>
            {typeof showingLabel === 'function' ? showingLabel(from, to, total) : showingLabel}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
              className={`rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 ${pageCls}`}
            >
              {prevLabel}
            </button>
            {pageButtons.map((p, i) => {
              const prev = pageButtons[i - 1];
              const showEllipsis = prev != null && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-1">
                  {showEllipsis && <span className="px-1 text-gray-400">…</span>}
                  <button
                    type="button"
                    onClick={() => goTo(p)}
                    className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 font-medium ${pageCls} ${
                      p === page ? 'bg-brand text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goTo(page + 1)}
              className={`rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 ${pageCls}`}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
