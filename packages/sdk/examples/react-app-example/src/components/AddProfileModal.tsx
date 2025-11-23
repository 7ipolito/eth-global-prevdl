import React, { useState } from 'react';
import { UserProfile, Location, Profession, Interest, Gender } from '../types';
import { Modal } from './Modal';
import './AddProfileModal.css';

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (profile: Omit<UserProfile, 'id'>) => void;
}

export function AddProfileModal({ isOpen, onClose, onAdd }: AddProfileModalProps) {
  const [formData, setFormData] = useState({
    age: '',
    location: Location.SAO_PAULO,
    profession: Profession.SOFTWARE_ENGINEER,
    interests: [] as Interest[],
    gender: Gender.MALE,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.age || formData.interests.length === 0) {
      return;
    }

    const newProfile: Omit<UserProfile, 'id'> = {
      age: parseInt(formData.age, 10),
      location: formData.location,
      profession: formData.profession,
      interests: formData.interests,
      gender: formData.gender,
    };

    onAdd(newProfile);
    
    // Reset form
    setFormData({
      age: '',
      location: Location.SAO_PAULO,
      profession: Profession.SOFTWARE_ENGINEER,
      interests: [],
      gender: Gender.MALE,
    });
    
    onClose();
  };

  const toggleInterest = (interest: Interest) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      
      // Limita a 4 interesses (conforme visto nos dados mockados)
      return { ...prev, interests: interests.slice(0, 4) };
    });
  };

  const locationOptions = [
    { value: Location.SAO_PAULO, label: 'São Paulo' },
    { value: Location.RIO_DE_JANEIRO, label: 'Rio de Janeiro' },
    { value: Location.BRASILIA, label: 'Brasília' },
  ];

  const professionOptions = [
    { value: Profession.SOFTWARE_ENGINEER, label: 'Software Engineer' },
    { value: Profession.DESIGNER, label: 'Designer' },
    { value: Profession.PRODUCT_MANAGER, label: 'Product Manager' },
  ];

  const interestOptions = [
    { value: Interest.TECH, label: 'Tech' },
    { value: Interest.CRYPTO, label: 'Crypto' },
    { value: Interest.GAMING, label: 'Gaming' },
    { value: Interest.SPORTS, label: 'Sports' },
    { value: Interest.FASHION, label: 'Fashion' },
    { value: Interest.TRAVEL, label: 'Travel' },
  ];

  const genderOptions = [
    { value: Gender.MALE, label: 'Male' },
    { value: Gender.FEMALE, label: 'Female' },
    { value: Gender.OTHER, label: 'Other' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Perfil">
      <form className="add-profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="age">Idade *</label>
          <input
            id="age"
            type="number"
            min="1"
            max="120"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Localização *</label>
          <select
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: parseInt(e.target.value, 10) as Location }))}
            required
            className="form-select"
          >
            {locationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="profession">Profissão *</label>
          <select
            id="profession"
            value={formData.profession}
            onChange={(e) => setFormData(prev => ({ ...prev, profession: parseInt(e.target.value, 10) as Profession }))}
            required
            className="form-select"
          >
            {professionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Interesses * (selecione até 4)</label>
          <div className="interests-grid">
            {interestOptions.map(option => {
              const isSelected = formData.interests.includes(option.value);
              const isDisabled = !isSelected && formData.interests.length >= 4;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleInterest(option.value)}
                  disabled={isDisabled}
                  className={`interest-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {formData.interests.length === 0 && (
            <p className="form-error">Selecione pelo menos um interesse</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gênero</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: parseInt(e.target.value, 10) as Gender }))}
            className="form-select"
          >
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={!formData.age || formData.interests.length === 0}>
            Adicionar Perfil
          </button>
        </div>
      </form>
    </Modal>
  );
}

