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

    // 从 sessionStorage 获取当前用户（示例）
    const userData = typeof window !== 'undefined'
        ? JSON.parse(sessionStorage.getItem('userData') || '{}')
        : {};
    const userId = userData.name || 'defaultUser';

    useEffect(() => {
        // 使用 POST 请求获取通用笔记（noteType 固定为 'common'）
        fetch('/api/notes/queryNotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, noteType: 'common' })
        })
            .then(res => res.json())
            .then((data: CommonNoteData) => {
                setNotes(data);
                if (data.notes.length > 0) {
                    setSelectedNote(data.notes[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch common notes error', err);
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <div>加载中...</div>;

    return (
        <div className={styles.container}>
            <CommonLeftPanel notes={notes} setSelectedNote={setSelectedNote} />
            <CommonContentPanel note={selectedNote} />
            <CommonRightPanel note={selectedNote} />
        </div>
    );
}