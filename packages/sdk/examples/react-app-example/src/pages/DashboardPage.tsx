import { useState, useEffect } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { usePrevDLAds } from '../../../../dist/components';
import type { DashboardAd } from '../types/dashboard';
import './DashboardPage.css';

export function DashboardPage() {
  const prevdlAds = usePrevDLAds();
  const [campaigns, setCampaigns] = useState<DashboardAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!prevdlAds) {
        setError('SDK não inicializado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Buscar IDs de todas as campanhas (ativas e inativas)
        // Usar getAllCampaigns se disponível, senão usar getActiveCampaigns como fallback
        let allCampaignIds: string[] = [];
        if (typeof (prevdlAds as any).getAllCampaigns === 'function') {
          allCampaignIds = await (prevdlAds as any).getAllCampaigns();
        } else {
          // Fallback: buscar apenas ativas se getAllCampaigns não estiver disponível
          allCampaignIds = await prevdlAds.getActiveCampaigns();
        }
        
        if (allCampaignIds.length === 0) {
          setCampaigns([]);
          setIsLoading(false);
          return;
        }

        // Buscar detalhes de cada campanha
        const campaignsData = await Promise.all(
          allCampaignIds.map(async (campaignId: string) => {
            try {
              // Buscar dados brutos do adapter diretamente para ter acesso a todas as propriedades
              let campaignRaw: any = null;
              let spentUSDC = 0;
              let createdAt: Date | null = null;
              let status = 'UNKNOWN';
              
              if (prevdlAds.oasisAdapter) {
                try {
                  campaignRaw = await prevdlAds.oasisAdapter.getCampaign(parseInt(campaignId));
                  spentUSDC = Number(campaignRaw.spentUSDC || 0) / 1000000; // Converter de 6 decimais para USDC
                  
                  // createdAt já vem como Date do OasisAdapter
                  if (campaignRaw.createdAt) {
                    createdAt = campaignRaw.createdAt instanceof Date 
                      ? campaignRaw.createdAt 
                      : new Date(Number(campaignRaw.createdAt) * 1000);
                  }
                  
                  // Status: 0=PENDING, 1=ACTIVE, 2=PAUSED, 3=BUDGET_EXCEEDED, 4=COMPLETED
                  const statusNum = Number(campaignRaw.status || 0);
                  status = statusNum === 1 ? 'ACTIVE' : 
                          statusNum === 2 ? 'PAUSED' : 
                          statusNum === 3 ? 'BUDGET_EXCEEDED' : 
                          statusNum === 4 ? 'COMPLETED' : 'PENDING';
                } catch (err) {
                  console.warn(`Erro ao buscar dados da campanha ${campaignId}:`, err);
                }
              }
              
              // Buscar campanha do SDK (converte para formato Ad)
              const campaign = await prevdlAds.getCampaign(campaignId);

              // Calcular amountPaid baseado em spentUSDC ou estimativa (clicks * bidPerClick + impressions * bidPerImpression)
              // Os valores de bid vêm em 6 decimais (micro USDC), então precisamos converter
              const bidPerClickUSDC = campaign.bidPerClick / 1000000;
              const bidPerImpressionUSDC = campaign.bidPerImpression / 1000000;
              const amountPaid = spentUSDC > 0 
                ? spentUSDC 
                : (campaign.clicks * bidPerClickUSDC + campaign.impressions * bidPerImpressionUSDC);

              // Criar título baseado no ID se não houver título
              const title = campaign.title || `Campaign #${campaignId}`;

              // Criar data (usar createdAt se disponível, senão usar data atual)
              const date = createdAt 
                ? createdAt.toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0];

              // Converter o Ad do SDK para o formato DashboardAd local
              const dashboardAd: DashboardAd = {
                id: campaignId,
                title,
                description: campaign.description || '',
                imageUrl: campaign.imageUrl,
                ctaUrl: campaign.ctaUrl,
                ctaText: campaign.ctaText,
                targetAgeMin: campaign.targetAgeMin,
                targetAgeMax: campaign.targetAgeMax,
                targetLocation: campaign.targetLocation as any, // Converter enum do SDK para enum local
                targetProfession: campaign.targetProfession as any,
                targetInterest: campaign.targetInterest as any,
                rankingScore: campaign.rankingScore || 0,
                metrics: {
                  adId: campaignId,
                  clicks: campaign.clicks || 0,
                  impressions: campaign.impressions || 0,
                  date,
                  amountPaid,
                  imageUrl: campaign.imageUrl,
                  status, // Adicionar status aos metrics
                },
              };

              return dashboardAd;
            } catch (err: any) {
              console.error(`Erro ao buscar campanha ${campaignId}:`, err);
              return null;
            }
          })
        );

        // Filtrar campanhas nulas (com erro)
        const validCampaigns = campaignsData.filter((c: DashboardAd | null): c is DashboardAd => c !== null);
        setCampaigns(validCampaigns);
      } catch (err: any) {
        console.error('Erro ao buscar campanhas:', err);
        setError(err.message || 'Erro ao carregar campanhas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [prevdlAds]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <section className="dashboard-section">
        <h2>
          <BarChart3 size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Ad Dashboard
        </h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '3rem',
          gap: '1rem',
          color: '#888'
        }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Carregando campanhas...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-section">
        <h2>
          <BarChart3 size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Ad Dashboard
        </h2>
        <div style={{ 
          padding: '2rem', 
          color: '#ff4444', 
          textAlign: 'center' 
        }}>
          <p>❌ Erro ao carregar campanhas</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#888' }}>{error}</p>
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="dashboard-section">
        <h2>
          <BarChart3 size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Ad Dashboard
        </h2>
        <div style={{ 
          padding: '2rem', 
          color: '#888', 
          textAlign: 'center' 
        }}>
          <p>Nenhuma campanha encontrada</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <h2>
        <BarChart3 size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
        Ad Dashboard
      </h2>
      
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Ad Name</th>
              <th>Image</th>
              <th>Date</th>
              <th className="center-header">Status</th>
              <th className="center-header">Clicks</th>
              <th className="center-header">Impressions</th>
              <th className="center-header">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(ad => (
              <tr key={ad.id}>
                <td className="ad-name-cell">
                  <strong>{ad.title}</strong>
                </td>
                <td className="ad-image-cell">
                  {ad.metrics.imageUrl ? (
                    <img src={ad.metrics.imageUrl} alt={ad.title} className="ad-thumbnail" />
                  ) : (
                    <div className="ad-placeholder">No Image</div>
                  )}
                </td>
                <td>{formatDate(ad.metrics.date)}</td>
                <td className="metric-cell">
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: ad.metrics.status === 'ACTIVE' ? '#00ff00' : 
                                   ad.metrics.status === 'PAUSED' ? '#ffaa00' : 
                                   ad.metrics.status === 'COMPLETED' ? '#00aaff' : '#888',
                    color: '#000'
                  }}>
                    {ad.metrics.status || 'UNKNOWN'}
                  </span>
                </td>
                <td className="metric-cell">{ad.metrics.clicks.toLocaleString()}</td>
                <td className="metric-cell">{ad.metrics.impressions.toLocaleString()}</td>
                <td className="amount-cell">{formatCurrency(ad.metrics.amountPaid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

