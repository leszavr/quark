#!/usr/bin/env node
/**
 * Проверка структуры проекта МКС Quark
 * Находит файлы в неправильных местах, проверяет именование, импорты
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readdir, stat, readFile } from 'node:fs/promises';
import { resolve, relative, extname, basename } from 'node:path';

interface ValidationIssue {
  type: 'error' | 'warning';
  file: string;
  rule: string;
  message: string;
  suggestion?: string;
}

interface ValidationResult {
  issues: ValidationIssue[];
  filesChecked: number;
  errors: number;
  warnings: number;
}

// Файлы которые разрешены в корне
const ALLOWED_IN_ROOT = new Set([
  // Конфигурация
  'package.json',
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'eslint.config.js',
  '.eslintrc.json',
  'postcss.config.js',
  'tailwind.config.js',
  '.npmrc',
  
  // Docker
  'docker-compose.yml',
  'docker-compose.dev.yml',
  '.dockerignore',
  'Dockerfile',
  
  // Git
  '.gitignore',
  '.gitattributes',
  '.gitleaks.toml',
  
  // Docs
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  
  // Scripts
  'quark-manager.sh',
  'init-databases.sql',
  
  // Environment
  '.env.example',
  '.env.template',
]);

// Расширения исходного кода
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue']);

// Паттерны для игнорирования
const IGNORE_PATTERNS = [
  /^\.git/,
  /^\.github$/,
  /^node_modules/,
  /^dist/,
  /^build/,
  /^\.next/,
  /^\.turbo/,
  /^logs?/,
  /^tmp/,
  /^coverage/,
  /^\.cache/,
];

/**
 * Проверяет должен ли путь быть проигнорирован
 */
function shouldIgnore(path: string): boolean {
  const parts = path.split('/').filter(Boolean);
  return IGNORE_PATTERNS.some(pattern => 
    parts.some(part => pattern.test(part))
  );
}

/**
 * Проверяет соответствие имени файла конвенции
 */
function validateFileName(filePath: string): ValidationIssue | null {
  const fileName = basename(filePath);
  const ext = extname(fileName);
  const nameWithoutExt = basename(fileName, ext);
  
  // React компоненты должны быть PascalCase
  if (['.tsx', '.jsx'].includes(ext)) {
    const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(nameWithoutExt);
    if (!isPascalCase && !fileName.startsWith('use') && fileName !== 'index.tsx') {
      return {
        type: 'warning',
        file: filePath,
        rule: 'naming-convention',
        message: 'React компоненты должны быть в PascalCase',
        suggestion: `Переименуйте в ${nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1)}${ext}`,
      };
    }
  }
  
  // Hooks должны начинаться с use
  if (fileName.startsWith('use') && !['.ts', '.tsx'].includes(ext)) {
    return {
      type: 'warning',
      file: filePath,
      rule: 'hook-naming',
      message: 'React hooks должны быть .ts или .tsx файлами',
    };
  }
  
  // Не должно быть snake_case для компонентов
  if (SOURCE_EXTENSIONS.has(ext) && nameWithoutExt.includes('_')) {
    return {
      type: 'warning',
      file: filePath,
      rule: 'naming-convention',
      message: 'Используйте kebab-case или PascalCase вместо snake_case',
      suggestion: nameWithoutExt.replaceAll('_', '-') + ext,
    };
  }
  
  return null;
}

/**
 * Проверяет импорты в файле
 */
