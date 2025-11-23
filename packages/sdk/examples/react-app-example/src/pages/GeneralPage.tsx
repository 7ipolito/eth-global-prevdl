import { User } from 'lucide-react';
import { UserProfileCard } from '../components/UserProfileCard';
import { mockUserProfiles } from '../data/mockData';
import './GeneralPage.css';

export function GeneralPage() {
  return (
    <section className="general-section">
      <h2>
        <User size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
        User Profiles
      </h2>
      <p className="general-description">
        Click on a user profile to see targeted ads for that profile.
      </p>
      <div className="profiles-grid">
        {mockUserProfiles.map(profile => (
          <UserProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </section>
  );
}

