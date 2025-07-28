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

export function PageCoordinatorRunPath({
  programId,
  runId,
}: {
  programId?: string;
  runId?: string;
}) {
  let searchParams = new URLSearchParams();
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  if (runId !== undefined) {
    searchParams.set("runId", runId);
  }
  return `coordinator?${searchParams.toString()}`;
}

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
  let coordinatorInstance = await idlService.getAndInferAndDecodeAccount(
    endpoint,
    coordinatorInstanceAddress,
  );
  let coordinatorAccountAddress = new PublicKey(
    getValueAtPath(coordinatorInstance.state, "coordinator_account"),
  );
  let coordinatorAccount = await idlService.getAndInferAndDecodeAccount(
    endpoint,
    coordinatorAccountAddress,
  );
  console.log("coordinatorAccount", coordinatorAccount.state);
  return {
    coordinatorInstance: coordinatorInstance.state,
    coordinatorAccount: coordinatorAccount.state,
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

      <Text h={3} value="Progress" />
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
  const [searchParams, setSearchParams] = useSearchParams();

  let filterClientId = searchParams.get("filterClientId") ?? "";
  let filterEpochState = searchParams.get("filterEpochState") ?? "";

  let runClients = [];
  let runClientsLen = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.clients.len",
  );
  let runClientsData = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.clients.data",
  );
  for (let i = 0; i < runClientsLen; i++) {
    let runClient = runClientsData[i];
    runClients.push({
      id: getValueAtPath(runClient, "id.signer"),
      active: getValueAtPath(runClient, "active"),
      earned: getValueAtPath(runClient, "earned"),
      slashed: getValueAtPath(runClient, "slashed"),
    });
  }

  runClients = runClients.filter((runClient) => {
    return runClient.id.includes(filterClientId);
  });

  let epochClients = [];
  let epochClientsLen = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.epoch_state.clients.len",
  );
  let epochClientsData = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.epoch_state.clients.data",
  );
  for (let i = 0; i < epochClientsLen; i++) {
    let epochClient = epochClientsData[i];
    epochClients.push({
      id: getValueAtPath(epochClient, "id.signer"),
      state: getValueAtPath(epochClient, "state"),
    });
  }

  epochClients = epochClients.filter((epochClient) => {
    return epochClient.id.includes(filterClientId);
  });
  epochClients = epochClients.filter((epochClient) => {
    return ("" + epochClient.state)
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
          setSearchParams((searchParams) => {
            searchParams.set("filterClientId", value);
            return searchParams;
          });
        }}
      />

      <Text h={3} value="Epoch State" />
      <TextInput
        value={filterEpochState}
        placeholder={"Filter by epoch state"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("filterEpochState", value);
            return searchParams;
          });
        }}
      />

      <Text h={3} value={`Epoch Clients (x${epochClients.length})`} />
      <Layout bordered>
        <ForEach
          values={epochClients}
          item={(epochClient) => (
            <Layout key={epochClient.id} horizontal>
              <Layout flexible padded>
                <Text value={epochClient.id} />
              </Layout>
              <Line />
              <Layout padded faded>
                <Text value={`State: ${epochClient.state}`} />
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

      <Text h={3} value={`Run Clients (x${runClients.length})`} />
      <Layout bordered>
        <ForEach
          values={runClients}
          item={(runClient) => (
            <Layout key={runClient.id} horizontal>
              <Layout flexible padded>
                <Text value={runClient.id} />
              </Layout>
              <Line />
              <Layout padded>
                <Text value={`Earned: ${runClient.earned}`} />
              </Layout>
              <Line />
              <Layout padded>
                <Text value={`Slashed: ${runClient.slashed}`} />
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
