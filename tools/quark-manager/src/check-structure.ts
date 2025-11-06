#!/usr/bin/env node
/**
 * Проверка структуры проекта МКС Quark
 * Находит файлы в неправильных местах и предлагает исправления
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, extname, basename } from 'node:path';

interface StructureIssue {
  type: 'misplaced' | 'wrong-import' | 'missing-file';
  severity: 'critical' | 'warning' | 'info';
  file: string;
  message: string;
  suggestion?: string;
  autofix?: () => Promise<void>;
}

interface ProjectRules {
  rootFiles: {
    allowed: string[];
    prohibited: string[];
  };
  directories: {
    [key: string]: {
      purpose: string;
      allowedExtensions: string[];
      namingPattern?: RegExp;
    };
  };
  importRules: {
    allowAbsoluteImports: boolean;
    pathAliases: { [key: string]: string };
  };
}

/**
 * Правила структуры проекта
 */
const PROJECT_RULES: ProjectRules = {
  rootFiles: {
    allowed: [
      'package.json',
      'pnpm-workspace.yaml',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'docker-compose.yml',
      '.gitignore',
      '.dockerignore',
      '.npmrc',
      '.env.example',
      '.gitleaks.toml',
      '.eslintrc.json',
      'README.md',
      'quark-manager.sh',
      'init-databases.sql',
    ],
    prohibited: [
      '*.tsx',
      '*.ts',
      '*.jsx',
      '*.js',
      '*.vue',
      '*.component.*',
      '*_example.*',
      'test.*',
      '*.spec.*',
      '*.test.*',
    ],
  },
  directories: {
    'services/': {
      purpose: 'Микросервисы бизнес-логики',
      allowedExtensions: ['.ts', '.js', '.json'],
      namingPattern: /^[a-z]+(-[a-z]+)*-service$/,
    },
    'infra/': {
      purpose: 'Инфраструктурные сервисы и UI',
      allowedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss'],
    },
    'docs/': {
      purpose: 'Документация проекта',
      allowedExtensions: ['.md', '.yaml', '.yml', '.json', '.png', '.jpg', '.svg'],
    },
    'tools/': {
      purpose: 'Вспомогательные инструменты',
      allowedExtensions: ['.ts', '.js', '.json'],
    },
    'scripts/': {
      purpose: 'Bash скрипты',
      allowedExtensions: ['.sh', '.bash'],
    },
    '.github/': {
      purpose: 'GitHub workflows и конфигурация',
      allowedExtensions: ['.yml', '.yaml', '.md'],
    },
  },
  importRules: {
    allowAbsoluteImports: true,
    pathAliases: {
      '@/': 'src/',
      '@components/': 'src/components/',
      '@lib/': 'src/lib/',
      '@utils/': 'src/utils/',
    },
  },
};

/**
 * Сканирует директорию рекурсивно
 */
async function scanDirectory(
  dir: string,
  root: string,
  maxDepth: number = 5
): Promise<string[]> {
  if (maxDepth <= 0) return [];

  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    const relativePath = relative(root, fullPath);

    // Игнорируем
    if (
      entry.name.startsWith('.') ||
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === 'build' ||
      entry.name === '.next' ||
      entry.name === 'coverage'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await scanDirectory(fullPath, root, maxDepth - 1);
      files.push(...subFiles);
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Проверяет файлы в корне проекта
 */
function checkRootFiles(files: string[], root: string): StructureIssue[] {
  const issues: StructureIssue[] = [];
  const rootFiles = files.filter((f) => !f.includes('/'));

  for (const file of rootFiles) {
    const isAllowed = PROJECT_RULES.rootFiles.allowed.some((pattern) => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replaceAll('*', '.*') + '$');
        return regex.test(file);
      }
      return file === pattern;
    });

    const isProhibited = PROJECT_RULES.rootFiles.prohibited.some((pattern) => {
      const regex = new RegExp('^' + pattern.replaceAll('*', '.*') + '$');
      return regex.test(file);
    });

    if (!isAllowed || isProhibited) {
      const suggestion = suggestCorrectLocation(file, root);
      
      issues.push({
        type: 'misplaced',
        severity: isProhibited ? 'critical' : 'warning',
        file,
        message: `Файл не должен находиться в корне проекта`,
        suggestion,
      });
    }
  }

  return issues;
}

