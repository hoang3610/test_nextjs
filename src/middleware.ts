import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    // Lấy token từ session (Server-side)
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    });

    const { pathname } = req.nextUrl;

    // 1. Bảo vệ trang Admin
    if (pathname.startsWith('/admin')) {
        // Chưa đăng nhập -> Đá về Login
        if (!token) {
            const url = new URL('/login', req.url);
            url.searchParams.set('callbackUrl', encodeURI(req.url));
            return NextResponse.redirect(url);
        }

        // Đã đăng nhập nhưng không phải ADMIN -> Đá về trang chủ
        if (token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // 2. Trang Login (Ngược lại: Đã đăng nhập thì không cho vào nữa)
    if (pathname.startsWith('/login')) {
        if (token) {
            if (token.role === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            }
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
}

// Cấu hình các path mà middleware sẽ chạy qua
export const config = {
    matcher: [
        '/admin/:path*',
        '/login'
    ],
};
