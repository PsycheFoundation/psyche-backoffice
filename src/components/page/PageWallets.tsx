import * as React from "react";

import {
  pubkeyFromBase58,
  signerGenerate,
  WalletAccount,
  WalletProvider,
  walletProviders,
} from "solana-kiss";
import { Button } from "../theme/Button";
import { Image } from "../theme/Image";
import { Layout } from "../theme/Layout";
import { Spacing } from "../theme/Spacing";
import { Text } from "../theme/Text";
import { service } from "./utils";

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
    const unsubscriber = walletProviders.subscribe(
      (walletProviders: Array<WalletProvider>) => {
        appendLog(
          setWalletProvidersLogs,
          `Wallet providers changed: ${walletProviders
            .map((wp) => wp.name)
            .join(", ")}`,
        );
        setWalletProvidersList([...walletProviders]);
        for (const walletProvider of walletProviders) {
          walletProvider.accounts.subscribe((newAccounts) => {
            appendLog(
              setWalletProvidersLogs,
              `Wallet provider ${walletProvider.name} accounts changed: ${newAccounts
                .map((a) => a.address)
                .join(", ")}`,
            );
          });
        }
      },
    );
  }, []);

  return (
    <>
      <Text h={1} value="Detected Wallet Providers:" />
      {walletProvidersList.map((walletProvider) => (
        <Layout key={walletProvider.name}>
          <Spacing />
          <Layout horizontal>
            <Image src={walletProvider.icon} size={{ x: 40, y: 40 }} />
            <Spacing />
            <Layout>
              <Button
                text={`Connect`}
                onClick={async () => {
                  await walletProvider.connect();
                }}
              />
            </Layout>
            <Spacing />
            <Layout>
              <Button
                text={`Disconnect`}
                onClick={async () => {
                  await walletProvider.disconnect();
                }}
              />
            </Layout>
            <Spacing />
            <Layout>
              <Button
                text={`SignMessage`}
                onClick={async () => {
                  await testSignMessage(walletProvider, setWalletProvidersLogs);
                }}
              />
            </Layout>
            <Spacing />
            <Layout flexible>
              <Button
                text={`SignTransaction`}
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
      <Button
        text="Clear Logs"
        onClick={() => {
          setWalletProvidersLogs([]);
        }}
      />
      <Spacing />
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
  const walletAccounts = await walletProvider.connect({ silent: true });
  appendLog(
    setWalletProvidersLogs,
    `Connected to wallet provider ${walletProvider.name}, accounts: ${walletAccounts
      .map((a) => a.address)
      .join(", ")}`,
  );
  const walletAccount = walletAccounts[0];
  if (!walletAccount) {
    throw new Error("No wallet accounts available");
  }
  return walletAccount;
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
  appendLog(
    setWalletProvidersLogs,
    `Signed message with wallet account ${walletAccount.address}: ${signedMessage}`,
  );
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
  const otherSigner = await signerGenerate();
  const instructions = [
    {
      programAddress: pubkeyFromBase58(
        "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
      ),
      inputs: [{ address: otherSigner.address, signer: true, writable: false }],
      data: new Uint8Array([]),
    },
  ];
  const { transactionHandle } = await service.prepareAndSendTransaction(
    walletAccount,
    instructions,
    {
      extraSigners: [otherSigner],
    },
  );
  appendLog(
    setWalletProvidersLogs,
    `Transaction sent ${walletProvider.name}: transactionHandle: ${transactionHandle}`,
  );
}

function appendLog(
  setWalletProvidersLogs: React.Dispatch<
    React.SetStateAction<Array<[Date, string]>>
  >,
  message: string,
) {
  setWalletProvidersLogs((logs) => [...logs, [new Date(), message]]);
}
