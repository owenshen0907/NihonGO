// src/app/components/NavBar.tsx
'use client'; // 需要在客户端渲染，比如点击跳转或使用交互

import Link from 'next/link';
import React from 'react';
import styles from './NavBar.module.css';

export default function NavBar() {
    return (
        <nav className={styles.navContainer}>
            <div className={styles.logo}>NihonGO</div>
            <ul className={styles.navMenu}>
                <li>
                    <Link href="/">首页</Link>
                </li>
                <li>
                    <Link href="/study-assistant">学习助手</Link>
                </li>
                <li>
                    <Link href="/listen-speak-read-write">听说写阅</Link>
                </li>
                <li>
                    <Link href="/study-notes">学习笔记</Link>
                </li>
                <li>
                    <Link href="/exam">考试</Link>
                </li>
            </ul>
        </nav>
    );
}