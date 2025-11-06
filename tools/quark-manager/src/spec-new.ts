#!/usr/bin/env node
/**
 * Spec New Tool for Quark Platform
 */

import { Command } from 'commander';
import { resolve } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import chalk from 'chalk';

async function runSpecNew(rootDir: string, serviceName: string) {
  if (!serviceName) {
    console.error(chalk.red('❌ Требуется указать имя сервиса'));
    console.log(chalk.yellow('Пример: quark-manager spec:new messaging-service'));
    process.exit(1);
  }
  
  console.log(chalk.blue(`📐 Создание новой спецификации для ${serviceName}...`));
  
  // Создаем имя сервиса в формате slug
  const serviceSlug = serviceName.toLowerCase().replace(/\s+/g, '-');
  
  // Определяем директорию для спецификаций
  const specsDir = resolve(rootDir, '.specify', 'specs');
  
  // Находим следующий номер спецификации
  let nextNum = 1;
  if (existsSync(specsDir)) {
    const specDirs = await import('node:fs').then(fs => 
      fs.readdirSync(specsDir).filter(f => 
        fs.statSync(resolve(specsDir, f)).isDirectory()
      )
    );
    
    for (const dir of specDirs) {
      const match = dir.match(/^(\d+)-/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= nextNum) nextNum = num + 1;
      }
    }
  } else {
    mkdirSync(specsDir, { recursive: true });
  }
  
  const specDir = resolve(specsDir, `${nextNum.toString().padStart(3, '0')}-${serviceSlug}`);
  
  // Создаем структуру директорий
  mkdirSync(specDir, { recursive: true });
  mkdirSync(resolve(specDir, 'contracts'));
  
  // Создаем spec.md
  const specContent = `# ${serviceName} Specification

## Overview

This document describes the ${serviceName} service for the Quark platform.

## Service Details

- **Name**: ${serviceName}
- **Slug**: ${serviceSlug}
- **ID**: ${nextNum.toString().padStart(3, '0')}
- **Date**: ${new Date().toISOString().split('T')[0]}

## Functional Requirements

1. [ ] Requirement 1
2. [ ] Requirement 2
3. [ ] Requirement 3

## Non-functional Requirements

1. [ ] Performance requirements
2. [ ] Security requirements
3. [ ] Scalability requirements

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET    | /   | Placeholder |

## Data Models

### ExampleModel

\`\`\`json
{
  "id": "string",
  "name": "string"
}
\`\`\`

## Events

| Event | Description |
|-------|-------------|
| example.event | Triggered when ... |

## Dependencies

- [ ] auth-service
- [ ] plugin-hub
- [ ] Other services

## Implementation Plan

1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3
`;
  
  writeFileSync(resolve(specDir, 'spec.md'), specContent);
  
  // Создаем README.md
  const readmeContent = `# ${serviceName}

**Branch**: \`${nextNum.toString().padStart(3, '0')}-${serviceSlug}\` | **Date**: ${new Date().toISOString().split('T')[0]}

## 📁 Structure

- \`spec.md\` - Service specification (WHAT and WHY)
- \`plan.md\` - Technical implementation plan (HOW)
- \`contracts/\` - API contracts (OpenAPI, AsyncAPI, UDI manifest)

## 🔄 Workflow

1. Fill \`spec.md\` (requirements, user stories)
2. Generate \`plan.md\` (tech stack, architecture)
3. Create contracts in \`contracts/\`
4. Start implementation in \`services/${serviceSlug}/\`

## 📚 Documentation

- [Constitution](.specify/memory/constitution.md) - 9 architectural principles
- [Practical Guide](docs/spec-driven-practical-guide.md) - usage examples
- [Frontend Integration](docs/frontend-backend-integration.md) - UI integration
`;
  
  writeFileSync(resolve(specDir, 'README.md'), readmeContent);
  
  console.log(chalk.green(`✅ Создана спецификация: ${specDir}`));
  console.log(chalk.cyan('📝 Следующие шаги:'));
  console.log(chalk.cyan(`   1. Заполните ${resolve(specDir, 'spec.md')} (требования)`));
  console.log(chalk.cyan(`   2. Создайте контракты в ${resolve(specDir, 'contracts')}/`));
}

const program = new Command();
program
  .description('Создать новую спецификацию сервиса')
  .option('-r, --root <path>', 'Корневая директория проекта', '.')
  .action(async (options, command) => {
    const serviceName = command.args[0];
    await runSpecNew(options.root, serviceName);
  });

program.parse();