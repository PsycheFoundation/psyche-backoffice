import {
  jsonCodecInteger,
  jsonCodecNumber,
  jsonCodecObject,
} from "solana-kiss";

export const jsonCodec = jsonCodecObject({
  bump: jsonCodecNumber,
  claimedCollateralAmount: jsonCodecInteger,
  claimedEarnedPoints: jsonCodecInteger,
});
