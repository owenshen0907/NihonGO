// api/notes/generate.ts
import { config } from 'dotenv';
config({ path: '.env.local' });
import { NextResponse } from 'next/server';
import { Client } from 'pg';
import configurations from '@/config';
import { processWordNotes } from '@/db/wordReportRepository';

interface RequestBody {
    content: string;
    configKey?: string;
    userName?: string;
}

export async function POST(req: Request) {
    let client;
    try {
        const { content, configKey, userName } = (await req.json()) as RequestBody;
        console.log('Received note generation request from user:', userName);

        if (!userName) {
            console.error('User name is missing');
            return new Response('请登录后重试', { status: 400 });
        }

        // 连接 PostgreSQL 数据库
        client = new Client({
            connectionString: process.env.DATABASE_URL,
        });
        await client.connect();
        console.log('已连接到 PostgreSQL 数据库。');

        // 调用外部 API 生成笔记
        const configItem = configurations[configKey || 'GENERATE_NOTE'];
        const payload = {
            model: configItem.model,
            stream: false,
            messages: [
                { role: 'system', content: configItem.systemMessage },
                { role: 'user', content: content },
            ],
        };

        const response = await fetch(configItem.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${configItem.apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return new Response('Error', { status: response.status });
        }

        const data = await response.json();
        // data.choices[0].message.content 是生成笔记后的 JSON 字符串
        const generatedContent = data.choices[0].message.content;
        const noteData = JSON.parse(generatedContent);

        // 针对 wordNotes 数组进行处理
        if (noteData.wordNotes && Array.isArray(noteData.wordNotes)) {
            const processedNotes = await processWordNotes(client, userName, noteData.wordNotes);
            // 将补全后的字段写回每个 wordNote 中
            for (let i = 0; i < noteData.wordNotes.length; i++) {
                noteData.wordNotes[i].id = processedNotes[i].id;
                noteData.wordNotes[i].listening = processedNotes[i].listening;
                noteData.wordNotes[i].speaking = processedNotes[i].speaking;
                noteData.wordNotes[i].writing = processedNotes[i].writing;
                noteData.wordNotes[i].reading = processedNotes[i].reading;
            }
        }

        // 此处仅处理 wordNotes，grammarNotes 部分后续实现类似逻辑
        return NextResponse.json(noteData);
    } catch (error) {
        console.error('API error:', error);
        return new Response('Internal Server Error', { status: 500 });
    } finally {
        if (client) {
            await client.end();
            console.log('已断开 PostgreSQL 连接。');
        }
    }
}