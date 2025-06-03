import * as React from "react";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { PublicKey } from "@solana/web3.js";
import { ToolboxEndpoint, ToolboxIdlService } from "solana_toolbox_web3";
import { Layout } from "../theme/Layout";
import { ForEach } from "../util/ForEach";

let endpoint = new ToolboxEndpoint("devnet", "confirmed");
let idlService = new ToolboxIdlService();

export function PageAuthPath() {
  return "/auth";
}

export function PageAuth() {
  let [programId, setProgramId] = React.useState(
    "PsyAUmhpmiUouWsnJdNGFSX8vZ6rWjXjgDPHsgqPGyw",
  );
  let [grantor, setGrantor] = React.useState("");
  let [grantee, setGrantee] = React.useState("");

  let [auths, setAuths] = React.useState([]);
  console.log("auths", auths);

  React.useEffect(() => {
    const execute = async () => {
      try {
        let programAddresses = await endpoint.searchAddresses(
          new PublicKey(programId),
        );
        let newAuths = [];
        for (let programAddress of programAddresses) {
          console.log("programAddress", programAddress);
          try {
            let programAccountDecoded = await idlService.getAndDecodeAccount(
              endpoint,
              programAddress,
            );
            console.log("programAccountDecoded", programAccountDecoded);
            if (programAccountDecoded.account.name === "Authorization") {
              console.log(
                "programAccountDecoded.account.name",
                programAccountDecoded.account.name,
              );
              newAuths.push({
                grantor: programAccountDecoded.state.grantor,
                grantee: programAccountDecoded.state.grantee,
                delegates: programAccountDecoded.state.delegates,
              });
            }
          } catch (error) {
            console.log("auth decode error", error);
          }
        }
        console.log("newAuths", newAuths);
        setAuths(newAuths as any);
      } catch (error) {
        console.log("error", error);
      }
    };
    execute();
  }, [programId]);

  return (
    <>
      <Text h={1} value="Auth" />

      <Text h={2} value="Search" />

      <Text h={3} value="ProgramId" />
      <TextInput
        value={programId}
        onChange={(value) => {
          setProgramId(value);
        }}
      />

      <Text h={3} value="Grantor" />
      <TextInput
        value={grantor}
        onChange={(value) => {
          setGrantor(value);
        }}
      />

      <Text h={3} value="Grantee" />
      <TextInput
        value={grantee}
        onChange={(value) => {
          setGrantee(value);
        }}
      />

      <Text h={2} value="Results" />

      <ForEach
        values={auths}
        renderer={(auth: any) => {
          return (
            <>
              <Layout bordered>
                <Text value={auth.grantor} />
                <Text value={auth.grantee} />
                <Text value={auth.delegates} />
              </Layout>
            </>
          );
        }}
      />
    </>
  );
}
