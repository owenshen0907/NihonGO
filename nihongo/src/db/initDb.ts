import { config } from 'dotenv';
config({ path: '.env.local' }); // 如果你的环境变量在 .env.local 中
import pkg from 'pg';
const { Client } = pkg;

const initDb = async () => {
    if (process.env.DB_INIT !== 'true') {
        console.log("DB_INIT 参数未开启，跳过数据库初始化。");
        return;
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("已连接到 PostgreSQL 数据库。");

        // 先创建语法分类表（grammar_classification）
        await client.query(`
      CREATE TABLE IF NOT EXISTS grammar_classification (
        code VARCHAR(10) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT
      );
    `);
        // 插入默认语法分类（如果不存在）
        await client.query(`
            INSERT INTO grammar_classification (code, name, description) VALUES
                                                                             ('01', '时间表达', '例如：～たあとで、～てから、～とき'),
                                                                             ('02', '条件 & 假设', '例如：～たら、～ば、～なら'),
                                                                             ('03', '可能性 & 推测', '例如：～かもしれない、～そうだ'),
                                                                             ('04', '原因 & 结果', '例如：～から、～ので、～ために'),
                                                                             ('05', '强调 & 轻重语气', '例如：～んです、～わけだ'),
                                                                             ('06', '书面语 & 敬语', '例如：～でございます、～させていただく')
                ON CONFLICT (code) DO NOTHING;
        `);

        // 创建单词表（word）
        await client.query(`
      CREATE TABLE IF NOT EXISTS word (
        kana VARCHAR(50) PRIMARY KEY,            -- 假名（唯一标识）
        level VARCHAR(10) NOT NULL,                -- 所属等级（如 N5-N1）
        kanji VARCHAR(100),                        -- 日汉字写法
        pos VARCHAR(50) NOT NULL,                  -- 词性：名词、动词、い形容词、な形容词、副词、助词/疑问词、其它
        explanation TEXT,                          -- 解释说明
        learned BOOLEAN DEFAULT false,             -- 是否已学
        listening INTEGER DEFAULT 0 CHECK (listening BETWEEN 0 AND 9),  -- 听熟悉程度（0-9）
        reading INTEGER DEFAULT 0 CHECK (reading BETWEEN 0 AND 9),      -- 读熟悉程度（0-9）
        writing INTEGER DEFAULT 0 CHECK (writing BETWEEN 0 AND 9)       -- 写熟悉程度（0-9）
      );
    `);

        // 创建语法表（grammar）
        await client.query(`
      CREATE TABLE IF NOT EXISTS grammar (
        id VARCHAR(20) PRIMARY KEY,                -- ID，如 N5-01-001
        point TEXT NOT NULL,                       -- 语法点（例如：動ます形＋ましょう，動て形＋ください）
        classification_code VARCHAR(10) REFERENCES grammar_classification(code), -- 语法分类编码
        level VARCHAR(10) NOT NULL,                -- 所属等级（N5-N1）
        explanation TEXT,                          -- 解释说明
        example TEXT,                              -- 经典例句
        learned BOOLEAN DEFAULT false,             -- 是否已学
        listening INTEGER DEFAULT 0 CHECK (listening BETWEEN 0 AND 9),  -- 听熟悉程度
        reading INTEGER DEFAULT 0 CHECK (reading BETWEEN 0 AND 9),      -- 读熟悉程度
        writing INTEGER DEFAULT 0 CHECK (writing BETWEEN 0 AND 9)       -- 写熟悉程度
      );
    `);

        console.log("数据库表创建或验证成功。");
    } catch (error) {
        console.error("数据库初始化出错：", error);
    } finally {
        await client.end();
        console.log("已断开 PostgreSQL 连接。");
    }
};

initDb();