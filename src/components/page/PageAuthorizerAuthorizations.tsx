import * as React from "react";

import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";

import { useSearchParams } from "react-router-dom";
import {
  jsonGetAt,
  pubkeyFromBase58,
  rpcHttpFindProgramOwnedAccounts,
} from "solana-kiss";
import { Button } from "../theme/Button";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { ForEach } from "../util/ForEach";
import { If } from "../util/If";
import { Promised } from "../util/Promised";
import { solana } from "./utils";

export function PageAuthorizerAuthorizationsPath({
  programAddress,
  filterGrantor,
  filterGrantee,
  filterDelegate,
}: {
  programAddress?: string;
  filterGrantor?: string;
  filterGrantee?: string;
  filterDelegate?: string;
}) {
  let searchParams = new URLSearchParams();
  if (programAddress !== undefined) {
    searchParams.set("programAddress", programAddress);
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

  let programAddress =
    searchParams.get("programAddress") ??
    "PsyAUmhpmiUouWsnJdNGFSX8vZ6rWjXjgDPHsgqPGyw";

  return (
    <>
      <Text h={1} value="Authorizer Authorizations" />

      <Text h={2} value="Fetch" />
      <Text h={3} value="programAddress" />
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

      <Promised
        value={React.useMemo(() => {
          return PageAuthorizerAuthorizationsLoader({ programAddress });
        }, [programAddress])}
        resolved={(authorizations) => (
          <PageAuthorizerAuthorizationsResults
            authorizations={authorizations}
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

export async function PageAuthorizerAuthorizationsLoader({
  programAddress,
}: {
  programAddress: string;
}) {
  console.log("Loading authorizations for program", programAddress);
  let { accountsAddresses: programAddresses } =
    await rpcHttpFindProgramOwnedAccounts(
      solana.getRpcHttp(),
      pubkeyFromBase58(programAddress),
    );
  console.log("programAddresses", programAddresses);
  let authorizations = [];
  for (let programAddress of programAddresses) {
    try {
      let { accountInfo } =
        await solana.getAndInferAndDecodeAccountInfo(programAddress);
      if (accountInfo.idl.name === "Authorization") {
        authorizations.push({
          address: programAddress,
          active: jsonGetAt(accountInfo.state, "active"),
          grantor: jsonGetAt(accountInfo.state, "grantor"),
          grantee: jsonGetAt(accountInfo.state, "grantee"),
          delegates: jsonGetAt(accountInfo.state, "delegates"),
        });
      }
    } catch (error) {
      console.log("authorization decode error", error);
    }
  }
  return authorizations;
}

export function PageAuthorizerAuthorizationsResults({
  authorizations,
}: {
  authorizations: any[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  let filterGrantor = searchParams.get("filterGrantor") ?? "";
  let filterGrantee = searchParams.get("filterGrantee") ?? "";
  let filterDelegate = searchParams.get("filterDelegate") ?? "";

  authorizations.sort((a: any, b: any) => {
    return b.grantor.localeCompare(a.grantor);
  });
  authorizations = authorizations.filter((authorization: any) => {
    return authorization.grantor.includes(filterGrantor);
  });
  authorizations = authorizations.filter((authorization: any) => {
    return authorization.grantee.includes(filterGrantee);
  });
  authorizations = authorizations.filter((authorization: any) => {
    if (authorization.delegates.length === 0) {
      return true;
    }
    for (let authDelegate of authorization.delegates) {
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
      />

      <Text h={3} value={`Records (x${authorizations.length})`} />
      <Layout bordered>
        <ForEach
          values={authorizations}
          item={(authorization: any) => (
            <PageAuthorizerAuthorizationsItem
              key={authorization.address}
              authorization={authorization}
              expanded={expandedAddresses.has(authorization.address)}
              filterDelegate={filterDelegate}
              onToggleExpanded={() => {
                let newExpandedAddresses = new Set(expandedAddresses);
                if (newExpandedAddresses.has(authorization.address)) {
                  newExpandedAddresses.delete(authorization.address);
                } else {
                  newExpandedAddresses.add(authorization.address);
                }
                setExpandedAddresses(newExpandedAddresses);
              }}
            />
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

export function PageAuthorizerAuthorizationsItem({
  authorization,
  expanded,
  filterDelegate,
  onToggleExpanded,
}: {
  authorization: any;
  expanded: boolean;
  filterDelegate: string;
  onToggleExpanded: () => void;
}) {
  return (
    <Layout key={authorization.address} padded faded={!authorization.active}>
      <Layout horizontal centered>
        <Layout flexible>
          <Text value={"Grantor: " + authorization.grantor} />
          <Layout faded>
            <Text value={"Grantee: " + authorization.grantee} />
          </Layout>
        </Layout>
        <Button
          text={"Delegates: x" + authorization.delegates.length}
          onClick={onToggleExpanded}
        />
      </Layout>
      <If
        value={expanded || !!filterDelegate}
        content={() => (
          <Layout padded>
            <ForEach
              values={authorization.delegates.filter((delegate: string) =>
                delegate.includes(filterDelegate),
              )}
              item={(delegate: any, index: number) => (
                <Text
                  key={index}
                  value={` - Delegate ${index} : ${delegate}`}
                />
              )}
              placeholder={() => <Text value="No delegates set..." />}
            />
          </Layout>
        )}
      />
    </Layout>
  );
}
