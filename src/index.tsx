import * as React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import { MenuBar } from "./components/menu/MenuBar";
import { PageAuth, PageAuthPath } from "./components/page/PageAuth";
import { PageHome, PageHomePath } from "./components/page/PageHome";
import { PageRun, PageRunPath } from "./components/page/PageRun";
import { PageTest, PageTestPath } from "./components/page/PageTest";
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
              <Route path={PageRunPath()} element={<PageRun />} />
              <Route path={PageAuthPath()} element={<PageAuth />} />
              <Route path={PageTestPath()} element={<PageTest />} />
            </Routes>
          </Layout>
        </div>
      </Layout>
    </HashRouter>
  );
}

createRoot(document.getElementById("app")!).render(<App />);
