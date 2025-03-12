// src/app/api/notes/operateCommonNotes/route.ts
import { NextResponse } from 'next/server';
import { Client } from 'pg';

interface RequestBody {
    operation: 'insert' | 'update' | 'delete';
    userId: string;
    update_type?: 'content' | 'tags' | 'comments';
    note?: {
        // 对于更新操作，若 update_type === 'content'，需要 note.id
        id?: string;
        title?: string;
        directory?: string;
        parent_directory: string;  // 必填
        summary?: string;
        content?: string; // Markdown 文本
        tags?: string;
        comments?: any; // JSONB 对象数组
        update_log?: string;
        is_public?: boolean;
    };
    noteId?: string; // 用于 delete 操作
}

export async function POST(request: Request) {
    try {
        const { operation, userId, note, noteId, update_type } = (await request.json()) as RequestBody;
        if (!userId) {
            return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
        }
        // 对于插入操作，note 必须存在且 parent_directory 必填
        if (operation === 'insert' && (!note || !note.parent_directory)) {
            return NextResponse.json({ error: '插入操作需要 parent_directory' }, { status: 400 });
        }
        // 对于更新操作，note 必须存在、包含 note.id 和 parent_directory
        if (operation === 'update' && (!note || !note.id || !note.parent_directory)) {
            return NextResponse.json({ error: '更新操作需要 note.id 和 parent_directory' }, { status: 400 });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });
        await client.connect();
        const safeUserId = userId.replace(/[^a-zA-Z0-9_]/g, '');

        if (operation === 'insert') {
            const query = `
                INSERT INTO notes
                (title, directory, parent_directory, summary, content, tags, comments, created_at, updated_at, update_log, user_id, is_public)
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8, $9, $10)
                    RETURNING *;
            `;
            const values = [
                note?.title || null,
                note?.directory || null,
                note!.parent_directory,
                note?.summary || null,
                note?.content || null,
                note?.tags || null,
                note?.comments ? JSON.stringify(note.comments) : '[]',
                note?.update_log || null,
                safeUserId,
                note?.is_public !== undefined ? note.is_public : false,
            ];
            const res = await client.query(query, values);
            await client.end();
            return NextResponse.json({ note: res.rows[0] });
        } else if (operation === 'update') {
            // 根据 update_type 区分更新类型
            const type = update_type || 'content';
            let query = '';
            let values: any[] = [];
            if (type === 'content') {
                // 更新标题、概述和详细内容
                query = `
          UPDATE notes
          SET title = $1,
              summary = $2,
              content = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4 AND user_id = $5
          RETURNING *;
        `;
                values = [note?.title || null, note?.summary || null, note?.content || null, note!.id, safeUserId];
            } else if (type === 'tags') {
                // 仅更新标签
                query = `
          UPDATE notes
          SET tags = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND user_id = $3
          RETURNING *;
        `;
                values = [note?.tags || null, note!.id, safeUserId];
            } else if (type === 'comments') {
                // 仅更新评论
                query = `
          UPDATE notes
          SET comments = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND user_id = $3
          RETURNING *;
        `;
                values = [note?.comments ? JSON.stringify(note.comments) : '[]', note!.id, safeUserId];
            } else {
                // 默认处理 content 更新
                query = `
          UPDATE notes
          SET title = $1,
              summary = $2,
              content = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4 AND user_id = $5
          RETURNING *;
        `;
                values = [note?.title || null, note?.summary || null, note?.content || null, note!.id, safeUserId];
            }
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