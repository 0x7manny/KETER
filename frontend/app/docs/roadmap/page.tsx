'use client';

import BadgePriority from '@/components/docs/BadgePriority';
import { roadmapTasks } from '@/data/roadmap';

export default function RoadmapPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">Roadmap</h1>
      <p className="text-keter-text-secondary mb-8">
        What needs to be done for the hackathon, and what comes after.
      </p>

      <div className="bg-white border border-keter-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-keter-secondary">
                <th className="text-left px-6 py-3 text-xs font-medium text-keter-text-muted uppercase tracking-wider">Priority</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-keter-text-muted uppercase tracking-wider">Task</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-keter-text-muted uppercase tracking-wider">File</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-keter-text-muted uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {roadmapTasks.map((t, i) => (
                <tr key={i} className="border-t border-keter-border-light hover:bg-keter-bg/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <BadgePriority priority={t.priority} />
                  </td>
                  <td className="px-6 py-3.5 text-keter-text">{t.task}</td>
                  <td className="px-6 py-3.5">
                    {t.file !== '—' ? (
                      <code className="text-xs font-mono text-keter-accent bg-keter-accent-light/30 px-1.5 py-0.5 rounded">
                        {t.file}
                      </code>
                    ) : (
                      <span className="text-keter-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-keter-text-secondary font-mono text-xs">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
