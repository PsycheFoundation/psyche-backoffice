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

let tokenProgramId = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
let ataProgramId = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

let endpoint = new ToolboxEndpoint("devnet", "confirmed");
let idlService = new ToolboxIdlService();

export function PageTreasurerRunPath({
  programId,
  runIdOrIndex,
}: {
  programId?: string;
  runIdOrIndex?: string;
}) {
  let searchParams = new URLSearchParams();
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  if (runIdOrIndex !== undefined) {
    searchParams.set("runIdOrIndex", runIdOrIndex);
  }
  return `treasurer?${searchParams.toString()}`;
}

export function PageTreasurerRun() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "vVeH6Xd43HAScbxjVtvfwDGqBMaMvNDLsAxwM5WK1pG";

  let runIdOrIndex = searchParams.get("runIdOrIndex") ?? "12345";

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
          () => PageTreasurerRunLoader({ programId, runIdOrIndex }),
          [programId, runIdOrIndex],
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
  programId,
  runIdOrIndex,
}: {
  programId: string;
  runIdOrIndex: string;
}) {
  let runIndexBuffer = Buffer.alloc(8);
  try {
    runIndexBuffer.writeBigInt64LE(BigInt(runIdOrIndex), 0);
  } catch (error) {
    runIndexBuffer.writeBigUInt64LE(
      await runIdToTreasurerIndex(runIdOrIndex),
      0,
    );
  }
  let treasurerRunAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("Run", "utf8"), runIndexBuffer],
    new PublicKey(programId),
  )[0];
  let treasurerRun = await idlService.getAndInferAndDecodeAccount(
    endpoint,
    treasurerRunAddress,
  );
  console.log("treasurerRun", treasurerRun.state);
  const collateralMintAddress = new PublicKey(
    getValueAtPath(treasurerRun.state, "collateral_mint"),
  );
  let treasurerRunCollateralAddress = PublicKey.findProgramAddressSync(
    [
      treasurerRunAddress.toBuffer(),
      tokenProgramId.toBuffer(),
      collateralMintAddress.toBuffer(),
    ],
    ataProgramId,
  )[0];
  let treasurerRunCollateral = await idlService.getAndInferAndDecodeAccount(
    endpoint,
    treasurerRunCollateralAddress,
  );
  let coordinatorAccountAddress = new PublicKey(
    getValueAtPath(treasurerRun.state, "coordinator_account"),
  );
  let coordinatorAccount = await idlService.getAndInferAndDecodeAccount(
    endpoint,
    coordinatorAccountAddress,
  );
  return {
    treasurerRun: treasurerRun.state,
    treasurerRunCollateral: treasurerRunCollateral.state,
    coordinatorAccount: coordinatorAccount.state,
  };
}

export function PageTreasurerRunResults({
  treasurerRun,
  treasurerRunCollateral,
  coordinatorAccount,
}: {
  treasurerRun: any;
  treasurerRunCollateral: any;
  coordinatorAccount: any;
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
  treasurerRun: any;
  treasurerRunCollateral: any;
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
    treasurerRunCollateral,
    "amount",
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
  // TODO - this could re-use code with PageCoordinator
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

async function runIdToTreasurerIndex(runId: string): Promise<bigint> {
  const data = new TextEncoder().encode(runId);
  const buffer = Buffer.from(await crypto.subtle.digest("SHA-256", data));
  return buffer.readBigUInt64LE(0);
}
