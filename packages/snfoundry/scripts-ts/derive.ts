import { ethers } from "ethers";
import { ec } from "starknet";

const mnemonicString = "lazy observe finish two afford nature canal crawl mobile raccoon seat project";
const mnemonic = ethers.Mnemonic.fromPhrase(mnemonicString);
// Starknet derivation path
const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic, "m/44'/9004'/0'/0/0");
const privateKey = wallet.privateKey;
const groundKey = ec.starkCurve.grindKey(privateKey);
console.log("Derived ETH PK:", privateKey);
console.log("Derived STARK PK:", "0x" + groundKey);
