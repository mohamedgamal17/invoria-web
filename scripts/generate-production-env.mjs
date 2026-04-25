import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, '..');

const apiUrl = process.env.API_URL?.trim();

if (!apiUrl) {
  console.error('Missing required environment variable: API_URL');
  console.error('Example: API_URL=https://api.example.com npm run build');
  process.exit(1);
}

const environmentFilePath = resolve(
  workspaceRoot,
  'src/environments/environment.production.ts',
);

mkdirSync(dirname(environmentFilePath), { recursive: true });

const environmentFileContent = `export const environment = {
  apiUrl: ${JSON.stringify(apiUrl)},
};
`;

writeFileSync(environmentFilePath, environmentFileContent, 'utf8');

console.log(`Generated production environment file: ${environmentFilePath}`);
