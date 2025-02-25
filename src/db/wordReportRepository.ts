import { Client } from 'pg';

// 定义单词笔记接口（仅用于本模块内部）
export interface WordNote {
    word: string;
    meaning: string;
    alternatives: string;
}

// 生成安全的用户名（只保留字母、数字和下划线），用于构造表名
function getSafeUserName(userName: string): string {
    return userName.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * 确保用户专属的报告表存在
 * 表名格式：word_${safeUserName}_report
 */
export async function ensureUserReportWordsTable(client: Client, userName: string): Promise<string> {
    const safeUserName = getSafeUserName(userName);
    const tableName = `word_${safeUserName}_report`;
    await client.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id VARCHAR(50) PRIMARY KEY,
      kana TEXT NOT NULL,
      kanji TEXT,
      romaji TEXT,
      pos TEXT,
      level INTEGER CHECK (level BETWEEN 1 AND 5),
      translation TEXT,
      listening INTEGER,
      speaking INTEGER,
      writing INTEGER,
      reading INTEGER
    );
  `);
    return tableName;
}

/**
 * 根据 note 中的 word 字段处理单词记录：
 * 1. 先在用户报告表中查找匹配（通过 kanji 字段）
 * 2. 如果找到直接返回该记录
 * 3. 如果未找到，则查询全局 words 表（通过 kanji 字段）
 *    - 如果在全局表中找到，则插入到用户报告表中（听、说、写、阅赋值 0）
 * 4. 如果全局表也未找到，则生成新的记录（ID 以 EXP 开头，其他未匹配字段采用默认值）
 */
export async function processWordNote(client: Client, userName: string, note: WordNote): Promise<any> {
    const tableName = await ensureUserReportWordsTable(client, userName);

    // ① 查询用户报告表中是否存在（匹配 kanji）
    let res = await client.query(`SELECT * FROM ${tableName} WHERE kanji = $1`, [note.word]);
    if (res.rows.length > 0) {
        return res.rows[0];
    }

    // ② 未找到则在全局 words 表中查询
    res = await client.query(`SELECT * FROM words WHERE kanji = $1`, [note.word]);
    if (res.rows.length > 0) {
        const wordRow = res.rows[0];
        // 插入到用户报告表中，额外的四个维度字段赋值 0
        await client.query(
            `
      INSERT INTO ${tableName} 
      (id, kana, kanji, romaji, pos, level, translation, listening, speaking, writing, reading)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, 0)
    `,
            [
                wordRow.id,
                wordRow.kana,
                wordRow.kanji,
                wordRow.romaji,
                wordRow.pos,
                wordRow.level,
                wordRow.translation,
            ]
        );
        return {
            ...wordRow,
            listening: 0,
            speaking: 0,
            writing: 0,
            reading: 0,
        };
    }

    // ③ 全局表也没有，生成新记录
    // 生成新 ID：使用 EXP 前缀+随机唯一字符串
    const newId =
        'EXP' +
        (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, '')
            : Math.random().toString(36).substring(2, 15));
    // 为满足表结构要求，这里设定 kana 使用 note.word（也可以根据实际情况调整），romaji、pos 为空，level 默认 1，translation 使用 note.meaning
    await client.query(
        `
      INSERT INTO ${tableName} 
      (id, kana, kanji, romaji, pos, level, translation, listening, speaking, writing, reading)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, 0)
    `,
        [newId, note.word, note.word, '', '', 1, note.meaning]
    );
    return {
        id: newId,
        kana: note.word,
        kanji: note.word,
        romaji: '',
        pos: '',
        level: 1,
        translation: note.meaning,
        listening: 0,
        speaking: 0,
        writing: 0,
        reading: 0,
    };
}

/**
 * 针对一组 wordNotes 进行处理，返回处理后的结果数组
 */
export async function processWordNotes(
    client: Client,
    userName: string,
    notes: WordNote[]
): Promise<any[]> {
    const results = [];
    for (const note of notes) {
        const processed = await processWordNote(client, userName, note);
        results.push(processed);
    }
    return results;
}