import { Solana, pubkeyFromBase58, rpcHttpFromUrl } from "solana-kiss";

export const solana = new Solana(
  rpcHttpFromUrl("https://api.devnet.solana.com", {
    commitment: "confirmed",
  }),
);

export const tokenProgramAddress = pubkeyFromBase58(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const ataProgramAddress = pubkeyFromBase58(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);
