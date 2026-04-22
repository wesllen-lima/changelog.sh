import { defineConfig } from 'drizzle-kit'

const dbPath = process.env.DB_PATH ?? './data/changelog.db'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: dbPath.startsWith('file:') ? dbPath : `file:${dbPath}`,
  },
})
