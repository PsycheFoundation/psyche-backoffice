import {
  jsonCodecInteger,
  jsonCodecNumber,
  jsonCodecObject,
  jsonCodecPubkey,
} from "solana-kiss";

export const jsonCodec = jsonCodecObject({
  bump: jsonCodecNumber,
  index: jsonCodecInteger,
  mainAuthority: jsonCodecPubkey,
  joinAuthority: jsonCodecPubkey,
  coordinatorAccount: jsonCodecPubkey,
  coordinatorInstance: jsonCodecPubkey,
  collateralMint: jsonCodecPubkey,
  totalClaimedCollateralAmount: jsonCodecInteger,
  totalClaimedEarnedPoints: jsonCodecInteger,
});
