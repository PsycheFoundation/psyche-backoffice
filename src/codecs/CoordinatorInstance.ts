import {
  jsonCodecNumber,
  jsonCodecObject,
  jsonCodecPubkey,
  jsonCodecString,
} from "solana-kiss";

export const jsonCodec = jsonCodecObject({
  bump: jsonCodecNumber,
  mainAuthority: jsonCodecPubkey,
  joinAuthority: jsonCodecPubkey,
  coordinatorAccount: jsonCodecPubkey,
  runId: jsonCodecString,
});
