import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Megaphone, User, ArrowRight, Lock } from 'lucide-react';
import { UserProfile, Ad, Location, Profession, Interest } from '../types';
import { mockAds, getMatchingAds } from '../data/mockData';
import './SuggestedAdsPage.css';

export function SuggestedAdsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const profileFromState = location.state?.profile as UserProfile | undefined;

  const defaultProfile: UserProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [Interest.TECH, Interest.CRYPTO, Interest.TRAVEL, Interest.GAMING],
  };

  const [currentProfile] = useState<UserProfile>(profileFromState || defaultProfile);
  const [matchedAds, setMatchedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const ads = getMatchingAds(currentProfile, mockAds);
      setMatchedAds(ads);
      setLoading(false);
    }, 300);
  }, [currentProfile]);

  const handleAdClick = (ad: Ad) => {
    console.log('Ad clicked:', ad.id, ad.title);
    alert(`You clicked on the ad: ${ad.title}`);
  };

  useEffect(() => {
    if (!profileFromState) {
      navigate('/general');
    }
  }, [profileFromState, navigate]);

  if (!profileFromState) {
    return null;
  }

  return (
    <>
      <section className="profile-section">
        <h2>
          <User size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Current User Profile
        </h2>
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-item">
              <strong>Age:</strong> {currentProfile.age} years
            </div>
            <div className="profile-item">
              <strong>Location:</strong> {Location[currentProfile.location]}
            </div>
            <div className="profile-item">
              <strong>Profession:</strong> {Profession[currentProfile.profession]}
            </div>
            <div className="profile-item">
              <strong>Interests:</strong>{' '}
              {currentProfile.interests.map(i => Interest[i]).join(', ')}
            </div>
          </div>
        </div>
      </section>

      <section className="ads-section" id="ads">
        <h2>
          <Megaphone size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Targeted Ads
        </h2>
        <p className="ads-description">
          These ads were selected specifically for you based on
          your profile, maintaining your privacy.
        </p>
        {!loading && (
          <div className="ads-count">
            <p>
              Found <strong>{matchedAds.length}</strong> relevant ads for your profile!
            </p>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading personalized ads...</p>
          </div>
        ) : matchedAds.length === 0 ? (
          <div className="error-state">
            <p>No ads found for your profile</p>
          </div>
        ) : (
          <div className="ads-container">
            {matchedAds.map(ad => (
              <div
                key={ad.id}
                className="custom-ad-card"
                onClick={() => handleAdClick(ad)}
              >
                <div className="ad-content">
                  <h3 className="ad-title">{ad.title}</h3>
                  <p className="ad-description">{ad.description}</p>
                  <div className="ad-footer">
                    <button className="ad-cta-button">
                      {ad.ctaText || 'Learn More'} <ArrowRight size={16} />
                    </button>
                    <span className="privacy-badge">
                      <Lock size={14} /> Private
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

