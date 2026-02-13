
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  const envCheck = {
    hasMongoUri: !!process.env.MONGODB_URI,
    hasSolanaKey: !!process.env.SOLANA_PRIVATE_KEY,
    mongoConnectionState: mongoose.connection.readyState,
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({ status: 'ok', env: envCheck });
}
