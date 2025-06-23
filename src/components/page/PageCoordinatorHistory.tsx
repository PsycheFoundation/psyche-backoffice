import * as React from "react";

import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { useSearchParams } from "react-router-dom";
import { ToolboxEndpoint, ToolboxIdlService } from "solana_toolbox_web3";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";
import { ForEach } from "../util/ForEach";
import { Promised } from "../util/Promised";

let endpoint = new ToolboxEndpoint("devnet", "confirmed");
let idlService = new ToolboxIdlService();

class PromiseQueue {
  private last?: Promise<void>;

  do<T>(task: () => Promise<T>): Promise<T> {
    const last = this.last;
    const next = (async () => {
      try {
        if (last !== undefined) {
          await last;
        }
      } catch (error) {
        // The error should be handled by another awaiter (from the return)
      }
      return task();
    })();
    this.last = next as Promise<void>;
    return next;
  }
}

let queueGetExecution = new PromiseQueue();
let queueDecodeInstruction = new PromiseQueue();

function findCoordinatorInstance(runId: string, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from([99, 111, 111, 114, 100, 105, 110, 97, 116, 111, 114]),
      Buffer.from(runId, "utf8"),
    ],
    programId,
  )[0];
}

export function PageCoordinatorHistoryPath(runId?: string, programId?: string) {
  let searchParams = new URLSearchParams();
  if (runId !== undefined) {
    searchParams.set("runId", runId);
  }
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  return `coordinator/history?${searchParams.toString()}`;
}

export function PageCoordinatorHistory() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "HR8RN2TP9E9zsi2kjhvPbirJWA1R6L6ruf4xNNGpjU5Y";
  let runId = searchParams.get("runId") ?? "consilience-40b-1";

  let [signatures, setSignatures] = React.useState<string[]>([]);

  React.useEffect(() => {
    const execute = async () => {
      let coordinatorInstanceAddress = findCoordinatorInstance(
        runId,
        new PublicKey(programId),
      );
      let coordinatorInstanceDecoded = await idlService.getAndDecodeAccount(
        endpoint,
        coordinatorInstanceAddress,
      );
      let coordinatorAccountAddress = new PublicKey(
        getValueAtPath(coordinatorInstanceDecoded.state, "coordinator_account"),
      );
      let signaturesCoordinator = await endpoint.searchSignatures(
        coordinatorAccountAddress,
        1000,
      );
      setSignatures(signaturesCoordinator);
      console.log("signaturesCoordinator", signaturesCoordinator);
    };
    execute();
  }, [searchParams]);

  return (
    <>
      <Text h={1} value="Coordinator Run History" />

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

      <Text h={2} value="Run Transactions" />
      <Text h={3} value={`Signatures (x${signatures.length})`} />
      <Layout bordered>
        <ForEach
          values={signatures}
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
          renderer={function (signature) {
            return (
              <>
                <Layout key={signature} horizontal>
                  <Layout padded>
                    <Text value={`${signature.substring(0, 8)}...`} />
                  </Layout>
                  <Line />
                  <Layout padded>
                    <PageCoordinatorHistoryTransactionFromSignature
                      key={signature}
                      signature={signature}
                    />
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

function PageCoordinatorHistoryTransactionFromSignature({
  signature,
}: {
  signature: string;
}) {
  return (
    <Promised
      value={queueGetExecution.do(() => endpoint.getExecution(signature))}
      pending={() => {
        return <Text value={`Loading...`} />;
      }}
      resolved={(execution) => {
        return (
          <ForEach
            values={execution.instructions}
            renderer={(instruction, index) => {
              return (
                <PageCoordinatorHistoryTransactionInstruction
                  key={index}
                  instruction={instruction}
                />
              );
            }}
            empty={() => {
              return <Text value={`No instructions found.`} />;
            }}
          />
        );
      }}
      rejected={(error) => {
        return <Text value={`Error fetching execution: ${error.message}`} />;
      }}
    />
  );
}

function PageCoordinatorHistoryTransactionInstruction({
  instruction,
}: {
  instruction: TransactionInstruction;
}) {
  return (
    <Promised
      value={queueDecodeInstruction.do(() =>
        idlService.decodeInstruction(endpoint, instruction),
      )}
      pending={() => {
        return <Text value={`Loading...`} />;
      }}
      resolved={(decodedInstruction) => {
        console.log("decodedInstruction", decodedInstruction);
        return (
          <>
            <Text value={`Name: ${decodedInstruction.instruction.name}`} />
            <Text
              value={`User: ${decodedInstruction.instructionAddresses.get("user")}`}
            />
          </>
        );
      }}
      rejected={(error) => {
        return <Text value={`Error decoding instruction: ${error.message}`} />;
      }}
    />
  );
}
