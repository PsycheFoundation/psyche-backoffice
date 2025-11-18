
import {jsonCodecPubkey,jsonCodecNullable,jsonCodecInteger,jsonCodecNumber,jsonCodecBoolean,jsonCodecObject} from "solana-kiss";

export const jsonCodec = jsonCodecObject({mintAuthority:jsonCodecNullable(jsonCodecPubkey),supply:jsonCodecInteger,decimals:jsonCodecNumber,isInitialized:jsonCodecBoolean,freezeAuthority:jsonCodecNullable(jsonCodecPubkey)});

