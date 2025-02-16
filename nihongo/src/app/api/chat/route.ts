// src/app/api/chat/route.ts
import { API_URL, API_KEY,MODEL_NAME, SYSTEM_MESSAGE } from '@/config';

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const payload = {
            model: MODEL_NAME,
            stream: true,
            messages: [
                {
                    role: "system",
                    content: SYSTEM_MESSAGE
                },
                {
                    role: "user",
                    content: message
                }
            ]
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            return new Response("Error", { status: response.status });
        }

        // 将上游返回的流式数据直接返回给前端
        return new Response(response.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });
    } catch (error) {
        console.error("API error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}