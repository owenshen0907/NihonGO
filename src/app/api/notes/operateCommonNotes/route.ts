// src/app/api/notes/operateCommonNotes/route.ts
import { NextResponse } from 'next/server';
import { Client } from 'pg';

interface RequestBody {
    operation: 'insert' | 'update' | 'delete';
    userId: string;
    note?: {
        // id 不再需要传入
        title: string;
        directory?: string;
        parent_directory?: string;
        summary?: string;
        content: string; // 存储 Markdown 格式文本
        tags?: string;
        comments?: any; // 传入对象数组，存为 JSONB
        update_log?: string;
        is_public?: boolean;
    };
    noteId?: string; // 用于 delete 操作
}

export async function POST(request: Request) {
    try {
        const { operation, userId, note, noteId } = (await request.json()) as RequestBody;
        if (!userId) {
            return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
        }
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });
        await client.connect();
        const safeUserId = userId.replace(/[^a-zA-Z0-9_]/g, '');

        if (operation === 'insert') {
            if (!note || !note.title || !note.content) {
                await client.end();
                return NextResponse.json({ error: '插入操作需要 title 和 content' }, { status: 400 });
            }
            const query = `
        INSERT INTO notes
          (title, directory, parent_directory, summary, content, tags, comments, created_at, updated_at, update_log, user_id, is_public)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8, $9, $10)
        RETURNING *;
      `;
            const values = [
                note.title,
                note.directory || null,
                note.parent_directory || null,
                note.summary || null,
                note.content,
                note.tags || null,
                note.comments ? JSON.stringify(note.comments) : '[]',
                note.update_log || null,
                safeUserId,
                note.is_public !== undefined ? note.is_public : false,
            ];
            const res = await client.query(query, values);
            await client.end();
            return NextResponse.json({ note: res.rows[0] });
        } else if (operation === 'update') {
            if (!note || !note.title || !note.content || !note.update_log || !('id' in note)) {
                await client.end();
                return NextResponse.json({ error: '更新操作需要 note.id、title 和 content' }, { status: 400 });
            }
            // 此处假设 note 对象中仍包含 id，用于更新操作
            const query = `
                UPDATE notes
                SET title = $1,
                    directory = $2,
                    parent_directory = $3,
                    summary = $4,
                    content = $5,
                    tags = $6,
                    comments = $7,
                    updated_at = CURRENT_TIMESTAMP,
                    update_log = $8,
                    is_public = $9
                WHERE id = $10 AND user_id = $11
                    RETURNING *;
            `;
            const values = [
                note.title,
                note.directory || null,
                note.parent_directory || null,
                note.summary || null,
                note.content,
                note.tags || null,
                note.comments ? JSON.stringify(note.comments) : '[]',
                note.update_log || null,
                note.is_public !== undefined ? note.is_public : false,
                (note as any).id, // 更新时需要 note.id
                safeUserId,
            ];
            const res = await client.query(query, values);
            await client.end();
            return NextResponse.json({ note: res.rows[0] });
        } else if (operation === 'delete') {
            if (!noteId) {
                await client.end();
                return NextResponse.json({ error: '删除操作需要 noteId' }, { status: 400 });
            }
            const query = `DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *;`;
            const values = [noteId, safeUserId];
            const res = await client.query(query, values);
            await client.end();
            // return NextResponse.json({ deleted: res.rowCount > 0 });
            return NextResponse.json({ deleted: (res.rowCount ?? 0) > 0 });
        } else {
            await client.end();
            return NextResponse.json({ error: '无效的操作' }, { status: 400 });
        }
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}