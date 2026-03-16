import sql from './db';

async function migrate() {
    try {
        console.log("Expanding schema (Phase 4)...");
        
        await sql`CREATE TABLE IF NOT EXISTS social_reactions (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            type TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, user_uid)
        )`;

        await sql`CREATE TABLE IF NOT EXISTS social_comments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS focus_sessions (
            id TEXT PRIMARY KEY,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            duration_ms INTEGER NOT NULL,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS user_states (
            user_uid TEXT PRIMARY KEY REFERENCES users(uid),
            equanimity INTEGER DEFAULT 70,
            wisdom INTEGER DEFAULT 85,
            courage INTEGER DEFAULT 62,
            justice INTEGER DEFAULT 75,
            temperance INTEGER DEFAULT 90,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        console.log("Phase 4 Schema expanded successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
