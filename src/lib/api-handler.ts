// lib/api-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './db';

type HandlerFunction = (req: NextRequest, context?: any) => Promise<any>;

export const apiHandler = (handler: HandlerFunction) => {
    return async (req: NextRequest, context?: any) => {
        try {
            // 1. Tự động kết nối DB trước khi chạy logic
            await dbConnect();

            // 2. Chạy hàm logic chính (Controller)
            const result = await handler(req, context);

            // 3. Nếu handler tự trả về NextResponse thì giữ nguyên, không thì bọc lại
            if (result instanceof NextResponse) {
                return result;
            }

            return NextResponse.json(result, { status: 200 });

        } catch (error: any) {
            // 4. Global Error Handling (Giống Exception Filter)
            console.error('API Error:', error);

            // Xử lý các loại lỗi cụ thể (ví dụ Mongoose Validation Error)
            const status = error.name === 'ValidationError' ? 400 : 500;

            return NextResponse.json(
                {
                    success: false,
                    message: error.message || 'Internal Server Error',
                    error: process.env.NODE_ENV === 'development' ? error : undefined
                },
                { status }
            );
        }
    };
};