import React, { useState } from 'react';
import {
  X,
  Shield,
  FileText,
  Code2,
  BookOpen,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SkillItem, SkillDetail } from '../types/skills';
import { MarkdownViewer } from '../utils/markdownRenderer';

interface SkillDetailModalProps {
  skill: SkillItem | null;
  detail: SkillDetail | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (skillName: string) => void;
  onSelectTactic?: (tacticId: string) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skill,
  detail,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (!skill) return null;

  const [activeTab, setActiveTab] = useState<'procedure' | 'references' | 'scripts' | 'agent' | 'raw'>('procedure');
  const [selectedRefIndex, setSelectedRefIndex] = useState(0);
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const references = detail?.references || [];
  const scripts = detail?.scripts || [];
  const assets = detail?.assets || [];

  const agentPromptSnippet = `You have access to the skill "${skill.name}".
Description: ${skill.description}
Domain: ${skill.domain}
Path: ${skill.path}/SKILL.md

When executing this skill:
1. Review the prerequisites and authorized scope.
2. Follow the verified step-by-step procedure in ${skill.path}/SKILL.md.
3. Validate artifacts and verify expected detection signatures.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(agentPromptSnippet);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const fullMarkdown = detail?.body || skill.description;

  const handleCopyRaw = () => {
    const raw = detail
      ? `---\nname: ${detail.name}\ndescription: ${detail.frontmatter.description || skill.description}\ndomain: ${detail.frontmatter.domain || skill.domain}\n---\n\n${detail.body}`
      : skill.description;
    navigator.clipboard.writeText(raw);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                {skill.subdomain || skill.domain}
              </span>
              <span className="text-xs text-slate-400 font-mono">v{skill.version || '1.0'}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{skill.license || 'Apache-2.0'}</span>
              {skill.hasFullDetails && (
                <span className="text-[11px] font-mono bg-blue-950/80 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" /> Complete Spec
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight break-words font-mono">
              {skill.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {skill.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(skill.name)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={isBookmarked ? 'In Agent Bundle' : 'Add to Agent Bundle'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Framework Badges bar */}
        {(skill.mitre_attack?.length || skill.nist_csf?.length || skill.mitre_f3?.length || skill.tags?.length) && (
          <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            {skill.mitre_attack && skill.mitre_attack.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[11px] uppercase">ATT&CK:</span>
                {skill.mitre_attack.map((id) => (
                  <span
                    key={id}
                    className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/30 font-mono text-[11px]"
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}

            {skill.nist_csf && skill.nist_csf.length > 0 && (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase">NIST CSF:</span>
                {skill.nist_csf.map((id) => (
                  <span
                    key={id}
                    className="px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-500/30 font-mono text-[11px]"
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}

            {skill.tags && skill.tags.length > 0 && (
              <div className="flex items-center gap-1 ml-auto overflow-x-auto py-0.5">
                {skill.tags.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setActiveTab('procedure')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'procedure'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Procedure & Spec
            </button>

            {references.length > 0 && (
              <button
                onClick={() => setActiveTab('references')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'references'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                References ({references.length})
              </button>
            )}

            {scripts.length > 0 && (
              <button
                onClick={() => setActiveTab('scripts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'scripts'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Scripts ({scripts.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('agent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'agent'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Agent Prompt
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'raw'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Raw Markdown
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 rounded border border-slate-700/80 transition-colors"
            >
              {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedRaw ? 'Copied' : 'Copy MD'}
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-950/30">
          {activeTab === 'procedure' && (
            <div>
              {detail ? (
                <MarkdownViewer content={detail.body} />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <h3 className="text-base font-semibold text-slate-200 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      agentskills.io Skill Specification
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{skill.description}</p>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <div>
                        Domain: <span className="font-mono text-emerald-400">{skill.domain}</span>
                      </div>
                      <div>•</div>
                      <div>
                        Standard: <span className="font-mono text-slate-300">agentskills.io v1.0</span>
                      </div>
                      <div>•</div>
                      <div>
                        Path: <span className="font-mono text-slate-400">{skill.path}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                      Agent Discovery Phase Behavior
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Per the AGENTS.md protocol, only this skill's <code className="text-emerald-400">name</code> and{' '}
                      <code className="text-emerald-400">description</code> are loaded into the agent's context during discovery.
                      The agent activates the full procedure when the user's investigation triggers matching keywords or attack
                      TTPs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'references' && references.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Reference file selector */}
              <div className="md:col-span-1 space-y-1.5 border-r border-slate-800/80 pr-2">
                <div className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
                  Reference Docs
                </div>
                {references.map((ref, idx) => (
                  <button
                    key={ref.name}
                    onClick={() => setSelectedRefIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors truncate ${
                      selectedRefIndex === idx
                        ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    {ref.name}
                  </button>
                ))}
              </div>

              {/* Reference content viewer */}
              <div className="md:col-span-3">
                <div className="mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    {references[selectedRefIndex]?.name}
                  </span>
                </div>
                <MarkdownViewer content={references[selectedRefIndex]?.content || ''} />
              </div>
            </div>
          )}

          {activeTab === 'scripts' && scripts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Scripts list */}
              <div className="md:col-span-1 space-y-1.5 border-r border-slate-800/80 pr-2">
                <div className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
                  Automation Scripts
                </div>
                {scripts.map((sc, idx) => (
                  <button
                    key={sc.name}
                    onClick={() => setSelectedScriptIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors truncate ${
                      selectedScriptIndex === idx
                        ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    {sc.name}
                  </button>
                ))}
              </div>

              {/* Script code viewer */}
              <div className="md:col-span-3">
                <div className="mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    {scripts[selectedScriptIndex]?.name}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                  <pre>
                    <code>{scripts[selectedScriptIndex]?.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Agent System Prompt Injection
                  </h3>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium hover:bg-emerald-900/60 transition-colors"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPrompt ? 'Copied' : 'Copy Prompt'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Add this instruction block to Claude, Cursor, ChatGPT, or your autonomous agent runtime to equip it with this
                  exact skill procedure.
                </p>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                  <pre>
                    <code>{agentPromptSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {fullMarkdown}
            </div>
          )}
        </div>

        {/* Footer actions bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 font-mono text-[11px]">
            Domain: <span className="text-slate-200 font-semibold">{skill.domain}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(skill.name)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isBookmarked
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isBookmarked ? 'In Bundle' : 'Add to Agent Bundle'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
