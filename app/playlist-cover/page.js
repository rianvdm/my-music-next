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
  });
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedPrompt(null);
    setGeneratedImage(null);

    try {
      const promptInput = `Create a playlist cover with these details:
      Title: "${formData.playlistName}"
      Genres: ${formData.genres}
      Mood/Vibe: ${formData.vibe}
      Objects to Include: ${formData.objects}
      Color Style: ${formData.colors}`;

      const promptResponse = await fetch(`https://api-openai-playlist-prompt.rian-db8.workers.dev/?prompt=${encodeURIComponent(promptInput)}`);
      const promptData = await promptResponse.json();
      
      if (!promptData.data) {
        throw new Error('No prompt received from prompt generation API');
      }
      
      setGeneratedPrompt(promptData.data);
      console.log('Generated prompt:', promptData.data);

      const imageResponse = await fetch(`https://api-openai-images.rian-db8.workers.dev/?prompt=${encodeURIComponent(promptData.data)}`);
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
      label: 'Playlist Name', 
      name: 'playlistName',
      placeholder: 'e.g., "Summer Nights" or "Rainy Day Jazz"'
    },
    { 
      id: 'genres-input', 
      label: 'Genres/Styles', 
      name: 'genres',
      placeholder: 'e.g., Rock, Jazz, Classical, Hip-hop'
    },
    { 
      id: 'vibe-input', 
      label: 'Vibe/Mood', 
      name: 'vibe',
      placeholder: 'e.g., Energetic, Melancholic, Peaceful'
    },
    { 
      id: 'objects-input', 
      label: 'Objects to Include', 
      name: 'objects',
      placeholder: 'e.g., Mountains, Ocean, City lights'
    },
    { 
      id: 'colors-input', 
      label: 'Color Style', 
      name: 'colors',
      placeholder: 'e.g., Vibrant blues, Warm sunset colors'
    }
  ];

  return (
    <div>
      <header>
        <h1>Playlist Cover Generator</h1>
      </header>
      <main>
        <section className="track_ul2" style={{ textAlign: 'left' }}>
          <p>
            <strong>Generate a custom cover image for your playlist using AI</strong>
          </p>
          
          <form onSubmit={handleSubmit} id="search-form" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            {FORM_FIELDS.map(field => (
              <div key={field.id} style={{ 
                display: 'flex', 
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                gap: '1rem'
              }}>
                <label htmlFor={field.id} style={{ 
                  width: '150px',
                  flexShrink: 0
                }}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required
                  style={{ 
                    flex: 1,
                    minWidth: '300px'
                  }}
                />
              </div>
            ))}
            
            <button
              type="submit"
              className="button"
              disabled={isLoading}
              style={{ 
                width: '200px', 
                marginTop: '1rem'
              }}
            >
              {isLoading ? 'Generating...' : 'Generate Cover'}
            </button>
          </form>

{/*           {generatedPrompt && (
            <div className="track_ul2" style={{ 
              marginTop: '2em',
              textAlign: 'left',
              maxWidth: '600px',
              margin: '2em auto'
            }}>
              <h2>Generated Prompt</h2>
              <p style={{ 
                padding: '0',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap'
              }}>
                {generatedPrompt}
              </p>
            </div>
          )} */}

          {generatedImage && (
            <div className="track_ul2" style={{ 
              marginTop: '0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h2>Generated Cover</h2>
              <div>
                <img
                  src={generatedImage}
                  alt="Generated playlist cover"
                  style={{ 
                    maxWidth: '100%',
                    width: '600px',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
