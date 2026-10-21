import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Play,
  RotateCcw,
  Copy,
  Check,
  Shield,
  HelpCircle,
} from 'lucide-react';

const SAMPLE_TEMPLATE = `---
name: hunting-kerberoasting-activity
description: Detect Kerberoasting attacks in Active Directory environments by analyzing Windows Event ID 4769 (Kerberos Service Ticket Request) with RC4 encryption (0x17) and anomalous high-privilege SPN ticket requests using Splunk or KQL. Use when investigating suspicious Kerberos ticket spikes or hunting for lateral-movement credential extraction. Keywords: Kerberoasting, Event 4769, 0x17, Ticket Granting Service, TGS, SPN, Rubeus, Impacket, GetUserSPNs. Do not use for AS-REP roasting — use hunting-asrep-roasting-activity.
domain: cybersecurity
subdomain: threat-hunting
tags:
  - active-directory
  - kerberos
  - credential-access
  - threat-hunting
  - event-4769
version: '1.0'
author: security-team
license: Apache-2.0
nist_csf:
  - DE.CM-01
  - DE.AE-02
mitre_attack:
  - T1558.003
---
# Hunting Kerberoasting Activity

## Overview
Kerberoasting takes advantage of Active Directory Service Principal Names (SPNs) registered to domain user accounts.

## When to Use
- When suspicious spikes in Event ID 4769 ticket requests appear in SIEM.
- During active directory compromise triage.

## Step-by-Step Procedure
1. Query SIEM for Event ID 4769 where TicketOptions indicates non-machine requests.
2. Filter for Ticket Encryption Type \`0x17\` (RC4-HMAC) requested by standard user accounts.
3. Cross-reference requested service names with sensitive high-privilege service accounts.

## Verification
Validate that alerts trigger on known test requests generated in lab environments.
`;

interface RuleCheck {
  id: string;
  title: string;
  passed: boolean;
  message: string;
  details?: string;
  level: 'error' | 'warning' | 'info';
}

