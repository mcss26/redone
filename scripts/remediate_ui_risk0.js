import fs from 'fs';
import path from 'path';

const dirsToScan = [
  path.join(process.cwd(), 'src', 'layouts'),
  path.join(process.cwd(), 'src', 'components')
];

let filesModified = 0;

for (const dir of dirsToScan) {
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.jsx')) continue;
    
    const filePath = path.join(dir, file);
    let code = fs.readFileSync(filePath, 'utf8');
    const original = code;
    
    // Risk 0 replacements:
    code = code.replace(/bg-\[#0A0A0A\]/g, 'bg-brand-bg');
    code = code.replace(/bg-\[#111111\]/g, 'bg-brand-surface');
    code = code.replace(/text-brand-muted\/40/g, 'text-brand-muted/70');
    code = code.replace(/rounded-2xl/g, 'rounded-lg');
    code = code.replace(/rounded-xl/g, 'rounded-lg');
    
    if (code !== original) {
      fs.writeFileSync(filePath, code, 'utf8');
      console.log(`Updated ${file}`);
      filesModified++;
    }
  }
}

console.log(`Risk 0 UI Fixes completed. Modified ${filesModified} files.`);
