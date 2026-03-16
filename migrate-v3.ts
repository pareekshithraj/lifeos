import sql from './db';

async function migrate() {
    try {
        console.log("Expanding schema (Phase 3)...");
        
        await sql`CREATE TABLE IF NOT EXISTS calendar_activities (
            id TEXT PRIMARY KEY,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            title TEXT NOT NULL,
            time TEXT NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS timetable_entries (
            id TEXT PRIMARY KEY,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            day TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            label TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        await sql`CREATE TABLE IF NOT EXISTS reflection_entries (
            id TEXT PRIMARY KEY,
            user_uid TEXT NOT NULL REFERENCES users(uid),
            content TEXT NOT NULL,
            audit TEXT,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`;

        console.log("Phase 3 Schema expanded successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
