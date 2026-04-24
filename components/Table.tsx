type Column<T> = {
  key: keyof T;
  label: string;
};

type TableProps<T extends Record<string, string | number>> = {
  title: string;
  columns: readonly Column<T>[];
  data: T[];
};

export default function Table<T extends Record<string, string | number>>({
  title,
  columns,
  data,
}: TableProps<T>) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="whitespace-nowrap px-3 py-3 font-semibold"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="whitespace-nowrap px-3 py-3 text-slate-700"
                    >
                      {String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  No records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
