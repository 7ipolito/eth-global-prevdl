import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { UserProfile, Location, Profession, Interest } from '../types';
import './UserProfileCard.css';

interface UserProfileCardProps {
  profile: UserProfile;
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/ads', { state: { profile } });
  };

  return (
    <div className="user-profile-card" onClick={handleClick}>
      <div className="profile-card-icon">
        <User size={32} />
      </div>
      <div className="profile-card-content">
        <h3 className="profile-card-title">User Profile</h3>
        <div className="profile-card-info">
          <div className="profile-card-item">
            <strong>Age:</strong> {profile.age} years
          </div>
          <div className="profile-card-item">
            <strong>Location:</strong> {Location[profile.location]}
          </div>
          <div className="profile-card-item">
            <strong>Profession:</strong> {Profession[profile.profession]}
          </div>
          <div className="profile-card-item">
            <strong>Interests:</strong>{' '}
            {profile.interests.map(i => Interest[i]).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}

