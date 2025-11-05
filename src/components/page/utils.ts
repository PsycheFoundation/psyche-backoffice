import { pubkeyFromBase58, rpcHttpFromUrl, Service } from "solana-kiss";

export const service = new Service(
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
