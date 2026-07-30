export function ChapterTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border" style={{ borderColor: "var(--line)" }}>
      <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
        <thead>
          <tr style={{ background: "var(--purple-bg)" }}>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 font-semibold"
                style={{ color: "var(--purple-text)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "var(--line)" }}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top leading-relaxed text-[var(--ink-body)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
