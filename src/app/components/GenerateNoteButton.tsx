// src/app/components/GenerateNoteButton.tsx
'use client';
import React, { useState } from 'react';
import styles from './GenerateNoteButton.module.css';

interface GenerateNoteButtonProps {
    content: string; // 当前对话或页面内容
    onGenerated: (data: any) => void; // 生成笔记后回调，返回笔记数据
}

export default function GenerateNoteButton({ content, onGenerated }: GenerateNoteButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!content.trim()) {
            setError('当前内容为空');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/notes/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 传入 configKey:"GENERATE_NOTE"
                body: JSON.stringify({ content, configKey: "GENERATE_NOTE" }),
            });
            if (!res.ok) {
                throw new Error(`请求失败：${res.status}`);
            }
            const result = await res.json();
            // JSON 格式校验
            const rawJsonString = typeof result === 'string' ? result : result.answer;
            let parsedData;
            try {
                parsedData = JSON.parse(rawJsonString);
            } catch (err) {
                console.error('JSON parse error:', err);
                return;
            }
            onGenerated(parsedData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`${styles.button} ${loading ? styles.loading : ''}`}
            >
                {loading && <span className={styles.spinner}></span>}
                {loading ? '生成中...' : '生成笔记'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}