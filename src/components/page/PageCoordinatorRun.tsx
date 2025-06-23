import * as React from "react";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { PublicKey } from "@solana/web3.js";
import { useSearchParams } from "react-router-dom";
import { ToolboxEndpoint, ToolboxIdlService } from "solana_toolbox_web3";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { ForEach } from "../util/ForEach";
import { Promised } from "../util/Promised";

let endpoint = new ToolboxEndpoint("devnet", "confirmed");
let idlService = new ToolboxIdlService();

export function PageCoordinatorRun() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y";

  let runId = searchParams.get("runId") ?? "consilience-40b-1";

  return (
    <>
      <Text h={1} value="Coordinator Run" />

      <Text h={2} value="Find" />

      <Text h={3} value="Program Id" />
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

      <Text h={3} value="Run Id" />
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

      <Promised
        value={React.useMemo(
          () => PageCoordinatorRunLoader({ programId, runId }),
          [programId, runId],
        )}
        resolved={({ coordinatorInstance, coordinatorAccount }) => (
          <PageCoordinatorRunResults
            coordinatorInstance={coordinatorInstance}
            coordinatorAccount={coordinatorAccount}
          />
        )}
        rejected={(error) => (
          <Layout padded>
            <Text value={`Error: ${error}`} />
          </Layout>
        )}
        pending={() => (
          <Layout padded centered>
            <Text value={`Loading ...`} />
          </Layout>
        )}
      />
    </>
  );
}

export function PageCoordinatorRunPath(runId?: string, programId?: string) {
  let searchParams = new URLSearchParams();
  if (runId !== undefined) {
    searchParams.set("runId", runId);
  }
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  return `coordinator?${searchParams.toString()}`;
}

export async function PageCoordinatorRunLoader({
  programId,
  runId,
}: {
  programId: string;
  runId: string;
}) {
  let coordinatorInstanceAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("coordinator", "utf8"), Buffer.from(runId, "utf8")],
    new PublicKey(programId),
  )[0];
  let coordinatorInstanceInfo = await idlService.getAndDecodeAccount(
    endpoint,
    coordinatorInstanceAddress,
  );
  let coordinatorAccountAddress = new PublicKey(
    getValueAtPath(coordinatorInstanceInfo.state, "coordinator_account"),
  );
  let coordinatorAccountInfo = await idlService.getAndDecodeAccount(
    endpoint,
    coordinatorAccountAddress,
  );
  return {
    coordinatorInstance: coordinatorInstanceInfo.state,
    coordinatorAccount: coordinatorAccountInfo.state,
  };
}

export function PageCoordinatorRunResults({
  coordinatorInstance,
  coordinatorAccount,
}: {
  coordinatorInstance: any;
  coordinatorAccount: any;
}) {
  return (
    <>
      <PageCoordinatorRunResultsStatus
        coordinatorInstance={coordinatorInstance}
        coordinatorAccount={coordinatorAccount}
      />
      <PageCoordinatorRunResultsClients
        coordinatorAccount={coordinatorAccount}
      />
    </>
  );
}

export function PageCoordinatorRunResultsStatus({
  coordinatorInstance,
  coordinatorAccount,
}: {
  coordinatorInstance: any;
  coordinatorAccount: any;
}) {
  let configJoinAuthority = getValueAtPath(
    coordinatorInstance,
    "join_authority",
  );
  let configMainAuthority = getValueAtPath(
    coordinatorInstance,
    "main_authority",
  );

  let progressStateName = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.run_state",
  );
  let progressStateStart = new Date(
    Number(
      getValueAtPath(
        coordinatorAccount,
        "state.coordinator.run_state_start_unix_timestamp",
      ),
    ) * 1000,
  );

  let progressEpoch = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.progress.epoch",
  );
  let progressStep = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.progress.step",
  );

  let earningRatesCurrentEpoch = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.current_epoch_rates.earning_rate",
  );
  let earningRatesFutureEpoch = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.future_epoch_rates.earning_rate",
  );

  return (
    <>
      <Text h={2} value="Status" />

      <Text h={3} value="Config" />
      <Text value={`- Join Authority: ${configJoinAuthority}`} />
      <Text value={`- Main Authority: ${configMainAuthority}`} />

      <Text h={3} value="Progress Info" />
      <Text value={`- State Start: ${progressStateStart}`} />
      <Text value={`- State Name: ${progressStateName}`} />
      <Text value={`- Progress Epoch Number: ${progressEpoch}`} />
      <Text value={`- Progress Step Number: ${progressStep}`} />

      <Text h={3} value="Earning Rates" />
      <Text value={`- Current Epoch: ${earningRatesCurrentEpoch}`} />
      <Text value={`- Future Epoch: ${earningRatesFutureEpoch}`} />
    </>
  );
}

export function PageCoordinatorRunResultsClients({
  coordinatorAccount,
}: {
  coordinatorAccount: any;
}) {
  let [filterClientId, setFilterClientId] = React.useState("");
  let [filterEpochState, setFilterEpochState] = React.useState("");

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
      <Text h={2} value="Clients" />

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

      <Text h={3} value={`Clients (x${displayClients.length})`} />
      <Layout bordered>
        <ForEach
          values={displayClients}
          item={(client) => (
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
          )}
          separator={(index) => <Line key={index} />}
          placeholder={() => (
            <Layout padded centered>
              <Text value="Nothing to show" />
            </Layout>
          )}
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
