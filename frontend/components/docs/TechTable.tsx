'use client';

interface TechTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  caption?: string;
}

export default function TechTable({ headers, rows, caption }: TechTableProps) {
  return (
    <div className="bg-white border border-keter-border-light rounded-xl overflow-hidden mb-6">
      {caption && (
        <div className="px-6 py-3 border-b border-keter-border-light">
          <p className="text-xs font-medium text-keter-text-muted uppercase tracking-widest">{caption}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-keter-secondary">
              {headers.map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs font-medium text-keter-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-keter-border-light hover:bg-keter-bg/50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-6 py-3.5 text-keter-text">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
