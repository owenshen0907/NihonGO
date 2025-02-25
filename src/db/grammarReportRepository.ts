import { Client } from 'pg';

export interface GrammarNote {
    grammar: string;
    detail: string;
}

// 辅助方法：仅保留字母、数字和下划线，用于构造安全的表名
function getSafeUserName(userName: string): string {
    return userName.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * 确保用户专属的语法报告表存在
 * 表名格式：grammar_${safeUserName}_report
 */
export async function ensureUserReportGrammarTable(client: Client, userName: string): Promise<string> {
    const safeUserName = getSafeUserName(userName);
    const tableName = `grammar_${safeUserName}_report`;
    await client.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id VARCHAR(50) PRIMARY KEY,
      grammar_formula TEXT NOT NULL,
      grammar_category_01 TEXT,
      grammar_category_02 TEXT,
      explanation TEXT,
      lesson INT NOT NULL,
      level INTEGER CHECK (level BETWEEN 1 AND 5),
      listening INTEGER,
      speaking INTEGER,
      writing INTEGER,
      reading INTEGER
    );
  `);
    console.log(`${tableName} 创建成功。`);
    return tableName;
}

/**
 * 处理单个语法记录的逻辑：
 * 1. 先在用户专属语法报告表中查询（匹配 grammar_formula 字段，与 note.grammar 对比）
 * 2. 如果存在则直接返回该记录
 * 3. 如果不存在，则先到全局 grammar 表中查询
 *    - 如果全局表中找到，则将该记录插入用户专属表（听、说、写、阅字段均设为 0）
 * 4. 如果全局表也未找到，则生成一条新记录：
 *    - 新记录的 ID 以 EXP 开头+随机唯一字符串
 *    - grammar_formula 用 note.grammar，explanation 用 note.detail，其他字段采用默认值，维度字段设为 0
 */
export async function processGrammarNote(client: Client, userName: string, note: GrammarNote): Promise<any> {
    const tableName = await ensureUserReportGrammarTable(client, userName);

    // ① 先在用户专属语法报告表中查询是否已存在该语法（匹配 grammar_formula 字段）
    let res = await client.query(`SELECT * FROM ${tableName} WHERE grammar_formula = $1`, [note.grammar]);
    if (res.rows.length > 0) {
        return res.rows[0];
    }

    // ② 未找到则到全局 grammar 表中查询（匹配 grammar_formula 字段）
    res = await client.query(`SELECT * FROM grammar WHERE grammar_formula = $1`, [note.grammar]);
    if (res.rows.length > 0) {
        const grammarRow = res.rows[0];
        await client.query(
            `
      INSERT INTO ${tableName}
      (id, grammar_formula, grammar_category_01, grammar_category_02, explanation, lesson, level, listening, speaking, writing, reading)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, 0)
      `,
            [
                grammarRow.id,
                grammarRow.grammar_formula,
                grammarRow.grammar_category_01,
                grammarRow.grammar_category_02,
                grammarRow.explanation,
                grammarRow.lesson,
                grammarRow.level,
            ]
        );
        return {
            ...grammarRow,
            listening: 0,
            speaking: 0,
            writing: 0,
            reading: 0,
        };
    }

    // ③ 全局表中也没有匹配，则生成新记录
    const newId =
        'EXP' +
        (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, '')
            : Math.random().toString(36).substring(2, 15));
    await client.query(
        `
      INSERT INTO ${tableName}
      (id, grammar_formula, grammar_category_01, grammar_category_02, explanation, lesson, level, listening, speaking, writing, reading)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, 0)
    `,
        [newId, note.grammar, '', '', note.detail, 1, 1]
    );
    return {
        id: newId,
        grammar_formula: note.grammar,
        grammar_category_01: '',
        grammar_category_02: '',
        explanation: note.detail,
        lesson: 1,
        level: 1,
        listening: 0,
        speaking: 0,
        writing: 0,
        reading: 0,
    };
}

/**
 * 处理一组语法记录，返回处理后的结果数组
 */
export async function processGrammarNotes(
    client: Client,
    userName: string,
    notes: GrammarNote[]
): Promise<any[]> {
    const results = [];
    for (const note of notes) {
        const processed = await processGrammarNote(client, userName, note);
        results.push(processed);
    }
    return results;
}