'use client';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './CommonContentPanel.module.css';
import { CommonNote } from '@/app/components/apiUtils';

interface ContentPanelProps {
    note: CommonNote | null;
    editable?: boolean;
    onEdit?: () => void;
    onSave?: (updatedNote: CommonNote) => void;
    onCancelEdit?: () => void;
}

export default function CommonContentPanel({
                                               note,
                                               editable = false,
                                               onEdit,
                                               onSave,
                                               onCancelEdit,
                                           }: ContentPanelProps) {
    const [editTitle, setEditTitle] = useState(note ? note.title : '');
    const [editSummary, setEditSummary] = useState(note ? note.summary || '' : '');
    const [editContent, setEditContent] = useState(note ? note.content : '');

    // 当 note 变化时，更新编辑数据
    useEffect(() => {
        if (note) {
            setEditTitle(note.title);
            setEditSummary(note.summary || '');
            setEditContent(note.content);
        }
    }, [note]);

    if (!note) return <div className={styles.content}>请选择一个笔记</div>;

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                {editable ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={styles.titleInput}
                        placeholder="请输入标题"
                    />
                ) : (
                    <h1 className={styles.title}>{note.title}</h1>
                )}
                {!editable && onEdit && (
                    <button className={styles.editButton} onClick={onEdit}>
                        编辑
                    </button>
                )}
            </div>
            {editable ? (
                <div className={styles.editArea}>
          <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className={styles.summaryInput}
              placeholder="请输入概述"
          />
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={styles.contentTextArea}
                        placeholder="请输入详细内容（Markdown 格式）"
                    />
                    <div className={styles.editButtons}>
                        <button className={styles.saveButton} onClick={() => onSave && onSave({ ...note, title: editTitle, summary: editSummary, content: editContent })}>
                            保存
                        </button>
                        <button className={styles.cancelButton} onClick={() => onCancelEdit && onCancelEdit()}>
                            取消
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {note.summary && <div className={styles.summary}>{note.summary}</div>}
                    <div className={styles.noteContent}>
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                </>
            )}
            <div className={styles.footer}>
                创建时间：{new Date(note.created_at).toLocaleString()}
            </div>
        </div>
    );
}