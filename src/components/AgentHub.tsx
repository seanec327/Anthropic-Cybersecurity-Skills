import React, { useState } from 'react';
import {
  Terminal,
  Bot,
  Copy,
  Check,
  Download,
  Share2,
  Trash2,
  BookmarkCheck,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SkillItem } from '../types/skills';

interface AgentHubProps {
  skills: SkillItem[];
  bookmarkedSkills: Set<string>;
  onRemoveBookmark: (skillName: string) => void;
  onClearBookmarks: () => void;
  onSelectSkill: (skill: SkillItem) => void;
}

export const AgentHub: React.FC<AgentHubProps> = ({
  skills,
  bookmarkedSkills,
  onRemoveBookmark,
  onClearBookmarks,
  onSelectSkill,
}) => {
  const [platform, setPlatform] = useState<'claude-plugin' | 'claude-desktop' | 'cursor' | 'hermes'>('claude-plugin');
  const [simQuery, setSimQuery] = useState('An attacker dumped LSASS memory and we need to investigate DPAPI blobs');
  const [copiedExport, setCopiedExport] = useState(false);

  const selectedSkills = skills.filter((s) => bookmarkedSkills.has(s.name));

  // Simulation: find top matching skill
  const matchedSkill = skills.find((s) => {
    const q = simQuery.toLowerCase();
    const nameWords = s.name.toLowerCase().split('-');
    const desc = s.description.toLowerCase();
    return nameWords.some((w) => w.length > 4 && q.includes(w)) || desc.includes(q.split(' ')[0] || '');
  }) || skills[0];

  // Generate Bundle export content
  const generateExportText = () => {
    if (platform === 'claude-plugin') {
      return JSON.stringify(
        {
          name: 'cybersecurity-skills',
          version: '1.3.0',
          description: 'Production-grade cybersecurity skills library for AI agents',
          skills: selectedSkills.map((s) => ({
            name: s.name,
            domain: s.domain,
            subdomain: s.subdomain,
            description: s.description,
            path: s.path,
          })),
        },
        null,
        2
      );
    }

    if (platform === 'claude-desktop') {
      return JSON.stringify(
        {
          mcpServers: {
            'cybersecurity-skills': {
              command: 'npx',
              args: ['-y', '@anthropic/cybersecurity-skills-mcp'],
              env: {
                ENABLED_SKILLS: selectedSkills.map((s) => s.name).join(','),
              },
            },
          },
        },
        null,
        2
      );
    }

    if (platform === 'cursor') {
      return `# Cybersecurity Agent Instructions

You are an expert security engineer equipped with the following specialized skills:

${selectedSkills
  .map(
    (s, idx) => `### ${idx + 1}. ${s.name} (${s.domain})
${s.description}
Path: ${s.path}/SKILL.md
`
  )
  .join('\n')}

When an investigation matches any of these skills, strictly follow the verified procedure and reference tooling.`;
    }

    // Hermes Agent / OpenAI
    return JSON.stringify(
      {
        skills_library: 'agentskills.io',
        total_selected: selectedSkills.length,
        skills: selectedSkills.map((s) => ({
          id: s.name,
          domain: s.domain,
          instructions_summary: s.description,
          frameworks: {
            mitre_attack: s.mitre_attack || [],
            nist_csf: s.nist_csf || [],
          },
        })),
      },
      null,
      2
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateExportText());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleDownload = () => {
    const text = generateExportText();
    const ext = platform === 'cursor' ? 'md' : 'json';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybersecurity-skills-bundle.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-400 border border-purple-500/30 text-xs font-mono font-medium mb-2">
              <Bot className="w-3.5 h-3.5" />
              Agent Protocol & Integrations
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Agent Skills Hub & Bundle Exporter
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Equip Claude Desktop, Cursor, Hermes Agent, Copilot, or custom LLM frameworks with the exact cybersecurity skill definitions.
            </p>
          </div>
        </div>
      </div>

      {/* Agent Discovery Lifecycle Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2 font-mono">
          <Terminal className="w-4 h-4 text-emerald-400" />
          The agentskills.io Two-Phase Discovery Architecture
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          To prevent context window bloat, agents do NOT load all 818 full markdown procedures at once. They follow the strict AGENTS.md discovery protocol:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-emerald-400 font-bold">Phase 1: Discovery</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Low Footprint</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Agent loads only <code className="text-emerald-300">name</code> and{' '}
              <code className="text-emerald-300">description</code> into discovery index (~400KB total).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-amber-400 font-bold">Phase 2: Negative Trigger</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Disambiguation</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Agent tests trigger conditions. If a skill says &quot;Do not use for X — use Y&quot;, the agent avoids collisions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-blue-400 font-bold">Phase 3: Body & Script Run</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Execution</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Agent pulls the full <code className="text-blue-300">SKILL.md</code> procedure, executes{' '}
              <code className="text-blue-300">agent.py</code>, and validates artifacts.
            </p>
          </div>
        </div>

        {/* Live Simulation Box */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-300 mb-2">Try Discovery Match Simulation:</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={simQuery}
              onChange={(e) => setSimQuery(e.target.value)}
              placeholder="Enter a security investigation prompt..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {matchedSkill && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] font-mono">Agent Match Result:</span>
                <div className="font-mono text-emerald-400 font-bold text-sm">{matchedSkill.name}</div>
                <div className="text-slate-300 text-xs line-clamp-1">{matchedSkill.description}</div>
              </div>
              <button
                onClick={() => onSelectSkill(matchedSkill)}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-medium hover:bg-emerald-900/60 shrink-0 font-mono"
              >
                View Skill Spec →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Bundle Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              Agent Skills Bundle ({selectedSkills.length} selected)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select skills across the catalog, then export them in your preferred AI platform format.
            </p>
          </div>

          {selectedSkills.length > 0 && (
            <button
              onClick={onClearBookmarks}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Bundle
            </button>
          )}
        </div>

        {/* Selected skills pill list */}
        {selectedSkills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {selectedSkills.map((sk) => (
              <span
                key={sk.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
              >
                <span>{sk.name}</span>
                <button
                  onClick={() => onRemoveBookmark(sk.name)}
                  className="text-slate-500 hover:text-red-400 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No skills selected yet. Click the bookmark icon on any skill card in the catalog to add it to this bundle.
          </div>
        )}

        {/* Platform Format Selectors & Exporter */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setPlatform('claude-plugin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  platform === 'claude-plugin'
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Claude Plugin JSON
              </button>
              <button
                onClick={() => setPlatform('claude-desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  platform === 'claude-desktop'
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Claude Desktop MCP
              </button>
              <button
                onClick={() => setPlatform('cursor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  platform === 'cursor'
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Cursor / Copilot MD
              </button>
              <button
                onClick={() => setPlatform('hermes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  platform === 'hermes'
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Hermes Agent
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-medium hover:bg-emerald-900/60 transition-colors"
              >
                {copiedExport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedExport ? 'Copied' : 'Copy Config'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-64 leading-relaxed">
            <pre>
              <code>{generateExportText()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
