import {
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import {
    TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
    createTransferInstruction,
} from "@solana/spl-token";
import { settings } from "@elizaos/core";


export class InvalidPublicKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidPublicKeyError";
    }
}

interface TransferTokenParams {
    toTokenAccountPubkey: string;
    tokenAmount: number;
}

/**
 * Transfers SPL tokens from the owner to a specified destination.
 * @param params Transfer parameters, including destination and amount.
 * @returns Transaction signature.
 */
export async function createSolSplTransferTransaction({
    toTokenAccountPubkey,
    tokenAmount,
}: TransferTokenParams): Promise<string> {
    try {
        // Establish Solana connection
        const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

        // Decode private key and initialize sender Keypair
        const privateKeyString = settings.SOL_SPL_OWNER_PRIVKEY;
        const secretKey = bs58.decode(privateKeyString);
        const senderKeypair = Keypair.fromSecretKey(secretKey);

        // Retrieve mint address and validate its existence
        const mint = new PublicKey(settings.SOL_SPL_MINT_PUBKEY);
        const mintAccount = await connection.getAccountInfo(mint);
        if (!mintAccount) throw new Error("Invalid mint account!");

        console.log("Mint Address:", mint.toString());

        // Get or create associated token accounts
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            senderKeypair,
            mint,
            senderKeypair.publicKey
        );
        console.log("From Token Account:", fromTokenAccount.address.toString());

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            senderKeypair,
            mint,
            new PublicKey(toTokenAccountPubkey)
        );

        console.log("To Token Account:", toTokenAccount.address.toString());

        // Construct the transfer transaction
        const transaction = new Transaction().add(
            createTransferInstruction(
                fromTokenAccount.address,
                toTokenAccount.address,
                senderKeypair.publicKey,
                tokenAmount,
                [],
                TOKEN_PROGRAM_ID
            )
        );

        // Set transaction fee payer and recent blockhash
        transaction.feePayer = senderKeypair.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        // Sign and send the transaction
        const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

        console.log("Transaction Signature:", signature);
        return signature;
    } catch (error) {
        console.error("SPL Transaction Error:", error);
        throw new Error(`SPL Transaction Error: ${error.message}`);
    }
}
