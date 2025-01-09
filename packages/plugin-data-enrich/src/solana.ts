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
 * Solana SOL Transaction
 * @param params 
 * @returns Transaction
 */
export async function createSolTransferTransaction({
    fromPubkey,
    toPubkey,
    solAmount,
}: TransferSolParams): Promise<Transaction> {
    const connection = new Connection(
        clusterApiUrl("mainnet-beta"),
        "confirmed"
    );

    // key
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

    // amount
    if (isNaN(solAmount) || solAmount <= 0) {
        throw new Error("Invalid SOL amount: must be a positive number");
    }

    // create
    const transaction = new Transaction();

    // 
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: fromPublicKey,
            toPubkey: toPublicKey,
            lamports: BigInt(solAmount * LAMPORTS_PER_SOL),
        })
    );

    // 
    transaction.feePayer = fromPublicKey;

    // 
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    return transaction;
}
