/** 单词笔记接口（与数据库表 word_${safeUserName}_report 对应） */
export interface WordNote {
    id: string;
    kana: string;
    kanji: string;
    romaji: string;
    pos: string;
    level: number;
    translation: string;
    listening: number;
    speaking: number;
    writing: number;
    reading: number;
    created_at: string;
    updated_at: string;
    update_explanation: string;
    extension?: any;
}

/** 语法笔记接口（与数据库表 grammar_${safeUserName}_report 对应） */
export interface GrammarNote {
    id: string;
    grammar_formula: string;
    grammar_category_01?: string;
    grammar_category_02?: string;
    explanation: string;
    lesson: number;
    level: number;
    embedding: string;
    listening: number;
    speaking: number;
    writing: number;
    reading: number;
    created_at: string;
    updated_at: string;
    update_explanation: string;
    extension?: any;
}

/** 综合笔记数据 */
export interface NoteData {
    wordNotes: WordNote[];
    grammarNotes: GrammarNote[];
}

/** 联合类型 */
export type NoteItem = WordNote | GrammarNote;

/** 根据熟悉度数值判断文本 */
export function familiarityText(value: number): string {
    if (value < 1) return '生疏';
    if (value >= 1 && value <= 3) return '模糊';
    if (value >= 4 && value <= 7) return '熟悉';
    return '精通';
}
/** 类型守卫：判断是否为语法笔记 */
export function isGrammarNote(item: NoteItem): item is GrammarNote {
    return 'grammar_formula' in item;
}

/** 以下为通用笔记（CommonNote）的类型定义，用于 GitBook 风格的笔记展示 */

/** 通用笔记接口：适用于存储用户自行编辑的综合学习笔记 */
export interface CommonNote {
    id: string;
    title: string;               // 笔记标题，必填
    directory?: string;          // 当前笔记所属目录（例如“语法”、“词汇”等）
    parent_directory?: string;   // 上级目录名称（支持多级目录）
    summary?: string;            // 概述说明
    content: string;             // 详细内容，假设存储 Markdown 文本
    tags?: string;               // 标签，多个标签以逗号分隔
    comments?: Array<{          // 评论反馈，每条评论包含作者、时间、内容等
        author: string;
        time: string;
        content: string;
    }>;
    created_at: string;
    updated_at: string;
    update_log?: string;
    user_id: string;
    is_public: boolean;
}

/** 通用笔记数据集合 */
export interface CommonNoteData {
    notes: CommonNote[];
}