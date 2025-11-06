#!/usr/bin/env node
/**
 * UI Build Tool for Quark Platform
 */

import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

async function runUiBuild(rootDir: string) {
  const uiPath = resolve(rootDir, 'infra', 'quark-ui');
  
  if (!existsSync(uiPath)) {
    console.error(chalk.red('❌ Директория quark-ui не найдена'));
    process.exit(1);
  }
  
  const spinner = ora('Сборка Quark UI для продакшена...').start();
  
  try {
    // Установка зависимостей если они отсутствуют
    if (!existsSync(resolve(uiPath, 'node_modules'))) {
      spinner.text = 'Установка зависимостей...';
      await execa('pnpm', ['install'], { cwd: uiPath });
    }
    
    // Сборка проекта
    spinner.text = 'Сборка проекта...';
    await execa('pnpm', ['run', 'build'], { 
      cwd: uiPath,
      stdio: 'inherit'
    });
    
    spinner.succeed(chalk.green('✅ Сборка завершена в директории dist/'));
  } catch (error) {
    spinner.fail(chalk.red('❌ Ошибка сборки UI'));
    console.error(error);
    process.exit(1);
  }
}

const program = new Command();
program
  .description('Сборка Quark UI для продакшена')
  .option('-r, --root <path>', 'Корневая директория проекта', '.')
  .action(async (options) => {
    await runUiBuild(options.root);
  });

program.parse();