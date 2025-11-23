import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
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
const OASIS_CHAIN_ID = "0x5aff"; // 23295 em hexadecimal
const OASIS_CHAIN_ID_DECIMAL = 23295;

// Configuração da rede Oasis Sapphire Testnet para MetaMask
const OASIS_NETWORK_CONFIG = {
  chainId: OASIS_CHAIN_ID,
  chainName: "Oasis Sapphire Testnet",
  nativeCurrency: {
    name: "TEST",
    symbol: "TEST",
    decimals: 18,
  },
  rpcUrls: [OASIS_RPC_URL],
  blockExplorerUrls: ["https://testnet.explorer.sapphire.oasis.io"],
};

// Função helper para garantir que o MetaMask está na rede Oasis Sapphire
async function ensureOasisNetwork(ethereum: any): Promise<void> {
  try {
    // Verificar chain ID atual
    const chainId = await ethereum.request({ method: "eth_chainId" });

    if (chainId !== OASIS_CHAIN_ID) {
      console.log(
        `🔄 Mudando rede de ${chainId} para Oasis Sapphire Testnet (${OASIS_CHAIN_ID})...`
      );

      try {
        // Tentar mudar para a rede Oasis Sapphire
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: OASIS_CHAIN_ID }],
        });
        console.log("✅ Rede alterada para Oasis Sapphire Testnet");
      } catch (switchError: any) {
        // Se a rede não existir no MetaMask, adicionar
        if (switchError.code === 4902 || switchError.code === -32603) {
          console.log(
            "➕ Adicionando rede Oasis Sapphire Testnet ao MetaMask..."
          );
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [OASIS_NETWORK_CONFIG],
          });
          console.log("✅ Rede Oasis Sapphire Testnet adicionada");
        } else {
          throw switchError;
        }
      }
    } else {
      console.log("✅ Já está conectado à Oasis Sapphire Testnet");
    }
  } catch (error: any) {
    console.error("❌ Erro ao configurar rede Oasis:", error);
    throw new Error(
      `Failed to switch to Oasis Sapphire Testnet: ${error.message}`
    );
  }
}

function App() {
  const [config, setConfig] = useState<PrevDLAdsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWallet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Tentar conectar wallet automaticamente
        let walletConnected = false;

        if (typeof window.ethereum !== "undefined") {
          try {
            // Garantir que está na rede Oasis Sapphire Testnet
            await ensureOasisNetwork(window.ethereum);

            // MetaMask disponível - usar BrowserProvider (ethers v6)
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();

            // Verificar se realmente está na rede correta
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== OASIS_CHAIN_ID_DECIMAL) {
              throw new Error(
                `Wrong network! Expected Oasis Sapphire Testnet (${OASIS_CHAIN_ID_DECIMAL}), but got chainId ${network.chainId}. Please switch networks in MetaMask.`
              );
            }

            console.log(
              `✅ Conectado à Oasis Sapphire Testnet (Chain ID: ${network.chainId})`
            );

            // Criar config com wallet do MetaMask
            setConfig({
              clientId: "react-app-example",
              environment: "sandbox",
              oasis: {
                contractAddress: OASIS_CONTRACT_ADDRESS,
                rpcUrl: OASIS_RPC_URL,
                wallet: signer,
                requireEncryption: true,
              },
            });
            walletConnected = true;
          } catch (walletError: any) {
            // Usuário rejeitou a conexão ou erro ao conectar
            console.warn("⚠️  Erro ao conectar MetaMask:", walletError.message);
            console.warn(
              "   Tentando fallback para private key ou modo local..."
            );
            // Continuar para o fallback abaixo
          }
        }

        // Fallback: usar private key do .env (apenas para desenvolvimento)
        if (!walletConnected) {
          const privateKey = import.meta.env.VITE_PRIVATE_KEY;
          if (privateKey) {
            const provider = new ethers.JsonRpcProvider(OASIS_RPC_URL);
            const walletInstance = new ethers.Wallet(privateKey, provider);

            setConfig({
              clientId: "react-app-example",
              environment: "sandbox",
              oasis: {
                contractAddress: OASIS_CONTRACT_ADDRESS,
                rpcUrl: OASIS_RPC_URL,
                wallet: walletInstance,
                requireEncryption: true,
              },
            });
            walletConnected = true;
          } else {
            // Nenhuma wallet disponível - usar modo local como fallback
            console.warn(
              "⚠️  MetaMask não encontrada e VITE_PRIVATE_KEY não configurada"
            );
            console.warn("   Usando modo local (mock data) como fallback");
            setConfig({
              clientId: "react-app-example",
              environment: "local", // Fallback para local mode
            });
          }
        }
      } catch (err: any) {
        console.error("Erro ao inicializar wallet:", err);
        setError(err.message || "Failed to initialize wallet");
        // Fallback para modo local em caso de erro
        setConfig({
          clientId: "react-app-example",
          environment: "local",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initWallet();

    // Listener para mudanças de rede no MetaMask
    if (typeof window.ethereum !== "undefined") {
      const handleChainChanged = (chainId: string) => {
        console.log("🔄 Rede alterada:", chainId);
        if (chainId !== OASIS_CHAIN_ID) {
          console.warn(
            `⚠️  Rede alterada para ${chainId}. Por favor, mude para Oasis Sapphire Testnet (${OASIS_CHAIN_ID})`
          );
          setError(
            `Wrong network! Please switch to Oasis Sapphire Testnet (Chain ID: ${OASIS_CHAIN_ID_DECIMAL})`
          );
        } else {
          setError(null);
          // Recarregar a página para reconectar com a rede correta
          window.location.reload();
        }
      };

      const ethereum = window.ethereum as any;
      if (ethereum.on) {
        ethereum.on("chainChanged", handleChainChanged);
      }

      // Cleanup
      return () => {
        if (ethereum && ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "#ffffff",
          background: "#000000",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>⏳ Carregando...</h1>
        <p>Conectando à wallet na Oasis Sapphire Testnet...</p>
        <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "1rem" }}>
          Se estiver demorando, verifique se MetaMask está instalado e
          configurado para a rede Oasis Sapphire Testnet (Chain ID: 23295)
        </p>
        <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
          Ou configure VITE_PRIVATE_KEY no .env para usar private key
          diretamente
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "#ff0000",
          background: "#000000",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>❌ Erro de Configuração</h1>
        <p>{error || "Não foi possível inicializar a configuração"}</p>
        <p style={{ fontSize: "0.9rem", color: "#888", marginTop: "1rem" }}>
          Verifique o console do navegador para mais detalhes.
        </p>
      </div>
    );
  }

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
