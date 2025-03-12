'use client';
import React, { useState, useEffect } from 'react';
import styles from './common.module.css';
import CommonLeftPanel from './CommonLeftPanel';
import CommonContentPanel from './CommonContentPanel';
import CommonRightPanel from './CommonRightPanel';
import { CommonNoteData, CommonNote } from '@/app/components/apiUtils';

export default function CommonNotesPage() {
    const [notes, setNotes] = useState<CommonNoteData>({ notes: [] });
    const [selectedNote, setSelectedNote] = useState<CommonNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // 从 sessionStorage 获取当前用户（示例）
    const userData =
        typeof window !== 'undefined'
            ? JSON.parse(sessionStorage.getItem('userData') || '{}')
            : {};
    const userId = userData.name || 'defaultUser';

    useEffect(() => {
        // 使用 POST 请求获取通用笔记（noteType 固定为 'common'）
        fetch('/api/notes/queryNotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, noteType: 'common' }),
        })
            .then((res) => res.json())
            .then((data: CommonNoteData) => {
                setNotes(data);
                if (data.notes.length > 0) {
                    setSelectedNote(data.notes[0]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Fetch common notes error', err);
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <div>加载中...</div>;

    // 当保存编辑后调用更新接口
    const handleUpdateNote = (updatedNote: CommonNote) => {
        fetch('/api/notes/operateCommonNotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operation: 'update',
                userId,
                update_type: 'content',
                note: updatedNote,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.note) {
                    setSelectedNote(data.note);
                    // 此处可以根据需要刷新整个 notes 数据
                } else {
                    console.error('更新失败', data);
                }
                setIsEditing(false);
            })
            .catch((err) => {
                console.error('更新接口调用出错', err);
                setIsEditing(false);
            });
    };

    return (
        <div className={styles.container}>
            <CommonLeftPanel
                notes={notes}
                setSelectedNote={(note) => {
                    setSelectedNote(note);
                    setIsEditing(false);
                }}
                onEdit={() => setIsEditing(true)}
            />
            <CommonContentPanel
                note={selectedNote}
                editable={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={handleUpdateNote}
                onCancelEdit={() => setIsEditing(false)}
            />
            <CommonRightPanel note={selectedNote} />
        </div>
    );
}