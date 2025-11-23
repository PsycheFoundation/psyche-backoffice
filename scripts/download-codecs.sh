

npx solana-json-codec -p TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA account-state TokenMint > ./src/codecs/TokenMint.ts
npx solana-json-codec -p TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA account-state TokenAccount > ./src/codecs/TokenAccount.ts

npx solana-json-codec -r devnet -p PsyAUmhpmiUouWsnJdNGFSX8vZ6rWjXjgDPHsgqPGyw account-state Authorization > ./src/codecs/AuthorizerAuthorization.ts

npx solana-json-codec -r devnet -p vVeH6Xd43HAScbxjVtvfwDGqBMaMvNDLsAxwM5WK1pG account-state Participant > ./src/codecs/TreasurerParticipant.ts
npx solana-json-codec -r devnet -p vVeH6Xd43HAScbxjVtvfwDGqBMaMvNDLsAxwM5WK1pG account-state Run > ./src/codecs/TreasurerRun.ts

npx solana-json-codec -r devnet -p HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y account-state CoordinatorAccount > ./src/codecs/CoordinatorAccount.ts
npx solana-json-codec -r devnet -p HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y account-state CoordinatorInstance > ./src/codecs/CoordinatorInstance.ts
