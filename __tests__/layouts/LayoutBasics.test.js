import { generateMetadata as generateAlbumMetadata } from '../../app/album/[artistAndAlbum]/layout';
import { generateMetadata as generateArtistMetadata } from '../../app/artist/[artist]/layout';
import { generateMetadata as generateGenreMetadata } from '../../app/genre/[genre]/layout';

// Mock fetch globally
global.fetch = jest.fn();

describe('Layout Basics', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Album Layout', () => {
    it('generates metadata when album is found', async () => {
      const mockAlbumData = {
        data: [
          {
            name: 'Test Album',
            artist: 'Test Artist',
            image: 'https://example.com/image.jpg',
          },
        ],
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockAlbumData,
      });

      const params = { artistAndAlbum: 'test-artist_test-album' };
      const metadata = await generateAlbumMetadata({ params });

      expect(metadata.title).toContain('Test Album');
      expect(metadata.title).toContain('Test Artist');
      expect(metadata.description).toContain('Test Album');
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
    });

    it('handles album not found', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const params = { artistAndAlbum: 'unknown-artist_unknown-album' };
      const metadata = await generateAlbumMetadata({ params });

      expect(metadata.title).toContain('Not Found');
      expect(metadata.description).toBeDefined();

      consoleError.mockRestore();
    });
  });

  describe('Artist Layout', () => {
    it('generates metadata for artist', async () => {
      const mockArtistData = {
        name: 'Test Artist',
        image: 'https://example.com/artist.jpg',
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockArtistData,
      });

      const params = { artist: 'test-artist' };
      const metadata = await generateArtistMetadata({ params });

      expect(metadata.title).toContain('Test Artist');
      expect(metadata.description).toContain('Test Artist');
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
    });
  });

  describe('Genre Layout', () => {
    it('generates metadata for genre', async () => {
      const params = { genre: 'progressive-rock' };
      const metadata = await generateGenreMetadata({ params });

      expect(metadata.title).toContain('Progressive Rock');
      expect(metadata.description).toContain('Progressive Rock');
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
    });

    it('handles genre name formatting', async () => {
      const params = { genre: 'jazz-fusion' };
      const metadata = await generateGenreMetadata({ params });

      expect(metadata.title).toContain('Jazz Fusion');
      expect(metadata.description).toContain('Jazz Fusion');
    });
  });

  describe('Static Layouts', () => {
    it('static layouts return children', async () => {
      const CollectionLayout = (await import('../../app/collection/layout')).default;
      const LibraryLayout = (await import('../../app/library/layout')).default;

      const testChild = <div>Test Child</div>;

      expect(CollectionLayout({ children: testChild })).toBe(testChild);
      expect(LibraryLayout({ children: testChild })).toBe(testChild);
    });

    it('static layouts are functions', async () => {
      const CollectionLayout = (await import('../../app/collection/layout')).default;
      const LibraryLayout = (await import('../../app/library/layout')).default;
      const GuessmeLayout = (await import('../../app/guessme/layout')).default;

      expect(typeof CollectionLayout).toBe('function');
      expect(typeof LibraryLayout).toBe('function');
      expect(typeof GuessmeLayout).toBe('function');
    });
  });
});
