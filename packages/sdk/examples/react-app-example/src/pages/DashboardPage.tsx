import { BarChart3 } from 'lucide-react';
import { dashboardAds } from '../data/dashboardData';
import './DashboardPage.css';

export function DashboardPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
              <th className="center-header">Clicks</th>
              <th className="center-header">Impressions</th>
              <th className="center-header">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {dashboardAds.map(ad => (
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