async function validateImports(filePath: string): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const ext = extname(filePath);
  
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    return issues;
  }
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const absolutePathRegex = /import.*from\s+['"]\.\/(services|infra)\//;
    const deepRelativeRegex = /import.*from\s+['"](\.\.[/\\]){3,}/;
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const lineNum = index + 1;
      
      // Проверка на абсолютные пути через ./
      if (absolutePathRegex.test(line)) {
        issues.push({
          type: 'error',
          file: `${filePath}:${lineNum}`,
          rule: 'absolute-imports',
          message: 'Используйте алиасы (@/) вместо абсолютных путей через ./',
          suggestion: 'Замените ./services/... на @/...',
        });
      }
      
      // Проверка на глубокую вложенность
      if (deepRelativeRegex.test(line)) {
        issues.push({
          type: 'warning',
          file: `${filePath}:${lineNum}`,
          rule: 'deep-imports',
          message: 'Слишком глубокая вложенность в относительных импортах',
          suggestion: 'Используйте алиасы (@/) для упрощения путей',
        });
      }
      
      // Проверка порядка импортов
      if (line.startsWith('import') && !line.includes('type {')) {
        const isExternal = line.includes('from "') && !line.includes('from ".') && !line.includes('from "@');
        
        // Простая эвристика: external -> internal -> relative
        const prevLine = lines[index - 1];
        if (prevLine?.startsWith('import')) {
          const prevIsInternal = prevLine.includes('from "@');
          
          if (isExternal && (prevIsInternal || prevLine.includes('from ".'))) {
            issues.push({
              type: 'warning',
              file: `${filePath}:${lineNum}`,
              rule: 'import-order',
              message: 'Неправильный порядок импортов (external -> internal -> relative)',
            });
          }
        }
      }
    }
  } catch {
    // Игнорируем ошибки чтения файлов - файл может быть недоступен
  }
  
  return issues;
}

/**
 * Рекурсивно сканирует директорию
 */
async function scanDirectory(
  dir: string,
  rootPath: string,
  depth: number = 0
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  
  if (shouldIgnore(relative(rootPath, dir))) {
    return issues;
  }
  
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = resolve(dir, entry);
      const relativePath = relative(rootPath, fullPath);
      
      if (shouldIgnore(relativePath)) {
        continue;
      }
      
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        // Рекурсивно сканируем поддиректории
        const subIssues = await scanDirectory(fullPath, rootPath, depth + 1);
        issues.push(...subIssues);
      } else if (stats.isFile()) {
        const ext = extname(entry);
        
        // Проверка файлов в корне
        if (depth === 0 && !ALLOWED_IN_ROOT.has(entry)) {
          const isSourceFile = SOURCE_EXTENSIONS.has(ext);
          
          if (isSourceFile) {
            issues.push({
              type: 'error',
              file: relativePath,
              rule: 'root-files',
              message: 'Исходные файлы не должны быть в корне проекта',
              suggestion: entry.endsWith('.tsx') || entry.endsWith('.jsx')
                ? `Переместите в infra/quark-ui/docs/examples/${entry}`
                : `Переместите в соответствующий сервис`,
            });
          } else if (!['.md', '.txt', '.json', '.yml', '.yaml', '.toml', '.png', '.jpg', '.svg'].includes(ext)) {
            issues.push({
              type: 'warning',
              file: relativePath,
              rule: 'root-files',
              message: 'Неожиданный файл в корне проекта',
            });
          }
        }
        
        // Проверка именования
        const nameIssue = validateFileName(relativePath);
        if (nameIssue) {
          issues.push(nameIssue);
        }
        
        // Проверка импортов
        if (SOURCE_EXTENSIONS.has(ext)) {
          const importIssues = await validateImports(fullPath);
          issues.push(...importIssues);
        }
      }
    }
  } catch {
    // Игнорируем ошибки доступа к директориям
  }
  
  return issues;
}

/**
 * Проверяет наличие обязательных директорий
 */
async function validateStructure(rootPath: string): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  
  const requiredDirs = [
    'services',
    'infra',
    'tools',
    'docs',
    'scripts',
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = resolve(rootPath, dir);
    try {
      const stats = await stat(dirPath);
      if (!stats.isDirectory()) {
        issues.push({
          type: 'error',
          file: dir,
          rule: 'project-structure',
          message: `Обязательная директория отсутствует: ${dir}`,
        });
      }
    } catch {
      issues.push({
        type: 'error',
        file: dir,
        rule: 'project-structure',
        message: `Обязательная директория отсутствует: ${dir}`,
      });
    }
  }
  
  return issues;
}

/**
 * Группирует проблемы по правилам
 */
