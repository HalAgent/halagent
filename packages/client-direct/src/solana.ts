import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Transaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createTransferInstruction } from "@solana/spl-token";

interface TransferTokenParams {
    fromTokenAccountPubkey: PublicKey | string;
    toTokenAccountPubkey: PublicKey | string;
    ownerPubkey: PublicKey | string;
    tokenAmount: number;
}

export class InvalidPublicKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidPublicKeyError";
    }
}

/**
 * ai16z Meme Coin transaction
 * @param params 
 * @returns Transaction 
 */
export async function createTokenTransferTransaction({
    fromTokenAccountPubkey,
    toTokenAccountPubkey,
    ownerPubkey,
    tokenAmount,
}: TransferTokenParams): Promise<Transaction> {
    const connection = new Connection(
        clusterApiUrl("mainnet-beta"),
        "confirmed"
    );

    // key
    const fromTokenAccount = new PublicKey(fromTokenAccountPubkey);
    const toTokenAccount = new PublicKey(toTokenAccountPubkey);
    const owner = new PublicKey(ownerPubkey);

    const transaction = new Transaction();

    // 
    transaction.add(
        createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            owner,
            tokenAmount,
            [],
            TOKEN_PROGRAM_ID
        )
    );

    // gas fee
    transaction.feePayer = owner;

    // hash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    return transaction;
}
