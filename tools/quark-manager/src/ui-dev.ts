#!/usr/bin/env node
/**
 * UI Dev Mode Runner for Quark Platform
 */

import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

async function runUiDev(rootDir: string) {
  const uiPath = resolve(rootDir, 'infra', 'quark-ui');
  
  if (!existsSync(uiPath)) {
    console.error(chalk.red('❌ Директория quark-ui не найдена'));
    process.exit(1);
  }
  
  const spinner = ora('Запуск Quark UI в режиме разработки...').start();
  
  try {
    // Установка зависимостей если они отсутствуют
    if (!existsSync(resolve(uiPath, 'node_modules'))) {
      spinner.text = 'Установка зависимостей...';
      await execa('pnpm', ['install'], { cwd: uiPath });
    }
    
    spinner.succeed(chalk.green('🚀 Запуск dev сервера на http://localhost:3101'));
    
    // Запуск dev сервера
    await execa('pnpm', ['run', 'dev'], { 
      cwd: uiPath,
      stdio: 'inherit'
    });
  } catch (error) {
    spinner.fail(chalk.red('❌ Ошибка запуска UI в режиме разработки'));
    console.error(error);
    process.exit(1);
  }
}

const program = new Command();
program
  .description('Запуск Quark UI в режиме разработки')
  .option('-r, --root <path>', 'Корневая директория проекта', '.')
  .action(async (options) => {
    await runUiDev(options.root);
  });

program.parse();