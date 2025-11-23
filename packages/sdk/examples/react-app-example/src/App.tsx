import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrevDLProvider } from "../../../dist/components";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { GeneralPage } from "./pages/GeneralPage";
import { SuggestedAdsPage } from "./pages/SuggestedAdsPage";
import { DashboardPage } from "./pages/DashboardPage";
import type { PrevDLAdsConfig } from "../../../dist/types";

// Configuração do contrato Oasis Sapphire
const OASIS_CONTRACT_ADDRESS = "0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0";
const OASIS_RPC_URL = "https://testnet.sapphire.oasis.io";

// Configuração do PrevDL Ads
const config: PrevDLAdsConfig = {
  clientId: "react-app-example",
  environment: "local",
  //   oasis: {
  //     contractAddress: OASIS_CONTRACT_ADDRESS,
  //     rpcUrl: OASIS_RPC_URL,
  //     requireEncryption: true,
  //     // A wallet será adicionada dinamicamente via useEffect se disponível
  //   },
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  return (
    <PrevDLProvider config={config}>
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
