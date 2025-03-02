'use client';
import React from 'react';
import leftStyles from './recommendLeftPanel.module.css';

import {NoteData,NoteItem,familiarityText,isGrammarNote} from "@/app/components/apiUtils";


interface LeftPanelProps {
    notes: NoteData;
    selectedTypes: { word: boolean; grammar: boolean };
    setSelectedTypes: React.Dispatch<React.SetStateAction<{ word: boolean; grammar: boolean }>>;
    familiarityFilters: {
        listening: Set<string>;
        speaking: Set<string>;
        writing: Set<string>;
        reading: Set<string>;
    };
    setFamiliarityFilters: React.Dispatch<React.SetStateAction<{
        listening: Set<string>;
        speaking: Set<string>;
        writing: Set<string>;
        reading: Set<string>;
    }>>;
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    previewResults: NoteItem[];
    setPreviewResults: React.Dispatch<React.SetStateAction<NoteItem[]>>;
    addNoteToDisplay: (note: NoteItem) => void;
}

export default function RecommendLeftPanel(props: LeftPanelProps) {
    const {
        notes,
        selectedTypes,
        setSelectedTypes,
        familiarityFilters,
        setFamiliarityFilters,
        searchText,
        setSearchText,
        previewResults,
        setPreviewResults,
        addNoteToDisplay,
    } = props;

    // 切换单词/语法选择（已在之前示例中实现）
    const toggleType = (type: 'word' | 'grammar') => {
        setSelectedTypes((prev) => {
            // 至少有一个必须选中
            if (prev[type] && !prev[type === 'word' ? 'grammar' : 'word']) {
                return prev;
            }
            return { ...prev, [type]: !prev[type] };
        });
    };

    // 切换熟悉度过滤（每个按钮独立）
    const toggleFamiliarity = (
        dimension: 'listening' | 'speaking' | 'writing' | 'reading',
        levelText: string
    ) => {
        setFamiliarityFilters((prev) => {
            const newSet = new Set(prev[dimension]);
            if (newSet.has(levelText)) newSet.delete(levelText);
            else newSet.add(levelText);
            return { ...prev, [dimension]: newSet };
        });
    };

    // 执行搜索：同之前逻辑
    const handleSearch = () => {
        let results: NoteItem[] = [];
        if (selectedTypes.word) {
            results = results.concat(
                notes.wordNotes.filter((note) =>
                    note.kana.includes(searchText) ||
                    note.kanji.includes(searchText) ||
                    note.romaji.includes(searchText)
                )
            );
        }
        if (selectedTypes.grammar) {
            results = results.concat(
                notes.grammarNotes.filter((note) =>
                    note.grammar_formula.includes(searchText)
                )
            );
        }
        const dims: ('listening' | 'speaking' | 'writing' | 'reading')[] = ['listening', 'speaking', 'writing', 'reading'];
        const filterByFamiliarity = (note: NoteItem) => {
            for (const dim of dims) {
                const sets = familiarityFilters[dim];
                if (sets.size > 0) {
                    const textVal = familiarityText(note[dim]);
                    if (!sets.has(textVal)) return false;
                }
            }
            return true;
        };
        results = results.filter(filterByFamiliarity);
        setPreviewResults(results);
    };

    return (
        <div className={leftStyles.leftPanel}>
            {/* 类型选择区域（大按钮形式） */}
            <div className={leftStyles.filterSection}>
                <h3>类型选择</h3>
                <div className={leftStyles.toggleGroup}>
                    <div
                        className={`${leftStyles.toggleButton} ${leftStyles.leftButton} ${selectedTypes.word ? leftStyles.wordSelected : ''}`}
                        onClick={() => toggleType('word')}
                    >
                        单词
                    </div>
                    <div
                        className={`${leftStyles.toggleButton} ${leftStyles.rightButton} ${selectedTypes.grammar ? leftStyles.grammarSelected : ''}`}
                        onClick={() => toggleType('grammar')}
                    >
                        语法
                    </div>
                </div>
            </div>

            {/* 各维度熟悉度筛选，每个维度为一组 */}
            {(['listening', 'speaking', 'writing', 'reading'] as const).map((dim) => (
                <div key={dim} className={leftStyles.filterSection}>
                    <h3>{dim === 'listening' ? '听' : dim === 'speaking' ? '说' : dim === 'writing' ? '写' : '阅'}</h3>
                    <div className={leftStyles.familiarityGroup}>
                        <button
                            className={`${leftStyles.familiarityButton} ${leftStyles.leftButton}`}
                            style={{
                                backgroundColor: familiarityFilters[dim].has('生疏') ? '#6C757D' : '#fff',
                                color: familiarityFilters[dim].has('生疏') ? '#fff' : '#000',
                            }}
                            onClick={() => toggleFamiliarity(dim, '生疏')}
                        >
                            生疏
                        </button>
                        <button
                            className={leftStyles.familiarityButton}
                            style={{
                                backgroundColor: familiarityFilters[dim].has('模糊') ? '#FFC107' : '#fff',
                                color: familiarityFilters[dim].has('模糊') ? '#fff' : '#000',
                            }}
                            onClick={() => toggleFamiliarity(dim, '模糊')}
                        >
                            模糊
                        </button>
                        <button
                            className={leftStyles.familiarityButton}
                            style={{
                                backgroundColor: familiarityFilters[dim].has('熟悉') ? '#20C997' : '#fff',
                                color: familiarityFilters[dim].has('熟悉') ? '#fff' : '#000',
                            }}
                            onClick={() => toggleFamiliarity(dim, '熟悉')}
                        >
                            熟悉
                        </button>
                        <button
                            className={`${leftStyles.familiarityButton} ${leftStyles.rightButton}`}
                            style={{
                                backgroundColor: familiarityFilters[dim].has('精通') ? '#2A3F8F' : '#fff',
                                color: familiarityFilters[dim].has('精通') ? '#fff' : '#000',
                            }}
                            onClick={() => toggleFamiliarity(dim, '精通')}
                        >
                            精通
                        </button>
                    </div>
                </div>
            ))}

            {/* 搜索区域：输入框和搜索按钮组合 */}
            <div className={leftStyles.filterSection}>
                <h3>搜索</h3>
                <div className={leftStyles.searchGroup}>
                    <input
                        type="text"
                        placeholder="输入搜索内容..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={leftStyles.searchInput}
                    />
                    <button onClick={handleSearch} className={leftStyles.searchButton}>
                        搜索
                    </button>
                </div>
            </div>

            {/* 预览结果 */}
            <div className={leftStyles.previewArea}>
                <h3>预览结果</h3>
                {previewResults.map((note) => (
                    <div key={note.id} className={leftStyles.previewItem}>
                        {isGrammarNote(note) ? (
                            <span>语法: {note.grammar_formula}</span>
                        ) : (
                            <span>单词: {note.kana} / {note.kanji} / {note.romaji}</span>
                        )}
                        <button onClick={() => addNoteToDisplay(note)} className={leftStyles.detailButton}>
                            详情
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}