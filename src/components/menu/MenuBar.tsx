import * as React from "react";
import { useNavigate } from "react-router-dom";

import { PageHomePath } from "../page/PageHome";
import { PageTestPath } from "../page/PageTest";
import { Button } from "../theme/Button";
import { Layout } from "../theme/Layout";
import { Spacing } from "../theme/Spacing";

export function MenuBar() {
  const navigate = useNavigate();
  return (
    <>
      <Layout horizontal>
        <Layout flexible>
          <Button
            text="Nous Research - Psyche Backoffice"
            onClick={() => {
              return navigate(PageHomePath());
            }}
          />
        </Layout>
        <Button
          text="UI TEST"
          onClick={() => {
            return navigate(PageTestPath());
          }}
        />
      </Layout>
    </>
  );
}
