import * as React from "react";

import {
  pubkeyFromBase58,
  rpcHttpGetLatestBlockHash,
  rpcHttpSendTransaction,
  signerGenerate,
  transactionCompileAndSign,
  WalletAccount,
  WalletProvider,
  walletProvidersDiscover,
} from "solana-kiss";
import { Button } from "../theme/Button";
import { Layout } from "../theme/Layout";
import { Spacing } from "../theme/Spacing";
import { Text } from "../theme/Text";
import { rpcHttp } from "./utils";

export function PageWalletsPath() {
  return "/wallets";
}

export function PageWallets() {
  const [walletProvidersLogs, setWalletProvidersLogs] = React.useState<
    Array<[Date, string]>
  >([]);

  const [walletProvidersList, setWalletProvidersList] = React.useState<
    Array<WalletProvider>
  >([]);
  React.useEffect(() => {
    walletProvidersDiscover((walletProvider: WalletProvider) => {
      setWalletProvidersList((prevList) => [...prevList, walletProvider]);
      setWalletProvidersLogs((logs) => [
        ...logs,
        [new Date(), `Discovered wallet provider ${walletProvider.name}`],
      ]);
    });
  }, []);

  return (
    <>
      <Text h={1} value="Detected Wallet Providers:" />
      {walletProvidersList.map((walletProvider) => (
        <Layout key={walletProvider.name}>
          <Spacing />
          <Layout horizontal>
            <Layout>
              <Button
                icon={walletProvider.icon}
                text={` - test SignMessage`}
                onClick={async () => {
                  await testSignMessage(walletProvider, setWalletProvidersLogs);
                }}
              />
            </Layout>
            <Spacing />
            <Layout flexible>
              <Button
                icon={walletProvider.icon}
                text={` - test SignTransaction (devnet send)`}
                onClick={async () => {
                  await testSignTransaction(
                    walletProvider,
                    setWalletProvidersLogs,
                  );
                }}
              />
            </Layout>
          </Layout>
        </Layout>
      ))}
      <Spacing />
      <Text h={2} value="Wallet Providers Logs:" />
      {walletProvidersLogs.map((log, index) => (
        <Layout key={index}>
          <Text value={log[0].toLocaleString()} />
          <Layout bordered padded>
            <Text value={`- ${log[1]}`} />
          </Layout>
          <Spacing />
        </Layout>
      ))}
    </>
  );
}

async function getWalletAccount(
  walletProvider: WalletProvider,
  setWalletProvidersLogs: React.Dispatch<
    React.SetStateAction<Array<[Date, string]>>
  >,
): Promise<WalletAccount> {
  const walletAccounts = await walletProvider.connect();
  if (walletAccounts.length === 0) {
    throw new Error("No wallet accounts available");
  }
  setWalletProvidersLogs((logs) => [
    ...logs,
    [
      new Date(),
      `Connected to wallet provider ${walletProvider.name}, found ${walletAccounts.map((account) => account.address).join(", ")} account(s)`,
    ],
  ]);
  return walletAccounts[0]!;
}

async function testSignMessage(
  walletProvider: WalletProvider,
  setWalletProvidersLogs: React.Dispatch<
    React.SetStateAction<Array<[Date, string]>>
  >,
) {
  const walletAccount = await getWalletAccount(
    walletProvider,
    setWalletProvidersLogs,
  );
  const message = new TextEncoder().encode("Hello, Solana!");
  const signedMessage = await walletAccount.signMessage(message);
  setWalletProvidersLogs((logs) => [
    ...logs,
    [
      new Date(),
      `Signed message with wallet account ${walletAccount.address}: ${signedMessage}`,
    ],
  ]);
}

async function testSignTransaction(
  walletProvider: WalletProvider,
  setWalletProvidersLogs: React.Dispatch<
    React.SetStateAction<Array<[Date, string]>>
  >,
) {
  const walletAccount = await getWalletAccount(
    walletProvider,
    setWalletProvidersLogs,
  );
  const { blockInfo } = await rpcHttpGetLatestBlockHash(rpcHttp);
  const recentBlockHash = blockInfo.hash;
  const otherSigner = await signerGenerate();
  const transactionPacketUnsigned = await transactionCompileAndSign(
    [otherSigner],
    {
      payerAddress: walletAccount.address,
      recentBlockHash,
      instructions: [
        {
          programAddress: pubkeyFromBase58(
            "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
          ),
          inputs: [
            { address: otherSigner.address, signer: true, writable: false },
          ],
          data: new Uint8Array([]),
        },
      ],
    },
  );
  const transactionPacketSigned = await walletAccount.signTransaction(
    transactionPacketUnsigned,
  );
  const { transactionId } = await rpcHttpSendTransaction(
    rpcHttp,
    transactionPacketSigned,
  );
  setWalletProvidersLogs((logs) => [
    ...logs,
    [new Date(), `Transaction sent, transactionId: ${transactionId}`],
  ]);
}
