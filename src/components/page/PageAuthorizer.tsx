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

let endpoint = new ToolboxEndpoint("devnet", "confirmed");
let idlService = new ToolboxIdlService();

export function PageAuthorizerPath(
  filterGrantor?: string,
  filterGrantee?: string,
  filterDelegate?: string,
  programId?: string,
) {
  let searchParams = new URLSearchParams();
  if (filterGrantor !== undefined) {
    searchParams.set("filterGrantor", filterGrantor);
  }
  if (filterGrantee !== undefined) {
    searchParams.set("filterGrantee", filterGrantee);
  }
  if (filterDelegate !== undefined) {
    searchParams.set("filterDelegate", filterDelegate);
  }
  if (programId !== undefined) {
    searchParams.set("programId", programId);
  }
  return `authorizer?${searchParams.toString()}`;
}

export function PageAuthorizer() {
  const [searchParams, setSearchParams] = useSearchParams();

  let programId =
    searchParams.get("programId") ??
    "PsyAUmhpmiUouWsnJdNGFSX8vZ6rWjXjgDPHsgqPGyw";

  let filterGrantor = searchParams.get("filterGrantor") ?? "";
  let filterGrantee = searchParams.get("filterGrantee") ?? "";
  let filterDelegate = searchParams.get("filterDelegate") ?? "";

  let [expandDelegatesSet, setExpandDelegatesSet] = React.useState(new Set());

  let [auths, setAuths] = React.useState([]);
  console.log("auths", auths);

  React.useEffect(() => {
    const execute = async () => {
      try {
        let programAddresses = await endpoint.searchAddresses(
          new PublicKey(programId),
        );
        let newAuths = [];
        for (let programAddress of programAddresses) {
          try {
            let programAccountDecoded = await idlService.getAndDecodeAccount(
              endpoint,
              programAddress,
            );
            if (programAccountDecoded.account.name === "Authorization") {
              newAuths.push({
                address: programAddress.toBase58(),
                grantor: programAccountDecoded.state.grantor,
                grantee: programAccountDecoded.state.grantee,
                delegates: programAccountDecoded.state.delegates,
              });
            }
          } catch (error) {
            console.log("auth decode error", error);
          }
        }
        setAuths(newAuths as any);
      } catch (error) {
        console.log("error", error);
      }
    };
    execute();
  }, [programId]);

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

  return (
    <>
      <Text h={1} value="Authorizer Inspection" />

      <Text h={2} value="Search Authorizations" />
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
      <Text h={2} value="Results" />
      <Layout bordered>
        <ForEach
          values={auths}
          separator={(index) => {
            return <Line key={index} />;
          }}
          placeholder={function () {
            return (
              <Layout key="placeholder" padded centered>
                <Text value="Nothing to show" />
              </Layout>
            );
          }}
          renderer={(auth: any) => {
            return (
              <>
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
                      onClick={() => {
                        let newExpendDelegatesSet = new Set(expandDelegatesSet);
                        if (newExpendDelegatesSet.has(auth.address)) {
                          newExpendDelegatesSet.delete(auth.address);
                        } else {
                          newExpendDelegatesSet.add(auth.address);
                        }
                        setExpandDelegatesSet(newExpendDelegatesSet);
                      }}
                    />
                  </Layout>
                  <If
                    value={
                      expandDelegatesSet.has(auth.address) || filterDelegate
                    }
                    renderer={() => {
                      return (
                        <Layout padded>
                          <ForEach
                            values={auth.delegates}
                            renderer={(delegate: any, index: number) => {
                              if (!delegate.includes(filterDelegate)) {
                                return <></>;
                              }
                              return (
                                <Text
                                  key={index}
                                  value={` - Delegate ${index} : ${delegate}`}
                                />
                              );
                            }}
                          />
                        </Layout>
                      );
                    }}
                  />
                </Layout>
              </>
            );
          }}
        />
      </Layout>
    </>
  );
}
