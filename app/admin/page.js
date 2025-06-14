'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const API_URL = 'https://personality-api.rian-db8.workers.dev/api';

// Custom hook for fetching personalities
const usePersonalities = () => {
  const [personalities, setPersonalities] = useState({});
  const [activePersonality, setActivePersonality] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonalities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/personalities`);
      if (!response.ok) {
        throw new Error('Failed to fetch personalities');
      }
      const data = await response.json();
      setPersonalities(data.personalities);
      setActivePersonality(data.activePersonality);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonalities();
  }, [fetchPersonalities]);

  return { personalities, activePersonality, isLoading, error, fetchPersonalities };
};

// Simple Modal Component
const SimpleModal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(var(--c-bg-rgb), 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: 'var(--c-bg)',
    padding: '20px',
    borderRadius: '5px',
    maxWidth: '500px',
    width: '90%',
    color: 'var(--c-base)',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>{title}</h2>
        <div>{children}</div>
        <button className="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// Personality Form Component
const PersonalityForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({ name: '', content: '' });
  const [error, setError] = useState('');

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const { name, content } = formData;
    if (!name.trim() || !content.trim()) {
      setError('Please enter both name and content.');
      return;
    }
    onAdd(formData);
    setFormData({ name: '', content: '' });
    setError('');
  }, [formData, onAdd]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Add New Personality</h1>
      <form>
        <div className="search-form" style={{ display: 'flex', justifyContent: 'center' }}>
          <Input
            variant="form"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter personality name..."
            style={{ width: '80%', maxWidth: '600px' }}
          />
        </div>
        <div
          className="search-form"
          style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}
        >
          <textarea
            id="follow-up-search"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter personality content..."
            rows="6"
            style={{ width: '80%', maxWidth: '600px' }}
          />
        </div>
        <div
          className="search-form"
          style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            className="button"
            style={{ width: '80%', maxWidth: '600px' }}
          >
            Add Personality
          </button>
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  );
};

// Game Data Form Component
const GameDataForm = () => {
  const [gameData, setGameData] = useState({ gameVersion: '', gameDate: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setGameData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/game-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) {
        throw new Error('Failed to save game data');
      }
      setMessage('Game data saved successfully');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '15px', marginTop: '0' }}>Set Game Data</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Input
          type="number"
          variant="form"
          size="small"
          name="gameVersion"
          value={gameData.gameVersion}
          onChange={handleChange}
          placeholder="Game version"
          style={{ width: 'calc(33% - 7.5px)' }}
          required
        />
        <Input
          type="date"
          variant="form"
          size="small"
          name="gameDate"
          value={gameData.gameDate}
          onChange={handleChange}
          style={{ width: 'calc(67% - 7.5px)' }}
          required
        />
        <button
          type="submit"
          className="button"
          style={{ padding: '8px 15px', whiteSpace: 'nowrap' }}
        >
          Save
        </button>
      </form>
      {message && (
        <p
          style={{
            color: message.includes('Error') ? 'red' : 'green',
            textAlign: 'center',
            marginTop: '10px',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// Personality List Component
const PersonalityList = ({ personalities, activePersonality, onUpdate, onDelete, onSetActive }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(null);

  const handleShowModal = (name, content) => {
    setSelectedPersonality({ name, content });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPersonality(null);
  };

  if (!Object.keys(personalities).length) {
    return <div>No personalities found.</div>;
  }

  return (
    <>
      <div
        className="track-grid"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}
      >
        {Object.entries(personalities).map(([name, data]) => (
          <div
            key={name}
            className="track"
            style={{
              padding: '20px',
              textAlign: 'center',
              border: '1px solid var(--c-accent)',
              borderRadius: '5px',
              maxWidth: 'none',
            }}
          >
            <h3 className="track_artist">{name}</h3>
            <p className="track_name">
              {data.content.substring(0, 100)}...
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  handleShowModal(name, data.content);
                }}
              >
                Read More
              </a>
            </p>
            <div className="button-group" style={{ marginTop: '10px' }}>
              <button onClick={() => onUpdate(name)} className="button">
                Update
              </button>
              <button onClick={() => onDelete(name)} className="button">
                Delete
              </button>
              <button
                onClick={() => onSetActive(name)}
                className="button"
                style={
                  activePersonality === name ? { backgroundColor: 'green', color: 'white' } : {}
                }
              >
                {activePersonality === name ? 'Active' : 'Set Active'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <SimpleModal show={showModal} onClose={handleCloseModal} title={selectedPersonality?.name}>
        <p>{selectedPersonality?.content}</p>
      </SimpleModal>
    </>
  );
};

// Main PersonalityManagerClient component
export default function PersonalityManagerClient() {
  const { personalities, activePersonality, isLoading, error, fetchPersonalities } =
    usePersonalities();

  const handleAddPersonality = useCallback(
    async personalityData => {
      try {
        const response = await fetch(`${API_URL}/personalities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personalityData),
        });
        if (!response.ok) {
          throw new Error('Failed to add personality');
        }
        fetchPersonalities();
      } catch (err) {
        console.error('Error adding personality:', err);
      }
    },
    [fetchPersonalities]
  );

  const handleUpdatePersonality = useCallback(
    async name => {
      const updatedContent = prompt('Enter new content:', personalities[name].content);
      if (updatedContent) {
        try {
          const response = await fetch(`${API_URL}/personalities/${name}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: updatedContent }),
          });
          if (!response.ok) {
            throw new Error('Failed to update personality');
          }
          fetchPersonalities();
        } catch (err) {
          console.error('Error updating personality:', err);
        }
      }
    },
    [personalities, fetchPersonalities]
  );

  const handleDeletePersonality = useCallback(
    async name => {
      if (confirm(`Are you sure you want to delete ${name}?`)) {
        try {
          const response = await fetch(`${API_URL}/personalities/${name}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error('Failed to delete personality');
          }
          fetchPersonalities();
        } catch (err) {
          console.error('Error deleting personality:', err);
        }
      }
    },
    [fetchPersonalities]
  );

  const handleSetActive = useCallback(
    async name => {
      try {
        const response = await fetch(`${API_URL}/active-personality`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!response.ok) {
          throw new Error('Failed to set active personality');
        }
        fetchPersonalities();
      } catch (err) {
        console.error('Error setting active personality:', err);
      }
    },
    [fetchPersonalities]
  );

  if (isLoading) {
    return <LoadingSpinner variant="personalities" size="medium" />;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <PersonalityForm onAdd={handleAddPersonality} />
      <GameDataForm />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginTop: '0', marginBottom: '0' }}>
          Existing Personalities
        </h2>
        <PersonalityList
          personalities={personalities}
          activePersonality={activePersonality}
          onUpdate={handleUpdatePersonality}
          onDelete={handleDeletePersonality}
          onSetActive={handleSetActive}
        />
      </div>
    </div>
  );
}
