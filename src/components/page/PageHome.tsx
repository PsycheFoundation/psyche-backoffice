import * as React from "react";
import { useNavigate } from "react-router-dom";

import { pubkeyFromBase58, signatureFromBytes } from "solana-kiss";
import { Button } from "../theme/Button";
import { Spacing } from "../theme/Spacing";
import { Text } from "../theme/Text";
import { PageAuthorizerAuthorizationsPath } from "./PageAuthorizerAuthorizations";
import { PageCoordinatorRunPath } from "./PageCoordinatorRun";
import { PageTreasurerRunPath } from "./PageTreasurerRun";

export function PageHomePath() {
  return "/";
}

export function PageHome() {
  const navigate = useNavigate();

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
      <Button
        text="Test"
        onClick={() => {
          test();
        }}
      />
    </>
  );
}

async function test() {
  console.log("test");
  const phantom = (globalThis.window as any).phantom;
  console.log("phantom", phantom);
  if (phantom) {
    //const dada = await phantom.solana.connect();
    //console.log("dada", dada, dada.publicKey.toString());
    console.log("phantom.solana.isConnected", phantom.solana.isConnected);
    const dodo = await phantom.solana.signMessage(
      new TextEncoder().encode("Hello, world!"),
      "utf8",
    );
    console.log("dodo", dodo);
    console.log("dodo.publicKey", pubkeyFromBase58(dodo.publicKey.toBase58()));
    console.log("dodo.signature", signatureFromBytes(dodo.signature));
    const dudu = await phantom.solana.signIn({ test: true });
    console.log("dudu", dudu);
    console.log(
      "dudu.signedMessage",
      new TextDecoder().decode(dudu.signedMessage),
    );
  }
}
