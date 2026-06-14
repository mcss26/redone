import fs from 'fs';
import path from 'path';

const changelogPath = path.join(process.cwd(), 'docs', 'ui-ux-changelog.md');
const decisionsPath = path.join(process.cwd(), 'docs', 'ui-ux-decisions.md');

const changelogEntry = `## 2026-06-14 (UI/UX Deep Visual Audit)
### Mass Remediation: Container Purge & Brutalism Form Inputs
- **Modules:** \`App.jsx\`, \`NightOpsModule.jsx\`, \`WorkDaysModule.jsx\`, \`StockRequestsModule.jsx\`, \`StaffPlanModule.jsx\`, \`NightReportModule.jsx\`, \`MonthlyReportModule.jsx\`, \`AnnualReportModule.jsx\`
- **Action:** 
  1. Removed \`bg-brand-surface p-1 rounded-xl\` container from the Reportes sub-nav in \`App.jsx\` to perfectly align it with the minimalist, floating text pattern of the other menus.
  2. Executed a "Container Purge" in \`NightOpsModule.jsx\` to remove all \`bg-brand-surface/*\` backgrounds from table headers, wrappers, and footers, allowing data to flow over the brand-bg natively.
  3. Replaced all rounded solid background inputs (\`bg-brand-surface border border-brand-border rounded-xl px-4\`) inside Slide-Overs with the transparent bottom-border variant (\`bg-transparent border-b border-brand-border/50 px-0 rounded-none\`).
- **Reason:** To enforce the strict Functional Brutalism rules based on a Playwright deep visual audit. Form fields must remain transparent with raw bottom borders, and tables/sub-navs must avoid redundant background shapes.

`;

const decisionsEntry = `## 2026-06-14: Playwright-Driven Deep Visual Audit Remediation
**Context:** The UI was audited visually using automated Playwright screenshots across all 22 active views. We identified recurring discrepancies with the Functional Brutalism standards, specifically concerning rounded solid inputs and nested \`bg-brand-surface\` wrappers in tables and topbars.
**Decision:** We conducted a mass remediation focusing on three architectural corrections:
1. **Report Sub-Nav Realignment (\`App.jsx\`):** Removed the pill-shaped background wrapper from the Report modules sub-navigation. The topbar must strictly employ text-based floating navigation without explicit containers, matching the \`Admin\` and \`Contador\` sub-navs.
2. **Form Field Transparency Enforcement:** Any standard CRUD slide-over input must strictly use \`bg-transparent border-b rounded-none px-0\`, deliberately breaking the modern "rounded pill" convention to favor raw, terminal-like data entry fields.
3. **Container Purge in High-Density Tables (\`NightOpsModule.jsx\`):** Stripped out background opacity scales (\`bg-brand-surface/30\`, etc.) from nested tables. Hierarchical separation must be achieved exclusively via typography (tracking, size) and raw \`border-b\` divisions, never via solid background shapes.

`;

if (fs.existsSync(changelogPath)) {
    let content = fs.readFileSync(changelogPath, 'utf8');
    content = content.replace('### Payments & Fixed Costs UI Alignment', changelogEntry + '### Payments & Fixed Costs UI Alignment');
    fs.writeFileSync(changelogPath, content, 'utf8');
}

if (fs.existsSync(decisionsPath)) {
    let content = fs.readFileSync(decisionsPath, 'utf8');
    content = content.replace('## 2026-06-06: Two-Tier Typographic Navigation', decisionsEntry + '## 2026-06-06: Two-Tier Typographic Navigation');
    fs.writeFileSync(decisionsPath, content, 'utf8');
}

console.log('Changelogs updated.');
