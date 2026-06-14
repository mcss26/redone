import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const AUDIT_DIR = path.join(process.cwd(), 'docs', 'visual_audit');
if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

const VIEWS = [
  'index', // AdminIndex
  'profiles',
  'suppliers',
  'sku',
  'master_vouchers',
  'bar_inventory',
  'staff_roles',
  'cost_templates',
  'fixed_cost_templates',
  'pos_terminals',
  'work_days',
  'opening_costs',
  'staff_plan',
  'stock_requests',
  'payments',
  'fixed_costs',
  'workday',
  'night_report',
  'auditoria_barra',
  'monthly_report',
  'annual_report',
  'r_pagos'
];

async function runAudit() {
  console.log('Starting Visual Audit...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  // Mock Supabase profiles check to prevent auto-logout
  await page.route('**/rest/v1/profiles?*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'dummy-id', active: true })
    });
  });

  // Supress other Supabase API errors so toasts don't overwhelm the UI (optional, we might want to see them if they exist)
  // Let's just mock all Supabase API to return empty arrays to avoid errors
  await page.route('**/rest/v1/*', async route => {
    if (route.request().url().includes('profiles')) {
        return; // Handled above
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');
  
  // Inject mock user
  await page.evaluate(() => {
    localStorage.setItem('mc_user', JSON.stringify({
      id: 'dummy-id',
      role: 'admin',
      full_name: 'Audit Bot',
      active: true
    }));
  });

  for (const view of VIEWS) {
    console.log(`Auditing view: ${view}`);
    
    // Set the active view and reload so the router picks it up
    await page.evaluate((v) => {
      localStorage.setItem('mc_active_view', v);
    }, view);
    
    await page.reload({ waitUntil: 'load' });
    
    // Wait an extra second for UI settling
    await page.waitForTimeout(1000);

    const filePath = path.join(AUDIT_DIR, `${view}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved screenshot: ${filePath}`);
  }

  await browser.close();
  console.log('Visual Audit completed.');
}

runAudit().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
