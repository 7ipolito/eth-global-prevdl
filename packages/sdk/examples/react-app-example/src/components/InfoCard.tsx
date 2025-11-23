import React from 'react';
import { Lock, Target, Zap } from 'lucide-react';
import './InfoCard.css';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export function InfoCard({ icon, title, description, onClick }: InfoCardProps) {
  return (
    <div className="info-card" onClick={onClick}>
      <div className="info-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <div className="info-grid how-it-works-grid">
      <InfoCard
        icon={<Lock size={32} />}
        title="Total Privacy"
        description="Your personal data never leaves your device. Only the match result is shared."
      />
      <InfoCard
        icon={<Target size={32} />}
        title="Precise Targeting"
        description="Relevant ads based on age, location, profession and interests."
      />
      {/* <InfoCard
        icon={<Zap size={32} />}
        title="Zero-Knowledge"
        description="Powered by Aztec Network to ensure privacy with zero knowledge proofs."
      /> */}
    </div>
  );
}

