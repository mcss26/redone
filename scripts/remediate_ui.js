import fs from 'fs';
import path from 'path';

const LAYOUTS_DIR = path.join(process.cwd(), 'src', 'layouts');
const APP_JSX_PATH = path.join(process.cwd(), 'src', 'App.jsx');

// Fix App.jsx Sub-Nav
let appCode = fs.readFileSync(APP_JSX_PATH, 'utf8');
const oldAppNav = `<div className="flex-1 flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar animate-fade-in px-4">
            <div className="flex bg-brand-surface p-1 rounded-xl">
              {['night_report', 'monthly_report', 'annual_report', 'r_pagos'].map(r => (
                <button
                  key={r}
                  onClick={() => handleNavigation(r)}
                  className={\`px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-colors \${activeView === r ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:text-brand-text'}\`}
                >
                  {r === 'night_report' ? 'R. JORNADA' : r === 'monthly_report' ? 'R. MENSUAL' : r === 'annual_report' ? 'R. ANUAL' : 'R. PAGOS'}
                </button>
              ))}
            </div>
          </div>`;
          
const newAppNav = `<div className="flex-1 flex items-center justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto no-scrollbar animate-fade-in px-4">
            {[
              { id: 'night_report', label: 'R. JORNADA' },
              { id: 'monthly_report', label: 'R. MENSUAL' },
              { id: 'annual_report', label: 'R. ANUAL' },
              { id: 'r_pagos', label: 'R. PAGOS' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => handleNavigation(mod.id)}
                className={\`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer \${
                  activeView === mod.id ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'
                }\`}
              >
                {mod.label}
              </button>
            ))}
          </div>`;

appCode = appCode.replace(oldAppNav, newAppNav);
fs.writeFileSync(APP_JSX_PATH, appCode, 'utf8');

// Fix layouts inputs and NightOps
const files = fs.readdirSync(LAYOUTS_DIR);

for (const file of files) {
  if (!file.endsWith('.jsx')) continue;
  
  let code = fs.readFileSync(path.join(LAYOUTS_DIR, file), 'utf8');
  let original = code;
  
  // Fix rounded-xl bg-brand-surface inputs
  code = code.replace(/bg-brand-surface border border-brand-border rounded-xl px-4/g, 'bg-transparent border-b border-brand-border/50 px-0 rounded-none focus:border-brand-text');
  
  // NightOps Specific Container Purge
  if (file === 'NightOpsModule.jsx') {
      code = code.replace(/bg-brand-surface\/40/g, 'bg-transparent');
      code = code.replace(/bg-brand-surface\/30/g, 'bg-transparent');
      code = code.replace(/bg-brand-surface\/20/g, 'bg-transparent');
      code = code.replace(/bg-brand-surface\/10/g, 'bg-transparent');
      code = code.replace(/bg-brand-surface\/50/g, 'bg-transparent');
      // Also remove some specific padding that looks weird when transparent
      code = code.replace(/className="w-32 bg-transparent border border-brand-border\/50/g, 'className="w-32 bg-transparent border-b border-brand-border\/50 rounded-none');
  }

  // Reports Module specific selects:
  if (['NightReportModule.jsx', 'MonthlyReportModule.jsx', 'AnnualReportModule.jsx'].includes(file)) {
      code = code.replace(/className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2/g, 'className="bg-transparent border-b border-brand-border/50 px-0 py-2 rounded-none');
  }

  if (code !== original) {
    fs.writeFileSync(path.join(LAYOUTS_DIR, file), code, 'utf8');
    console.log(`Updated ${file}`);
  }
}

console.log('UI Fixes completed.');