export const SkillValidatorLab: React.FC = () => {
  const [skillText, setSkillText] = useState(SAMPLE_TEMPLATE);
  const [copied, setCopied] = useState(false);

  // Validation Engine
  const validateSkill = (content: string): RuleCheck[] => {
    const checks: RuleCheck[] = [];

    // Check 1: Frontmatter structure
    const hasFrontmatter = content.startsWith('---');
    const parts = content.split('---');
    const hasValidParts = hasFrontmatter && parts.length >= 3;

    checks.push({
      id: 'frontmatter-format',
      title: 'YAML Frontmatter Delimiters',
      passed: hasValidParts,
      level: 'error',
      message: hasValidParts
        ? 'Valid YAML frontmatter block detected between --- delimiters.'
        : 'Missing or malformed frontmatter delimiters (--- at top and bottom).',
    });

    if (!hasValidParts) return checks;

    const yamlBlock = parts[1];
    const bodyBlock = parts.slice(2).join('---').trim();

    // Parse simple frontmatter keys
    const getVal = (key: string) => {
      const match = yamlBlock.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
      return match ? match[1].trim().replace(/^['\"]|['\"]$/g, '') : '';
    };

    const name = getVal('name');
    const description = getVal('description');
    const domain = getVal('domain');
    const subdomain = getVal('subdomain');

    // Check 2: Name specification
    const nameValid =
      Boolean(name) && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) && name.length <= 64;
    checks.push({
      id: 'name-rule',
      title: 'Skill Name (lowercase-kebab, ≤64 chars)',
      passed: nameValid,
      level: 'error',
      message: nameValid
        ? `Skill name "${name}" adheres to standard kebab-case (${name.length}/64 chars).`
        : `Skill name must be lowercase-kebab (a-z, 0-9, -) and ≤64 characters. Currently: "${name}" (${name.length} chars).`,
    });

    // Check 3: Domain & Subdomain
    const domainValid = domain === 'cybersecurity';
    checks.push({
      id: 'domain-rule',
      title: 'Standard Domain',
      passed: domainValid,
      level: 'error',
      message: domainValid
        ? 'Domain is correctly set to "cybersecurity".'
        : `Domain must be "cybersecurity", found: "${domain}".`,
    });

    // Check 4: Description length (≤1024 chars)
    const descLength = description ? description.length : 0;
    const descLengthValid = descLength > 0 && descLength <= 1024;
    checks.push({
      id: 'desc-length',
      title: 'Description Character Limit (≤1024 chars)',
      passed: descLengthValid,
      level: 'error',
      message: descLengthValid
        ? `Description length is ${descLength}/1024 characters.`
        : `Description must be 1-1024 characters. Current length: ${descLength} characters.`,
    });

    // Check 5: Description 4 mandatory components (AGENTS.md)
    const hasUseWhen = /use when/i.test(description);
    const hasKeywords = /keywords:/i.test(description);
    const hasNegativeTrigger = /do not use for/i.test(description);

    checks.push({
      id: 'desc-components',
      title: 'Description 4-Point Signal Check',
      passed: hasUseWhen && hasKeywords && hasNegativeTrigger,
      level: hasUseWhen && hasKeywords && hasNegativeTrigger ? 'info' : 'warning',
      message:
        hasUseWhen && hasKeywords && hasNegativeTrigger
          ? 'Includes "Use when...", "Keywords:", and negative trigger ("Do not use for...")'
          : `Missing recommended signals: ${[!hasUseWhen && '"Use when..."', !hasKeywords && '"Keywords:"', !hasNegativeTrigger && '"Do not use for..."'].filter(Boolean).join(', ')}.`,
      details: 'Negative triggers allow AI agents to avoid collisions between overlapping skills.',
    });

    // Check 6: Body line count (≤500 lines)
    const bodyLines = bodyBlock.split('\n').length;
    const bodyLinesValid = bodyLines <= 500;
    checks.push({
      id: 'body-limit',
      title: 'Procedure Body Length (≤500 lines)',
      passed: bodyLinesValid,
      level: 'warning',
      message: bodyLinesValid
        ? `Body line count is ${bodyLines}/500 lines.`
        : `Body has ${bodyLines} lines (>500 limit). Long references belong in references/ directory.`,
    });

    // Check 7: Framework mappings syntax
    const hasAttack = yamlBlock.includes('mitre_attack:');
    const hasNist = yamlBlock.includes('nist_csf:');
    checks.push({
      id: 'framework-syntax',
      title: 'Framework Mappings',
      passed: hasAttack || hasNist,
      level: 'info',
      message:
        hasAttack && hasNist
          ? 'Carries both MITRE ATT&CK and NIST CSF mappings.'
          : hasAttack
          ? 'Carries MITRE ATT&CK mappings.'
          : hasNist
          ? 'Carries NIST CSF mappings.'
          : 'No framework mappings detected in frontmatter.',
    });

    return checks;
  };

  const results = validateSkill(skillText);
  const errorCount = results.filter((r) => !r.passed && r.level === 'error').length;
  const warningCount = results.filter((r) => !r.passed && r.level === 'warning').length;
  const allPassed = errorCount === 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(skillText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-950/80 text-teal-400 border border-teal-500/30 text-xs font-mono font-medium mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              AGENTS.md & agentskills.io Compliance Linter
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Skill Validator & Authoring Lab
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Validate existing skills or test new cybersecurity skills against the repository CI specification before publishing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSkillText(SAMPLE_TEMPLATE)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Template
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center gap-1.5 hover:bg-emerald-900/60 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy SKILL.md'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Diagnostic Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SKILL.md Editor</span>
            <span>{skillText.split('\n').length} lines • {skillText.length} bytes</span>
          </div>
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <textarea
              value={skillText}
              onChange={(e) => setSkillText(e.target.value)}
              className="w-full h-[520px] p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-emerald-900 selection:text-white"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Diagnostic Linter Results (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Linter Diagnostics
              </h3>

              <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                {errorCount === 0 ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {errorCount} ERRORS
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {warningCount}
                  </span>
                )}
              </div>
            </div>

            {/* Checklist items */}
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {results.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    r.passed
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                      : r.level === 'error'
                      ? 'bg-red-950/20 border-red-500/30 text-red-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : r.level === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className={r.passed ? 'text-slate-200' : ''}>{r.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 pl-6">{r.message}</p>
                  {r.details && (
                    <p className="mt-0.5 text-[10px] text-slate-500 pl-6 italic">{r.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
