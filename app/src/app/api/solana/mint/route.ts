
import { 
    Connection, 
    Keypair, 
    PublicKey, 
    clusterApiUrl 
} from '@solana/web3.js';
import { 
    getOrCreateAssociatedTokenAccount, 
    mintTo, 
    TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { NextResponse } from 'next/server';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export async function POST(req: Request) {
    try {
        const { walletAddress, amount } = await req.json();

        if (!process.env.SOLANA_PRIVATE_KEY || !process.env.NEXT_PUBLIC_XP_MINT_ADDRESS) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const secretKey = Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY));
        const authority = Keypair.fromSecretKey(secretKey);
        const mint = new PublicKey(process.env.NEXT_PUBLIC_XP_MINT_ADDRESS);
        const recipient = new PublicKey(walletAddress);

        // Get Recipient's Token Account (or create if needed)
        // Note: In a real app, the user might need to pay for rent, or we pay for it.
        // Here, the Authority pays for the ATA creation.
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            authority,
            mint,
            recipient
        );

        // Mint Tokens
        const tx = await mintTo(
            connection,
            authority,
            mint,
            recipientTokenAccount.address,
            authority,
            amount // Check decimals. Our mint has 0 decimals, so this is raw amount.
        );

        return NextResponse.json({ success: true, tx });

    } catch (error) {
        console.error("Minting Error:", error);
        return NextResponse.json({ error: 'Failed to mint tokens' }, { status: 500 });
    }
}
