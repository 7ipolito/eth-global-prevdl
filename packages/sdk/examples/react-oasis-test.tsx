/**
 * React Test Example - PrevDLProvider with Oasis Sapphire Contract
 * 
 * Este exemplo testa o PrevDLProvider com o contrato deployado:
 * 0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0
 * 
 * Para rodar:
 * 1. Configure uma wallet (MetaMask ou similar)
 * 2. Importe este componente em sua aplicação React
 * 3. Certifique-se de ter ethers.js instalado
 */

import React, { useState, useEffect } from 'react';
import { PrevDLProvider, usePrevDLAds, usePrevDLContext } from '../src/components/PrevDLProvider';
import { UserProfile, Location, Profession, Interest, Gender, Ad } from '../src/types';
import { ethers } from 'ethers';

// ============================================
// CONFIGURAÇÃO DO CONTRATO
// ============================================
const CONTRACT_ADDRESS = '0x8a7d416E2fb2EEdC3a547Cadb3F21dD0dcFF19e0';
const RPC_URL = 'https://testnet.sapphire.oasis.io';

// ============================================
// COMPONENTE DE TESTE
// ============================================
function TestComponent() {
  const { prevdlAds, isInitialized, error } = usePrevDLContext();
  const [userAddress, setUserAddress] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  // Conectar wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        addLog(`✅ Wallet conectada: ${address}`);
      } else {
        addLog('❌ MetaMask não encontrada. Instale MetaMask primeiro.');
      }
    } catch (error: any) {
      addLog(`❌ Erro ao conectar wallet: ${error.message}`);
    }
  };

  // Teste 1: Verificar estado do contrato
  const testContractState = async () => {
    if (!prevdlAds || !isInitialized) {
      addLog('❌ SDK não inicializado');
      return;
    }

    setLoading(true);
    try {
      addLog('📊 Testando estado do contrato...');
      
      const total = await prevdlAds.getTotalCampaigns();
      addLog(`   Total de campanhas: ${total}`);
      
      const active = await prevdlAds.getActiveCampaigns();
      addLog(`   Campanhas ativas: ${active.length}`);
      setCampaigns(active);
      
      if (active.length > 0) {
        addLog(`   IDs: ${active.join(', ')}`);
      }
      
      addLog('✅ Teste de estado concluído');
    } catch (error: any) {
      addLog(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Teste 2: Criar perfil de usuário
  const testCreateProfile = async () => {
    if (!prevdlAds || !userAddress) {
      addLog('❌ SDK não inicializado ou wallet não conectada');
      return;
    }

    setLoading(true);
    try {
      addLog('📝 Testando criação de perfil...');
      
      const profile: UserProfile = {
        age: 28,
        location: Location.SAO_PAULO,
        profession: Profession.SOFTWARE_ENGINEER,
        interests: [Interest.TECH, Interest.CRYPTO],
        gender: Gender.MALE,
      };
      
      setUserProfile(profile);
      
      // Verificar se já tem perfil
      const hasProfile = await prevdlAds.hasProfile(userAddress);
      if (hasProfile) {
        addLog('   ⚠️  Usuário já tem perfil. Obtendo perfil existente...');
        const existing = await prevdlAds.getUserProfile(userAddress);
        addLog(`   ✅ Perfil existente: idade ${existing.age}, localização ${Location[existing.location]}`);
        return;
      }
      
      addLog('   🔐 Criptografando e enviando perfil...');
      const txHash = await prevdlAds.setUserProfile(profile, userAddress);
      addLog(`   ✅ Perfil criado! TX: ${txHash}`);
      addLog('   ⏳ Aguardando confirmação...');
      
      // Aguardar confirmação
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      await provider.waitForTransaction(txHash as string, 1);
      addLog('   ✅ Transação confirmada!');
      
    } catch (error: any) {
      addLog(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Teste 3: Obter ads matching
  const testGetMatchingAds = async () => {
    if (!prevdlAds || !userAddress) {
      addLog('❌ SDK não inicializado ou wallet não conectada');
      return;
    }

    setLoading(true);
    try {
      addLog('🎯 Testando obtenção de ads matching...');
      
      const matchingAds = await prevdlAds.getTargetedAds(undefined, userAddress);
      addLog(`   ✅ Encontrados ${matchingAds.length} ads matching`);
      
      if (matchingAds.length > 0) {
        matchingAds.forEach((ad, index) => {
          addLog(`   ${index + 1}. Ad ID: ${ad.id}, CTA: ${ad.ctaUrl}`);
        });
        setAds(matchingAds);
      } else {
        addLog('   ℹ️  Nenhum ad matching encontrado');
        addLog('   💡 Crie uma campanha que corresponda ao seu perfil');
      }
      
    } catch (error: any) {
      addLog(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Teste 4: Verificar match de ad específico
  const testCheckAdMatch = async () => {
    if (!prevdlAds || !userAddress || campaigns.length === 0) {
      addLog('❌ SDK não inicializado ou nenhuma campanha disponível');
      return;
    }

    setLoading(true);
    try {
      addLog('🔍 Testando verificação de match...');
      
      const campaignId = campaigns[0];
      if (!userProfile) {
        addLog('   ⚠️  Criando perfil temporário para teste...');
        setUserProfile({
          age: 28,
          location: Location.SAO_PAULO,
          profession: Profession.SOFTWARE_ENGINEER,
          interests: [Interest.TECH, Interest.CRYPTO],
          gender: Gender.MALE,
        });
      }
      
      const match = await prevdlAds.checkAdMatch(userProfile!, campaignId, userAddress);
      addLog(`   Campanha ID: ${campaignId}`);
      addLog(`   Match: ${match.isMatch ? '✅ Sim' : '❌ Não'}`);
      
      if (match.matchDetails) {
        addLog(`   Detalhes:`);
        addLog(`     - Idade: ${match.matchDetails.ageMatch ? '✅' : '❌'}`);
        addLog(`     - Localização: ${match.matchDetails.locationMatch ? '✅' : '❌'}`);
        addLog(`     - Profissão: ${match.matchDetails.professionMatch ? '✅' : '❌'}`);
        addLog(`     - Interesse: ${match.matchDetails.interestMatch ? '✅' : '❌'}`);
        addLog(`     - Gênero: ${match.matchDetails.genderMatch ? '✅' : '❌'}`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Teste 5: Obter estatísticas
  const testGetStats = async () => {
    if (!prevdlAds || campaigns.length === 0) {
      addLog('❌ SDK não inicializado ou nenhuma campanha disponível');
      return;
    }

    setLoading(true);
    try {
      addLog('📈 Testando obtenção de estatísticas...');
      
      const campaignId = campaigns[0];
      const campaignStats = await prevdlAds.getCampaignStats(campaignId);
      
      addLog(`   Campanha ID: ${campaignId}`);
      addLog(`   Impressões: ${campaignStats.impressions}`);
      addLog(`   Clicks: ${campaignStats.clicks}`);
      addLog(`   Matches: ${campaignStats.matches}`);
      addLog(`   Match Rate: ${campaignStats.matchRate}%`);
      addLog(`   CTR: ${campaignStats.ctr}%`);
      
      setStats(campaignStats);
      
    } catch (error: any) {
      addLog(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Teste 6: Obter campanha específica
  const testGetCampaign = async () => {
    if (!prevdlAds || campaigns.length === 0) {
      addLog('❌ SDK não inicializado ou nenhuma campanha disponível');
      return;
    }

    setLoading(true);
    try {
      addLog('📄 Testando obtenção de campanha...');
      
      const campaignId = campaigns[0];
      const campaign = await prevdlAds.getCampaign(campaignId);
      
      addLog(`   Campanha ID: ${campaign.id}`);
      addLog(`   CTA URL: ${campaign.ctaUrl}`);
      addLog(`   Bid/Impression: ${campaign.bidPerImpression}`);
      addLog(`   Bid/Click: ${campaign.bidPerClick}`);
      addLog(`   Impressões: ${campaign.impressions}`);
      addLog(`   Clicks: ${campaign.clicks}`);
      
    } catch (error: any) {
      addLog(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Limpar logs
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 PrevDL Ads - Testes com Contrato Oasis</h1>
      <p><strong>Contrato:</strong> {CONTRACT_ADDRESS}</p>
      <p><strong>Network:</strong> Sapphire Testnet</p>
      
      {/* Status */}
      <div style={{ margin: '20px 0', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Status</h2>
        <p>SDK Inicializado: {isInitialized ? '✅' : '❌'}</p>
        <p>Wallet: {userAddress || 'Não conectada'}</p>
        {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      </div>

      {/* Botões de Teste */}
      <div style={{ margin: '20px 0' }}>
        <h2>Testes</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={connectWallet} disabled={loading}>
            🔗 Conectar Wallet
          </button>
          <button onClick={testContractState} disabled={loading || !isInitialized}>
            1️⃣ Estado do Contrato
          </button>
          <button onClick={testCreateProfile} disabled={loading || !isInitialized || !userAddress}>
            2️⃣ Criar Perfil
          </button>
          <button onClick={testGetMatchingAds} disabled={loading || !isInitialized || !userAddress}>
            3️⃣ Obter Ads Matching
          </button>
          <button onClick={testCheckAdMatch} disabled={loading || !isInitialized || !userAddress || campaigns.length === 0}>
            4️⃣ Verificar Match
          </button>
          <button onClick={testGetStats} disabled={loading || !isInitialized || campaigns.length === 0}>
            5️⃣ Estatísticas
          </button>
          <button onClick={testGetCampaign} disabled={loading || !isInitialized || campaigns.length === 0}>
            6️⃣ Obter Campanha
          </button>
          <button onClick={clearLogs} disabled={loading}>
            🗑️ Limpar Logs
          </button>
        </div>
      </div>

      {/* Resultados */}
      {(ads.length > 0 || stats || campaigns.length > 0) && (
        <div style={{ margin: '20px 0', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
          <h2>Resultados</h2>
          {campaigns.length > 0 && (
            <div>
              <h3>Campanhas Ativas:</h3>
              <ul>
                {campaigns.map(id => (
                  <li key={id}>ID: {id}</li>
                ))}
              </ul>
            </div>
          )}
          {ads.length > 0 && (
            <div>
              <h3>Ads Matching ({ads.length}):</h3>
              <ul>
                {ads.map(ad => (
                  <li key={ad.id}>
                    ID: {ad.id}, CTA: {ad.ctaUrl}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stats && (
            <div>
              <h3>Estatísticas:</h3>
              <p>Impressões: {stats.impressions}</p>
              <p>Clicks: {stats.clicks}</p>
              <p>Matches: {stats.matches}</p>
              <p>Match Rate: {stats.matchRate}%</p>
              <p>CTR: {stats.ctr}%</p>
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      <div style={{ margin: '20px 0' }}>
        <h2>Logs</h2>
        <div style={{
          padding: '15px',
          background: '#1e1e1e',
          color: '#d4d4d4',
          borderRadius: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.length === 0 ? (
            <p style={{ color: '#888' }}>Nenhum log ainda. Execute os testes acima.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// APP PRINCIPAL COM PROVIDER
// ============================================
export default function OasisTestApp() {
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Tentar conectar wallet automaticamente
    const initWallet = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
          const signer = provider.getSigner();
          
          // Criar config com wallet do MetaMask
          setConfig({
            clientId: 'oasis-test-app',
            oasis: {
              contractAddress: CONTRACT_ADDRESS,
              rpcUrl: RPC_URL,
              wallet: signer,
            }
          });
        } else {
          // Fallback: usar private key do .env (apenas para desenvolvimento)
          const privateKey = process.env.REACT_APP_PRIVATE_KEY;
          if (privateKey) {
            const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
            const walletInstance = new ethers.Wallet(privateKey, provider);
            setWallet(walletInstance);
            
            setConfig({
              clientId: 'oasis-test-app',
              oasis: {
                contractAddress: CONTRACT_ADDRESS,
                rpcUrl: RPC_URL,
                wallet: walletInstance,
              }
            });
          } else {
            console.warn('⚠️  MetaMask não encontrada e PRIVATE_KEY não configurada');
            console.warn('   Configure REACT_APP_PRIVATE_KEY no .env ou instale MetaMask');
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar wallet:', error);
      }
    };

    initWallet();
  }, []);

  if (!config) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>⏳ Carregando...</h1>
        <p>Conectando à wallet...</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Se estiver demorando, verifique se MetaMask está instalado ou configure REACT_APP_PRIVATE_KEY
        </p>
      </div>
    );
  }

  return (
    <PrevDLProvider config={config}>
      <TestComponent />
    </PrevDLProvider>
  );
}

