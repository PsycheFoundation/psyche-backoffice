import {
  JsonCodecContent,
  jsonCodecNumber,
  jsonCodecObjectToObject,
  jsonCodecPubkey,
  jsonCodecString,
} from "solana-kiss";

export type JsonContent = JsonCodecContent<typeof jsonCodec>;

export const jsonCodec = jsonCodecObjectToObject({
  bump: jsonCodecNumber,
  mainAuthority: jsonCodecPubkey,
  joinAuthority: jsonCodecPubkey,
  coordinatorAccount: jsonCodecPubkey,
  runId: jsonCodecString,
});
