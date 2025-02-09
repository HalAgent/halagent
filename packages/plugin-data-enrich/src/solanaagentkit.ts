import { settings } from "@elizaos/core";
import {
    clusterApiUrl,
    PublicKey,
} from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { InvalidPublicKeyError } from "./solanaspl";

const SOLANA_RPC_URL = clusterApiUrl("mainnet-beta");
//const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

interface TransferTokenParams {
    toTokenAccountPubkey: PublicKey | string;
    mintPubkey: PublicKey | string;
    tokenAmount: number;
}

/**
 * Init SolanaAgentKit, and transfer SPL token.
 * @param params TransferTokenParams
 * @returns Transaction/Signature String
 */
export async function callSolanaAgentTransfer({
    toTokenAccountPubkey,
    mintPubkey,
    tokenAmount,
}: TransferTokenParams): Promise<string> {
    try {
        const agentKit = new SolanaAgentKit(
            settings.SOLANA_PRIVATE_KEY!,
            SOLANA_RPC_URL,
            settings.OPENAI_API_KEY!
        );
        //const tools = createSolanaTools(agentKit);

        // Get Address
        let toTokenAccount: PublicKey;
        let mintAddress: PublicKey;
        try {
            toTokenAccount =
                typeof toTokenAccountPubkey === "string" ?
                new PublicKey(toTokenAccountPubkey) : toTokenAccountPubkey;
            mintAddress =
                typeof mintPubkey === "string" ?
                new PublicKey(mintPubkey) : mintPubkey;
        } catch (err) {
            throw new InvalidPublicKeyError("Invalid public key provided");
        }

        // Verify amount
        if (isNaN(tokenAmount) || tokenAmount <= 0) {
            throw new Error("Invalid token amount: must be a positive number");
        }

        let transaction = await agentKit.transfer(toTokenAccount, tokenAmount, mintAddress);
        console.log(transaction);
        return transaction;
    } catch (error) {
      console.error("Failed on SolAgent Transfer:", error);
      throw error;
    }
}
