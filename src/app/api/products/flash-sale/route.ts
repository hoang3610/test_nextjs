import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Calculate Date Range (Current Month)
        // 1. Calculate Date Range (Current Month) - UTC Forced
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth(); // 0-based

        // Start of current month in UTC (e.g. 2024-12-01T00:00:00.000Z)
        const start = new Date(Date.UTC(year, month, 1));

        // End of current month in UTC (Start of next month - 1ms)
        const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

        // 2. Query Products
        // Logic: active products where sale time overlaps with current month
        // (sale_start <= endOfMonth AND sale_end >= startOfMonth)
        const products = await Product.find({
            is_active: true,
            sale_start_at: { $lte: end },
            sale_end_at: { $gte: start },
        }).sort({ sale_end_at: 1 }); // Sort by ending soonest? Or start? Let's sort by end date asc.

        return NextResponse.json({
            data: products,
            meta: {
                total: products.length,
                range: {
                    start: start.toISOString(),
                    end: end.toISOString()
                }
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching flash sale products:", error);
        return NextResponse.json(
            { error: "Failed to fetch flash sale products" },
            { status: 500 }
        );
    }
}
