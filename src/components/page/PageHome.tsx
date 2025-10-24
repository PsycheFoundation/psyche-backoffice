import * as React from "react";
import { useNavigate } from "react-router-dom";

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
import { PageAuthorizerAuthorizationsPath } from "./PageAuthorizerAuthorizations";
import { PageCoordinatorRunPath } from "./PageCoordinatorRun";
import { PageTreasurerRunPath } from "./PageTreasurerRun";
import { rpcHttp } from "./utils";

export function PageHomePath() {
  return "/";
}

export function PageHome() {
  const navigate = useNavigate();

  const [walletProvidersList, setWalletProvidersList] = React.useState<
    Array<WalletProvider>
  >([]);
  React.useEffect(() => {
    walletProvidersDiscover((walletProvider: WalletProvider) => {
      setWalletProvidersList((prevList) => [...prevList, walletProvider]);
    });
  }, []);

  return (
    <>
      <Text h={1} value="Backoffice Dashboards" />
      <Button
        text="Treasurer Run"
        onClick={() => {
          return navigate(PageTreasurerRunPath({}));
        }}
      />
      <Spacing />
      <Button
        text="Coordinator Run"
        onClick={() => {
          return navigate(PageCoordinatorRunPath({}));
        }}
      />
      <Spacing />
      <Button
        text="Authorizer Authorizations"
        onClick={() => {
          return navigate(PageAuthorizerAuthorizationsPath({}));
        }}
      />
      <Spacing />
      <Text h={2} value="Detected Wallet Providers:" />
      {walletProvidersList.map((walletProvider) => (
        <Layout key={walletProvider.name}>
          <Spacing />
          <Button
            text={`Test ${walletProvider.name}`}
            icon={walletProvider.icon}
            onClick={async () => {
              console.log(`Using wallet provider: ${walletProvider.name}`);
              await test(walletProvider);
            }}
          />
        </Layout>
      ))}
    </>
  );
}

async function test(walletProvider: WalletProvider) {
  console.log("Connecting to wallet provider...");

  const walletAccounts = await walletProvider.connect();
  console.log("Connected:", walletAccounts);

  const walletAccount = walletAccounts[0]!;
  console.log("Using wallet account:", walletAccount.address);

  //await testSignMessage(walletAccount);
  await testSignTransaction(walletAccount);
}

async function testSignMessage(walletAccount: WalletAccount) {
  const message = new TextEncoder().encode("Hello, Solana!");
  console.log("Signing message:", message);
  const signedMessage = await walletAccount.signMessage(message);
  console.log("Signed message:", signedMessage);
}

async function testSignTransaction(walletAccount: WalletAccount) {
  const { blockInfo } = await rpcHttpGetLatestBlockHash(rpcHttp);
  const recentBlockHash = blockInfo.hash;
  console.log("recentBlockHash", recentBlockHash);

  const otherSigner = await signerGenerate();
  console.log("otherSigner", otherSigner.address);
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
  console.log("Transaction sent, transactionId:", transactionId);
}
