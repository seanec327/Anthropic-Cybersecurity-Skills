import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  Layers,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Bot,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { SkillItem, FrameworksData } from '../types/skills';

interface FrameworkMappingsViewProps {
  skills: SkillItem[];
  frameworks: FrameworksData | null;
  onSelectSkill: (skill: SkillItem) => void;
}

export const FrameworkMappingsView: React.FC<FrameworkMappingsViewProps> = ({
  skills,
  frameworks,
  onSelectSkill,
}) => {
  const [activeFramework, setActiveFramework] = useState<'nist-csf' | 'mitre-f3' | 'ai-rmf-atlas' | 'd3fend'>('nist-csf');
  const [selectedCategory, setSelectedCategory] = useState<string>('DE'); // Detect by default

  // Filter skills by NIST CSF category prefix (GV, ID, PR, DE, RS, RC)
  const nistFilteredSkills = skills.filter((s) => {
    if (!selectedCategory) return true;
    return s.nist_csf?.some((c) => c.startsWith(selectedCategory));
  });

  // Filter skills for MITRE F3 (fraud-relevant)
  const f3FilteredSkills = skills.filter((s) => {
    const desc = s.description.toLowerCase();
    const name = s.name.toLowerCase();
    return (
      s.mitre_f3?.length ||
      desc.includes('fraud') ||
      desc.includes('monetization') ||
      desc.includes('bec') ||
      desc.includes('business email compromise') ||
      desc.includes('mule') ||
      desc.includes('wire transfer') ||
      name.includes('phishing') ||
      name.includes('ransomware-payment')
    );
  });

  // Filter AI security skills (ATLAS / AI RMF)
  const aiFilteredSkills = skills.filter((s) => {
    const desc = s.description.toLowerCase();
    const name = s.name.toLowerCase();
    return (
      desc.includes('llm') ||
      desc.includes('vector') ||
      desc.includes('embedding') ||
      desc.includes('promptfoo') ||
      desc.includes('mcp') ||
      desc.includes('rag') ||
      name.includes('llm') ||
      name.includes('embedding') ||
      name.includes('mcp')
    );
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-500/30 text-xs font-mono font-medium mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Multi-Framework Alignment Matrix
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Six Cybersecurity & AI Frameworks, One Library
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Every skill maps precisely to the standards relevant to its technical domain, spanning enterprise posture, cyber fraud, and adversarial machine learning.
            </p>
          </div>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveFramework('nist-csf')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeFramework === 'nist-csf'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            NIST CSF 2.0 (804 Skills)
          </button>
          <button
            onClick={() => setActiveFramework('mitre-f3')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeFramework === 'mitre-f3'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            MITRE F3 Fight Fraud (94 Skills)
          </button>
          <button
            onClick={() => setActiveFramework('ai-rmf-atlas')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeFramework === 'ai-rmf-atlas'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            MITRE ATLAS & NIST AI RMF (190 Skills)
          </button>
          <button
            onClick={() => setActiveFramework('d3fend')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeFramework === 'd3fend'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            MITRE D3FEND Countermeasures (139 Skills)
          </button>
        </div>
      </div>

      {/* NIST CSF 2.0 View */}
      {activeFramework === 'nist-csf' && (
        <div className="space-y-6">
          {/* 6 CSF Functions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'GV', name: 'Govern', color: 'border-purple-500/50 bg-purple-950/30 text-purple-300', count: 42 },
              { id: 'ID', name: 'Identify', color: 'border-blue-500/50 bg-blue-950/30 text-blue-300', count: 188 },
              { id: 'PR', name: 'Protect', color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300', count: 245 },
              { id: 'DE', name: 'Detect', color: 'border-amber-500/50 bg-amber-950/30 text-amber-300', count: 312 },
              { id: 'RS', name: 'Respond', color: 'border-red-500/50 bg-red-950/30 text-red-300', count: 196 },
              { id: 'RC', name: 'Recover', color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300', count: 58 },
            ].map((fn) => {
              const isSelected = selectedCategory === fn.id;
              return (
                <button
                  key={fn.id}
                  onClick={() => setSelectedCategory(fn.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected ? 'ring-2 ring-blue-400 bg-slate-800 border-blue-500' : fn.color
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{fn.id}</div>
                  <div className="text-sm font-semibold text-slate-100 mt-1">{fn.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">{fn.count} skills</div>
                </button>
              );
            })}
          </div>

          {/* List of Skills Mapped to this Function */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-semibold text-slate-200">
                Skills in Function: <span className="font-mono text-blue-400">{selectedCategory}</span> ({nistFilteredSkills.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono">NIST Cybersecurity Framework 2.0</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nistFilteredSkills.slice(0, 18).map((sk) => (
                <div
                  key={sk.name}
                  onClick={() => onSelectSkill(sk)}
                  className="p-3 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-200 hover:text-blue-400">
                      {sk.name}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sk.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="text-blue-300">{sk.nist_csf?.[0] || selectedCategory}</span>
                    <span className="text-emerald-400">View Spec →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MITRE F3 Fight Fraud View */}
      {activeFramework === 'mitre-f3' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              MITRE Fight Fraud Framework (F3) v1.1 — Released April 9, 2026
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Co-developed with JPMorganChase, Citigroup, Lloyds, Standard Chartered, and CrowdStrike to enumerate adversary
              actions taken *after* initial breach for financial monetization and account takeover.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/20">
                <span className="font-mono text-amber-400 font-bold">FA0001 Positioning:</span>
                <p className="text-slate-300 mt-1">
                  Synthetic-identity seeding, account warming, beneficiary setup, SIM swap pre-positioning, and banking session hijacking.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/20">
                <span className="font-mono text-amber-400 font-bold">FA0002 Monetization:</span>
                <p className="text-slate-300 mt-1">
                  Money-mule layering, authorized push payment (APP) fraud, crypto off-ramping, card cash-out, refund abuse.
                </p>
              </div>
            </div>
          </div>

          {/* F3 Skills List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">
              Fraud & Monetization Relevant Skills ({f3FilteredSkills.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {f3FilteredSkills.map((sk) => (
                <div
                  key={sk.name}
                  onClick={() => onSelectSkill(sk)}
                  className="p-3 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-200 hover:text-amber-400">
                      {sk.name}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sk.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="text-amber-400">MITRE F3</span>
                    <span className="text-emerald-400">View Spec →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI RMF & ATLAS View */}
      {activeFramework === 'ai-rmf-atlas' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-1">
              <Bot className="w-4 h-4" />
              Adversarial AI Security (MITRE ATLAS & NIST AI RMF 1.0)
            </div>
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Targeted skills protecting against prompt injection, model extraction, vector store / RAG poisoning, MCP server poisoning, and embedding inversion.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">
              AI Security & LLM Red-Teaming Skills ({aiFilteredSkills.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiFilteredSkills.map((sk) => (
                <div
                  key={sk.name}
                  onClick={() => onSelectSkill(sk)}
                  className="p-3 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-200 hover:text-purple-400">
                      {sk.name}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sk.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="text-purple-400">ATLAS / AI RMF</span>
                    <span className="text-emerald-400">View Spec →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* D3FEND View */}
      {activeFramework === 'd3fend' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-200">
              MITRE D3FEND Defensive Countermeasures (139 Skills)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Defensive matrix techniques that directly counter ATT&CK behaviors: Network Traffic Analysis (D3-NTA), File Analysis (D3-FA), Credential Hardening (D3-CH), and Memory Eviction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills
              .filter(
                (s) =>
                  s.name.includes('analyzing') ||
                  s.name.includes('configuring') ||
                  s.name.includes('detecting') ||
                  s.name.includes('auditing')
              )
              .slice(0, 18)
              .map((sk) => (
                <div
                  key={sk.name}
                  onClick={() => onSelectSkill(sk)}
                  className="p-3 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-200 hover:text-emerald-400">
                      {sk.name}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sk.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="text-emerald-400">D3FEND Countermeasure</span>
                    <span className="text-emerald-400">View Spec →</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