/**
 * Предлагает правильное расположение файла
 */
function suggestCorrectLocation(file: string, root: string): string {
  const ext = extname(file);
  const name = basename(file);

  // React компоненты / примеры
  if (ext === '.tsx' || ext === '.jsx') {
    if (name.toLowerCase().includes('example')) {
      return 'infra/quark-ui/docs/examples/';
    }
    if (name.toLowerCase().includes('dialog') || name.toLowerCase().includes('modal')) {
      return 'infra/quark-ui/src/components/ui/';
    }
    return 'infra/quark-ui/src/components/';
  }

  // TypeScript утилиты
  if (ext === '.ts' && !name.endsWith('.d.ts')) {
    if (name.includes('util') || name.includes('helper')) {
      return 'infra/quark-ui/src/lib/';
    }
    return 'tools/quark-manager/src/';
  }

  // Документация
  if (ext === '.md') {
    return 'docs/';
  }

  // Скрипты
  if (ext === '.sh' || ext === '.bash') {
    return 'scripts/';
  }

  return 'docs/other/';
}

/**
 * Проверяет импорты в TypeScript/JavaScript файлах
 */
async function checkImports(
  file: string,
  root: string
): Promise<StructureIssue[]> {
  const issues: StructureIssue[] = [];
  const fullPath = resolve(root, file);

  if (!['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))) {
    return issues;
  }

  try {
    const content = await readFile(fullPath, 'utf-8');
    const importLines = content.split('\n').filter((line) =>
      /^import\s+.*from\s+['"]/.test(line.trim())
    );

    const importRegex = /from\s+['"](.*)['"]/;
    
    for (const line of importLines) {
      const match = importRegex.exec(line);
      if (!match) continue;

      const importPath = match[1];

      // Проверяем неправильные абсолютные пути
      if (importPath.startsWith('./services/') || importPath.startsWith('../services/')) {
        const suggestion = convertToAlias(importPath);
        
        issues.push({
          type: 'wrong-import',
          severity: 'warning',
          file,
          message: `Импорт использует относительный путь вместо алиаса: ${importPath}`,
          suggestion: `Используйте алиас: ${suggestion}`,
        });
      }

      // Проверяем импорты из других сервисов (cross-service imports)
      if (file.includes('services/') && importPath.includes('/services/')) {
        const currentService = file.split('/services/')[1].split('/')[0];
        const importedService = importPath.includes('/services/')
          ? importPath.split('/services/')[1].split('/')[0]
          : null;

        if (importedService && currentService !== importedService) {
          issues.push({
            type: 'wrong-import',
            severity: 'critical',
            file,
            message: `Сервис ${currentService} импортирует из ${importedService}`,
            suggestion: 'Сервисы должны взаимодействовать через API, а не прямые импорты',
          });
        }
      }
    }
  } catch (error) {
    // Игнорируем ошибки чтения файлов (файл может быть удален или недоступен)
    if (error instanceof Error) {
      // Логируем только в verbose режиме
    }
  }

  return issues;
}

/**
 * Конвертирует путь в алиас
 */
function convertToAlias(importPath: string): string {
  if (importPath.includes('/src/components/')) {
    return importPath.replace(/.*\/src\/components\//, '@components/');
  }
  if (importPath.includes('/src/lib/')) {
    return importPath.replace(/.*\/src\/lib\//, '@lib/');
  }
  if (importPath.includes('/src/utils/')) {
    return importPath.replace(/.*\/src\/utils\//, '@utils/');
  }
  if (importPath.includes('/src/')) {
    return importPath.replace(/.*\/src\//, '@/');
  }
  return importPath;
}

/**
 * Отображает найденные проблемы
 */
function displayIssues(issues: StructureIssue[], verbose: boolean): void {
  if (issues.length === 0) {
    console.log(chalk.green.bold('\n✅ Структура проекта корректна!\n'));
    return;
  }

  const critical = issues.filter((i) => i.severity === 'critical');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const info = issues.filter((i) => i.severity === 'info');

  console.log(chalk.red.bold(`\n❌ Найдено проблем: ${issues.length}\n`));

  if (critical.length > 0) {
    console.log(chalk.red.bold('🔴 КРИТИЧНЫЕ ПРОБЛЕМЫ:\n'));
    for (const issue of critical) {
      console.log(chalk.red(`  📄 ${issue.file}`));
      console.log(chalk.red(`     ${issue.message}`));
      if (issue.suggestion) {
        console.log(chalk.yellow(`     💡 ${issue.suggestion}`));
      }
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold('⚠️  ПРЕДУПРЕЖДЕНИЯ:\n'));
    for (const issue of warnings) {
      console.log(chalk.yellow(`  📄 ${issue.file}`));
      console.log(chalk.yellow(`     ${issue.message}`));
      if (issue.suggestion) {
        console.log(chalk.cyan(`     💡 ${issue.suggestion}`));
      }
      console.log();
    }
  }

  if (verbose && info.length > 0) {
    console.log(chalk.blue.bold('ℹ️  ИНФОРМАЦИЯ:\n'));
    for (const issue of info) {
      console.log(chalk.blue(`  📄 ${issue.file}`));
      console.log(chalk.blue(`     ${issue.message}`));
      console.log();
    }
  }

  console.log(chalk.white.bold('📋 Рекомендации:'));
  console.log('  1. Переместите файлы в правильные директории');
  console.log('  2. Исправьте импорты (используйте алиасы @/)');
  console.log('  3. Избегайте cross-service импортов');
  console.log('  4. Запустите с --fix для автоматического исправления\n');
}

/**
 * Main CLI
 */
const program = new Command();

program
  .name('quark-check-structure')
  .description('Проверка структуры проекта МКС Quark')
  .version('1.0.0')
  .option('-r, --root <path>', 'Корневая директория проекта', process.cwd())
  .option('-v, --verbose', 'Подробный вывод')
  .option('-q, --quiet', 'Тихий режим (только ошибки)')
  .option('--fix', 'Автоматически исправить проблемы (TODO)')
  .option('--json', 'Вывести результат в JSON')
  .action(async (options: {
    root: string;
    verbose: boolean;
    quiet: boolean;
    fix: boolean;
    json: boolean;
  }) => {
    if (!options.quiet) {
      console.log(chalk.blue.bold('📁 Проверка структуры проекта МКС Quark\n'));
    }

    try {
      // 1. Сканирование проекта
      if (!options.quiet) {
        console.log(chalk.gray('Сканирование файлов...'));
      }
      const files = await scanDirectory(options.root, options.root);
      if (!options.quiet) {
        console.log(chalk.gray(`Найдено файлов: ${files.length}\n`));
      }

      // 2. Проверка структуры
      const allIssues: StructureIssue[] = [];

      // Проверка корневых файлов
      const rootIssues = checkRootFiles(files, options.root);
      allIssues.push(...rootIssues);

      // Проверка импортов
      for (const file of files.slice(0, 100)) {
        // Ограничиваем для скорости
        const importIssues = await checkImports(file, options.root);
        allIssues.push(...importIssues);
      }

      // 3. Отображение результатов
      if (options.json) {
        console.log(JSON.stringify(allIssues, null, 2));
      } else if (!options.quiet) {
        displayIssues(allIssues, options.verbose);
      }

      // 4. Exit code
      const critical = allIssues.filter((i) => i.severity === 'critical');
      if (critical.length > 0) {
        if (options.quiet) {
          console.error(chalk.red(`❌ Найдено критичных проблем: ${critical.length}`));
        }
        process.exit(1);
      } else if (allIssues.length > 0) {
        if (options.quiet) {
          console.error(chalk.yellow(`⚠️  Найдено предупреждений: ${allIssues.length}`));
        }
        process.exit(2);
      } else {
        if (options.quiet) {
          console.log(chalk.green('✅ OK'));
        }
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Ошибка проверки структуры:'));
      console.error(error);
      process.exit(3);
    }
  });

program.parse();
