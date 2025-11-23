import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { pubkeyFromBase58 } from "solana-kiss";
import {
  JsonContent as JsonContentCoordinatorAccount,
  jsonCodec as jsonCodecCoordinatorAccount,
} from "../../codecs/CoordinatorAccount";
import {
  JsonContent as JsonContentTokenAccount,
  jsonCodec as jsonCodecTokenAccount,
} from "../../codecs/TokenAccount";
import {
  JsonContent as JsonContentTreasurerRun,
  jsonCodec as jsonCodecTreasurerRun,
} from "../../codecs/TreasurerRun";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";
import { ForEach } from "../util/ForEach";
import { Promised } from "../util/Promised";
import { ataProgramAddress, solana } from "./utils";

export function PageTreasurerRunPath({
  programAddress,
  runIdOrIndex,
}: {
  programAddress?: string;
  runIdOrIndex?: string;
}) {
  let searchParams = new URLSearchParams();
  if (programAddress !== undefined) {
    searchParams.set("programAddress", programAddress);
  }
  if (runIdOrIndex !== undefined) {
    searchParams.set("runIdOrIndex", runIdOrIndex);
  }
  return `treasurer?${searchParams.toString()}`;
}

export function PageTreasurerRun() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programAddress =
    searchParams.get("programAddress") ??
    "vVeH6Xd43HAScbxjVtvfwDGqBMaMvNDLsAxwM5WK1pG";

  let runIdOrIndex = searchParams.get("runIdOrIndex") ?? "12345";

  return (
    <>
      <Text h={1} value="Treasurer Run" />

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

      <Text h={3} value="Run Id Or Index" />
      <TextInput
        value={runIdOrIndex}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("runIdOrIndex", value);
            return searchParams;
          });
        }}
      />

      <Promised
        value={React.useMemo(
          () =>
            PageTreasurerRunLoader({
              programAddress,
              runIdOrIndex,
            }),
          [programAddress, runIdOrIndex],
        )}
        resolved={({
          treasurerRun,
          treasurerRunCollateral,
          coordinatorAccount,
        }) => (
          <PageTreasurerRunResults
            treasurerRun={treasurerRun}
            treasurerRunCollateral={treasurerRunCollateral}
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

export async function PageTreasurerRunLoader({
  programAddress,
  runIdOrIndex,
}: {
  programAddress: string;
  runIdOrIndex: string;
}) {
  let runIndex = BigInt(0);
  try {
    runIndex = BigInt(runIdOrIndex);
  } catch (error) {
    runIndex = await runIdToTreasurerIndex(runIdOrIndex);
  }
  const {
    instructionAddresses: { run: treasurerRunAddress },
  } = await solana.hydrateInstructionAddresses(
    pubkeyFromBase58(programAddress),
    "run_create",
    { instructionPayload: { params: { index: String(runIndex) } } },
  );
  console.log("treasurerRunAddress", treasurerRunAddress);
  let { accountState: treasurerRunState } =
    await solana.getAndInferAndDecodeAccount(treasurerRunAddress);
  const treasurerRunDecoded = jsonCodecTreasurerRun.decoder(treasurerRunState);
  console.log("treasurerRunDecoded", treasurerRunDecoded);
  const {
    instructionAddresses: { ata: treasurerRunCollateralAddress },
  } = await solana.hydrateInstructionAddresses(ataProgramAddress, "create", {
    instructionAddresses: {
      owner: treasurerRunAddress,
      mint: treasurerRunDecoded.collateralMint,
    },
  });
  console.log("treasurerRunCollateralAddress", treasurerRunCollateralAddress);
  let { accountState: treasurerRunCollateralState } =
    await solana.getAndInferAndDecodeAccount(treasurerRunCollateralAddress);
  const treasurerRunCollateralDecoded = jsonCodecTokenAccount.decoder(
    treasurerRunCollateralState,
  );
  console.log("treasurerRunCollateralDecoded", treasurerRunCollateralDecoded);
  let { accountState: coordinatorAccountState } =
    await solana.getAndInferAndDecodeAccount(
      treasurerRunDecoded.coordinatorAccount,
    );
  const coordinatorAccounDecoded = jsonCodecCoordinatorAccount.decoder(
    coordinatorAccountState,
  );
  return {
    treasurerRun: treasurerRunDecoded,
    treasurerRunCollateral: treasurerRunCollateralDecoded,
    coordinatorAccount: coordinatorAccounDecoded,
  };
}

export function PageTreasurerRunResults({
  treasurerRun,
  treasurerRunCollateral,
  coordinatorAccount,
}: {
  treasurerRun: JsonContentTreasurerRun;
  treasurerRunCollateral: JsonContentTokenAccount;
  coordinatorAccount: JsonContentCoordinatorAccount;
}) {
  return (
    <>
      <PageTreasurerRunResultsStatus
        treasurerRun={treasurerRun}
        treasurerRunCollateral={treasurerRunCollateral}
        coordinatorAccount={coordinatorAccount}
      />
      <PageTreasurerRunResultsClients coordinatorAccount={coordinatorAccount} />
    </>
  );
}

export function PageTreasurerRunResultsStatus({
  treasurerRun,
  treasurerRunCollateral,
  coordinatorAccount,
}: {
  treasurerRun: JsonContentTreasurerRun;
  treasurerRunCollateral: JsonContentTokenAccount;
  coordinatorAccount: JsonContentCoordinatorAccount;
}) {
  let configJoinAuthority = treasurerRun.joinAuthority;
  let configMainAuthority = treasurerRun.mainAuthority;
  let configCollateralMint = treasurerRun.collateralMint;

  let earningRatesCurrentEpoch =
    coordinatorAccount.state.clientsState.currentEpochRates.earningRate;
  let earningRatesFutureEpoch =
    coordinatorAccount.state.clientsState.futureEpochRates.earningRate;

  let rewardsEarnedPoints = BigInt(0);
  let runClientsLen = coordinatorAccount.state.clientsState.clients.len;
  let runClientsData = coordinatorAccount.state.clientsState.clients.data;
  for (let i = 0; i < runClientsLen; i++) {
    rewardsEarnedPoints += runClientsData[i].earned;
  }
  let rewardsEarnedCollateralAmount = rewardsEarnedPoints;

  let rewardsClaimedEarnedPoints = treasurerRun.totalClaimedEarnedPoints;
  let rewardsClaimedCollateralAmount =
    treasurerRun.totalClaimedCollateralAmount;
  let rewardsFundedCollateralAmount = treasurerRunCollateral.amount;

  const epochClientsLen =
    coordinatorAccount.state.coordinator.epochState.clients.len;
  let rewardsFundedEstimatedEpochs = "??";
  if (earningRatesFutureEpoch && epochClientsLen) {
    rewardsFundedEstimatedEpochs =
      "" +
      (rewardsFundedCollateralAmount - rewardsEarnedPoints) /
        earningRatesFutureEpoch /
        epochClientsLen;
  }

  let progressStateName = coordinatorAccount.state.coordinator.runState;
  let progressStateStart = new Date(
    Number(coordinatorAccount.state.coordinator.runStateStartUnixTimestamp) *
      1000,
  );

  let progressEpoch = coordinatorAccount.state.coordinator.progress.epoch;
  let progressStep = coordinatorAccount.state.coordinator.progress.step;

  return (
    <>
      <Text h={2} value="Status" />

      <Text h={3} value="Config" />
      <Text value={`- Join Authority: ${configJoinAuthority}`} />
      <Text value={`- Main Authority: ${configMainAuthority}`} />
      <Text value={`- Collateral Mint: ${configCollateralMint}`} />

      <Text h={3} value="Earning Rates" />
      <Text value={`- Current Epoch: ${earningRatesCurrentEpoch}`} />
      <Text value={`- Future Epoch: ${earningRatesFutureEpoch}`} />

      <Text h={3} value="Rewards" />
      <Text value={`- Earned points: ${rewardsEarnedPoints}`} />
      <Text
        value={`- Earned collateral amount: ${rewardsEarnedCollateralAmount}`}
      />
      <Text value={`- Claimed points: ${rewardsClaimedEarnedPoints}`} />
      <Text
        value={`- Claimed collateral amount: ${rewardsClaimedCollateralAmount}`}
      />
      <Text
        value={`- Funded collateral amount: ${rewardsFundedCollateralAmount}`}
      />
      <Text
        value={`- Funded estimated epochs: ${rewardsFundedEstimatedEpochs}`}
      />

      <Text h={3} value="Progress Info" />
      <Text value={`- State Start: ${progressStateStart}`} />
      <Text value={`- State Name: ${progressStateName}`} />
      <Text value={`- Progress Epoch Number: ${progressEpoch}`} />
      <Text value={`- Progress Step Number: ${progressStep}`} />
    </>
  );
}

export function PageTreasurerRunResultsClients({
  coordinatorAccount,
}: {
  coordinatorAccount: JsonContentCoordinatorAccount;
}) {
  // TODO - this could re-use code with PageCoordinator
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

async function runIdToTreasurerIndex(runId: string): Promise<bigint> {
  const data = new TextEncoder().encode(runId);
  const buffer = Buffer.from(await crypto.subtle.digest("SHA-256", data));
  return buffer.readBigUInt64LE(0);
}
