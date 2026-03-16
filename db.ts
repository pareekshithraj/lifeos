import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

if (typeof process !== 'undefined') {
  dotenv.config({ path: '.env.local' });
}

// Helper to get Database URL across different environments (Vite/Node)
const getDatabaseUrl = () => {
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env?.DATABASE_URL) {
    // @ts-ignore
    return process.env.DATABASE_URL;
  }
  // @ts-ignore
  if (typeof DATABASE_URL !== 'undefined') {
    // @ts-ignore
    return DATABASE_URL;
  }
  return '';
};

const sql = neon(getDatabaseUrl());

export default sql;
