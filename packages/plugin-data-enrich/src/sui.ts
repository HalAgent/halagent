
import { SuiClient } from '@mysten/sui/client';
import { Transaction, type ObjectRef } from "@mysten/sui/transactions";
import { isValidSuiAddress } from '@mysten/sui/utils'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl } from '@mysten/sui/client';
import { settings } from "@elizaos/core";


export async function transferSui(account: string, amount: string): Promise<string> {
    let client = new SuiClient({ url: settings.SUI_RPC || getFullnodeUrl("devnet") })
    let keypair = Ed25519Keypair.fromSecretKey(settings.SUI_PRIVATEKEY || "",)
    let objectId = settings.TOKEN_PROJECT_ID || ""

    if (!isValidSuiAddress(account)) {
        throw new Error("invalid sui address")
    }

    try {
        BigInt(amount)
    } catch {
        throw new Error("invalid amount")
    }

    try {
        const txb = new Transaction();
        // Split
        const [coinToTransfer] = txb.splitCoins(objectId, [amount]);

        // transfer
        txb.transferObjects([coinToTransfer], account);


        // Gas
        let gasPayment = await client.getCoins({
            owner: keypair.toSuiAddress(),
            coinType: '0x2::sui::SUI',
        });

        if (gasPayment.data.length === 0) {
            throw new Error('No SUI coins found for gas payment.');
        }

        let payments: ObjectRef[] = []
        gasPayment.data.forEach((coin) => {
            payments.push({
                objectId: coin.coinObjectId,
                version: coin.version,
                digest: coin.digest,
            })
        })


        // Gas
        txb.setGasPayment(payments);

        // Simulate
        let res = await client.devInspectTransactionBlock({
            sender: keypair.toSuiAddress(),
            transactionBlock: txb,
        })

        // transcation
        if (res.effects.status.status != "success") {
            throw new Error(res.effects.status.error || "transaction failed");
        }

        // sign
        const result = await client.signAndExecuteTransaction({
            transaction: txb,
            signer: keypair,
        });
        return result.digest
    } catch (error) {
        throw new Error(`internel failed: ${error}`);
    }

}
