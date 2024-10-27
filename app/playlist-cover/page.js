'use client';

export const runtime = 'edge';

import { useState } from 'react';

export default function PlaylistCoverPage() {
  // Add this style constant at the top of your component
  const inputWidth = '400px';

  const [formData, setFormData] = useState({
    playlistName: '',
    genres: '',
    vibe: '',
    objects: '',
    colors: '',
    fontStyle: '', // Add this new field
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
    setGeneratedPrompt(null); // Reset prompt when starting new generation
    setGeneratedImage(null); // Reset image when starting new generation

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
      
      setGeneratedPrompt(promptData.data); // Store the generated prompt
      console.log('Generated prompt:', promptData.data);

      // Then use that prompt with DALL-E
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
            <div className="filter-container" style={{ width: inputWidth }}>
              <label htmlFor="playlist-name">Playlist Name</label>
              <input
                id="playlist-name"
                type="text"
                name="playlistName"
                value={formData.playlistName}
                onChange={handleInputChange}
                placeholder="Enter playlist name..."
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="filter-container" style={{ width: inputWidth }}>
              <label htmlFor="genres-input">Genres/Styles</label>
              <input
                id="genres-input"
                type="text"
                name="genres"
                value={formData.genres}
                onChange={handleInputChange}
                placeholder="Enter genres/styles..."
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="filter-container" style={{ width: inputWidth }}>
              <label htmlFor="vibe-input">Vibe/Mood</label>
              <input
                id="vibe-input"
                type="text"
                name="vibe"
                value={formData.vibe}
                onChange={handleInputChange}
                placeholder="Enter the vibe/mood..."
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="filter-container" style={{ width: inputWidth }}>
              <label htmlFor="objects-input">Objects to Include</label>
              <input
                id="objects-input"
                type="text"
                name="objects"
                value={formData.objects}
                onChange={handleInputChange}
                placeholder="Enter objects to include..."
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="filter-container" style={{ width: inputWidth }}>
              <label htmlFor="colors-input">Color Style</label>
              <input
                id="colors-input"
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleInputChange}
                placeholder="Enter color style..."
                required
                style={{ width: '100%' }}
              />
            </div>

    {/*             <div className="filter-container" style={{ width: inputWidth }}>
                <label htmlFor="font-input">Font Style</label>
                <input
                    id="font-input"
                    type="text"
                    name="fontStyle"
                    value={formData.fontStyle}
                    onChange={handleInputChange}
                    placeholder="Enter font style (e.g., bold serif, elegant script)..."
                    required
                    style={{ width: '100%' }}
                />
                </div> */}

            <button
              type="submit"
              className="button"
              disabled={isLoading}
              style={{ width: '200px', marginTop: '1rem', marginLeft: '0' }}
            >
              {isLoading ? 'Generating...' : 'Generate Cover'}
            </button>
          </form>
{/* 
          {generatedPrompt && (
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
              marginTop: '2em',
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
