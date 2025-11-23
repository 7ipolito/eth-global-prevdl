import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Megaphone, User, ArrowRight, Lock } from "lucide-react";
import { Ads } from "../../../../dist/sdk/src/components/Ads";
import { UserProfile, Ad, Location, Profession, Interest } from "../types";
import "./SuggestedAdsPage.css";

export function SuggestedAdsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const profileFromState = location.state?.profile as UserProfile | undefined;

  const defaultProfile: UserProfile = {
    age: 28,
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [
      Interest.TECH,
      Interest.CRYPTO,
      Interest.TRAVEL,
      Interest.GAMING,
    ],
  };

  const [currentProfile] = useState<UserProfile>(
    profileFromState || defaultProfile
  );

  const handleAdClick = (ad: Ad) => {
    console.log("Ad clicked:", ad.id, ad.title);
    alert(`You clicked on the ad: ${ad.title}`);
  };

  const handleAdImpression = (ad: Ad) => {
    console.log("Ad impression:", ad.id, ad.title);
  };

  useEffect(() => {
    if (!profileFromState) {
      navigate("/general");
    }
  }, [profileFromState, navigate]);

  if (!profileFromState) {
    return null;
  }

  return (
    <>
      <section className="profile-section">
        <h2>
          <User
            size={24}
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: "0.5rem",
            }}
          />
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
              <strong>Profession:</strong>{" "}
              {Profession[currentProfile.profession]}
            </div>
            <div className="profile-item">
              <strong>Interests:</strong>{" "}
              {currentProfile.interests.map((i) => Interest[i]).join(", ")}
            </div>
          </div>
        </div>
      </section>

      <section className="ads-section" id="ads">
        <h2>
          <Megaphone
            size={24}
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: "0.5rem",
            }}
          />
          Targeted Ads
        </h2>
        <p className="ads-description">
          These ads were selected specifically for you based on your profile,
          maintaining your privacy.
        </p>

        <Ads
          userProfile={currentProfile}
          maxAds={10}
          devHighlights={true}
          loading={
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading personalized ads...</p>
            </div>
          }
          error={
            <div className="error-state">
              <p>No ads found for your profile</p>
            </div>
          }
        />
      </section>
    </>
  );
}
