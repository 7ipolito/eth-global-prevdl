import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrevDLProvider } from "../../../dist/sdk/src/components/PrevDLProvider";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { GeneralPage } from "./pages/GeneralPage";
import { SuggestedAdsPage } from "./pages/SuggestedAdsPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <PrevDLProvider
      config={{
        clientId: "react-app-example",
        environment: "local",
      }}
    >
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/general" element={<GeneralPage />} />
            <Route path="/ads" element={<SuggestedAdsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </PrevDLProvider>
  );
}

export default App;
