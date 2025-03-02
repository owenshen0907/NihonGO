'use client';
import React, { useState } from 'react';
import styles from './NoteArea.module.css';
import { WordNote, GrammarNote, NoteData, NoteItem, familiarityText } from '@/app/components/apiUtils';
import ExtensionButton from '@/app/components/ExtensionButton'; // 调整路径，根据你的目录结构

/** NoteCard 组件 */
interface NoteCardProps {
    note: NoteItem;
    isGrammar?: boolean;
    onUpdateExtension: (noteId: string, newExtension: any) => void;
}
function NoteCard({ note, isGrammar, onUpdateExtension }: NoteCardProps) {
    const [selected, setSelected] = useState(true);
    // 保留原有选择区域

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardGrid}>
                    {/* 左侧选择区域 */}
                    <div
                        className={`${styles.selectionArea} ${selected ? styles.selected : ''}`}
                        onClick={() => setSelected(!selected)}
                    ></div>
                    {/* 中间内容区域 */}
                    <div className={styles.cardContent}>
                        {isGrammar ? (
                            <>
                                <div className={styles.cardRow}>
                  <span className={styles.primaryText}>
                    {(note as GrammarNote).grammar_formula}
                  </span>
                                </div>
                                <div className={styles.cardRow}>
                  <span className={styles.secondaryText}>
                    {(note as GrammarNote).explanation}
                  </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.cardRow}>
                  <span className={styles.primaryText}>
                    {(note as WordNote).kanji}
                      {(note as WordNote).romaji ? ` (${(note as WordNote).romaji})` : ''}
                  </span>
                                </div>
                                <div className={styles.cardRow}>
                  <span className={styles.secondaryText}>
                    {(note as WordNote).translation}
                  </span>
                                </div>
                            </>
                        )}
                    </div>
                    {/* 右侧扩展按钮使用独立组件 */}
                    <div className={styles.expandArea}>
                        <ExtensionButton note={note} isGrammar={isGrammar} onUpdateExtension={onUpdateExtension} />
                    </div>
                </div>
            </div>
        </>
    );
}

interface NoteAreaProps {
    noteData?: NoteData;
    pageId: string;
}

export default function NoteArea({ noteData, pageId }: NoteAreaProps) {
    // 将 props.noteData 拷贝到本地 state，方便更新 extension 后写入 localStorage
    const [noteDataState, setNoteDataState] = useState<NoteData | undefined>(noteData);
    const [hydrated, setHydrated] = useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    let username = 'defaultUser';
    if (typeof window !== 'undefined') {
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            username = userData.name || 'defaultUser';
        }
    }

    React.useEffect(() => {
        if (noteDataState && hydrated) {
            localStorage.setItem(`notes_${username}`, JSON.stringify(noteDataState));
        }
    }, [noteDataState, hydrated, username]);

    // 回调函数：更新指定 note 的 extension 字段
    const handleUpdateExtension = (noteId: string, newExtension: any) => {
        if (!noteDataState) return;
        // 更新单词与语法各自的记录
        const updatedWordNotes = noteDataState.wordNotes.map((w) =>
            w.id === noteId ? { ...w, extension: newExtension } : w
        );
        const updatedGrammarNotes = noteDataState.grammarNotes.map((g) =>
            g.id === noteId ? { ...g, extension: newExtension } : g
        );
        setNoteDataState({
            wordNotes: updatedWordNotes,
            grammarNotes: updatedGrammarNotes,
        });
    };

    // dimension 和 study_status 参数未在这里使用，但保留
    const dimension = pageId === 'study-assistant' ? '阅' : 'default';
    const study_status = pageId === 'study-assistant' ? 1 : 0;

    if (!hydrated) return null;

    return (
        <div className={styles.noteArea}>
            {/* 单词笔记部分 */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h4>单词笔记</h4>
                    <button className={styles.addNoteButton} onClick={() => { /* 添加单词笔记逻辑 */ }}>
                        添加笔记
                    </button>
                </div>
                {(noteDataState?.wordNotes?.length ?? 0) > 0 ? (
                    <div className={styles.cardsContainer}>
                        {noteDataState?.wordNotes.map((note, index) => (
                            <NoteCard key={index} note={note} onUpdateExtension={handleUpdateExtension} />
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
                    <button className={styles.addNoteButton} onClick={() => { /* 添加语法笔记逻辑 */ }}>
                        添加笔记
                    </button>
                </div>
                {(noteDataState?.grammarNotes?.length ?? 0) > 0 ? (
                    <div className={styles.cardsContainer}>
                        {noteDataState?.grammarNotes.map((note, index) => (
                            <NoteCard key={index} note={note} isGrammar={true} onUpdateExtension={handleUpdateExtension} />
                        ))}
                    </div>
                ) : (
                    <p>暂无语法笔记</p>
                )}
            </div>
        </div>
    );
}