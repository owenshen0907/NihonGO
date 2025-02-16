import React from 'react';
import styles from './page.module.css';
import ChatArea from './chat/ChatArea';
import NoteArea from '../components/NoteArea';

export default function StudyAssistantPage() {
    return (
        <main className={styles.mainContainer}>
            {/* 左侧区域：功能选取 + 对话区 */}
            <section className={styles.leftSection}>
                {/* 功能选取：仅显示 "学习助手"，带圆角和下方蓝色指示条 */}
                <div className={styles.functionSelect}>
                    <span className={styles.navItem}>学习助手</span>
                    <div className={styles.activeIndicator}></div>
                </div>

                {/* 对话区组件 */}
                <ChatArea />
            </section>

            {/* 右侧区域：笔记区组件 */}
            <aside className={styles.notesArea}>
                <NoteArea />
            </aside>
        </main>
    );
}