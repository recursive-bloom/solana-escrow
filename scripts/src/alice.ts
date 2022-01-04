import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BN = require("bn.js");
import {
  getKeypair,
  getProgramId,
  getPublicKey,
  getTerms,
  writePublicKey,
} from "./utils";

const alice = async () => {
  const escrowProgramId = getProgramId();
  const terms = getTerms();

  const aliceXTokenAccountPubkey = getPublicKey("alice_x");
  const XTokenMintPubkey = getPublicKey("mint_x");
  const aliceKeypair = getKeypair("alice");

  const tempXTokenAccountKeypair = new Keypair();
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  writePublicKey(tempXTokenAccountKeypair.publicKey, "pda_tempX");
  const createTempTokenAccountIx = SystemProgram.createAccount({
    programId: TOKEN_PROGRAM_ID,
    space: AccountLayout.span,
    lamports: await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span
    ),
    fromPubkey: aliceKeypair.publicKey,
    newAccountPubkey: tempXTokenAccountKeypair.publicKey,
  });
  const initTempAccountIx = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,
    XTokenMintPubkey,
    tempXTokenAccountKeypair.publicKey,
    aliceKeypair.publicKey
  );
  const transferXTokensToTempAccIx = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    aliceXTokenAccountPubkey,
    tempXTokenAccountKeypair.publicKey,
    aliceKeypair.publicKey,
    [],
    1
  );
  const deposit = new TransactionInstruction({
    programId: escrowProgramId,
    keys: [
      { pubkey: aliceKeypair.publicKey, isSigner: true, isWritable: false },
      {
        pubkey: tempXTokenAccountKeypair.publicKey,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      Uint8Array.of(0, ...new BN(terms.aliceExpectedAmount).toArray("le", 8))
    ),
  });

  const tx = new Transaction().add(
    createTempTokenAccountIx,
    initTempAccountIx,
    transferXTokensToTempAccIx,
    deposit
  );
  console.log("Sending Alice's transaction...");
  await sendAndConfirmTransaction(
    connection,
    tx,
    [aliceKeypair, tempXTokenAccountKeypair],
    { skipPreflight: false, preflightCommitment: "confirmed" }
  );
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const aliceBalance = await connection.getTokenAccountBalance(
    aliceXTokenAccountPubkey
  );
  const transferAmount = await connection.getTokenAccountBalance(
    tempXTokenAccountKeypair.publicKey
  );
  console.log(
    `alice transfer amount ->  ${transferAmount.value.amount}
      xToken lamports ->  ${aliceBalance.value.amount}`
  );
  console.log("");
};

alice();
