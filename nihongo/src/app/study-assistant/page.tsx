'use client';
import React, { useState } from 'react';
import styles from './page.module.css';
import ChatArea from './chat/ChatArea';
import NoteArea, { NoteData } from '../components/NoteArea';
import GenerateNoteButton from '../components/GenerateNoteButton';

export default function StudyAssistantPage() {
    // 保存最新一次对话内容（例如机器人回复的内容）
    const [latestChat, setLatestChat] = useState<string>('');
    // 保存生成的笔记数据
    const [noteData, setNoteData] = useState<NoteData | undefined>(undefined);

    return (
        <main className={styles.mainContainer}>
            {/* 顶部：功能选取 */}
            <div className={styles.headerRow}>
                <div className={styles.functionSelect}>
                    <span className={styles.navItem}>学习助手</span>
                    <div className={styles.activeIndicator}></div>
                </div>
            </div>

            {/* 下方区域：对话区与笔记区并列 */}
            <div className={styles.bodyRow}>
                <div className={styles.chatColumn}>
                    {/* ChatArea 传入 onLatestChat 回调，用于获取最新对话文本 */}
                    <ChatArea onLatestChat={(text) => setLatestChat(text)} />
                    {/* 生成笔记按钮，传入当前最新对话文本，点击后将生成的笔记数据通过 onGenerated 回调更新 state */}
                    <GenerateNoteButton content={latestChat} onGenerated={(data) => setNoteData(data)} />
                </div>
                <div className={styles.notesColumn}>
                    {/* NoteArea 接收 noteData 并展示笔记内容 */}
                    <NoteArea pageId="study-assistant" noteData={noteData} />
                </div>
            </div>
        </main>
    );
}