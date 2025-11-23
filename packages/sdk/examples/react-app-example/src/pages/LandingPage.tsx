import { useNavigate } from 'react-router-dom';
import { Info, Users } from 'lucide-react';
import { HowItWorksSection, InfoCard } from '../components/InfoCard';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="landing-section">
        <div className="view-profiles-card-wrapper">
          <InfoCard
            icon={<Users size={48} />}
            title="View User Profiles"
            description="Explore different user profiles and see how targeted ads are matched based on privacy-preserving technology."
            onClick={() => navigate('/general')}
          />
        </div>
      </section>

      <section className="landing-section" id="general">
        <h2>
          <Info size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          How It Works
        </h2>
        <HowItWorksSection />
      </section>
    </>
  );
}

