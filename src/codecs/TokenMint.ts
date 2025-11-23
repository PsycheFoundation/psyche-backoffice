import {
  JsonCodecContent,
  jsonCodecBigInt,
  jsonCodecBoolean,
  jsonCodecNullable,
  jsonCodecNumber,
  jsonCodecObjectToObject,
  jsonCodecPubkey,
} from "solana-kiss";

export type JsonContent = JsonCodecContent<typeof jsonCodec>;

export const jsonCodec = jsonCodecObjectToObject({
  mintAuthority: jsonCodecNullable(jsonCodecPubkey),
  supply: jsonCodecBigInt,
  decimals: jsonCodecNumber,
  isInitialized: jsonCodecBoolean,
  freezeAuthority: jsonCodecNullable(jsonCodecPubkey),
});
