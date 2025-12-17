import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Promotion from '@/models/Promotion';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Validate thời gian nếu có cập nhật
        if (body.start_at && body.end_at) {
            if (new Date(body.start_at) >= new Date(body.end_at)) {
                return NextResponse.json(
                    { error: 'End time must be after start time' },
                    { status: 400 }
                );
            }
        }

        // Logic check: Nếu chỉ update 1 trong 2 trường date?
        // Thường frontend sẽ gửi cả 2, hoặc ta phải fetch cái cũ ra compare.
        // Để an toàn, nếu body có date, ta nên kiểm tra tính hợp lệ với date còn lại (từ body hoặc db).
        // Tuy nhiên, để đơn giản cho MVP, giả sử frontend gửi cả bộ hoặc gửi đúng logic.
        // Ta sẽ validate chặt chẽ hơn: nếu có start_at hoặc end_at, ta nên fetch cũ ra để check lại toàn vẹn.

        let updateData = { ...body };

        // Fetch current to validate dates integrity if partial update
        const currentPromotion = await Promotion.findById(id);
        if (!currentPromotion) {
            return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
        }

        const newStart = body.start_at ? new Date(body.start_at) : currentPromotion.start_at;
        const newEnd = body.end_at ? new Date(body.end_at) : currentPromotion.end_at;

        if (newStart >= newEnd) {
            return NextResponse.json(
                { error: 'Invalid time range: End time must be after start time' },
                { status: 400 }
            );
        }

        const updatedPromotion = await Promotion.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedPromotion);

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
