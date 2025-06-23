import * as React from "react";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { PublicKey } from "@solana/web3.js";
import { useSearchParams } from "react-router-dom";
import { ToolboxEndpoint, ToolboxIdlService } from "solana_toolbox_web3";
import { Button } from "../theme/Button";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { ForEach } from "../util/ForEach";
import { If } from "../util/If";
import { Promised } from "../util/Promised";

let endpoint = new ToolboxEndpoint("devnet", "confirmed");
let idlService = new ToolboxIdlService();

export function PageAuthorizerAuthorizationsPath(
  programId?: string,
  filterGrantor?: string,
  filterGrantee?: string,
  filterDelegate?: string,
) {
  let searchParams = new URLSearchParams();
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  if (filterGrantor !== undefined) {
    searchParams.set("filterGrantor", filterGrantor);
  }
  if (filterGrantee !== undefined) {
    searchParams.set("filterGrantee", filterGrantee);
  }
  if (filterDelegate !== undefined) {
    searchParams.set("filterDelegate", filterDelegate);
  }
  return `authorizer?${searchParams.toString()}`;
}

export function PageAuthorizerAuthorizations() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "PsyAUmhpmiUouWsnJdNGFSX8vZ6rWjXjgDPHsgqPGyw";

  return (
    <>
      <Text h={1} value="Authorizer Authorizations" />

      <Text h={2} value="Fetch" />
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

      <Promised
        value={React.useMemo(
          () => PageAuthorizerAuthorizationsLoader({ programId }),
          [programId],
        )}
        resolved={(auths) => (
          <PageAuthorizerAuthorizationsResults auths={auths} />
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

export async function PageAuthorizerAuthorizationsLoader({
  programId,
}: {
  programId: string;
}) {
  let programAddresses = await endpoint.searchAddresses(
    new PublicKey(programId),
  );
  let auths = [];
  for (let programAddress of programAddresses) {
    try {
      let programAccountInfo = await idlService.getAndDecodeAccount(
        endpoint,
        programAddress,
      );
      if (programAccountInfo.account.name === "Authorization") {
        auths.push({
          address: programAddress.toBase58(),
          grantor: programAccountInfo.state.grantor,
          grantee: programAccountInfo.state.grantee,
          delegates: programAccountInfo.state.delegates,
        });
      }
    } catch (error) {
      console.log("auth decode error", error);
    }
  }
  return auths;
}

export function PageAuthorizerAuthorizationsResults({
  auths,
}: {
  auths: any[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  let filterGrantor = searchParams.get("filterGrantor") ?? "";
  let filterGrantee = searchParams.get("filterGrantee") ?? "";
  let filterDelegate = searchParams.get("filterDelegate") ?? "";

  auths.sort((a: any, b: any) => {
    return b.grantor.localeCompare(a.grantor);
  });
  auths = auths.filter((auth: any) => {
    return auth.grantor.includes(filterGrantor);
  });
  auths = auths.filter((auth: any) => {
    return auth.grantee.includes(filterGrantee);
  });
  auths = auths.filter((auth: any) => {
    for (let authDelegate of auth.delegates) {
      if (authDelegate.includes(filterDelegate)) {
        return true;
      }
    }
    return false;
  });
  let [expandedAddresses, setExpandedAddresses] = React.useState(new Set());
  return (
    <>
      <Text h={2} value="Filter" />
      <Text h={3} value="Grantor" />
      <TextInput
        value={filterGrantor}
        placeholder={"Filter by grantor"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("filterGrantor", value);
            return searchParams;
          });
        }}
      />
      <Text h={3} value="Grantee" />
      <TextInput
        value={filterGrantee}
        placeholder={"Filter by grantee"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("filterGrantee", value);
            return searchParams;
          });
        }}
      />
      <Text h={3} value="Delegate" />
      <TextInput
        value={filterDelegate}
        placeholder={"Filter by delegate"}
        onChange={(value) => {
          setSearchParams((searchParams) => {
            searchParams.set("filterDelegate", value);
            return searchParams;
          });
        }}
      />{" "}
      <Text h={3} value={`Records (x${auths.length})`} />
      <Layout bordered>
        <ForEach
          values={auths}
          item={(auth: any) => (
            <PageAuthorizerAuthorizationsItem
              key={auth.address}
              auth={auth}
              expanded={expandedAddresses.has(auth.address)}
              filterDelegate={filterDelegate}
              onToggleExpanded={() => {
                let newExpandedAddresses = new Set(expandedAddresses);
                if (newExpandedAddresses.has(auth.address)) {
                  newExpandedAddresses.delete(auth.address);
                } else {
                  newExpandedAddresses.add(auth.address);
                }
                setExpandedAddresses(newExpandedAddresses);
              }}
            />
          )}
          separator={(index) => <Line key={index} />}
          placeholder={() => (
            <Layout key="placeholder" padded centered>
              <Text value="Nothing to show" />
            </Layout>
          )}
        />
      </Layout>
    </>
  );
}

export function PageAuthorizerAuthorizationsItem({
  auth,
  expanded,
  filterDelegate,
  onToggleExpanded,
}: {
  auth: any;
  expanded: boolean;
  filterDelegate: string;
  onToggleExpanded: () => void;
}) {
  return (
    <Layout key={auth.address} padded>
      <Layout horizontal centered>
        <Layout flexible>
          <Text value={"Grantor: " + auth.grantor} />
          <Layout faded>
            <Text value={"Grantee: " + auth.grantee} />
          </Layout>
        </Layout>
        <Button
          text={"Delegates: x" + auth.delegates.length}
          onClick={onToggleExpanded}
        />
      </Layout>
      <If
        value={expanded || !!filterDelegate}
        content={() => (
          <Layout padded>
            <ForEach
              values={auth.delegates.filter((delegate: string) =>
                delegate.includes(filterDelegate),
              )}
              item={(delegate: any, index: number) => (
                <Text
                  key={index}
                  value={` - Delegate ${index} : ${delegate}`}
                />
              )}
            />
          </Layout>
        )}
      />
    </Layout>
  );
}
