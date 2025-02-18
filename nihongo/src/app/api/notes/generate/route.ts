import { NextResponse } from 'next/server';
import configurations from '@/config';
interface RequestBody {
    content: string;
    configKey?: string;
}

export async function POST(req: Request) {
    try {
        const { content, configKey } = (await req.json()) as RequestBody;

        // 根据 configKey 取配置，默认为 STEP_FUN
        const config = configurations[configKey || 'GENERATE_NOTE'];

        const payload = {
            model: config.model,
            stream: false,
            messages: [
                {
                    role: "system",
                    content: config.systemMessage
                },
                {
                    role: "user",
                    content: content
                }
            ]
        };

        const response = await fetch(config.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            return new Response("Error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.choices[0].message.content);
    } catch (error) {
        console.error("API error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}