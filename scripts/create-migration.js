const fs = require('fs');
const path = require('path');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Please provide a migration name');
  console.error('Usage: npm run migration:create <migration-name>');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '').split('T').join('_');
const fileName = `${timestamp}_${migrationName}.ts`;
const migrationsDir = path.join(__dirname, '../migrations');
const filePath = path.join(migrationsDir, fileName);

const template = `import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add migration code here
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add rollback code here
}
`;

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

fs.writeFileSync(filePath, template);
console.log(`✓ Created migration: ${fileName}`);
