'use client';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import styles from './ChatArea.module.css';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

interface Message {
    sender: 'user' | 'bot';
    content: string;
}

interface ChatAreaProps {
    onLatestChat?: (text: string) => void;
}

export default function ChatArea({ onLatestChat }: ChatAreaProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');

    // 每次 messages 更新后，调用 onLatestChat 回调（只在最后一条消息为机器人回复时调用）
    useEffect(() => {
        if (onLatestChat && messages.length > 0) {
            const last = messages[messages.length - 1];
            if (last.sender === 'bot') {
                onLatestChat(last.content);
            }
        }
    }, [messages, onLatestChat]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = { sender: 'user', content: inputValue };
        setMessages((prev) => [...prev, userMessage]);
        const userText = inputValue;
        setInputValue('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    // 直接使用配置文件中导入的值（在后端进行匹配配置）
                    configKey: "STUDY_ASSISTANT"
                }),
            });

            if (!response.ok || !response.body) {
                console.error("API response error");
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let botContent = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);
                const lines = chunkValue.split('\n').filter((line) => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '');
                        // 如果数据行中包含 “Copy to clipboard” 或不以 "{" 开头，则跳过
                        if (dataStr.includes("Copy to clipboard") || !dataStr.trim().startsWith('{')) {
                            continue;
                        }
                        if (dataStr === '[DONE]') {
                            done = true;
                            break;
                        }
                        try {
                            const json = JSON.parse(dataStr);
                            const delta = json.choices[0]?.delta?.content;
                            if (delta) {
                                botContent += delta;
                                const formattedContent = botContent.replace(/\s+$/g, '');
                                setMessages((prev) => {
                                    const last = prev[prev.length - 1];
                                    let newMessages: Message[];
                                    if (last && last.sender === 'bot') {
                                        newMessages = [...prev];
                                        newMessages[newMessages.length - 1] = { ...last, content: formattedContent };
                                    } else {
                                        newMessages = [...prev, { sender: "bot", content: formattedContent }];
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (err) {
                            console.error('JSON parse error:', err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.contentArea}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={msg.sender === 'user' ? styles.userMessage : styles.botMessage}
                    >
                        <strong>{msg.sender === 'user' ? '用户:' : '机器人:'}</strong>{' '}
                        {msg.sender === 'bot' ? (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : (
                            msg.content
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.inputArea}>
                <input
                    type="text"
                    placeholder="请输入内容..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                />
                <button onClick={handleSend}>发送</button>
            </div>
        </div>
    );
}