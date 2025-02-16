import { ethers } from 'ethers';
import { settings } from "@elizaos/core";


// Token contract address and ABI
const tokenAbi = [
    "function transfer(address to, uint256 amount) returns (bool)"
];

export async function transferEthToken(
    toAddress: string,
    amountString: string,
    chainType: string
): Promise<string> {
    try {
        // BSC mainnet provider URL (you can get this from services like Infura or Alchemy)
        let provider = null;
        let contractAddress = settings.ETH_CONTRACT_ADDRESS;
        let privateKey = settings.ETH_PRIVATE_KEY;
        //const accountAddress = settings.BSC_ACCOUNT_ADDRESS;

        switch (chainType) {
            case "eth":
                provider = new ethers.JsonRpcProvider(settings.ETH_RPC);
                contractAddress = settings.ETH_CONTRACT_ADDRESS;
                privateKey = settings.ETH_PRIVATE_KEY;
                break;
            case "bsc":
                provider = new ethers.JsonRpcProvider(settings.BSC_RPC);
                contractAddress = settings.BSC_CONTRACT_ADDRESS;
                privateKey = settings.BSC_PRIVATE_KEY;
                break;
            case "base":
                provider = new ethers.JsonRpcProvider(settings.BASE_RPC);
                contractAddress = settings.BASE_CONTRACT_ADDRESS;
                privateKey = settings.BASE_PRIVATE_KEY;
                break;
            case "mantle":
                provider = new ethers.JsonRpcProvider(settings.MANTLE_RPC);
                contractAddress = settings.MANTLE_CONTRACT_ADDRESS;
                privateKey = settings.MANTLE_PRIVATE_KEY;
                break;
            default:
                provider = new ethers.JsonRpcProvider(settings.ETH_RPC);
                contractAddress = settings.ETH_CONTRACT_ADDRESS;
                privateKey = settings.ETH_PRIVATE_KEY;
                break;
        }

        const wallet = new ethers.Wallet(privateKey, provider);

        const contract = new ethers.Contract(contractAddress, tokenAbi, wallet);

        // The amount to send, adjust according to your token's decimals
        const amount = ethers.parseUnits(amountString, 18);

        console.log("Starting transfer...");
        const tx = await contract.transfer(toAddress, amount/*, {
            gasLimit: 100000, // Set Gas Limit
            gasPrice: ethers.parseUnits("20", "gwei"), //Gas Price
        }*/);
        console.log(`Transaction hash: ${tx.hash}`);

        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log("Transfer successful!");
        return tx.hash;
    } catch (error) {
        console.error("Transfer failed:", error);
        throw new Error(`ETH Transaction Error: ${error.message}`);
    }
}
