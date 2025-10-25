import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../theme/Button";
import { Spacing } from "../theme/Spacing";
import { Text } from "../theme/Text";
import { PageAuthorizerAuthorizationsPath } from "./PageAuthorizerAuthorizations";
import { PageCoordinatorRunPath } from "./PageCoordinatorRun";
import { PageTreasurerRunPath } from "./PageTreasurerRun";
import { PageWalletsPath } from "./PageWallets";

export function PageHomePath() {
  return "/";
}

export function PageHome() {
  const navigate = useNavigate();
  return (
    <>
      <Text h={1} value="Backoffice Dashboards" />
      <Button
        text="Treasurer Run"
        onClick={() => {
          return navigate(PageTreasurerRunPath({}));
        }}
      />
      <Spacing />
      <Button
        text="Coordinator Run"
        onClick={() => {
          return navigate(PageCoordinatorRunPath({}));
        }}
      />
      <Spacing />
      <Button
        text="Authorizer Authorizations"
        onClick={() => {
          return navigate(PageAuthorizerAuthorizationsPath({}));
        }}
      />
      <Spacing />
      <Button
        text="Wallets"
        onClick={() => {
          return navigate(PageWalletsPath());
        }}
      />
    </>
  );
}
