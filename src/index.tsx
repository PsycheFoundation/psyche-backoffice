import * as React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import { MenuBar } from "./components/menu/MenuBar";
import {
  PageAuthorizerAuthorizations,
  PageAuthorizerAuthorizationsPath,
} from "./components/page/PageAuthorizerAuthorizations";
import {
  PageCoordinatorRun,
  PageCoordinatorRunPath,
} from "./components/page/PageCoordinatorRun";
import { PageHome, PageHomePath } from "./components/page/PageHome";
import {
  PageTreasurerRun,
  PageTreasurerRunPath,
} from "./components/page/PageTreasurerRun";
import { PageWallets, PageWalletsPath } from "./components/page/PageWallets";
import { Layout } from "./components/theme/Layout";
import { Spacing } from "./components/theme/Spacing";
import "./index.scss";

function App() {
  return (
    <HashRouter>
      <MenuBar />
      <Layout centered>
        <div style={{ width: "100%", maxWidth: 800 }}>
          <Layout padded>
            <Routes>
              <Route path={PageHomePath()} element={<PageHome />} />
              <Route path={PageWalletsPath()} element={<PageWallets />} />
              <Route
                path={PageCoordinatorRunPath({})}
                element={<PageCoordinatorRun />}
              />
              <Route
                path={PageTreasurerRunPath({})}
                element={<PageTreasurerRun />}
              />
              <Route
                path={PageAuthorizerAuthorizationsPath({})}
                element={<PageAuthorizerAuthorizations />}
              />
            </Routes>
          </Layout>
          <Spacing />
        </div>
        <Spacing />
      </Layout>
    </HashRouter>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
