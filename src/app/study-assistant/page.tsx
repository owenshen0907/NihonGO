'use client';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import ChatArea from './chat/ChatArea';
import NoteArea, { NoteData } from '../components/NoteArea';
import GenerateNoteButton from '../components/GenerateNoteButton';

export default function StudyAssistantPage() {
    // 初始化时尝试从 localStorage 读取缓存
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
    const [hydrated, setHydrated] = useState(false);
    const [latestChat, setLatestChat] = useState<string>('');

    // 组件挂载后设置 hydrated 状态
    useEffect(() => {
        setHydrated(true);
    }, []);

    // 当 noteData 更新时，将数据保存到 localStorage，并打印日志确认更新
    useEffect(() => {
        console.log('noteData updated: ', noteData);
        if (noteData) {
            localStorage.setItem('noteData', JSON.stringify(noteData));
        }
    }, [noteData]);

    // 未挂载前不渲染
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
                            onGenerated={(data: any) => {
                                console.log('Generated note data: ', data);
                                setNoteData(data);
                            }}
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