import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../theme/Button";
import { Spacing } from "../theme/Spacing";
import { Text } from "../theme/Text";
import { PageAuthorizerPath } from "./PageAuthorizer";
import { PageCoordinatorClientsPath } from "./PageCoordinatorClients";
import { PageCoordinatorHistoryPath } from "./PageCoordinatorHistory";
import { PageCoordinatorStatusPath } from "./PageCoordinatorStatus";

export function PageHomePath() {
  return "/";
}

export function PageHome() {
  const navigate = useNavigate();

  return (
    <>
      <Text h={1} value="Home" />
      <Button
        text="Coordinator Status"
        onClick={() => {
          return navigate(PageCoordinatorStatusPath());
        }}
      />
      <Spacing />
      <Button
        text="Coordinator Clients"
        onClick={() => {
          return navigate(PageCoordinatorClientsPath());
        }}
      />
      <Spacing />
      <Button
        text="Coordinator History"
        onClick={() => {
          return navigate(PageCoordinatorHistoryPath());
        }}
      />
      <Spacing />
      <Button
        text="Authorizer"
        onClick={() => {
          return navigate(PageAuthorizerPath());
        }}
      />
    </>
  );
}
