import * as React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import { MenuBar } from "./components/menu/MenuBar";
import {
  PageAuthorizer,
  PageAuthorizerPath,
} from "./components/page/PageAuthorizer";
import {
  PageCoordinatorClients,
  PageCoordinatorClientsPath,
} from "./components/page/PageCoordinatorClients";
import {
  PageCoordinatorHistory,
  PageCoordinatorHistoryPath,
} from "./components/page/PageCoordinatorHistory";
import {
  PageCoordinatorStatus,
  PageCoordinatorStatusPath,
} from "./components/page/PageCoordinatorStatus";
import { PageHome, PageHomePath } from "./components/page/PageHome";
import { Layout } from "./components/theme/Layout";
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
              <Route
                path={PageCoordinatorStatusPath()}
                element={<PageCoordinatorStatus />}
              />
              <Route
                path={PageCoordinatorHistoryPath()}
                element={<PageCoordinatorHistory />}
              />
              <Route
                path={PageCoordinatorClientsPath()}
                element={<PageCoordinatorClients />}
              />
              <Route path={PageAuthorizerPath()} element={<PageAuthorizer />} />
            </Routes>
          </Layout>
        </div>
      </Layout>
    </HashRouter>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
