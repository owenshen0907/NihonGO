import React from 'react';
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

export default function NoteArea({ noteData, pageId }: NoteAreaProps) {
    return (
        <div className={styles.noteArea}>
            <h3>{pageId} 页面笔记</h3>
            <div className={styles.wordsNotes}>
                <h4>单词笔记</h4>
                {(noteData?.wordNotes?.length ?? 0) > 0 ? (
                    noteData!.wordNotes.map((note, index) => (
                        <div key={index} className={styles.noteItem}>
                            <p>
                                <strong>{note.word}</strong>：{note.meaning}
                            </p>
                            {note.alternatives && <small>可替换词：{note.alternatives}</small>}
                        </div>
                    ))
                ) : (
                    <p>暂无单词笔记</p>
                )}
            </div>
            <div className={styles.grammarNotes}>
                <h4>语法笔记</h4>
                {(noteData?.grammarNotes?.length ?? 0) > 0 ? (
                    noteData!.grammarNotes.map((note, index) => (
                        <div key={index} className={styles.noteItem}>
                            <p>
                                <strong>{note.grammar}</strong>：{note.detail}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>暂无语法笔记</p>
                )}
            </div>
        </div>
    );
}