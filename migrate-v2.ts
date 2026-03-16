
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import sql from './db';

async function migrate() {
    try {
        console.log("Expanding schema...");
        
        await sql`CREATE TABLE IF NOT EXISTS rules (
            id TEXT PRIMARY KEY,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            label TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS discipline_records (
            user_uid TEXT NOT NULL REFERENCES users(uid),
            rule_id TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            completed BOOLEAN NOT NULL,
            PRIMARY KEY (user_uid, rule_id, date)
        )`;

        await sql`CREATE TABLE IF NOT EXISTS finance_goals (
            id TEXT PRIMARY KEY,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            title TEXT NOT NULL,
            target_amount NUMERIC NOT NULL,
            current_amount NUMERIC DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS social_posts (
            id TEXT PRIMARY KEY,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            metric TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS social_comments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        console.log("Schema expanded successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
