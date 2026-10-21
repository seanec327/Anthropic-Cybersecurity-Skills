import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  Filter,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { SkillItem, AttackTechnique } from '../types/skills';

interface MitreAttackExplorerProps {
  skills: SkillItem[];
  onSelectSkill: (skill: SkillItem) => void;
  attackLayer: {
    name: string;
    description: string;
    techniques: AttackTechnique[];
  } | null;
}

const TACTICS_LIST = [
  { id: 'TA0043', name: 'Reconnaissance', count: 103, color: 'border-cyan-500/40 text-cyan-400' },
  { id: 'TA0042', name: 'Resource Development', count: 22, color: 'border-sky-500/40 text-sky-400' },
  { id: 'TA0001', name: 'Initial Access', count: 467, color: 'border-blue-500/40 text-blue-400' },
  { id: 'TA0002', name: 'Execution', count: 350, color: 'border-indigo-500/40 text-indigo-400' },
  { id: 'TA0003', name: 'Persistence', count: 444, color: 'border-purple-500/40 text-purple-400' },
  { id: 'TA0004', name: 'Privilege Escalation', count: 464, color: 'border-pink-500/40 text-pink-400' },
  { id: 'TA0005', name: 'Stealth / Defense Evasion', count: 442, color: 'border-rose-500/40 text-rose-400' },
  { id: 'TA0112', name: 'Defense Impairment', count: 92, color: 'border-red-500/40 text-red-400' },
  { id: 'TA0006', name: 'Credential Access', count: 202, color: 'border-amber-500/40 text-amber-400' },
  { id: 'TA0007', name: 'Discovery', count: 237, color: 'border-yellow-500/40 text-yellow-400' },
  { id: 'TA0008', name: 'Lateral Movement', count: 68, color: 'border-lime-500/40 text-lime-400' },
  { id: 'TA0009', name: 'Collection', count: 172, color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'TA0011', name: 'Command & Control', count: 123, color: 'border-teal-500/40 text-teal-400' },
  { id: 'TA0010', name: 'Exfiltration', count: 82, color: 'border-emerald-600/40 text-emerald-400' },
  { id: 'TA0040', name: 'Impact', count: 50, color: 'border-orange-500/40 text-orange-400' },
];

export const MitreAttackExplorer: React.FC<MitreAttackExplorerProps> = ({
  skills,
  onSelectSkill,
  attackLayer,
}) => {
  const [selectedTactic, setSelectedTactic] = useState<string>('TA0006'); // Credential Access default
  const [techniqueFilter, setTechniqueFilter] = useState('');
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>('T1003');

  const techniques = attackLayer?.techniques || [];

  // Filter techniques
  const filteredTechniques = useMemo(() => {
    const q = techniqueFilter.toLowerCase().trim();
    if (!q) return techniques;
    return techniques.filter(
      (t) =>
        t.techniqueID.toLowerCase().includes(q) ||
        (t.comment && t.comment.toLowerCase().includes(q))
    );
  }, [techniques, techniqueFilter]);

  // Skills matching the selected technique or tactic
  const matchedSkills = useMemo(() => {
    if (selectedTechniqueId) {
      return skills.filter(
        (s) =>
          s.mitre_attack?.some(
            (t) => t.startsWith(selectedTechniqueId) || selectedTechniqueId.startsWith(t)
          ) ||
          s.description.toLowerCase().includes(selectedTechniqueId.toLowerCase())
      );
    }
    return [];
  }, [skills, selectedTechniqueId]);

  // Heatmap color generator
  const getHeatmapColor = (score: number) => {
    if (score >= 30) return 'bg-amber-500/30 text-amber-200 border-amber-500/50';
    if (score >= 15) return 'bg-amber-600/20 text-amber-300 border-amber-600/40';
    if (score >= 5) return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30';
    return 'bg-slate-900 text-slate-300 border-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30 text-xs font-mono font-medium mb-2">
              <Flame className="w-3.5 h-3.5" />
              MITRE ATT&CK v19.1 Enterprise Coverage
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Interactive TTP Navigator & Coverage Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              805 of 818 skills are directly mapped to 290 ATT&CK techniques across Enterprise, ICS, and Mobile matrices with zero deprecated IDs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Total Scored Techniques:</span>
            <span className="text-amber-400 font-bold">{techniques.length}</span>
          </div>
        </div>
      </div>

      {/* ATT&CK Tactic Kill-chain Scrollbar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
            ATT&CK Tactics (Select to explore)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">15 enterprise tactics</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TACTICS_LIST.map((tactic) => {
            const isSelected = selectedTactic === tactic.id;
            return (
              <button
                key={tactic.id}
                onClick={() => {
                  setSelectedTactic(tactic.id);
                  // also find first technique if possible
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500/60 shadow-md shadow-amber-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">{tactic.id}</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate max-w-[130px]">
                  {tactic.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-1">
                  {tactic.count} skills
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-column view: Techniques Grid & Matched Skills Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Techniques Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Scored Techniques in Navigator Layer
              </h3>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter techniques..."
                  value={techniqueFilter}
                  onChange={(e) => setTechniqueFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Techniques Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredTechniques.map((tech) => {
                const isSelected = selectedTechniqueId === tech.techniqueID;
                const commentText = tech.comment || '';
                const techName = commentText.split('-')[0]?.trim() || tech.techniqueID;

                return (
                  <button
                    key={tech.techniqueID}
                    onClick={() => setSelectedTechniqueId(tech.techniqueID)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-emerald-400 bg-slate-800 border-emerald-500/80'
                        : getHeatmapColor(tech.score)
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">{tech.techniqueID}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 font-semibold">
                          score {tech.score}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium mt-1 line-clamp-2 leading-tight text-slate-200">
                        {techName}
                      </div>
                    </div>
                    {commentText.includes('Referenced in') && (
                      <div className="text-[10px] font-mono text-slate-400 mt-2">
                        {commentText.split('-')[1]?.trim() || ''}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Matched Skills for Selected Technique (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full flex flex-col">
            <div className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 uppercase font-semibold">
                  Selected Technique
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {matchedSkills.length} matching skills
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono mt-1">
                {selectedTechniqueId || 'Select a technique'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {techniques.find((t) => t.techniqueID === selectedTechniqueId)?.comment ||
                  'Technique mapping in cybersecurity skills library.'}
              </p>
            </div>

            {/* List of matching skills */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 max-h-[500px]">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((sk) => (
                  <div
                    key={sk.name}
                    onClick={() => onSelectSkill(sk)}
                    className="group p-3 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800/90 hover:border-emerald-500/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {sk.name}
                      </span>
                      {sk.hasFullDetails && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                          SPEC
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {sk.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{sk.subdomain || sk.domain}</span>
                      <span className="text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Read Spec <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No exact skills mapped to this technique ID directly. Try selecting another technique like T1003 or T1555.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
