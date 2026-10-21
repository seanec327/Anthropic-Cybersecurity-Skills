import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let tableLines: string[] = [];
  let inTable = false;

  const flushTable = (index: number) => {
    if (tableLines.length === 0) return;
    const headerRow = tableLines[0];
    const dataRows = tableLines.slice(2); // skip separator row

    const parseRow = (row: string) =>
      row
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

    const headers = parseRow(headerRow);

    renderedElements.push(
      <div key={`table-${index}`} className="my-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60">
        <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300">
          <thead className="bg-slate-900 font-semibold text-slate-200">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {dataRows.map((r, ri) => (
              <tr key={ri} className="hover:bg-slate-800/30 transition-colors">
                {parseRow(r).map((cell, ci) => (
                  <td key={ci} className="px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableLines = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        if (inTable) flushTable(i);
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
        codeBlockLines = [];
        continue;
      } else {
        const codeText = codeBlockLines.join('\n');
        renderedElements.push(
          <CodeBlockItem key={`code-${i}`} code={codeText} language={codeBlockLang} />
        );
        inCodeBlock = false;
        codeBlockLines = [];
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Markdown Table check
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableLines.push(line);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Headings
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1 key={i} className="mt-6 mb-3 text-2xl font-bold tracking-tight text-white border-b border-slate-800 pb-2">
          {line.slice(2)}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={i} className="mt-5 mb-2.5 text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={i} className="mt-4 mb-2 text-base font-semibold text-slate-200">
          {line.slice(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={i} className="mt-3 mb-1 text-sm font-semibold text-slate-300">
          {line.slice(5)}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const isLegal = line.toLowerCase().includes('legal') || line.toLowerCase().includes('authorized');
      renderedElements.push(
        <div
          key={i}
          className={`my-3 px-4 py-3 rounded-lg border text-xs leading-relaxed ${
            isLegal
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200/90'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-300'
          }`}
        >
          {formatInlineMarkdown(line.slice(2))}
        </div>
      );
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      renderedElements.push(
        <li key={i} className="ml-5 list-disc text-sm text-slate-300 my-1 leading-relaxed">
          {formatInlineMarkdown(line.trim().slice(2))}
        </li>
      );
      continue;
    }

    // Ordered List
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <li key={i} className="ml-5 list-decimal text-sm text-slate-300 my-1 leading-relaxed">
          {formatInlineMarkdown(numMatch[2])}
        </li>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      renderedElements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Regular paragraph
    renderedElements.push(
      <p key={i} className="text-sm text-slate-300 leading-relaxed my-1.5">
        {formatInlineMarkdown(line)}
      </p>
    );
  }

  if (inTable) {
    flushTable(lines.length);
  }

  return <div className="space-y-1 font-sans text-slate-300">{renderedElements}</div>;
};

const CodeBlockItem: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg border border-slate-800 bg-slate-900/90 overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/70 border-b border-slate-800/80 text-slate-400">
        <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:text-white hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-slate-200 leading-relaxed text-[12px]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function formatInlineMarkdown(text: string): React.ReactNode {
  // Replace inline bold, code, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex to split by `code`, **bold**, or [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[11.5px] border border-slate-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkText = token.slice(1, token.indexOf(']('));
      const linkUrl = token.slice(token.indexOf('](') + 2, -1);
      parts.push(
        <a
          key={keyIdx++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
        >
          {linkText}
        </a>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
