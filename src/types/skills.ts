export interface SkillItem {
  name: string;
  description: string;
  domain: string;
  path: string;
  hasFullDetails: boolean;
  subdomain?: string;
  tags?: string[];
  version?: string;
  author?: string;
  license?: string;
  mitre_attack?: string[];
  nist_csf?: string[];
  mitre_f3?: string[];
  refsCount?: number;
  scriptsCount?: number;
  assetsCount?: number;
}

export interface SkillDetail {
  name: string;
  frontmatter: {
    name?: string;
    description?: string;
    domain?: string;
    subdomain?: string;
    tags?: string[];
    version?: string;
    author?: string;
    license?: string;
    nist_csf?: string[];
    mitre_attack?: string[];
    mitre_f3?: string[];
    [key: string]: any;
  };
  body: string;
  references: { name: string; content: string }[];
  scripts: { name: string; content: string }[];
  assets: { name: string; content: string }[];
}

export interface AttackTechnique {
  techniqueID: string;
  score: number;
  comment?: string;
}

export interface AttackTactic {
  id: string;
  name: string;
  skillsCount: number;
  description: string;
}

export interface NistFunction {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface MitreF3Tactic {
  id: string;
  name: string;
  description: string;
}

export interface FrameworksData {
  attack: {
    name: string;
    version: string;
    mappedSkills: number;
    tactics: AttackTactic[];
  };
  nistCsf: {
    name: string;
    version: string;
    mappedSkills: number;
    functions: NistFunction[];
  };
  mitreF3: {
    name: string;
    version: string;
    mappedSkills: number;
    tactics: MitreF3Tactic[];
  };
  d3fend: {
    name: string;
    version: string;
    mappedSkills: number;
  };
  aiRmf: {
    name: string;
    version: string;
    mappedSkills: number;
  };
  atlas: {
    name: string;
    version: string;
    mappedSkills: number;
  };
}
