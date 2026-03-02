import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // 1. Authorization
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Ideally check for ADMIN role here
        // if (session.user.role !== 'ADMIN') ...

        const { id } = await params;

        // 2. Validation
        // const body = await request.json(); // No payload needed
        const DEFAULT_PASSWORD = '123456';

        // 3. Find User
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { message: 'Không tìm thấy người dùng' },
                { status: 404 }
            );
        }

        // 4. Hash & Update
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(DEFAULT_PASSWORD, salt);
        await user.save();

        return NextResponse.json(
            { message: `Đã reset mật khẩu thành công về mặc định: ${DEFAULT_PASSWORD}` },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { message: 'Lỗi server: ' + error.message },
            { status: 500 }
        );
    }
}
