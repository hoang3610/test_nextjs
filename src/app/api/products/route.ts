import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category'; // Ensure model is registered and imported
import '@/models/Brand';    // Ensure model is registered



function removeAccents(str: string) {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        let category_slug = searchParams.get('category');
        const category_id = searchParams.get('category_id');
        const brand_id = searchParams.get('brand_id');
        const is_active = searchParams.get('is_active');

        // Normalize category slug (remove accents & spaces -> -)
        if (category_slug) {
            category_slug = removeAccents(category_slug).replace(/\s+/g, '-');
        }

        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Logic xử lý Category Slug (Fuzzy Search)
        if (category_slug) {
            // Tìm tất cả category có slug chứa từ khóa (không phân biệt hoa thường)
            const categories = await Category.find({
                slug: { $regex: category_slug, $options: 'i' }
            }).select('_id');

            if (categories.length > 0) {
                const categoryIds = categories.map(cat => cat._id);
                query.category_id = { $in: categoryIds };
            } else {
                // Không tìm thấy category nào match thì trả về rỗng
                return NextResponse.json({
                    data: [],
                    pagination: { total: 0, page, limit, totalPages: 0 }
                });
            }
        }

        // Fallback: nếu không có slug thì check category_id truyền trực tiếp
        // Lưu ý: Nếu đã filter theo slug ở trên thì không overwrite bằng category_id nữa (hoặc tùy logic prioritize)
        // Hiện tại code dưới sẽ chỉ chạy nếu query.category_id chưa được set (tức là không có slug hoặc slug tìm không ra - mà slug tìm ko ra đã return ở trên rồi)
        if (!query.category_id && category_id) {
            query.category_id = category_id;
        }

        if (brand_id) {
            query.brand_id = brand_id;
        }

        if (is_active !== null) {
            query.is_active = is_active === 'true';
        }

        const is_featured = searchParams.get('is_featured');
        if (is_featured !== null) {
            query.is_featured = is_featured === 'true';
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .populate('category_id', 'name')
            .populate('brand_id', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        return NextResponse.json({
            data: products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.slug || !body.category_id) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug, category_id' },
                { status: 400 }
            );
        }

        // Check if slug exists
        const existingProduct = await Product.findOne({ slug: body.slug });
        if (existingProduct) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        const product = await Product.create(body);

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        // Handle duplicate key error specifically if needed, though slug check covers most
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