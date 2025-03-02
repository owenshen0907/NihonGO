// ./src/app/api/notes/addNote/route.ts
import { NextResponse } from 'next/server';
import { Client } from 'pg';
import {
    insertWordStudyLog,
    updateUserWordReport,
    insertGrammarStudyLog,
    updateUserGrammarReport,
} from '@/db/noteOperations';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, type, note, dimension, study_status } = body;

        if (!userId || !type || !note || !dimension || study_status === undefined) {
            return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });
        await client.connect();

        if (type === 'word') {
            // 插入单词学习日志记录，使用传入的 dimension 和 study_status
            await insertWordStudyLog(client, userId, note.id, dimension, study_status);
            // 更新用户单词报告表，根据 dimension 更新对应列，加上 study_status 的值
            await updateUserWordReport(client, userId, note.id, dimension, study_status);
            await client.end();
            return NextResponse.json({ message: '单词笔记处理成功' });
        } else if (type === 'grammar') {
            // 插入语法学习日志记录
            await insertGrammarStudyLog(client, userId, note.id, dimension, study_status);
            // 更新用户语法报告表
            await updateUserGrammarReport(client, userId, note.id, dimension, study_status);
            await client.end();
            return NextResponse.json({ message: '语法笔记处理成功' });
        } else {
            await client.end();
            return NextResponse.json({ error: '无效的笔记类型' }, { status: 400 });
        }
    } catch (error) {
        console.error('处理笔记时出错:', error);
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
    }
}