import React, { useState } from 'react';
import styles from './NoteArea.module.css';

export interface WordNote {
    word: string;
    meaning: string;
    alternatives?: string;
}

export interface GrammarNote {
    grammar: string;
    detail: string;
}

export interface NoteData {
    wordNotes: WordNote[];
    grammarNotes: GrammarNote[];
}

interface NoteAreaProps {
    noteData?: NoteData;
    pageId: string;
}

interface NoteCardProps {
    title: string;
    subtitle?: string;
    isGrammar?: boolean;
}

function NoteCard({ title, subtitle, isGrammar }: NoteCardProps) {
    const [selected, setSelected] = useState(true);

    const handleExpand = () => {
        alert('扩展功能待实现');
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardGrid}>
                <div
                    className={`${styles.selectionArea} ${selected ? styles.selected : ''}`}
                    onClick={() => setSelected((prev) => !prev)}
                ></div>
                <div className={styles.cardContent}>
                    <h5 className={isGrammar ? styles.grammarTitle : styles.cardTitle}>
                        {title}
                    </h5>
                    {subtitle && <p className={styles.cardSubtext}>{subtitle}</p>}
                </div>
                <div className={styles.expandArea} onClick={handleExpand}>
                    <button className={styles.expandButton}>扩展</button>
                </div>
            </div>
        </div>
    );
}

export default function NoteArea({ noteData, pageId }: NoteAreaProps) {
    return (
        <div className={styles.noteArea}>
            {/* 单词笔记部分：始终展示“可替换词”，空值时显示“无” */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4>单词笔记</h4>
                    <button className={styles.addNoteButton}>添加笔记</button>
                </div>
                {(noteData?.wordNotes?.length ?? 0) > 0 ? (
                    <div className={styles.cardsContainer}>
                        {noteData?.wordNotes.map((note, index) => (
                            <NoteCard
                                key={index}
                                title={`${note.word} (${note.meaning})`}
                                subtitle={`可替换词: ${note.alternatives?.trim() ? note.alternatives : "无"}`}
                            />
                        ))}
                    </div>
                ) : (
                    <p>暂无单词笔记</p>
                )}
            </div>

            {/* 语法笔记部分 */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4>语法笔记</h4>
                    <button className={styles.addNoteButton}>添加笔记</button>
                </div>
                {(noteData?.grammarNotes?.length ?? 0) > 0 ? (
                    <div className={styles.cardsContainer}>
                        {noteData?.grammarNotes.map((note, index) => (
                            <NoteCard
                                key={index}
                                title={`${note.grammar} (${note.detail})`}
                                isGrammar={true}
                            />
                        ))}
                    </div>
                ) : (
                    <p>暂无语法笔记</p>
                )}
            </div>
        </div>
    );
}