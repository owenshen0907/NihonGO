// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CASDOOR_CONFIG } from '@/config';

export function middleware(request: NextRequest) {
    console.log("Middleware 被调用，当前路径：", request.nextUrl.pathname);

    // 如果需要对某些路径（例如登录页面或静态资源）放行，可以在这里排除
    // 排除登录页面和回调接口
    const path = request.nextUrl.pathname;
    if (path.startsWith('/api/auth/callback')) {
        return NextResponse.next();
    }

    // 检查 sessionToken Cookie 是否存在
    const token = request.cookies.get('sessionToken');
    if (!token) {
        // 构造自定义登录地址，使用 OAuth2 授权入口
        const loginUrl = new URL(`${CASDOOR_CONFIG.endpoint}/login/oauth/authorize`);
        loginUrl.searchParams.set('client_id', CASDOOR_CONFIG.clientId);
        loginUrl.searchParams.set('response_type', 'code'); // 授权码模式
        loginUrl.searchParams.set('redirect_uri', CASDOOR_CONFIG.redirectUri);
        loginUrl.searchParams.set('scope', 'read');          // 根据需要设置 scope
        loginUrl.searchParams.set('state', 'casdoor');         // 自定义 state 值
        loginUrl.searchParams.set('app_name', CASDOOR_CONFIG.appName);
        loginUrl.searchParams.set('org_name', CASDOOR_CONFIG.orgName);
        console.log("Redirecting to login: ", loginUrl.toString());
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// 修改 matcher 为匹配所有路径
export const config = {
    matcher: '/:path*',
};