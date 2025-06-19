// ABOUTME: Performance-optimized image component that uses intersection observer for lazy loading
// ABOUTME: Shows loading state until image appears in viewport, then loads with fade-in effect and quality optimization
'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';

const LazyImage = memo(({ src, alt, width, height }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className="artist_image_wrapper">
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleImageLoad}
          className={`artist_image ${isLoaded ? 'loaded' : ''}`}
          loading="lazy"
          quality={75}
        />
      ) : (
        <div className="placeholder-image">
          <LoadingSpinner variant="inline" />
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
