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

export function PageTreasurerRunPath({
  programId,
  runIndex,
}: {
  programId?: string;
  runIndex?: string;
}) {
  let searchParams = new URLSearchParams();
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  if (runIndex !== undefined) {
    searchParams.set("runIndex", runIndex);
  }
  return `treasurer?${searchParams.toString()}`;
}

export function PageTreasurerRun() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "vVeH6Xd43HAScbxjVtvfwDGqBMaMvNDLsAxwM5WK1pG";

  let runIndex = searchParams.get("runIndex") ?? "12345";

  return (
    <>
      <Text h={1} value="Treasurer Run" />

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

      <Text h={3} value="Run Index" />
      <TextInput
        value={runIndex}
        placeholder={"Specify the runIndex"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("runIndex", value);
            return searchParams;
          });
        }}
      />

      <Promised
        value={React.useMemo(
          () => PageTreasurerRunLoader({ programId, runIndex }),
          [programId, runIndex],
        )}
        resolved={({ treasurerRun, coordinatorAccount }) => (
          <PageTreasurerRunResults
            treasurerRun={treasurerRun}
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
  programId,
  runIndex,
}: {
  programId: string;
  runIndex: string;
}) {
  let runIndexBuffer = Buffer.alloc(8);
  runIndexBuffer.writeBigInt64LE(BigInt(runIndex), 0);
  let treasurerRunAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("Run", "utf8"), runIndexBuffer],
    new PublicKey(programId),
  )[0];
  let treasurerRunInfo = await idlService.getAndDecodeAccount(
    endpoint,
    treasurerRunAddress,
  );
  console.log("treasurerRunInfo", treasurerRunInfo);
  let coordinatorAccountAddress = new PublicKey(
    getValueAtPath(treasurerRunInfo.state, "coordinator_account"),
  );
  let coordinatorAccountInfo = await idlService.getAndDecodeAccount(
    endpoint,
    coordinatorAccountAddress,
  );
  return {
    treasurerRun: treasurerRunInfo.state,
    coordinatorAccount: coordinatorAccountInfo.state,
  };
}

export function PageTreasurerRunResults({
  treasurerRun,
  coordinatorAccount,
}: {
  treasurerRun: any;
  coordinatorAccount: any;
}) {
  return (
    <>
      <PageTreasurerRunResultsStatus
        treasurerRun={treasurerRun}
        coordinatorAccount={coordinatorAccount}
      />
      <PageTreasurerRunResultsClients coordinatorAccount={coordinatorAccount} />
    </>
  );
}

export function PageTreasurerRunResultsStatus({
  treasurerRun,
  coordinatorAccount,
}: {
  treasurerRun: any;
  coordinatorAccount: any;
}) {
  let configJoinAuthority = getValueAtPath(treasurerRun, "join_authority");
  let configMainAuthority = getValueAtPath(treasurerRun, "main_authority");
  let configCollateralMint = getValueAtPath(treasurerRun, "collateral_mint");

  let earningRatesCurrentEpoch = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.current_epoch_rates.earning_rate",
  );
  let earningRatesFutureEpoch = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.future_epoch_rates.earning_rate",
  );

  let rewardsEarnedPoints = BigInt(0);
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
      rewardsEarnedPoints += getValueAtPath(runClientsData[i], "earned");
    }
  }
  let rewardsEarnedCollateralAmount = rewardsEarnedPoints;

  let rewardsClaimedEarnedPoints = getValueAtPath(
    treasurerRun,
    "total_claimed_earned_points",
  );
  let rewardsClaimedCollateralAmount = getValueAtPath(
    treasurerRun,
    "total_claimed_collateral_amount",
  );
  let rewardsFundedCollateralAmount = getValueAtPath(
    treasurerRun,
    "total_funded_collateral_amount",
  );

  let epochClientsLen = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.epoch_state.clients.len",
  );
  let rewardsFundedEstimatedEpochs = "??";
  if (earningRatesFutureEpoch && epochClientsLen) {
    rewardsFundedEstimatedEpochs =
      "" +
      (rewardsFundedCollateralAmount - rewardsEarnedPoints) /
        earningRatesFutureEpoch /
        epochClientsLen;
  }

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
  if (runClientsLen) {
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
  }

  runClients = runClients.filter((runClient) => {
    return runClient.id.includes(filterClientId);
  });

  let epochClients = [];
  let epochClientsLen = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.epoch_state.clients.len",
  );
  if (epochClientsLen) {
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
