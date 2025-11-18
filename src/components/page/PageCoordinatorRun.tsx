import * as React from "react";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { useSearchParams } from "react-router-dom";
import {
  JsonCodecContent,
  pubkeyFindPdaAddress,
  pubkeyFromBase58,
} from "solana-kiss";
import { jsonCodec as jsonCodecCoordinatorAccount } from "../../codecs/CoordinatorAccount";
import { jsonCodec as jsonCodecCoordinatorInstance } from "../../codecs/CoordinatorInstance";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { ForEach } from "../util/ForEach";
import { Promised } from "../util/Promised";
import { solana } from "./utils";

export function PageCoordinatorRunPath({
  programAddress,
  runId,
}: {
  programAddress?: string;
  runId?: string;
}) {
  let searchParams = new URLSearchParams();
  if (programAddress !== undefined) {
    searchParams.set("programAddress", programAddress);
  }
  if (runId !== undefined) {
    searchParams.set("runId", runId);
  }
  return `coordinator?${searchParams.toString()}`;
}

export function PageCoordinatorRun() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programAddress =
    searchParams.get("programAddress") ??
    "HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y";

  let runId = searchParams.get("runId") ?? "consilience-40b-1";

  return (
    <>
      <Text h={1} value="Coordinator Run" />

      <Text h={2} value="Find" />

      <Text h={3} value="Program Id" />
      <TextInput
        value={programAddress}
        placeholder={"Specify the programAddress"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("programAddress", value);
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
          () => PageCoordinatorRunLoader({ programAddress, runId }),
          [programAddress, runId],
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
  programAddress,
  runId,
}: {
  programAddress: string;
  runId: string;
}) {
  let coordinatorInstanceAddress = pubkeyFindPdaAddress(
    pubkeyFromBase58(programAddress),
    [new TextEncoder().encode("coordinator"), new TextEncoder().encode(runId)],
  );
  let { accountState: coordinatorInstanceAccountState } =
    await solana.getAndInferAndDecodeAccount(coordinatorInstanceAddress);
  const coordinatorInstanceDecoded = jsonCodecCoordinatorInstance.decoder(
    coordinatorInstanceAccountState,
  );
  let { accountState: coordinatorAccountAccountState } =
    await solana.getAndInferAndDecodeAccount(
      coordinatorInstanceDecoded.coordinatorAccount,
    );
  const coordinatorAccountDecoded = jsonCodecCoordinatorAccount.decoder(
    coordinatorAccountAccountState,
  );
  console.log("coordinatorInstanceDecoded", coordinatorInstanceDecoded);
  console.log("coordinatorAccountDecoded", coordinatorAccountDecoded);
  return {
    coordinatorInstance: coordinatorInstanceDecoded,
    coordinatorAccount: coordinatorAccountDecoded,
  };
}

export function PageCoordinatorRunResults({
  coordinatorInstance,
  coordinatorAccount,
}: {
  coordinatorInstance: JsonCodecContent<typeof jsonCodecCoordinatorInstance>;
  coordinatorAccount: JsonCodecContent<typeof jsonCodecCoordinatorAccount>;
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
  coordinatorInstance: JsonCodecContent<typeof jsonCodecCoordinatorInstance>;
  coordinatorAccount: JsonCodecContent<typeof jsonCodecCoordinatorAccount>;
}) {
  const progressStateStart = new Date(
    Number(coordinatorAccount.state.coordinator.runStateStartUnixTimestamp) *
      1000,
  );
  const progressStateName = coordinatorAccount.state.coordinator.runState;
  const progressEpoch = coordinatorAccount.state.coordinator.progress.epoch;
  const progressStep = coordinatorAccount.state.coordinator.progress.step;
  const earningRatesCurrentEpoch =
    coordinatorAccount.state.clientsState.currentEpochRates.earningRate;
  const earningRatesFutureEpoch =
    coordinatorAccount.state.clientsState.futureEpochRates.earningRate;
  return (
    <>
      <Text h={2} value="Status" />

      <Text h={3} value="Config" />
      <Text value={`- Join Authority: ${coordinatorInstance.joinAuthority}`} />
      <Text value={`- Main Authority: ${coordinatorInstance.mainAuthority}`} />

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
  coordinatorAccount: JsonCodecContent<typeof jsonCodecCoordinatorAccount>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  let filterClientId = searchParams.get("filterClientId") ?? "";
  let filterEpochState = searchParams.get("filterEpochState") ?? "";

  let runClients = [];
  let runClientsLen = coordinatorAccount.state.clientsState.clients.len;
  let runClientsData = coordinatorAccount.state.clientsState.clients.data;
  for (let i = 0; i < runClientsLen; i++) {
    let runClient = runClientsData[i];
    runClients.push({
      id: runClient.id.signer,
      active: runClient.active,
      earned: runClient.earned,
      slashed: runClient.slashed,
    });
  }

  runClients = runClients.filter((runClient) => {
    return runClient.id.toString().includes(filterClientId);
  });

  let epochClients = [];
  let epochClientsLen =
    coordinatorAccount.state.coordinator.epochState.clients.len;
  let epochClientsData =
    coordinatorAccount.state.coordinator.epochState.clients.data;
  for (let i = 0; i < epochClientsLen; i++) {
    let epochClient = epochClientsData[i];
    epochClients.push({
      id: epochClient.id.signer,
      state: epochClient.state,
    });
  }

  epochClients = epochClients.filter((epochClient) => {
    return epochClient.id.toString().includes(filterClientId);
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
            <Layout key={"" + epochClient.id} horizontal>
              <Layout flexible padded>
                <Text value={"" + epochClient.id} />
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
            <Layout key={"" + runClient.id} horizontal>
              <Layout flexible padded>
                <Text value={"" + runClient.id} />
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
