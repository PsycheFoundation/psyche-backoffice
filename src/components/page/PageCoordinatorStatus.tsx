import * as React from "react";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { PublicKey } from "@solana/web3.js";
import { useSearchParams } from "react-router-dom";
import { ToolboxEndpoint, ToolboxIdlService } from "solana_toolbox_web3";

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

export function PageCoordinatorStatusPath(runId?: string, programId?: string) {
  let searchParams = new URLSearchParams();
  if (runId !== undefined) {
    searchParams.set("runId", runId);
  }
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  return `coordinator/status`;
}

export function PageCoordinatorStatus() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y";
  let runId = searchParams.get("runId") ?? "consilience-40b-1";

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
  }, [searchParams]);

  let displayConfigJoinAuthority = getValueAtPath(
    coordinatorInstance,
    "join_authority",
  );
  let displayConfigMainAuthority = getValueAtPath(
    coordinatorInstance,
    "main_authority",
  );

  let displayProgressStateName = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.run_state",
  );
  let displayProgressStateStart = new Date(
    Number(
      getValueAtPath(
        coordinatorAccount,
        "state.coordinator.run_state_start_unix_timestamp",
      ),
    ) * 1000,
  );

  let displayProgressEpoch = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.progress.epoch",
  );
  let displayProgressStep = getValueAtPath(
    coordinatorAccount,
    "state.coordinator.progress.step",
  );

  let displayEarningRateCurrentEpoch = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.current_epoch_rates.earning_rate",
  );
  let displayEarningRateFutureEpoch = getValueAtPath(
    coordinatorAccount,
    "state.clients_state.future_epoch_rates.earning_rate",
  );

  return (
    <>
      <Text h={1} value="Coordinator Status" />

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

      <Text h={2} value="Run Status" />

      <Text h={3} value="Run Config" />
      <Text value={`- Join Authority: ${displayConfigJoinAuthority}`} />
      <Text value={`- Main Authority: ${displayConfigMainAuthority}`} />

      <Text h={3} value="Run Live Info" />
      <Text value={`- State Start: ${displayProgressStateStart}`} />
      <Text value={`- State Name: ${displayProgressStateName}`} />
      <Text value={`- Progress Epoch Number: ${displayProgressEpoch}`} />
      <Text value={`- Progress Step Number: ${displayProgressStep}`} />

      <Text h={3} value="Run Earning Rates" />
      <Text value={`- Current Epoch: ${displayEarningRateCurrentEpoch}`} />
      <Text value={`- Future Epoch: ${displayEarningRateFutureEpoch}`} />
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
