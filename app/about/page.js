'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState('');

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        // Fetch README.md from the public folder or your repository
        const response = await fetch(
          'https://raw.githubusercontent.com/rianvdm/my-music-next/main/README.md'
        );
        const markdown = await response.text();
        const htmlContent = marked(markdown);

        // Modify the HTML content to add the 'centered-image' class to all <img> tags
        const modifiedContent = htmlContent.replace(/<img/g, '<img class="centered-image"');

        setAboutContent(modifiedContent);
      } catch (error) {
        console.error('Error fetching about content:', error);
        setAboutContent('<p>Failed to load about content.</p>');
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <div>
      <h1>About this site</h1>
      {/* Render the fetched and parsed README.md content */}
      <div dangerouslySetInnerHTML={{ __html: aboutContent }} />
    </div>
  );
}
