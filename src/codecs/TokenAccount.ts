import {
  JsonCodecContent,
  jsonCodecBigInt,
  jsonCodecConst,
  jsonCodecNullable,
  jsonCodecObjectToObject,
  jsonCodecPubkey,
} from "solana-kiss";

export type JsonContent = JsonCodecContent<typeof jsonCodec>;

export const jsonCodec = jsonCodecObjectToObject({
  mint: jsonCodecPubkey,
  owner: jsonCodecPubkey,
  amount: jsonCodecBigInt,
  delegate: jsonCodecNullable(jsonCodecPubkey),
  state: jsonCodecConst("Uninitialized", "Initialized", "Frozen"),
  isNative: jsonCodecNullable(jsonCodecBigInt),
  delegatedAmount: jsonCodecBigInt,
  closeAuthority: jsonCodecNullable(jsonCodecPubkey),
});
