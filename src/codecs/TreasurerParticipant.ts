import {
  JsonCodecContent,
  jsonCodecBigInt,
  jsonCodecNumber,
  jsonCodecObjectToObject,
} from "solana-kiss";

export type JsonContent = JsonCodecContent<typeof jsonCodec>;

export const jsonCodec = jsonCodecObjectToObject({
  bump: jsonCodecNumber,
  claimedCollateralAmount: jsonCodecBigInt,
  claimedEarnedPoints: jsonCodecBigInt,
});
