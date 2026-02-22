'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

export default function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-keter-border-light mb-6">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          {title && (
            <span className="text-xs text-gray-400 font-mono">{title}</span>
          )}
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors font-mono"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code area */}
      <div className="bg-[#0f0f23] overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="text-gray-300 font-mono whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
}
