import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Pubkey, pubkeyFromBase58 } from "solana-kiss";
import {
  JsonContent as JsonContentAuthorization,
  jsonCodec as jsonCodecAuthorization,
} from "../../codecs/AuthorizerAuthorization";
import { Button } from "../theme/Button";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { Text } from "../theme/Text";
import { TextInput } from "../theme/TextInput";
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
            authorizationsRecords={authorizations}
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

type AuthorizationRecord = {
  address: Pubkey;
} & JsonContentAuthorization;

export async function PageAuthorizerAuthorizationsLoader({
  programAddress,
}: {
  programAddress: string;
}) {
  console.log("Loading authorizations for program", programAddress);
  let { accountsAddresses: ownedAddresses } =
    await solana.findProgramOwnedAccounts(
      pubkeyFromBase58(programAddress),
      "Authorization",
    );
  console.log("ownedAddresses", ownedAddresses);
  let authorizationsRecords = new Array<AuthorizationRecord>();
  for (let ownedAddress of ownedAddresses) {
    try {
      let { accountState } =
        await solana.getAndInferAndDecodeAccount(ownedAddress);
      const authorization = jsonCodecAuthorization.decoder(accountState);
      console.log("decoded authorization", authorization);
      authorizationsRecords.push({ address: ownedAddress, ...authorization });
    } catch (error) {
      console.log("authorization decode error", error);
    }
  }
  return authorizationsRecords;
}

export function PageAuthorizerAuthorizationsResults({
  authorizationsRecords: authorizations,
}: {
  authorizationsRecords: Array<AuthorizationRecord>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  let filterGrantor = searchParams.get("filterGrantor") ?? "";
  let filterGrantee = searchParams.get("filterGrantee") ?? "";
  let filterDelegate = searchParams.get("filterDelegate") ?? "";

  authorizations.sort((a, b) => {
    return b.grantor.toString().localeCompare(a.grantor.toString());
  });
  authorizations = authorizations.filter((authorization) => {
    return authorization.grantor.toString().includes(filterGrantor);
  });
  authorizations = authorizations.filter((authorization) => {
    return authorization.grantee.toString().includes(filterGrantee);
  });
  authorizations = authorizations.filter((authorization) => {
    if (authorization.delegates.length === 0 && !filterDelegate) {
      return true;
    }
    for (let authDelegate of authorization.delegates) {
      if (authDelegate.toString().includes(filterDelegate)) {
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
          item={(authorization) => (
            <PageAuthorizerAuthorizationsItem
              key={"" + authorization.address}
              authorizationRecord={authorization}
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
  authorizationRecord,
  expanded,
  filterDelegate,
  onToggleExpanded,
}: {
  authorizationRecord: AuthorizationRecord;
  expanded: boolean;
  filterDelegate: string;
  onToggleExpanded: () => void;
}) {
  return (
    <Layout
      key={"" + authorizationRecord.address}
      padded
      faded={!authorizationRecord.active}
    >
      <Layout horizontal centered>
        <Layout flexible>
          <Text value={"Grantor: " + authorizationRecord.grantor} />
          <Layout faded>
            <Text value={"Grantee: " + authorizationRecord.grantee} />
          </Layout>
        </Layout>
        <Button
          text={"Delegates: x" + authorizationRecord.delegates.length}
          onClick={onToggleExpanded}
        />
      </Layout>
      <If
        value={expanded || !!filterDelegate}
        content={() => (
          <Layout padded>
            <ForEach
              values={authorizationRecord.delegates.filter((delegate) =>
                delegate.toString().includes(filterDelegate),
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
