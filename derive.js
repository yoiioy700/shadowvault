const { ethers } = require("ethers");
const { ec } = require("starknet");

const mnemonic = "lazy observe finish two afford nature canal crawl mobile raccoon seat project";
const node = ethers.HDNodeWallet.fromPhrase(mnemonic);
const child = node.derivePath("m/44'/9004'/0'/0/0");
const privateKey = child.privateKey;
const groundKey = ec.starkCurve.grindKey(privateKey);
console.log("Derived PK:", "0x" + BigInt(groundKey).toString(16));
