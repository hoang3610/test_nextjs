import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await connectDB(); // Bắt buộc gọi hàm này trước
  const users = await User.find({});
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const newUser = await User.create(body);
  return NextResponse.json(newUser, { status: 201 });
}