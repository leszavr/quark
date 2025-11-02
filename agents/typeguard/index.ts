#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { execSync } from 'child_process';
import fetch from 'npm-registry-fetch';

// --- CLI args ---
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fix = args.includes('--fix') || !dryRun;
const verbose = args.includes('--verbose');
const aiAssist = args.includes('--ai-assist');

// --- Helpers ---
function log(msg: string) {
  if (verbose) console.log(msg);
}
function info(msg: string) {
  console.log(`[TypeGuard] ${msg}`);
}
function backupFile(file: string) {
  fs.copyFileSync(file, `${file}.bak`);
}
function restoreFile(file: string) {
  fs.copyFileSync(`${file}.bak`, file);
  fs.unlinkSync(`${file}.bak`);
}
function getPackageManager(): string {
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}
function runTypeCheck(): boolean {
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}
function getPackageJson(): any {
  return JSON.parse(fs.readFileSync('package.json', 'utf8'));
}
function savePackageJson(pkg: any) {
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}
function isNodeProject(pkg: any): boolean {
  if (pkg.type === 'module') return false;
  // Check for node:* imports
  const project = new Project();
  project.addSourceFilesAtPaths('src/**/*.{ts,tsx,js,jsx}');
  return project.getSourceFiles().some((sf: import('ts-morph').SourceFile) => sf.getImportDeclarations().some((id: import('ts-morph').ImportDeclaration) => id.getModuleSpecifierValue().startsWith('node:')));
}

// --- Main logic ---
(async () => {
  const pkg = getPackageJson();
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const typeDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(d => d.startsWith('@types/'));
  const toRemove: string[] = [];
  const skipped: string[] = [];
  const usedTypes: Record<string, number> = {};

  // Node project safety
  const nodeSafe = isNodeProject(pkg);

  for (const typeDep of typeDeps) {
    if (typeDep === '@types/node' && nodeSafe) {
      info('Skipped: @types/node (Node project detected)');
      continue;
    }
    const jsPkg = typeDep.replace(/^@types\//, '');
    if (!deps[jsPkg]) {
      toRemove.push(typeDep);
      info(`Candidate: ${typeDep} (no matching JS package)`);
      continue;
    }
    // Check if JS package has types
    try {
      const meta: any = await fetch.json(`/${jsPkg}`);
      if (meta.types || meta.typings) {
        toRemove.push(typeDep);
        info(`Candidate: ${typeDep} (built-in types)`);
        continue;
      }
    } catch (e) {
      log(`Could not fetch meta for ${jsPkg}: ${e}`);
    }
    // AST analysis
    const project = new Project();
    project.addSourceFilesAtPaths('src/**/*.{ts,tsx,js,jsx}');
    let used = 0;
    for (const sf of project.getSourceFiles()) {
      if (sf.getText().includes(typeDep)) used++;
    }
    if (used === 0) {
      toRemove.push(typeDep);
      info(`Candidate: ${typeDep} (not imported)`);
    } else {
      skipped.push(typeDep);
      usedTypes[typeDep] = used;
      info(`Skipped: ${typeDep} (used in ${used} files)`);
    }
  }

  if (dryRun) {
    info(`Dry run: would remove ${toRemove.length} dependencies.`);
    toRemove.forEach(dep => info(`Would remove: ${dep}`));
    process.exit(0);
  }

  // Backup
  backupFile('package.json');
  let error = false;
  try {
    // Remove from package.json
    for (const dep of toRemove) {
      if (pkg.dependencies && pkg.dependencies[dep]) delete pkg.dependencies[dep];
      if (pkg.devDependencies && pkg.devDependencies[dep]) delete pkg.devDependencies[dep];
      info(`Removed: ${dep}`);
    }
    savePackageJson(pkg);
    // Install
    const pm = getPackageManager();
    execSync(`${pm} install`, { stdio: 'inherit' });
    // Type check
    if (!runTypeCheck()) {
      error = true;
      info('Type errors detected after cleaning. Restoring package.json...');
      restoreFile('package.json');
      execSync(`${pm} install`, { stdio: 'inherit' });
    }
  } catch (e) {
    error = true;
    info(`Error: ${e}`);
    restoreFile('package.json');
  }

  // Output
  toRemove.forEach(dep => info(`Removed: ${dep}`));
  skipped.forEach(dep => info(`Skipped: ${dep} (used in ${usedTypes[dep]} files)`));
  if (!error) info(`OK — ${toRemove.length} dependency cleaned, 0 errors.`);
  else info(`ERROR — ${toRemove.length} attempted, restore complete.`);
})();
