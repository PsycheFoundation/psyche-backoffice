import {
  JsonCodecContent,
  jsonCodecBigInt,
  jsonCodecNumber,
  jsonCodecObjectToObject,
  jsonCodecPubkey,
} from "solana-kiss";

export type JsonContent = JsonCodecContent<typeof jsonCodec>;

export const jsonCodec = jsonCodecObjectToObject({
  bump: jsonCodecNumber,
  index: jsonCodecBigInt,
  mainAuthority: jsonCodecPubkey,
  joinAuthority: jsonCodecPubkey,
  coordinatorAccount: jsonCodecPubkey,
  coordinatorInstance: jsonCodecPubkey,
  collateralMint: jsonCodecPubkey,
  totalClaimedCollateralAmount: jsonCodecBigInt,
  totalClaimedEarnedPoints: jsonCodecBigInt,
});
