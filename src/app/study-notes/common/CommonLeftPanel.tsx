// src/app/study-notes/common/CommonLeftPanel.tsx
'use client';
import React, { useState } from 'react';
import styles from './CommonLeftPanel.module.css';
import { CommonNoteData, CommonNote } from '@/app/components/apiUtils';

interface TreeNode {
    label: string;       // 目录名
    note?: CommonNote;   // 关联笔记
    parent?: string;     // 父目录名
    children: TreeNode[];
}

// 根据 notes 构建树
function buildTree(notes: CommonNote[]): TreeNode[] {
    const nodeMap: Record<string, TreeNode> = {};

    // 初始化所有节点
    notes.forEach(note => {
        const label = note.directory?.trim() || note.title.trim();
        nodeMap[label] = {
            label,
            note,
            parent: note.parent_directory?.trim() || '',
            children: []
        };
    });

    const roots: TreeNode[] = [];
    Object.values(nodeMap).forEach(node => {
        if (node.parent && nodeMap[node.parent]) {
            nodeMap[node.parent].children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

interface LeftPanelProps {
    notes: CommonNoteData;
    setSelectedNote: (note: CommonNote) => void;
    onEdit: (note: CommonNote | null) => void;
}

export default function CommonLeftPanel({ notes, setSelectedNote, onEdit }: LeftPanelProps) {
    // 构建目录树，如果没有数据则为空数组
    const treeData = notes.notes.length > 0 ? buildTree(notes.notes) : [];
    // 默认添加一个根目录“目录”
    const rootNode: TreeNode = { label: '目录', children: treeData };

    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const toggleExpand = (label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(expandedNodes);
        if (newSet.has(label)) {
            newSet.delete(label);
        } else {
            newSet.add(label);
        }
        setExpandedNodes(newSet);
    };

    // 递归渲染树节点
    const renderTree = (node: TreeNode, level: number) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expandedNodes.has(node.label);

        return (
            <li key={node.label} className={styles.treeNode} style={{ marginLeft: `${level * 1.2}rem` }}>
                <div className={styles.nodeRow} onClick={() => {
                    if (node.note) {
                        setSelectedNote(node.note);
                    } else {
                        setSelectedNote({ id: '', title: node.label, content: '', created_at: '', updated_at: '', user_id: '', is_public: false });
                    }
                }}>
                    <div className={styles.labelArea}>
                        {hasChildren && (
                            <span className={styles.arrowIcon} onClick={(e) => toggleExpand(node.label, e)}>
                {isExpanded ? '▾' : '▸'}
              </span>
                        )}
                        <span className={styles.nodeLabel}>{node.label}</span>
                    </div>
                    <div className={styles.iconsArea}>
            <span className={styles.menuIcon} onClick={(e) => { e.stopPropagation(); setActiveMenu(node.label === activeMenu ? null : node.label); }}>
              ⋮
            </span>
                        {activeMenu === node.label && (
                            <div className={styles.optionMenu}>
                                {node.label !== '目录' && (
                                    <div className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setActiveMenu(null); onEdit(node.note || null); }}>
                                        编辑
                                    </div>
                                )}
                                <div className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setActiveMenu(null); handleNewDir(node.label); }}>
                                    新增
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <ul className={styles.childList}>
                        {node.children.map(child => renderTree(child, level + 1))}
                    </ul>
                )}
            </li>
        );
    };

    // 新增子目录：调用接口插入数据
    const handleNewDir = async (parentLabel: string) => {
        const newTitle = prompt(`请输入 "${parentLabel}" 下的子目录名称:`);
        if (!newTitle) return;

        // 构造 noteData 对象，新目录的父级为 parentLabel
        const newNoteData = {
            title: newTitle.trim(),
            directory: newTitle.trim(), // 子目录的名称作为自身目录字段
            parent_directory: parentLabel,
            summary: '',
            content: '',
            tags: '',
            comments: [],
            update_log: '',
            user_id: '', // 将由后端或 session 设置
            is_public: false,
        };

        let username = 'defaultUser';
        if (typeof window !== 'undefined') {
            const storedUserData = sessionStorage.getItem('userData');
            if (storedUserData) {
                const userData = JSON.parse(storedUserData);
                username = userData.name || 'defaultUser';
            }
        }

        try {
            const res = await fetch('/api/notes/operateCommonNotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operation: 'insert', userId: username, note: newNoteData }),
            });
            const data = await res.json();
            if (data.note) {
                alert(`新增目录 "${data.note.directory}" 成功`);
                // 此处你可以刷新目录数据，或直接调用 setSelectedNote(data.note) 使内容区显示空内容
                setSelectedNote(data.note);
            } else {
                console.error('保存失败', data);
            }
        } catch (error) {
            console.error('保存接口调用出错', error);
        }
    };

    return (
        <div className={styles.leftPanel}>
            <ul className={styles.treeList}>
                {renderTree(rootNode, 0)}
            </ul>
        </div>
    );
}