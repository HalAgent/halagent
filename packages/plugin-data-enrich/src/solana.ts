import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";

interface TransferSolParams {
    fromPubkey: PublicKey | string;
    toPubkey: PublicKey | string;
    solAmount: number;
}

export class InvalidPublicKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidPublicKeyError";
    }
}

/**
 * Create Solana SOL Transcation
 * @param params trans input
 * @returns Transaction output
 */
export async function createSolTransferTransaction({
    fromPubkey,
    toPubkey,
    solAmount,
}: TransferSolParams): Promise<Transaction> {
    const connection = new Connection(
        clusterApiUrl("mainnet-beta"), // 或者 'mainnet-beta' 用于主网
        "confirmed"
    );

    // Get Key
    let fromPublicKey: PublicKey;
    let toPublicKey: PublicKey;

    try {
        fromPublicKey =
            typeof fromPubkey === "string"
                ? new PublicKey(fromPubkey)
                : fromPubkey;
        toPublicKey =
            typeof toPubkey === "string" ? new PublicKey(toPubkey) : toPubkey;
    } catch (err) {
        throw new InvalidPublicKeyError("Invalid public key provided");
    }

    // Check Amount
    if (isNaN(solAmount) || solAmount <= 0) {
        throw new Error("Invalid SOL amount: must be a positive number");
    }

    // Create Transaction
    const transaction = new Transaction();

    // Add trans
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports: BigInt(solAmount * LAMPORTS_PER_SOL),
        })
    );

    // Set gas address
    transaction.feePayer = fromPublicKey;

    // Get result
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    return transaction;
}
