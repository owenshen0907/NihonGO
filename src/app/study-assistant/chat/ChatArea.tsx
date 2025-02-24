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
    // 初始 state 固定为空数组，服务器端和客户端一致
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [hydrated, setHydrated] = useState(false);

    // 客户端挂载后恢复消息，并设置 hydrated 为 true
    useEffect(() => {
        setHydrated(true);
        const cached = localStorage.getItem('chatMessages');
        if (cached) {
            try {
                setMessages(JSON.parse(cached));
            } catch (err) {
                console.error('Error parsing cached chatMessages', err);
            }
        }
    }, []);

    // 每次 messages 更新时，保存到 localStorage，并调用 onLatestChat 回调
    useEffect(() => {
        if (hydrated) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            if (onLatestChat && messages.length > 0) {
                const last = messages[messages.length - 1];
                if (last.sender === 'bot') {
                    onLatestChat(last.content);
                }
            }
        }
    }, [messages, onLatestChat, hydrated]);

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

    if (!hydrated) return null;

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