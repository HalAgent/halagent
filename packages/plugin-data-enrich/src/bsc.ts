import { ethers } from 'ethers';
import { settings } from "@elizaos/core";

// BSC mainnet provider URL (you can get this from services like Infura or Alchemy)
const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

// Token contract address and ABI
const tokenAbi = [
    "function transfer(address to, uint256 amount) returns (bool)"
];

async function transferBscToken(toAddress: string, amountString: string): Promise<string> {
    try {
        const contractAddress = settings.BSC_CONTRACT_ADDRESS;
        const privateKey = settings.BSC_PRIVATE_KEY;
        //const accountAddress = settings.BSC_ACCOUNT_ADDRESS;
        const wallet = new ethers.Wallet(privateKey, provider);

        const contract = new ethers.Contract(contractAddress, tokenAbi, wallet);

        // The amount to send, adjust according to your token's decimals
        const amount = ethers.utils.parseUnits(amountString, 18);

        console.log("Starting transfer...");
        const tx = await contract.transfer(toAddress, amount);
        console.log(`Transaction hash: ${tx.hash}`);

        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log("Transfer successful!");
        return tx.hash;
    } catch (error) {
        console.error("Transfer failed:", error);
        throw new Error(`BSC Transaction Error: ${error.message}`);
    }
}
