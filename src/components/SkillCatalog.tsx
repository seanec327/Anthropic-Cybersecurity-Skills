import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Shield,
  Layers,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronRight,
  Terminal,
  Crosshair,
  CheckCircle2,
  X,
  FileCode2,
} from 'lucide-react';
import { SkillItem } from '../types/skills';

interface SkillCatalogProps {
  skills: SkillItem[];
  onSelectSkill: (skill: SkillItem) => void;
  bookmarkedSkills: Set<string>;
  onToggleBookmark: (skillName: string) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  selectedFramework: string;
  setSelectedFramework: (fw: string) => void;
}

const QUICK_SEARCH_EXAMPLES = [
  'DPAPI credentials',
  'Cobalt Strike beacon',
  'Volatility memory forensics',
  'Kubernetes audit logs',
  'AWS S3 permissions',
  'Ransomware payment wallets',
  'Pass-the-ticket attack',
  'MITRE F3 fraud',
];

export const SkillCatalog: React.FC<SkillCatalogProps> = ({
  skills,
  onSelectSkill,
  bookmarkedSkills,
  onToggleBookmark,
  selectedDomain,
  setSelectedDomain,
  selectedFramework,
  setSelectedFramework,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFullDetails, setOnlyFullDetails] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Extract all unique domains and their count
  const domainCounts = useMemo(() => {
    const map = new Map<string, number>();
    skills.forEach((s) => {
      const d = s.subdomain || s.domain;
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [skills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return skills.filter((skill) => {
      if (onlyFullDetails && !skill.hasFullDetails) return false;

      if (selectedDomain && skill.domain !== selectedDomain && skill.subdomain !== selectedDomain) {
        return false;
      }

      if (selectedFramework === 'mitre_attack' && (!skill.mitre_attack || skill.mitre_attack.length === 0)) {
        return false;
      }
      if (selectedFramework === 'nist_csf' && (!skill.nist_csf || skill.nist_csf.length === 0)) {
        return false;
      }
      if (selectedFramework === 'mitre_f3' && (!skill.mitre_f3 || skill.mitre_f3.length === 0)) {
        return false;
      }

      if (!q) return true;

      const nameMatch = skill.name.toLowerCase().includes(q);
      const descMatch = skill.description.toLowerCase().includes(q);
      const domainMatch = skill.domain.toLowerCase().includes(q) || (skill.subdomain && skill.subdomain.toLowerCase().includes(q));
      const tagMatch = skill.tags?.some((t) => t.toLowerCase().includes(q));
      const attackMatch = skill.mitre_attack?.some((a) => a.toLowerCase().includes(q));
      const csfMatch = skill.nist_csf?.some((c) => c.toLowerCase().includes(q));

      return nameMatch || descMatch || domainMatch || tagMatch || attackMatch || csfMatch;
    });
  }, [skills, searchQuery, selectedDomain, selectedFramework, onlyFullDetails]);

  const totalPages = Math.ceil(filteredSkills.length / pageSize);
  const paginatedSkills = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSkills.slice(start, start + pageSize);
  }, [filteredSkills, page]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDomain('');
    setSelectedFramework('');
    setOnlyFullDetails(false);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-3">
            <Shield className="w-3.5 h-3.5" />
            Open Standard for Cybersecurity AI Agents
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Security Intelligence for Autonomous Agents
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Give any AI agent the capability of a senior security engineer. Browse, inspect, and export 818 production-grade
            skills across 34 domains mapped to MITRE ATT&CK, NIST CSF 2.0, and MITRE F3.
          </p>

          {/* Quick Scenario Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" /> Quick scenarios:
            </span>
            {QUICK_SEARCH_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setSearchQuery(ex);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs transition-colors border border-slate-700/60 font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by skill name, description, tool (Volatility, Mimikatz, Ghidra), CVE, or TTP (T1003)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Domain Dropdown */}
          <div className="w-full md:w-64">
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Domains ({skills.length})</option>
              {domainCounts.map(([domain, count]) => (
                <option key={domain} value={domain}>
                  {domain} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Framework Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedFramework}
              onChange={(e) => {
                setSelectedFramework(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Frameworks</option>
              <option value="mitre_attack">MITRE ATT&CK (805)</option>
              <option value="nist_csf">NIST CSF 2.0 (804)</option>
              <option value="mitre_f3">MITRE F3 Fraud (94)</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={onlyFullDetails}
                onChange={(e) => {
                  setOnlyFullDetails(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Complete Specs Only ({skills.filter((s) => s.hasFullDetails).length})
              </span>
            </label>

            {(searchQuery || selectedDomain || selectedFramework || onlyFullDetails) && (
              <button
                onClick={handleResetFilters}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="text-slate-400 font-mono text-xs">
            Showing <span className="text-slate-100 font-semibold">{filteredSkills.length}</span> of {skills.length} skills
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {paginatedSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedSkills.map((skill) => {
            const isBookmarked = bookmarkedSkills.has(skill.name);

            return (
              <div
                key={skill.name}
                className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: domain badge + bookmark */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-emerald-400 border border-slate-700/80 font-medium truncate max-w-[70%]">
                      {skill.subdomain || skill.domain}
                    </span>

                    <div className="flex items-center gap-1">
                      {skill.hasFullDetails && (
                        <span
                          title="Complete Procedure, References & Scripts included"
                          className="w-2 h-2 rounded-full bg-blue-400"
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(skill.name);
                        }}
                        className={`p-1 rounded text-slate-500 hover:text-white transition-colors ${
                          isBookmarked ? 'text-emerald-400' : ''
                        }`}
                        title={isBookmarked ? 'In Agent Bundle' : 'Add to Agent Bundle'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectSkill(skill)}
                    className="font-mono text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors cursor-pointer break-words"
                  >
                    {skill.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                {/* Card Footer: Framework tags & action */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {skill.mitre_attack && skill.mitre_attack.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono text-[10px] border border-amber-500/20 truncate">
                        {skill.mitre_attack[0]}
                      </span>
                    )}
                    {skill.nist_csf && skill.nist_csf.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 font-mono text-[10px] border border-blue-500/20 truncate">
                        {skill.nist_csf[0]}
                      </span>
                    )}
                    {skill.scriptsCount ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center gap-0.5">
                        <FileCode2 className="w-2.5 h-2.5" /> {skill.scriptsCount}
                      </span>
                    ) : null}
                  </div>

                  <button
                    onClick={() => onSelectSkill(skill)}
                    className="flex items-center gap-1 text-xs text-emerald-400 group-hover:text-emerald-300 font-medium shrink-0 ml-auto"
                  >
                    <span>View Spec</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800 p-8">
          <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No matching skills found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing domain/framework filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <div className="text-slate-400 font-mono">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-mono transition-colors ${
                      page === pageNum
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
