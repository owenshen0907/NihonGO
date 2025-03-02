'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './studyNotes.module.css';

// 动态引入子页面组件
const RecommendNotes = dynamic(() => import('./recommend/page'));
const LatestNotes = dynamic(() => import('./latest/page'));
const CommonNotes = dynamic(() => import('./common/page'));

export default function StudyNotesPage() {
    // 默认选中“推荐”页面
    const [selectedTab, setSelectedTab] = useState<'recommend' | 'latest' | 'common'>('recommend');

    const renderContent = () => {
        switch (selectedTab) {
            case 'recommend':
                return <RecommendNotes />;
            case 'latest':
                return <LatestNotes />;
            case 'common':
                return <CommonNotes />;
            default:
                return null;
        }
    };

    return (
        <main className={styles.mainContainer}>
            {/* 顶部导航区域：标题和页面切换按钮在同一行 */}
            <div className={styles.headerRow}>
                <div className={styles.functionSelect}>
                    <span className={styles.navItem}>学习笔记</span>
                    <div className={styles.activeIndicator}></div>
                </div>
                <div className={styles.pageSwitcher}>
                    <button
                        className={`${styles.switchButton} ${selectedTab === 'recommend' ? styles.activeButton : ''}`}
                        onClick={() => setSelectedTab('recommend')}
                    >
                        推荐
                    </button>
                    <button
                        className={`${styles.switchButton} ${selectedTab === 'latest' ? styles.activeButton : ''}`}
                        onClick={() => setSelectedTab('latest')}
                    >
                        最新
                    </button>
                    <button
                        className={`${styles.switchButton} ${selectedTab === 'common' ? styles.activeButton : ''}`}
                        onClick={() => setSelectedTab('common')}
                    >
                        通用
                    </button>
                </div>
            </div>
            {/* 笔记内容区域 */}
            <div className={styles.contentArea}>{renderContent()}</div>
        </main>
    );
}