import { useState } from 'react';
import { User, Plus } from 'lucide-react';
import { UserProfileCard } from '../components/UserProfileCard';
import { AddProfileModal } from '../components/AddProfileModal';
import { mockUserProfiles } from '../data/mockData';
import { UserProfile } from '../types';
import './GeneralPage.css';

export function GeneralPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>(mockUserProfiles);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddProfile = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddNewProfile = (newProfile: Omit<UserProfile, 'id'>) => {
    // Gera um ID único baseado no timestamp e número aleatório
    const newId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const profileWithId: UserProfile = {
      ...newProfile,
      id: newId,
    };
    
    setProfiles(prev => [...prev, profileWithId]);
  };

  return (
    <>
      <section className="general-section">
        <div className="general-section-header">
          <h2>
            <User size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            User Profiles
          </h2>
          <button className="add-profile-btn" onClick={handleAddProfile} aria-label="Adicionar novo perfil">
            <Plus size={20} />
          </button>
        </div>
        <p className="general-description">
          Click on a user profile to see targeted ads for that profile.
        </p>
        <div className="profiles-grid">
          {profiles.map(profile => (
            <UserProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>

      <AddProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddNewProfile}
      />
    </>
  );
}

