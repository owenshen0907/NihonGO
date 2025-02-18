'use client';
import React, { useState } from 'react';

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
                // 加入 configKey:"OPEN_AI"
                body: JSON.stringify({ content, configKey: "GENERATE_NOTE" }),
            });
            if (!res.ok) {
                throw new Error(`请求失败：${res.status}`);
            }
            const result = await res.json();
            //这里做json格式校验
            const rawJsonString = typeof result === 'string' ? result : result.answer;
            let parsedData;
            try {
                parsedData = JSON.parse(rawJsonString);
            } catch (err) {
                console.error('JSON parse error:', err);
                // 做一些容错处理
                return;
            }
            //这里传给父级页面，待笔记区接收
            onGenerated(parsedData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleGenerate} disabled={loading}>
                {loading ? '生成中...' : '生成笔记'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}