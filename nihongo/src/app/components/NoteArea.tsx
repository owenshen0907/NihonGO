import React from 'react';
import styles from './NoteArea.module.css';

export default function NoteArea() {
    return (
        <div className={styles.noteArea}>
            {/* 上方：单词笔记 */}
            <div className={styles.wordsNotes}>
                <h3>单词笔记</h3>
                <p>这里显示单词笔记内容...</p>
            </div>
            {/* 下方：语法笔记 */}
            <div className={styles.grammarNotes}>
                <h3>语法笔记</h3>
                <p>这里显示语法笔记内容...</p>
            </div>
        </div>
    );
}