function groupByRule(issues: ValidationIssue[]): Map<string, ValidationIssue[]> {
  const grouped = new Map<string, ValidationIssue[]>();
  
  for (const issue of issues) {
    if (!grouped.has(issue.rule)) {
      grouped.set(issue.rule, []);
    }
    grouped.get(issue.rule)!.push(issue);
  }
  
  return grouped;
}

/**
 * Отображает результаты проверки
 */
function displayResults(result: ValidationResult): void {
  console.log();
  
  if (result.issues.length === 0) {
    console.log(chalk.green.bold('✅ Структура проекта валидна!\n'));
    console.log(chalk.gray(`Проверено файлов: ${result.filesChecked}`));
    return;
  }
  
  console.log(chalk.yellow.bold(`⚠️  Найдено проблем: ${result.issues.length}\n`));
  
  // Группируем по правилам
  const grouped = groupByRule(result.issues);
  
  for (const [rule, issues] of grouped) {
    const errors = issues.filter(i => i.type === 'error').length;
    const warnings = issues.filter(i => i.type === 'warning').length;
    
    console.log(chalk.white.bold(`\n📋 ${rule}`));
    console.log(chalk.gray(`   ${errors} errors, ${warnings} warnings\n`));
    
    for (const issue of issues.slice(0, 10)) {
      const icon = issue.type === 'error' ? chalk.red('❌') : chalk.yellow('⚠️ ');
      console.log(`${icon} ${chalk.cyan(issue.file)}`);
      console.log(`   ${issue.message}`);
      if (issue.suggestion) {
        console.log(chalk.gray(`   💡 ${issue.suggestion}`));
      }
      console.log();
    }
    
    if (issues.length > 10) {
      console.log(chalk.gray(`   ... и ещё ${issues.length - 10} проблем\n`));
    }
  }
  
  console.log(chalk.white.bold('\n📊 Итого:'));
  console.log(`   ${chalk.red('Ошибок:')} ${result.errors}`);
  console.log(`   ${chalk.yellow('Предупреждений:')} ${result.warnings}`);
  console.log(`   Проверено файлов: ${result.filesChecked}\n`);
  
  console.log(chalk.cyan.bold('💡 Рекомендации:'));
  console.log('   1. Прочитайте docs/project-structure.md для правил');
  console.log('   2. Используйте ./quark-manager.sh project:fix для автоматического исправления');
  console.log('   3. Настройте ESLint для проверки импортов\n');
}

/**
 * Main CLI
 */
const program = new Command();

program
  .name('quark-project-validate')
  .description('Валидация структуры проекта МКС Quark')
  .version('1.0.0')
  .option('-r, --root <path>', 'Корневая директория проекта', process.cwd())
  .option('-v, --verbose', 'Подробный вывод')
  .option('--json', 'Вывод в JSON формате')
  .option('--fix', 'Автоматическое исправление (TODO)')
  .action(async (options: {
    root: string;
    verbose: boolean;
    json: boolean;
    fix: boolean;
  }) => {
    if (!options.json) {
      console.log(chalk.blue.bold('🔍 Валидация структуры проекта МКС Quark\n'));
    }

    try {
      const spinner = options.json ? null : ora('Сканирование файлов...').start();
      
      // 1. Проверка базовой структуры
      const structureIssues = await validateStructure(options.root);
      
      // 2. Сканирование всех файлов
      const fileIssues = await scanDirectory(options.root, options.root);
      
      const allIssues = [...structureIssues, ...fileIssues];
      
      spinner?.stop();
      
      const result: ValidationResult = {
        issues: allIssues,
        filesChecked: fileIssues.length,
        errors: allIssues.filter(i => i.type === 'error').length,
        warnings: allIssues.filter(i => i.type === 'warning').length,
      };
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        displayResults(result);
      }
      
      // Exit codes
      if (result.errors > 0) {
        process.exit(1);
      } else if (result.warnings > 0) {
        process.exit(2);
      } else {
        process.exit(0);
      }
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Ошибка валидации:'));
      console.error(error);
      process.exit(3);
    }
  });

program.parse();
