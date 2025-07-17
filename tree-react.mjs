import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Для __dirname (ESM не поддерживает напрямую)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.next', '.vscode', 'build', 'dist', '.idea', '.cache'
]);
const EXCLUDE_FILES = new Set(['.DS_Store', 'Thumbs.db']);

const INCLUDE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.html', '.css', '.env'
]);
const INCLUDE_FILES = new Set([
  'package.json', 'README.md', '.gitignore', '.env'
]);

function isImportantFile(filename) {
  if (INCLUDE_FILES.has(filename)) return true;
  const ext = path.extname(filename).toLowerCase();
  return INCLUDE_EXTENSIONS.has(ext);
}

function tree(dirPath, indent = '', maxDepth = 3, curDepth = 0) {
  if (curDepth > maxDepth) return;

  let items;
  try {
    items = fs.readdirSync(dirPath).sort();
  } catch {
    return;
  }

  for (let i = 0; i < items.length; i++) {
    const entry = items[i];
    if (EXCLUDE_DIRS.has(entry) || EXCLUDE_FILES.has(entry) || entry.startsWith('.')) continue;
    const fullPath = path.join(dirPath, entry);
    const isLast = i === items.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    const nextIndent = indent + (isLast ? '    ' : '│   ');

    if (fs.statSync(fullPath).isDirectory()) {
      console.log(indent + chalk.blue.bold(prefix + entry + '/'));
      tree(fullPath, nextIndent, maxDepth, curDepth + 1);
    } else {
      if (isImportantFile(entry)) {
        let color;
        if (entry === 'package.json') {
          color = chalk.green.bold;
        } else if (entry.endsWith('.md')) {
          color = chalk.cyan;
        } else if (entry.endsWith('.json')) {
          color = chalk.yellow;
        } else {
          color = chalk.white;
        }
        console.log(indent + color(prefix + entry));
      }
    }
  }
}

// Использование: node tree-react.mjs [путь] [глубина]
const root = process.argv[2] || '.';
const depth = parseInt(process.argv[4], 10) || 3;

console.log(chalk.magenta.bold(root));
tree(root, '', depth);

