import { Account, Contract, Provider, constants } from 'starknet';
import { uint256 } from 'starknet';
import { settings } from "@elizaos/core";

/**
 * Starknet Transfer API endpoint handler
 */
export async function transferStarknetToken(toAddress: string, amount: string): Promise<string> {
    try {
        const contractAddress = settings.STARKNET_CONTRACT_ADDRESS;
        const privateKey = settings.STARKNET_PRIVATE_KEY;
        const accountAddress = settings.STARKNET_ACCOUNT_ADDRESS;

        // Init Starknet provider
        const provider = new Provider({
            sequencer: {
                network: constants.NetworkName.SN_MAIN // or SN_GOERLI for testnet
            }
        });

        // Init account
        const account = new Account(
            provider,
            accountAddress,
            privateKey
        );

        // Init contract
        const contract = new Contract(
            [
                {
                    name: 'transfer',
                    type: 'function',
                    inputs: [
                        { name: 'recipient', type: 'felt' },
                        { name: "amount_low", type: "felt" },
                        { name: "amount_high", type: "felt" }
                    ],
                    outputs: []
                }
            ],
            contractAddress,
            provider
        );

        contract.connect(account);

        // to uint256
        const amountUint256 = uint256.bnToUint256(amount);

        // transfer
        const { transaction_hash } = await contract.transfer(
            toAddress,
            amountUint256.low,
            amountUint256.high
        );

        // wait
        await provider.waitForTransaction(transaction_hash);

        return transaction_hash;

    } catch (error: any) {
        console.error('Starknet Transfer API Error:', error);
        throw new Error(`Starknet Transaction Error: ${error.message}`);
    }
}
