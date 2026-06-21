// Lightweight generic table. columns: [{ key, header, render?, className? }]
// Renders a real table on md+ screens, and stacked cards on small screens.
export default function DataTable({ columns, rows, rowKey = '_id', empty = 'No records' }) {
  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold ${c.className || ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row[rowKey]} className="hover:bg-gray-50">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards (one card per row, label → value) */}
      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400 shadow-sm">
            {empty}
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row[rowKey]}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {columns.map((c) => (
                <div
                  key={c.key}
                  className="flex items-center justify-between gap-3 border-b border-gray-50 py-2 last:border-0"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {c.header}
                  </span>
                  <span className="min-w-0 text-right text-sm">
                    {c.render ? c.render(row) : row[c.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
