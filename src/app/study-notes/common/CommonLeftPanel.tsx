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
    // activeMenu 用于记录当前点击的目录名称，菜单仅显示在对应目录项内部
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // 如果有数据，则按 note.directory（若无则用 note.title）取唯一值；否则只显示固定项 "目录"
    let uniqueDirs: string[] = [];
    if (notes.notes.length > 0) {
        uniqueDirs = Array.from(
            new Set(notes.notes.map(note => (note.directory?.trim() || note.title.trim())))
        );
    } else {
        uniqueDirs = ['目录'];
    }

    // 点击目录名称时，选择第一个匹配该目录的笔记（如果有数据时）
    const handleSelectDirectory = (dir: string) => {
        const note = notes.notes.find(n => (n.directory?.trim() || n.title.trim()) === dir);
        if (note) {
            setSelectedNote(note);
        } else {
            // 如果没有数据，则可选固定目录不做处理
            setSelectedNote({ id: 'default', title: '目录', content: '', created_at: '', updated_at: '', user_id: '', is_public: false });
        }
    };

    // 点击右侧小图标时，记录当前目录，阻止事件冒泡
    const handleMenuClick = (dir: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveMenu(dir);
    };

    // 点击菜单中的“新增”
    const handleNewNote = (dir: string) => {
        setModalDirectory(dir);
        setShowModal(true);
        setActiveMenu(null);
    };

    // 点击菜单中的“编辑”
    const handleEdit = () => {
        onEdit(null); // 此处示例传 null，父组件据此进入编辑状态
        setActiveMenu(null);
    };

    return (
        <div className={styles.leftPanel}>
            <h3>目录</h3>
            <ul>
                {uniqueDirs.map((dir, idx) => (
                    <li key={idx} className={styles.directoryItem}>
                        <span onClick={() => handleSelectDirectory(dir)}>{dir}</span>
                        <span className={styles.icon} onClick={(e) => handleMenuClick(dir, e)}>
              &#x270E;
            </span>
                        {activeMenu === dir && (
                            <div className={styles.optionMenu}>
                                {dir !== '目录' && (
                                    <div className={styles.menuItem} onClick={handleEdit}>
                                        编辑
                                    </div>
                                )}
                                <div className={styles.menuItem} onClick={() => handleNewNote(dir)}>
                                    新增
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            {showModal && (
                <CommonNoteModal
                    initialDirectory={modalDirectory}
                    onClose={() => setShowModal(false)}
                    onSubmit={(newNoteData) => {
                        console.log('保存笔记:', newNoteData);
                        setShowModal(false);
                        // 此处调用接口后刷新数据
                    }}
                />
            )}
        </div>
    );
}