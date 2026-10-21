import React from 'react';
import { Shield, Database, Cpu, Terminal, CheckCircle2, Bookmark, Flame } from 'lucide-react';

interface HeaderProps {
  activeTab: 'catalog' | 'attack' | 'frameworks' | 'agent-hub' | 'validator';
  setActiveTab: (tab: 'catalog' | 'attack' | 'frameworks' | 'agent-hub' | 'validator') => void;
  selectedCount: number;
  onOpenBundle: () => void;
  totalSkills: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCount,
  onOpenBundle,
  totalSkills,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Anthropic Cybersecurity Skills
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                  agentskills.io
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{totalSkills} Skills</span>
                <span className="text-slate-600">•</span>
                <span>34 Domains</span>
                <span className="text-slate-600">•</span>
                <span>6 Frameworks</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Skills Catalog
            </button>

            <button
              onClick={() => setActiveTab('attack')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'attack'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              MITRE ATT&CK
            </button>

            <button
              onClick={() => setActiveTab('frameworks')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'frameworks'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              NIST & Frameworks
            </button>

            <button
              onClick={() => setActiveTab('agent-hub')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'agent-hub'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              Agent Hub & Plugins
            </button>

            <button
              onClick={() => setActiveTab('validator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'validator'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              Skill Validator Lab
            </button>
          </nav>

          {/* Bundle Cart / Export Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBundle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedCount > 0
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bundle</span>
              {selectedCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {selectedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('attack')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'attack' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            ATT&CK Matrix
          </button>
          <button
            onClick={() => setActiveTab('frameworks')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'frameworks' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Frameworks
          </button>
          <button
            onClick={() => setActiveTab('agent-hub')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'agent-hub' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Agent Hub
          </button>
          <button
            onClick={() => setActiveTab('validator')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'validator' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Validator
          </button>
        </div>
      </div>
    </header>
  );
};
