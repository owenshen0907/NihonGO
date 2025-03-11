'use client';
import React, { useState } from 'react';
import styles from './CommonNoteModal.module.css';
import { CommonNote } from '@/app/components/apiUtils';

interface CommonNoteModalProps {
    initialDirectory: string;
    onClose: () => void;
    onSubmit: (noteData: Omit<CommonNote, 'id' | 'created_at' | 'updated_at'>) => void;
}

const CommonNoteModal: React.FC<CommonNoteModalProps> = ({ initialDirectory, onClose, onSubmit }) => {
    const [directory, setDirectory] = useState(initialDirectory);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            // 仅支持 Markdown 文件
            if (selectedFile.type !== 'text/markdown' && !selectedFile.name.endsWith('.md')) {
                alert('请上传 Markdown 文件 (.md)');
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setContent(reader.result);
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和详细内容为必填');
            return;
        }
        onSubmit({
            title: title.trim(),
            directory: directory.trim(),
            summary: summary.trim(),
            tags: tags.trim(),
            content,
            comments: [],
            update_log: '',
            user_id: '', // 此处可由后端设置或从 session 获取
            is_public: false,
        });
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>新增笔记</h2>
                <div className={styles.formGroup}>
                    <label>目录</label>
                    <input
                        type="text"
                        value={directory}
                        onChange={(e) => setDirectory(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>标题 *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>概述</label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>标签（逗号分隔）</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>详细内容 *</label>
                    <input type="file" accept=".md" onChange={handleFileChange} />
                    {content && (
                        <textarea
                            readOnly
                            value={content}
                            className={styles.previewContent}
                        />
                    )}
                </div>
                <div className={styles.buttonGroup}>
                    <button onClick={handleSubmit}>保存</button>
                    <button onClick={onClose}>取消</button>
                </div>
            </div>
        </div>
    );
};

export default CommonNoteModal;