import * as React from "react";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { PublicKey } from "@solana/web3.js";
import { useSearchParams } from "react-router-dom";
import { ToolboxEndpoint, ToolboxIdlService } from "solana_toolbox_web3";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
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

export function PageCoordinatorClientsPath(runId?: string, programId?: string) {
  let searchParams = new URLSearchParams();
  if (runId !== undefined) {
    searchParams.set("runId", runId);
  }
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  return `coordinator/clients?${searchParams.toString()}`;
}

export function PageCoordinatorClients() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y";
  let runId = searchParams.get("runId") ?? "consilience-40b-1";

  let [filterClientId, setFilterClientId] = React.useState("");
  let [filterEpochState, setFilterEpochState] = React.useState("");

  let [coordinatorInstance, setCoordinatorInstance] = React.useState(undefined);
  console.log("coordinatorInstance", coordinatorInstance);
  let [coordinatorAccount, setCoordinatorAccount] = React.useState(undefined);
  console.log("coordinatorAccount", coordinatorAccount);

  React.useEffect(() => {
    const execute = async () => {
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
          getValueAtPath(
            coordinatorInstanceDecoded.state,
            "coordinator_account",
          ),
        );
        let coordinatorAccountDecoded = await idlService.getAndDecodeAccount(
          endpoint,
          coordinatorAccountAddress,
        );
        setCoordinatorAccount(coordinatorAccountDecoded.state);
      } catch (error) {
        console.log("error", error);
        setCoordinatorAccount(undefined);
        setCoordinatorInstance(undefined);
      }
    };
    execute();
  }, [programId, runId]);

  let clientsInfoBySignerKey = new Map();

  let runClientsLen = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.clients.len",
  );
  if (runClientsLen) {
    let runClientsData = getValueAtPath(
      coordinatorAccount,
      "state.clients_state.clients.data",
    );
    for (let i = 0; i < runClientsLen; i++) {
      let runClient = runClientsData[i];
      let runClientId = getValueAtPath(runClient, "id.signer");
      clientsInfoBySignerKey.set(runClientId, {
        active: getValueAtPath(runClient, "active"),
        earned: getValueAtPath(runClient, "earned"),
      });
    }
  }

  let coordinatorEpochClientsLen = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.epoch_state.clients.len",
  );
  if (coordinatorEpochClientsLen) {
    let coordinatorEpochClientsData = getValueAtPath(
      coordinatorAccount,
      "state.coordinator.epoch_state.clients.data",
    );
    for (let i = 0; i < coordinatorEpochClientsLen; i++) {
      let coordinatorEpochClient = coordinatorEpochClientsData[i];
      let coordinatorEpochClientId = getValueAtPath(
        coordinatorEpochClient,
        "id.signer",
      );
      clientsInfoBySignerKey.set(coordinatorEpochClientId, {
        ...(clientsInfoBySignerKey.get(coordinatorEpochClientId) ?? {}),
        state: getValueAtPath(coordinatorEpochClient, "state"),
      });
    }
  }

  let displayClients: any[] = [];
  clientsInfoBySignerKey.forEach((clientInfo, signerKey) => {
    displayClients.push({
      id: signerKey,
      info: clientInfo,
    });
  });

  displayClients = displayClients.filter((value) => {
    return value.id.includes(filterClientId);
  });
  displayClients = displayClients.filter((value) => {
    return ("" + value.info.state)
      .toLocaleLowerCase()
      .includes(filterEpochState.toLocaleLowerCase());
  });

  return (
    <>
      <Text h={1} value="Coordinator Run Inspection" />

      <Text h={2} value="Find Run" />

      <Text h={3} value="ProgramId" />
      <TextInput
        value={programId}
        placeholder={"Specify the programId"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("programId", value);
            return searchParams;
          });
        }}
      />

      <Text h={3} value="RunId" />
      <TextInput
        value={runId}
        placeholder={"Specify the runId"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("runId", value);
            return searchParams;
          });
        }}
      />

      <Text h={2} value="Run Clients" />

      <Text h={3} value="ClientId" />
      <TextInput
        value={filterClientId}
        placeholder={"Filter by client Id"}
        onChange={(value) => {
          setFilterClientId(value);
        }}
      />

      <Text h={3} value="Epoch State" />
      <TextInput
        value={filterEpochState}
        placeholder={"Filter by epoch state"}
        onChange={(value) => {
          setFilterEpochState(value);
        }}
      />

      <Text h={3} value={`Matching Client List (x${displayClients.length})`} />
      <Layout bordered>
        <ForEach
          values={displayClients}
          separator={function (index) {
            return <Line key={index} />;
          }}
          placeholder={function () {
            return (
              <Layout padded centered>
                <Text value="Nothing to show" />
              </Layout>
            );
          }}
          renderer={function (client) {
            return (
              <>
                <Layout key={client.id} horizontal>
                  <Layout padded faded>
                    <Text value={`State: ${client.info.state}`} />
                  </Layout>
                  <Line />
                  <Layout flexible padded>
                    <Text value={client.id} />
                  </Layout>
                  <Line />
                  <Layout padded>
                    <Text value={`Earned: ${client.info.earned}`} />
                  </Layout>
                </Layout>
              </>
            );
          }}
        />
      </Layout>
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
