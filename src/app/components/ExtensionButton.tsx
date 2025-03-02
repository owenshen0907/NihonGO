'use client';
import React, { useState } from 'react';
import styles from './ExtensionButton.module.css';
import ExtensionDisplay from './ExtensionDisplay';
import { WordNote, GrammarNote, NoteItem } from '@/app/components/apiUtils';

interface ExtensionButtonProps {
    note: NoteItem;
    isGrammar?: boolean;
    onUpdateExtension: (noteId: string, newExtension: any) => void;
}

const ExtensionButton: React.FC<ExtensionButtonProps> = ({ note, isGrammar, onUpdateExtension }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [extensionContent, setExtensionContent] = useState(note.extension);

    const handleExpand = async () => {
        // 判断 extension 是否为空（falsy 或空对象）
        let isEmpty = !extensionContent || (typeof extensionContent === 'object' && Object.keys(extensionContent).length === 0);
        if (isEmpty) {
            try {
                const storedUserData = sessionStorage.getItem('userData');
                if (!storedUserData) {
                    alert('用户未登录');
                    return;
                }
                const userData = JSON.parse(storedUserData);
                const userName = userData.name;
                const noteType = isGrammar ? 'grammar' : 'word';
                // 如果是单词，则拼接 kanji/kana，例如 "勉強/べんきょう"
                const content = noteType === 'word'
                    ? `${(note as WordNote).kanji}/${(note as WordNote).kana}`
                    : (note as GrammarNote).grammar_formula;
                const payload = {
                    content,
                    noteType,
                    userName,
                    id: note.id,
                };
                console.log("ExtensionButton 调用生成扩展接口，payload:", JSON.stringify(payload, null, 2));
                const res = await fetch('/api/notes/generateExtension', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                console.log("ExtensionButton 生成扩展接口返回状态:", res.status);
                if (!res.ok) {
                    alert('生成扩展内容失败');
                    return;
                }
                const rawText = await res.text();
                console.log("ExtensionButton 原始响应文本:", rawText);
                const data = JSON.parse(rawText);
                console.log("ExtensionButton 解析后的扩展数据:", data);
                const generatedContent = data.choices[0].message.content;
                const newExtension = JSON.parse(generatedContent);
                console.log("ExtensionButton 最终扩展内容:", newExtension);
                setExtensionContent(newExtension);
                onUpdateExtension(note.id, newExtension);
            } catch (error) {
                console.error("ExtensionButton 生成扩展内容错误", error);
            }
        }
        setModalOpen(true);
    };

    return (
        <>
            <button className={styles.expandButton} onClick={handleExpand}>扩展</button>
            {modalOpen && (
                <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setModalOpen(false)}>关闭</button>
                        <ExtensionDisplay data={extensionContent} />
                    </div>
                </div>
            )}
        </>
    );
};

export default ExtensionButton;