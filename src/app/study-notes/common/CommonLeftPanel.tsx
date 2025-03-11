// src/app/study-notes/common/CommonLeftPanel.tsx
'use client';
import React, { useState } from 'react';
import styles from './CommonLeftPanel.module.css';
import { CommonNoteData, CommonNote } from '@/app/components/apiUtils';
import CommonNoteModal from './CommonNoteModal';

interface LeftPanelProps {
    notes: CommonNoteData;
    setSelectedNote: (note: CommonNote) => void;
    onEdit: (note: CommonNote | null) => void; // 当选择编辑时调用
}

export default function CommonLeftPanel({ notes, setSelectedNote, onEdit }: LeftPanelProps) {
    const [showModal, setShowModal] = useState(false);
    const [modalDirectory, setModalDirectory] = useState('');
    const [showMenuFor, setShowMenuFor] = useState<string | null>(null); // 用于记录点击的是哪个目录项，若为空则目录为空时使用

    // 根据目录展示，如果没有数据，则用默认项
    const directoryItems: CommonNote[] =
        notes.notes.length > 0 ? notes.notes : [{ id: 'default', title: '目录', content: '', created_at: '', updated_at: '', user_id: '', is_public: false }];

    const handleMenuClick = (directory: string) => {
        setShowMenuFor(directory);
    };

    const handleNewNote = (directory: string) => {
        setModalDirectory(directory);
        setShowModal(true);
        setShowMenuFor(null);
    };

    const handleEdit = (note: CommonNote | null) => {
        // 调用父组件回调通知编辑
        onEdit(note);
        setShowMenuFor(null);
    };

    return (
        <div className={styles.leftPanel}>
            <h3>目录</h3>
            <ul>
                {directoryItems.map((note: CommonNote) => (
                    <li key={note.id} className={styles.directoryItem}>
            <span onClick={() => setSelectedNote(note)}>
              {note.title}
            </span>
                        <span className={styles.icon} onClick={() => handleMenuClick(note.directory || note.title)}>
              &#x270E;
            </span>
                    </li>
                ))}
                {/* 如果没有笔记数据，也显示一个空目录项 */}
                {notes.notes.length === 0 && (
                    <li className={styles.directoryItem}>
                        <span>目录</span>
                        <span className={styles.icon} onClick={() => handleMenuClick('')}>
              &#x270E;
            </span>
                    </li>
                )}
            </ul>
            {showMenuFor !== null && (
                <div className={styles.optionMenu}>
                    <div className={styles.menuItem} onClick={() => handleEdit(null)}>编辑</div>
                    <div className={styles.menuItem} onClick={() => handleNewNote(showMenuFor)}>新增</div>
                </div>
            )}
            {showModal && (
                <CommonNoteModal
                    initialDirectory={modalDirectory}
                    onClose={() => setShowModal(false)}
                    onSubmit={(newNoteData) => {
                        console.log('保存笔记:', newNoteData);
                        setShowModal(false);
                        // 这里你可以调用接口后刷新数据
                    }}
                />
            )}
        </div>
    );
}