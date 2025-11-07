#!/usr/bin/env node
/**
 * UI Start Tool for Quark Platform
 */
import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
async function runUiStart(rootDir) {
    const uiPath = resolve(rootDir, 'infra', 'quark-ui');
    if (!existsSync(uiPath)) {
        console.error(chalk.red('❌ Директория quark-ui не найдена'));
        process.exit(1);
    }
    const spinner = ora('Запуск Quark UI...').start();
    try {
        // Установка зависимостей если они отсутствуют
        if (!existsSync(resolve(uiPath, 'node_modules'))) {
            spinner.text = 'Установка зависимостей...';
            await execa('pnpm', ['install'], { cwd: uiPath });
        }
        // Запуск проекта
        spinner.text = 'Запуск сервера...';
        await execa('pnpm', ['start'], {
            cwd: uiPath,
            stdio: 'inherit'
        });
        spinner.succeed(chalk.green('✅ UI запущен на http://localhost:3101'));
    }
    catch (error) {
        spinner.fail(chalk.red('❌ Ошибка запуска UI'));
        console.error(error);
        process.exit(1);
    }
}
const program = new Command();
program
    .description('Запуск Quark UI через Docker')
    .option('-r, --root <path>', 'Корневая директория проекта', '.')
    .action(async (options) => {
    await runUiStart(options.root);
});
program.parse();
//# sourceMappingURL=ui-start.js.map