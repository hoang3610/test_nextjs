
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();

    // Fetch users, newest first, exclude password
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { full_name, email, password } = body;

    // 1. Basic Validation
    if (!full_name || !email) {
      return NextResponse.json(
        { success: false, message: 'Full name and email are required' },
        { status: 400 }
      );
    }

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // 3. Hash Password if exists
    let userData = { ...body };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }

    // 4. Create User
    const newUser = new User(userData);
    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { success: true, message: 'User created successfully', data: userResponse },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating user:', error);

    // Handle Duplicate Key Error (E11000)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create user', error: error.message },
      { status: 500 }
    );
  }
}