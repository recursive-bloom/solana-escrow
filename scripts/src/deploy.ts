/**
 * deploy_transfer_contract_event
 */
import {
  Account,
  BPF_LOADER_PROGRAM_ID,
  BpfLoader,
  Connection,
  Keypair,
} from "@solana/web3.js";

import fs from "mz/fs";

/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair;

async function main_to_deploy() {
  const programAccount = await deployCode();
  console.log(
    "deploy constract,publicKey is:",
    programAccount.publicKey,
    "secretKey is:",
    programAccount.secretKey
  );
  const acc = await connection.getAccountInfo(programAccount.publicKey);
  console.log("new keyPair,publicKey is", programAccount.publicKey.toBase58());
  console.log(acc);
}

export async function getConnect(): Promise<void> {
  //connect
  console.log("try to get connection");
  connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const version = await connection.getVersion();
  console.log(
    "Connection to cluster established:",
    "https://api.devnet.solana.com",
    version
  );
}

async function deployCode() {
  await getConnect();
  // const data = Uint8Array.from(JSON.parse(contract_so_str));
  const data = await fs.readFile("");
  const programAccount = new Account();
  console.log("new keyPair,publicKey is", programAccount.publicKey.toBase58());
  await BpfLoader.load(
    connection,
    getSigner(),
    programAccount,
    data,
    BPF_LOADER_PROGRAM_ID
  );
  return programAccount;
}

function getSigner() {
  const secretKey = Uint8Array.from([
    16, 118, 77, 27, 51, 154, 56, 25, 103, 140, 255, 38, 24, 13, 1, 155, 198,
    129, 225, 197, 58, 75, 127, 232, 129, 204, 178, 119, 184, 17, 165, 103, 152,
    168, 150, 228, 19, 27, 1, 37, 132, 150, 84, 149, 237, 117, 187, 3, 247, 82,
    9, 133, 75, 3, 252, 199, 29, 50, 200, 100, 179, 240, 112, 171,
  ]);
  payer = Keypair.fromSecretKey(secretKey);
  return payer;
}

main_to_deploy().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);
