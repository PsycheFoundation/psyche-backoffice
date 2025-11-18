
import {jsonCodecPubkey,jsonCodecInteger,jsonCodecNullable,jsonCodecConst,jsonCodecObject} from "solana-kiss";

export const jsonCodec = jsonCodecObject({mint:jsonCodecPubkey,owner:jsonCodecPubkey,amount:jsonCodecInteger,delegate:jsonCodecNullable(jsonCodecPubkey),state:jsonCodecConst("Uninitialized","Initialized","Frozen"),isNative:jsonCodecNullable(jsonCodecInteger),delegatedAmount:jsonCodecInteger,closeAuthority:jsonCodecNullable(jsonCodecPubkey)});

