'use client';
import React from 'react';
import rightStyles from './recommendRightPanel.module.css';
import {NoteItem,familiarityText,isGrammarNote} from "@/app/components/apiUtils";


interface RightPanelProps {
    displayedNotes: NoteItem[];
}

export default function RecommendRightPanel({ displayedNotes }: RightPanelProps) {
    return (
        <div className={rightStyles.rightPanel}>
            <h3>推荐笔记</h3>
            {displayedNotes.map((note) => (
                <div key={note.id} className={rightStyles.noteCard}>
                    {isGrammarNote(note) ? (
                        <div>
                            <div className={rightStyles.cardRow}>
                                <span className={rightStyles.noteType}>语法</span>
                                <span>{note.grammar_formula}</span>
                                <span>等级: {note.level}</span>
                                <span>听: {familiarityText(note.listening)}</span>
                                <span>说: {familiarityText(note.speaking)}</span>
                                <span>写: {familiarityText(note.writing)}</span>
                                <span>阅: {familiarityText(note.reading)}</span>
                            </div>
                            <div className={rightStyles.cardRow}>
                                <span>{note.explanation}</span>
                                <span>创建: {note.created_at}</span>
                                <span>更新: {note.updated_at}</span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className={rightStyles.cardRow}>
                                <span className={rightStyles.noteType}>单词</span>
                                <span>{note.kana} / {note.kanji} / {note.romaji}</span>
                                <span>POS: {note.pos}</span>
                                <span>等级: {note.level}</span>
                                <span>听: {familiarityText(note.listening)}</span>
                                <span>说: {familiarityText(note.speaking)}</span>
                                <span>写: {familiarityText(note.writing)}</span>
                                <span>阅: {familiarityText(note.reading)}</span>
                            </div>
                            <div className={rightStyles.cardRow}>
                                <span>{note.translation}</span>
                                <span>创建: {note.created_at}</span>
                                <span>更新: {note.updated_at}</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}