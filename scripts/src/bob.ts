import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BN = require("bn.js");
import { getKeypair, getProgramId, getPublicKey } from "./utils";

const bob = async () => {
  const bobKeypair = getKeypair("bob");
  const bobXTokenAccountPubkey = getPublicKey("bob_x");
  const alice = getPublicKey("alice");
  const escrowProgramId = getProgramId();
  const pdaTempTokenAccountPubkey = getPublicKey("pda_tempX");

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const PDA = await PublicKey.findProgramAddress(
    [Buffer.from("escrow")],
    escrowProgramId
  );

  const withdrawInstruct = new TransactionInstruction({
    programId: escrowProgramId,
    data: Buffer.from(Uint8Array.of(1, ...new BN(13).toArray("le", 8))),
    keys: [
      { pubkey: bobKeypair.publicKey, isSigner: true, isWritable: false },
      { pubkey: bobXTokenAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: pdaTempTokenAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: alice, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: PDA[0], isSigner: false, isWritable: false },
    ],
  });

  console.log("Sending Bob's transaction...");
  await connection.sendTransaction(
    new Transaction().add(withdrawInstruct),
    [bobKeypair],
    { skipPreflight: false, preflightCommitment: "confirmed" }
  );
  console.log("");
};

bob();
