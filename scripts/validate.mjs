#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePairs = [
  ['editors/vscode/themes/Asahi-color-theme.json', 'future/legacy-vscode-themes/Asahi-color-theme.json'],
  ['editors/vscode/themes/Karesansui-color-theme.json', 'future/legacy-vscode-themes/Karesansui-color-theme.json'],
  ['editors/vscode/themes/Tasogare-color-theme.json', 'future/legacy-vscode-themes/Tasogare-color-theme.json'],
  ['editors/vscode/themes/KokeDera-color-theme.json', 'future/legacy-vscode-themes/KokeDera-color-theme.json'],
  ['editors/vscode/themes/KuroSumi-color-theme.json', 'future/legacy-vscode-themes/KuroSumi-color-theme.json'],
  ['editors/vscode/themes/Kachiiro-color-theme.json', 'future/legacy-vscode-themes/Kachiiro-color-theme.json']
];

async function main() {
  const mismatches = [];

  for (const [generated, legacy] of filePairs) {
    const generatedPath = path.join(rootDir, generated);
    const legacyPath = path.join(rootDir, legacy);
    const generatedRaw = await readFile(generatedPath, 'utf8');
    const legacyRaw = await readFile(legacyPath, 'utf8');

    if (generatedRaw !== legacyRaw) {
      mismatches.push({ generated, legacy });
    }
  }

  if (mismatches.length > 0) {
    for (const entry of mismatches) {
      console.error(`Mismatch: ${entry.generated} != ${entry.legacy}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Validation passed: generated VS Code themes match legacy themes byte-for-byte.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
