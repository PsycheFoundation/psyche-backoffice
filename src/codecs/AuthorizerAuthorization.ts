import {
  JsonCodecContent,
  jsonCodecArrayToArray,
  jsonCodecArrayToBytes,
  jsonCodecBigInt,
  jsonCodecBoolean,
  jsonCodecNumber,
  jsonCodecObjectToObject,
  jsonCodecPubkey,
} from "solana-kiss";

export type JsonContent = JsonCodecContent<typeof jsonCodec>;

export const jsonCodec = jsonCodecObjectToObject({
  bump: jsonCodecNumber,
  grantor: jsonCodecPubkey,
  grantee: jsonCodecPubkey,
  scope: jsonCodecArrayToBytes,
  active: jsonCodecBoolean,
  delegates: jsonCodecArrayToArray(jsonCodecPubkey),
  grantorUpdateUnixTimestamp: jsonCodecBigInt,
});
