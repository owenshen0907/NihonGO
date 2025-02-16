'use client';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import styles from './ChatArea.module.css';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

interface Message {
    sender: 'user' | 'bot';
    content: string;
}

export default function ChatArea() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // 添加用户消息
        const userMessage: Message = { sender: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        const userText = inputValue;
        setInputValue('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText }),
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
                // 按行拆分数据
                const lines = chunkValue.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '');
                        if (dataStr === '[DONE]') {
                            done = true;
                            break;
                        }
                        try {
                            const json = JSON.parse(dataStr);
                            const delta = json.choices[0]?.delta?.content;
                            if (delta) {
                                botContent += delta;
                                // 格式化处理：去掉多余的空白字符
                                const formattedContent = botContent.replace(/\s+$/g, '');
                                // 更新最后一条机器人消息
                                setMessages(prev => {
                                    const last = prev[prev.length - 1];
                                    if (last && last.sender === 'bot') {
                                        const newMessages = [...prev];
                                        newMessages[newMessages.length - 1] = { ...last, content: formattedContent };
                                        return newMessages;
                                    } else {
                                        return [...prev, { sender: 'bot', content: formattedContent }];
                                    }
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