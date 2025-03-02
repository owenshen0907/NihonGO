import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    const safeUserName = userId.replace(/[^a-zA-Z0-9_]/g, '');
    const wordTable = `word_${safeUserName}_report`;
    const grammarTable = `grammar_${safeUserName}_report`;

    let wordNotes = [];
    try {
        const res1 = await client.query(`SELECT * FROM ${wordTable}`);
        wordNotes = res1.rows;
    } catch (e) {
        wordNotes = [];
    }

    let grammarNotes = [];
    try {
        const res2 = await client.query(`SELECT * FROM ${grammarTable}`);
        grammarNotes = res2.rows;
    } catch (e) {
        grammarNotes = [];
    }

    await client.end();
    return NextResponse.json({ wordNotes, grammarNotes });
}