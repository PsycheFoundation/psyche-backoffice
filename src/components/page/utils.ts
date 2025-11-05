import {
  IdlProgram,
  idlProgramParse,
  Pubkey,
  pubkeyFromBase58,
  rpcHttpFromUrl,
  Service,
} from "solana-kiss";

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

const programIdlByAddress = new Map<Pubkey, IdlProgram>();

programIdlByAddress.set(
  tokenProgramAddress,
  idlProgramParse({
    accounts: {
      TokenAccount: {
        space: 165,
        discriminator: [],
        fields: [
          { name: "mint", type: "pubkey" },
          { name: "owner", type: "pubkey" },
          { name: "amount", type: "u64" },
          { name: "delegate", coption: "pubkey" },
          {
            name: "state",
            type: { variants: ["Uninitialized", "Initialized", "Frozen"] },
          },
          { name: "is_native", coption: "u64" },
          { name: "delegated_amount", type: "u64" },
          { name: "close_authority", coption: "pubkey" },
        ],
      },
      TokenMint: {
        space: 82,
        discriminator: [],
        fields: [
          { name: "mint_authority", coption: "pubkey" },
          { name: "supply", type: "u64" },
          { name: "decimals", type: "u8" },
          { name: "is_initialized", type: "bool" },
          { name: "freeze_authority", coption: "pubkey" },
        ],
      },
    },
  }),
);
