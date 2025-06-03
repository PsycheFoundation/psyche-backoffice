import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { PublicKey } from "@solana/web3.js";
import { ToolboxEndpoint, ToolboxIdlService } from "solana_toolbox_web3";
import { Layout } from "../theme/Layout";
import { Spacing } from "../theme/Spacing";
import { ForEach } from "../util/ForEach";

let endpoint = new ToolboxEndpoint("devnet", "confirmed");
let idlService = new ToolboxIdlService();

function findCoordinatorInstance(runId: string, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from([99, 111, 111, 114, 100, 105, 110, 97, 116, 111, 114]),
      Buffer.from(runId, "utf8"),
    ],
    programId,
  )[0];
}

export function PageRunPath() {
  return "/run";
}

export function PageRun() {
  const navigate = useNavigate();

  let [programId, setProgramId] = React.useState(
    "HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y",
  );
  let [runId, setRunId] = React.useState("consilience-40b-1");

  let [coordinatorInstance, setCoordinatorInstance] = React.useState(undefined);
  console.log("coordinatorInstance", coordinatorInstance);
  let [coordinatorAccount, setCoordinatorAccount] = React.useState(undefined);
  console.log("coordinatorAccount", coordinatorAccount);

  React.useEffect(() => {
    const execute = async () => {
      setCoordinatorAccount(undefined);
      setCoordinatorInstance(undefined);
      try {
        let coordinatorInstanceAddress = findCoordinatorInstance(
          runId,
          new PublicKey(programId),
        );
        let coordinatorInstanceDecoded = await idlService.getAndDecodeAccount(
          endpoint,
          coordinatorInstanceAddress,
        );
        setCoordinatorInstance(coordinatorInstanceDecoded.state);
        let coordinatorAccountAddress = new PublicKey(
          coordinatorInstanceDecoded.state["coordinator_account"],
        );
        let coordinatorAccountDecoded = await idlService.getAndDecodeAccount(
          endpoint,
          coordinatorAccountAddress,
        );
        setCoordinatorAccount(coordinatorAccountDecoded.state);
      } catch (error) {
        console.log("error", error);
      }
    };
    execute();
  }, [programId, runId]);

  let runClients = null;

  let coordinatorClients = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.clients",
  );
  if (coordinatorClients) {
    runClients = [];
    let length = Number(coordinatorClients.len);
    let data = coordinatorClients.data;
    for (let i = 0; i < length; i++) {
      let coordinatorClient = data[i];
      runClients.push({
        key: String(coordinatorClient.id.signer),
        active: Number(coordinatorClient.active),
        earned: Number(coordinatorClient.earned),
      });
    }
    runClients.sort((a, b) => b.earned - a.earned);
  }

  return (
    <>
      <Text h={1} value="Rum" />

      <Text h={2} value="Search" />

      <Text h={3} value="ProgramId" />
      <TextInput
        value={programId}
        onChange={(value) => {
          setProgramId(value);
        }}
      />

      <Text h={3} value="RunId" />
      <TextInput
        value={runId}
        onChange={(value) => {
          setRunId(value);
        }}
      />

      <Text h={2} value="Clients" />

      <ForEach
        values={runClients}
        separator={function () {
          return <Spacing />;
        }}
        placeholder={function (isNull) {
          if (isNull) {
            return <Text value="Loading..." />;
          } else {
            return <Text value="Nothing was found..." />;
          }
        }}
        renderer={function (runClient) {
          return (
            <>
              <Layout horizontal bordered centered padded>
                <Layout flexible>
                  <Text value={runClient.key} />
                </Layout>
                <Text value={"active: " + runClient.active} />
                <Spacing />
                <Text value={"Earned: " + runClient.earned} />
              </Layout>
            </>
          );
        }}
      />
    </>
  );
}

function getValueAtPath(obj: any, path: string) {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj,
    );
}
