'use client';

export const runtime = 'edge';

import { useState } from 'react';

export default function PlaylistCoverPage() {
  const inputWidth = '400px';

  const [formData, setFormData] = useState({
    playlistName: '',
    genres: '',
    vibe: '',
    objects: '',
    colors: '',
    model: 'STABILITY',
  });
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedPrompt(null);
    setGeneratedImage(null);

    try {
      const promptInput = `Create a prompt for a playlist cover with these details:
      Playlist Title: '${formData.playlistName}'
      Genres: ${formData.genres}
      Mood/Vibe: ${formData.vibe}
      Objects to Include: ${formData.objects}
      Color Style: ${formData.colors}`;

      const promptResponse = await fetch(
        `https://api-openai-playlist-prompt.rian-db8.workers.dev/?prompt=${encodeURIComponent(promptInput)}`
      );
      const promptData = await promptResponse.json();

      if (!promptData.data) {
        throw new Error('No prompt received from prompt generation API');
      }

      setGeneratedPrompt(promptData.data);
      console.log('Generated prompt:', promptData.data);

      const imageResponse = await fetch(
        `https://api-openai-images.rian-db8.workers.dev/?prompt=${encodeURIComponent(promptData.data)}&model=${formData.model}`
      );
      if (!imageResponse.ok) {
        throw new Error(`Image API responded with status: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      if (!imageData.data) {
        throw new Error('No image data received from image generation API');
      }

      setGeneratedImage(imageData.data);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error generating image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // At the top of your component, add this configuration
  const FORM_FIELDS = [
    {
      id: 'playlist-name',
      label: 'Playlist Title',
      name: 'playlistName',
      placeholder: 'e.g., Summer Nights, Big Guitars',
      required: true,
    },
    {
      id: 'genres-input',
      label: 'Genres',
      name: 'genres',
      placeholder: 'e.g., Rock, Jazz, Classical, Hip-hop',
      required: true,
    },
    {
      id: 'vibe-input',
      label: 'Mood/Style',
      name: 'vibe',
      placeholder: 'e.g., Energetic, Melancholic, Illustration',
      required: true,
    },
    {
      id: 'objects-input',
      label: 'Objects (optional)',
      name: 'objects',
      placeholder: 'e.g., Mountains, Ocean, Guitars',
      required: false,
    },
    {
      id: 'colors-input',
      label: 'Color Style',
      name: 'colors',
      placeholder: 'e.g., Vibrant blues, Warm sunset colors',
      required: true,
    },
  ];

  const MODEL_OPTIONS = [
    { value: 'STABILITY', label: 'Stability AI' },
    { value: 'OPENAI', label: 'DALLE 3' },
  ];

  return (
    <div>
      <header>
        <h1>Playlist Cover Generator</h1>
      </header>
      <main>
        <section className="track_ul2" style={{ textAlign: 'left' }}>
          <p>
            <strong>For best results, use a playlist name that is 1-2 words.</strong> You also might
            need to give it a more than one try to get the perfect image.
          </p>

          <form
            onSubmit={handleSubmit}
            id="search-form"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            {FORM_FIELDS.map(field => (
              <div
                key={field.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '600px',
                  gap: '1rem',
                }}
              >
                <label
                  htmlFor={field.id}
                  style={{
                    width: '150px',
                    flexShrink: 0,
                  }}
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  style={{
                    flex: 1,
                    minWidth: '300px',
                  }}
                />
              </div>
            ))}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                gap: '1rem',
              }}
            >
              <label
                htmlFor="model-select"
                style={{
                  width: '150px',
                  flexShrink: 0,
                }}
              >
                AI Model
              </label>
              <select
                id="model-select"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="genre-select"
                style={{
                  flex: 1,
                  minWidth: '300px',
                }}
              >
                {MODEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="button"
              disabled={isLoading}
              style={{
                width: '200px',
                marginTop: '1rem',
              }}
            >
              {isLoading ? 'Generating...' : 'Generate Cover'}
            </button>
          </form>

          {generatedPrompt && (
            <div
              className="track_ul2"
              style={{
                marginTop: '1rem',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '1rem auto',
              }}
            >
              <h2 style={{ margin: '0 0 0.5em' }}>Generated Prompt</h2>
              <p
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(var(--c-base-rgb), 0.1)',
                  color: 'var(--c-base)',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {generatedPrompt}
              </p>
            </div>
          )}

          {generatedImage && (
            <div
              className="track_ul2"
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: '0 0 0.5em' }}>Generated Cover</h2>
              <div>
                <img
                  src={generatedImage}
                  alt="Generated playlist cover"
                  style={{
                    maxWidth: '100%',
                    width: '600px',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
