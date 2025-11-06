#!/usr/bin/env node
/**
 * Проверка на наличие секретов в коде
 * Использует gitleaks для сканирования репозитория
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

interface LeakResult {
  file: string;
  line: number;
  rule: string;
  match: string;
  secret: string;
}

/**
 * Проверяет установлен ли gitleaks
 */
async function checkGitleaksInstalled(): Promise<boolean> {
  try {
    await execa('gitleaks', ['version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Устанавливает gitleaks (Linux only)
 */
async function installGitleaks(): Promise<void> {
  const spinner = ora('Установка gitleaks...').start();
  
  try {
    // Скачиваем и устанавливаем gitleaks
    await execa('bash', [
      '-c',
      'curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz | sudo tar -xz -C /usr/local/bin gitleaks'
    ]);
    
    spinner.succeed(chalk.green('Gitleaks установлен'));
  } catch (error) {
    spinner.fail(chalk.red('Ошибка установки gitleaks'));
    throw error;
  }
}

/**
 * Запускает gitleaks сканирование
 */
async function runGitleaksScan(projectRoot: string, verbose: boolean): Promise<LeakResult[]> {
  const spinner = ora('Сканирование репозитория на секреты...').start();

  try {
    const args = [
      'detect',
      '--source', projectRoot,
      '--report-format', 'json',
      '--no-git',
    ];

    if (verbose) {
      args.push('--verbose');
    }

    const { stdout } = await execa('gitleaks', args, {
      cwd: projectRoot,
      reject: false, // Не бросать ошибку если найдены секреты
    });

    spinner.stop();

    if (!stdout) {
      return [];
    }

    const results: LeakResult[] = JSON.parse(stdout);
    return results;

  } catch (error) {
    spinner.fail(chalk.red('Ошибка сканирования'));
    
    // Если gitleaks вернул exit code != 0 это значит найдены секреты
    if (error instanceof Error && 'stdout' in error) {
      const stdout = (error as any).stdout;
      if (stdout) {
        try {
          const results: LeakResult[] = JSON.parse(stdout);
          return results;
        } catch {
          // Не удалось распарсить, возвращаем пустой массив
        }
      }
    }
    
    throw error;
  }
}

/**
 * Группирует результаты по файлам
 */
function groupByFile(results: LeakResult[]): Map<string, LeakResult[]> {
  const grouped = new Map<string, LeakResult[]>();
  
  for (const result of results) {
    if (!grouped.has(result.file)) {
      grouped.set(result.file, []);
    }
    grouped.get(result.file)!.push(result);
  }
  
  return grouped;
}

/**
 * Отображает найденные секреты
 */
function displayResults(results: LeakResult[], projectRoot: string): void {
  if (results.length === 0) {
    console.log(chalk.green.bold('\n✅ Секреты в коде не найдены!\n'));
    return;
  }

  console.log(chalk.red.bold('\n❌ НАЙДЕНЫ СЕКРЕТЫ В КОДЕ!\n'));
  console.log(chalk.yellow(`⚠️  Обнаружено проблем: ${results.length}\n`));

  const grouped = groupByFile(results);

  for (const [file, leaks] of grouped) {
    const relativePath = file.replace(projectRoot, '').replace(/^\//, '');
    console.log(chalk.red.bold(`📄 ${relativePath}`));
    
    for (const leak of leaks) {
      console.log(chalk.gray(`   Строка ${leak.line}:`));
      console.log(chalk.red(`     Правило: ${leak.rule}`));
      console.log(chalk.yellow(`     Найдено: ${leak.match.slice(0, 50)}...`));
      console.log();
    }
  }

  console.log(chalk.yellow.bold('💡 Рекомендации:'));
  console.log('   1. Переместите секреты в .env файлы');
  console.log('   2. Используйте HashiCorp Vault: pnpm quark:vault-init');
  console.log('   3. Добавьте файлы с секретами в .gitignore');
  console.log('   4. Удалите секреты из истории Git: git filter-branch или BFG Repo-Cleaner\n');
}

/**
 * Проверяет наличие .env файла
 */
function checkEnvFile(projectRoot: string): boolean {
  const envPaths = [
    resolve(projectRoot, '.env'),
    resolve(projectRoot, '.env.local'),
    resolve(projectRoot, '.env.development'),
  ];

  return envPaths.some(path => existsSync(path));
}

/**
 * Проверяет наличие .env.example
 */
function checkEnvExample(projectRoot: string): boolean {
  return existsSync(resolve(projectRoot, '.env.example'));
}

/**
 * Отображает статус конфигурации
 */
function displayConfigStatus(projectRoot: string): void {
  console.log(chalk.blue.bold('📋 Статус конфигурации:\n'));

  const hasEnv = checkEnvFile(projectRoot);
  const hasExample = checkEnvExample(projectRoot);

  if (hasEnv) {
    console.log(chalk.green('   ✓ .env файл найден'));
  } else {
    console.log(chalk.red('   ✗ .env файл отсутствует'));
    console.log(chalk.yellow('     💡 Создайте из .env.example или используйте vault-init'));
  }

  if (hasExample) {
    console.log(chalk.green('   ✓ .env.example присутствует'));
  } else {
    console.log(chalk.yellow('   ⚠ .env.example отсутствует'));
  }

  console.log();
}

/**
 * Main CLI
 */
const program = new Command();

program
  .name('quark-security-check')
  .description('Проверка безопасности: поиск секретов в коде, проверка .env файлов')
  .version('1.0.0')
  .option('-r, --root <path>', 'Корневая директория проекта', process.cwd())
  .option('-v, --verbose', 'Подробный вывод')
  .option('--install-gitleaks', 'Установить gitleaks если отсутствует')
  .option('--skip-scan', 'Пропустить сканирование (только проверка .env)')
  .action(async (options: {
    root: string;
    verbose: boolean;
    installGitleaks: boolean;
    skipScan: boolean;
  }) => {
    console.log(chalk.blue.bold('🔒 Проверка безопасности МКС Quark\n'));

    try {
      // 1. Проверка статуса конфигурации
      displayConfigStatus(options.root);

      if (options.skipScan) {
        console.log(chalk.yellow('⏭️  Сканирование пропущено (--skip-scan)\n'));
        process.exit(0);
      }

      // 2. Проверка gitleaks
      const hasGitleaks = await checkGitleaksInstalled();
      
      if (!hasGitleaks) {
        console.log(chalk.yellow('⚠️  Gitleaks не установлен'));
        
        if (options.installGitleaks) {
          await installGitleaks();
        } else {
          console.log(chalk.cyan('💡 Установите gitleaks:'));
          console.log('   curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz | sudo tar -xz -C /usr/local/bin gitleaks');
          console.log(chalk.cyan('   Или запустите с флагом: --install-gitleaks\n'));
          process.exit(1);
        }
      }

      // 3. Сканирование на секреты
      const results = await runGitleaksScan(options.root, options.verbose);

      // 4. Отображение результатов
      displayResults(results, options.root);

      // Exit code
      if (results.length > 0) {
        process.exit(1); // Найдены секреты
      } else {
        process.exit(0); // Всё чисто
      }

    } catch (error) {
      console.error(chalk.red.bold('\n❌ Ошибка проверки безопасности:'));
      console.error(error);
      process.exit(2);
    }
  });

program.parse();
