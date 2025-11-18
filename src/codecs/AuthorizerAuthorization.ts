import {
  jsonCodecArray,
  jsonCodecBoolean,
  jsonCodecBytesArray,
  jsonCodecInteger,
  jsonCodecNumber,
  jsonCodecObject,
  jsonCodecPubkey,
} from "solana-kiss";

export const jsonCodec = jsonCodecObject({
  bump: jsonCodecNumber,
  grantor: jsonCodecPubkey,
  grantee: jsonCodecPubkey,
  scope: jsonCodecBytesArray,
  active: jsonCodecBoolean,
  delegates: jsonCodecArray(jsonCodecPubkey),
  grantorUpdateUnixTimestamp: jsonCodecInteger,
});
