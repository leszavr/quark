#!/usr/bin/env node
/**
 * UI Open Tool for Quark Platform
 */
import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { platform } from 'node:os';
async function runUiOpen() {
    const spinner = ora('Открытие Quark UI в браузере...').start();
    const url = 'http://localhost:3101';
    try {
        const os = platform();
        let command;
        let args = [];
        switch (os) {
            case 'darwin':
                command = 'open';
                args = [url];
                break;
            case 'win32':
                command = 'start';
                args = [url];
                break;
            default:
                command = 'xdg-open';
                args = [url];
        }
        await execa(command, args);
        spinner.succeed(chalk.green(`✅ Открыт Quark UI в браузере: ${url}`));
    }
    catch (error) {
        spinner.fail(chalk.red('❌ Ошибка открытия браузера'));
        console.error(chalk.yellow(`Откройте вручную: ${url}`));
        process.exit(1);
    }
}
const program = new Command();
program
    .description('Открыть Quark UI в браузере')
    .action(async () => {
    await runUiOpen();
});
program.parse();
//# sourceMappingURL=ui-open.js.map