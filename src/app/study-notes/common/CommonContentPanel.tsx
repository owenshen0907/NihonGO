// src/app/study-notes/common/CommonContentPanel.tsx
'use client';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './CommonContentPanel.module.css';
import { CommonNote } from '@/app/components/apiUtils';

interface ContentPanelProps {
    note: CommonNote | null;
    editable?: boolean;
    onSave?: (updatedNote: CommonNote) => void;
    onCancelEdit?: () => void;
}

export default function CommonContentPanel({ note, editable = false, onSave, onCancelEdit }: ContentPanelProps) {
    const [editContent, setEditContent] = useState(note ? note.content : '');

    // 当 note 变化时，更新编辑内容
    React.useEffect(() => {
        if (note) {
            setEditContent(note.content);
        }
    }, [note]);

    if (!note) return <div className={styles.content}>请选择一个笔记</div>;

    return (
        <div className={styles.content}>
            <h1>{note.title}</h1>
            {editable ? (
                <div className={styles.editArea}>
          <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.editTextArea}
          />
                    <div className={styles.editButtons}>
                        <button onClick={() => onSave && onSave({ ...note, content: editContent })}>保存</button>
                        <button onClick={() => onCancelEdit && onCancelEdit()}>取消</button>
                    </div>
                </div>
            ) : (
                <div className={styles.noteContent}>
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}