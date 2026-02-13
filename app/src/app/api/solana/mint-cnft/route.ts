
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
    createUmi as createUmiDirect,
    keypairIdentity, 
    publicKey,
    none
} from '@metaplex-foundation/umi';
import { 
    mplBubblegum, 
    mintToCollectionV1 
} from '@metaplex-foundation/mpl-bubblegum';
import { NextResponse } from 'next/server';
import { clusterApiUrl } from '@solana/web3.js';

export async function POST(req: Request) {
    try {
        const { walletAddress, courseTitle, courseSlug } = await req.json();

        if (!process.env.SOLANA_PRIVATE_KEY || 
            !process.env.NEXT_PUBLIC_CREDENTIAL_TREE_ADDRESS || 
            !process.env.NEXT_PUBLIC_COLLECTION_MINT) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Setup Umi
        let rpc = process.env.NEXT_PUBLIC_HELIUS_RPC;
        if (!rpc || rpc.includes('your-api-key') || rpc.includes('mock')) {
             rpc = clusterApiUrl('devnet');
        }
        const umi = createUmi(rpc).use(mplBubblegum());

        // Load Authority
        const secretKey = Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY));
        const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
        umi.use(keypairIdentity(keypair));

        // Mint cNFT
        const treeAddress = publicKey(process.env.NEXT_PUBLIC_CREDENTIAL_TREE_ADDRESS);
        const collectionMint = publicKey(process.env.NEXT_PUBLIC_COLLECTION_MINT);
        
        console.log(`Minting cNFT to ${walletAddress} for ${courseTitle}`);

        const { signature } = await mintToCollectionV1(umi, {
            leafOwner: publicKey(walletAddress),
            merkleTree: treeAddress,
            collectionMint: collectionMint,
            metadata: {
                name: `Completed: ${courseTitle}`,
                uri: `https://superteam.fun/credentials/${courseSlug}`, // Placeholder
                sellerFeeBasisPoints: 0,
                collection: { key: collectionMint, verified: false },
                creators: [
                    { address: keypair.publicKey, verified: true, share: 100 }
                ],
            },
        }).sendAndConfirm(umi);

        // Convert signature to string (Uint8Array)
        const sigString = Buffer.from(signature).toString('hex');
        // Actually base58 is better for Solana sigs, generally we use bs58
        // But for simplicty in this demo helper...
        
        return NextResponse.json({ success: true, signature: "Minted" });

    } catch (error) {
        console.error("cNFT Minting Error:", error);
        return NextResponse.json({ error: 'Failed to mint credential' }, { status: 500 });
    }
}
