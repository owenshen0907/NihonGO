'use client';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import ChatArea from './chat/ChatArea';
import NoteArea, { NoteData } from '../components/NoteArea';
import GenerateNoteButton from '../components/GenerateNoteButton';

export default function StudyAssistantPage() {
    // 定义所有 hook
    const [hydrated, setHydrated] = useState(false);
    const [latestChat, setLatestChat] = useState<string>('');
    const [noteData, setNoteData] = useState<NoteData | undefined>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('noteData');
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) {
                    console.error('Error parsing cached noteData', e);
                }
            }
        }
        return undefined;
    });

    // 挂载后设置 hydrated 状态
    useEffect(() => {
        setHydrated(true);
    }, []);

    // 当 noteData 更新时，同步保存到 localStorage
    useEffect(() => {
        if (noteData) {
            localStorage.setItem('noteData', JSON.stringify(noteData));
        }
    }, [noteData]);

    // 条件渲染（所有 hook 均已调用）
    if (!hydrated) return null;

    return (
        <main className={styles.mainContainer}>
            <div className={styles.headerRow}>
                <div className={styles.functionSelect}>
                    <span className={styles.navItem}>学习助手</span>
                    <div className={styles.activeIndicator}></div>
                </div>
            </div>
            <div className={styles.bodyRow}>
                <div className={styles.chatColumn}>
                    <ChatArea onLatestChat={(text) => setLatestChat(text)} />
                    <div className={styles.floatingButton}>
                        <GenerateNoteButton
                            content={latestChat}
                            onGenerated={(data: any) => setNoteData(data)}
                        />
                    </div>
                </div>
                <div className={styles.notesColumn}>
                    <NoteArea pageId="study-assistant" noteData={noteData} />
                </div>
            </div>
        </main>
    );
}