import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Ensure model is registered
import '@/models/Brand';    // Ensure model is registered


export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const params = await props.params;
        const { id } = params;

        const product = await Product.findById(id)
            .populate('category_id', 'name slug')
            .populate('brand_id', 'name');

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Basic validation could go here, relying on Schema validation for now

        // Check if slug exists (if slug is being updated)
        if (body.slug) {
            const existingProduct = await Product.findOne({
                slug: body.slug,
                _id: { $ne: id } // Exclude current product
            });
            if (existingProduct) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        // Logic Min/Max Price Update
        // Note: If updating SKUs, we should re-calculate. If body.skus is present, use it.
        // If not, we might need to fetch existing SKUs?
        // Usually frontend sends the full object. Assuming body contains skus if they are being updated.
        if (body.skus && Array.isArray(body.skus) && body.skus.length > 0) {
            const prices: number[] = [];

            body.skus = body.skus.map((sku: any) => {
                if (typeof sku.price === 'number') {
                    prices.push(sku.price);
                    // User Request: Assign regular_price = price and sale_price = 0
                    sku.regular_price = sku.price;
                    sku.sale_price = 0;
                }
                return sku;
            });

            if (prices.length > 0) {
                body.min_price = Math.min(...prices);
                body.max_price = Math.max(...prices);
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProduct);

    } catch (error: any) {
        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Duplicate key error' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
