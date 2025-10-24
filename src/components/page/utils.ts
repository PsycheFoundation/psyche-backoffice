import {
  idlAccountDecode,
  idlOnchainAnchorAddress,
  idlOnchainAnchorDecode,
  IdlProgram,
  idlProgramGuessAccount,
  idlProgramParse,
  Pubkey,
  pubkeyFromBase58,
  rpcHttpFromUrl,
  rpcHttpGetAccountWithData,
} from "solana-kiss";

export const rpcHttp = rpcHttpFromUrl("https://api.devnet.solana.com", {
  commitment: "confirmed",
});

export const tokenProgramAddress = pubkeyFromBase58(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const ataProgramAddress = pubkeyFromBase58(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

const programIdlByAddress = new Map<Pubkey, IdlProgram>();

export async function getAndInferAndDecodeAccountState(accountAddress: Pubkey) {
  const { accountInfo } = await rpcHttpGetAccountWithData(
    rpcHttp,
    accountAddress,
  );
  const programAddress = accountInfo.owner;
  let programIdl = programIdlByAddress.get(programAddress);
  if (programIdl === undefined) {
    const onchainAnchorAddress = idlOnchainAnchorAddress(programAddress);
    const { accountInfo: onchainAnchorInfo } = await rpcHttpGetAccountWithData(
      rpcHttp,
      onchainAnchorAddress,
    );
    programIdl = idlOnchainAnchorDecode(onchainAnchorInfo.data);
    programIdlByAddress.set(programAddress, programIdl);
  }
  const accountIdl = idlProgramGuessAccount(programIdl, accountInfo.data);
  if (accountIdl === undefined) {
    throw new Error(
      `No account type found in IDL for program ${programAddress} matching data ${accountInfo.data.slice(0, 8)} (length ${accountInfo.data.length})`,
    );
  }
  const state = idlAccountDecode(accountIdl, accountInfo.data);
  return { accountIdl, state };
}

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
