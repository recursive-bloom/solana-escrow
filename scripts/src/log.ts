import { Connection, PublicKey } from "@solana/web3.js";

async function getLog2() {
  const escrowProgramId = new PublicKey(
    "9ZNsjm3FjdxBP9bEx3Q7Q8bCJx77hptRT2kbhtcTiLg1"
  );
  console.log(
    "current programId is -> ",
    escrowProgramId.toBase58().toString()
  );
  //connect
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const version = await connection.getVersion();
  console.log(
    "Connection to cluster established:",
    "https://api.devnet.solana.com",
    version
  );
  while (true) {
    const recentBlock = await connection.getRecentBlockhashAndContext();
    const startSlot = recentBlock.context.slot;
    let start = startSlot;
    console.log("start slot is ->", startSlot);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    //get block
    const slotsArr = await connection.getBlocks(start);
    const promiseList = slotsArr.map((slot) => {
      return connection.getBlock(slot).then((block) => {
        if (block !== null) {
          console.log("slot is -> ", slot, "blockHash is  ->", block.blockhash);
          const tss = block.transactions;
          tss.forEach((ele) => {
            const ts = ele.transaction;
            const pubkeyBoo = ts.message.accountKeys.some((key) =>
              key.equals(escrowProgramId)
            );
            if (pubkeyBoo) {
              const logMesg = ele.meta?.logMessages;
              console.log("logMesg array is -> ", logMesg);
            }
          });
        }
      });
    });

    Promise.all(promiseList)
      // .then((blockList) => {
      //   blockList.forEach((block) => {
      //     if (block) {
      //       console.log("blockHash is  ->", block.blockhash);
      //       if (block !== null) {
      //         const tss = block.transactions;
      //         tss.forEach((ele) => {
      //           const ts = ele.transaction;
      //           const pubkeyBoo = ts.message.accountKeys.some((key) =>
      //             key.equals(escrowProgramId)
      //           );
      //           if (pubkeyBoo) {
      //             const logMesg = ele.meta?.logMessages;
      //             console.log("logMesg array is -> ", logMesg);
      //           }
      //         });
      //       }
      //     }
      //   });
      // })
      .catch(console.log);
    start = slotsArr[slotsArr.length - 1] + 1;
  }
}

const getLog = async () => {
  await getLog2();
};

getLog();
