import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SkillCatalog } from './components/SkillCatalog';
import { MitreAttackExplorer } from './components/MitreAttackExplorer';
import { FrameworkMappingsView } from './components/FrameworkMappingsView';
import { AgentHub } from './components/AgentHub';
import { SkillValidatorLab } from './components/SkillValidatorLab';
import { SkillDetailModal } from './components/SkillDetailModal';
import { SkillItem, SkillDetail, FrameworksData } from './types/skills';

// Import bundled metadata and catalog
import catalogData from './data/catalog.json';
import attackLayerData from './data/attack-layer.json';
import frameworksData from './data/frameworks.json';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'attack' | 'frameworks' | 'agent-hub' | 'validator'>('catalog');
  const [skills, setSkills] = useState<SkillItem[]>(catalogData as SkillItem[]);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [skillDetailsCache, setSkillDetailsCache] = useState<Record<string, SkillDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Bundle bookmarks with localStorage persistence
  const [bookmarkedSkills, setBookmarkedSkills] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('anthropic_skills_bundle');
      return saved ? new Set(JSON.parse(saved)) : new Set(['abusing-dpapi-for-credential-access', 'analyzing-cobalt-strike-beacon-configuration']);
    } catch {
      return new Set(['abusing-dpapi-for-credential-access', 'analyzing-cobalt-strike-beacon-configuration']);
    }
  });

  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('anthropic_skills_bundle', JSON.stringify(Array.from(bookmarkedSkills)));
    } catch {
      // ignore
    }
  }, [bookmarkedSkills]);

  const handleToggleBookmark = (skillName: string) => {
    setBookmarkedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillName)) {
        next.delete(skillName);
      } else {
        next.add(skillName);
      }
      return next;
    });
  };

  const handleRemoveBookmark = (skillName: string) => {
    setBookmarkedSkills((prev) => {
      const next = new Set(prev);
      next.delete(skillName);
      return next;
    });
  };

  const handleClearBookmarks = () => {
    setBookmarkedSkills(new Set());
  };

  // Open skill detail modal & load full content if available
  const handleSelectSkill = async (skill: SkillItem) => {
    setSelectedSkill(skill);

    if (skillDetailsCache[skill.name]) {
      return;
    }

    if (skill.hasFullDetails) {
      setLoadingDetail(true);
      try {
        const res = await fetch('/data/detailed-skills.json');
        if (res.ok) {
          const allDetails = await res.json();
          setSkillDetailsCache((prev) => ({ ...prev, ...allDetails }));
        }
      } catch (err) {
        console.error('Failed to load detailed skills:', err);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const currentDetail = selectedSkill ? skillDetailsCache[selectedSkill.name] || null : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCount={bookmarkedSkills.size}
        onOpenBundle={() => setActiveTab('agent-hub')}
        totalSkills={skills.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'catalog' && (
          <SkillCatalog
            skills={skills}
            onSelectSkill={handleSelectSkill}
            bookmarkedSkills={bookmarkedSkills}
            onToggleBookmark={handleToggleBookmark}
            selectedDomain={selectedDomain}
            setSelectedDomain={setSelectedDomain}
            selectedFramework={selectedFramework}
            setSelectedFramework={setSelectedFramework}
          />
        )}

        {activeTab === 'attack' && (
          <MitreAttackExplorer
            skills={skills}
            onSelectSkill={handleSelectSkill}
            attackLayer={attackLayerData as any}
          />
        )}

        {activeTab === 'frameworks' && (
          <FrameworkMappingsView
            skills={skills}
            frameworks={frameworksData as unknown as FrameworksData}
            onSelectSkill={handleSelectSkill}
          />
        )}

        {activeTab === 'agent-hub' && (
          <AgentHub
            skills={skills}
            bookmarkedSkills={bookmarkedSkills}
            onRemoveBookmark={handleRemoveBookmark}
            onClearBookmarks={handleClearBookmarks}
            onSelectSkill={handleSelectSkill}
          />
        )}

        {activeTab === 'validator' && <SkillValidatorLab />}
      </main>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          detail={currentDetail}
          onClose={() => setSelectedSkill(null)}
          isBookmarked={bookmarkedSkills.has(selectedSkill.name)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Anthropic Cybersecurity Skills</span>
            <span>•</span>
            <span>Open standard by agentskills.io</span>
            <span>•</span>
            <span>Apache-2.0 License</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            818 Production Skills • MITRE ATT&CK v19.1 • NIST CSF 2.0 • MITRE F3 v1.1
          </div>
        </div>
      </footer>
    </div>
  );
}
