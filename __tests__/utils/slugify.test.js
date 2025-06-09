import { generateArtistSlug, generateAlbumSlug, generateLastfmArtistSlug } from '../../app/utils/slugify'

describe('Slugify Utils', () => {
  describe('generateArtistSlug', () => {
    it('converts artist name to slug format', () => {
      expect(generateArtistSlug('Pink Floyd')).toBe('pink-floyd')
      expect(generateArtistSlug('The Beatles')).toBe('the-beatles')
      expect(generateArtistSlug('AC/DC')).toBe('ac-dc')
    })

    it('handles special characters', () => {
      expect(generateArtistSlug('Panic! at the Disco')).toBe('panic!-at-the-disco')
      expect(generateArtistSlug('Twenty One Pilots')).toBe('twenty-one-pilots')
    })

    it('handles parentheses and commas', () => {
      expect(generateArtistSlug('Artist (feat. Someone)')).toBe('artist')
      expect(generateArtistSlug('Artist, Extra Info')).toBe('artist')
    })

    it('throws error for null/undefined input', () => {
      expect(() => generateArtistSlug(null)).toThrow()
      expect(() => generateArtistSlug(undefined)).toThrow()
    })

    it('handles empty string', () => {
      expect(generateArtistSlug('')).toBe('')
    })
  })

  describe('generateAlbumSlug', () => {
    it('converts album name to slug format', () => {
      expect(generateAlbumSlug('The Dark Side of the Moon')).toBe('the-dark-side-of-the-moon')
      expect(generateAlbumSlug('Abbey Road')).toBe('abbey-road')
    })

    it('handles special characters and numbers', () => {
      expect(generateAlbumSlug('OK Computer')).toBe('ok-computer')
      expect(generateAlbumSlug('2001: A Space Odyssey')).toBe('2001%3A-a-space-odyssey')
    })

    it('removes periods and handles parentheses', () => {
      expect(generateAlbumSlug('Mr. Blue Sky')).toBe('mr-blue-sky')
      expect(generateAlbumSlug('Album (Deluxe Edition)')).toBe('album')
    })

    it('throws error for null/undefined input', () => {
      expect(() => generateAlbumSlug(null)).toThrow()
      expect(() => generateAlbumSlug(undefined)).toThrow()
    })

    it('handles empty string', () => {
      expect(generateAlbumSlug('')).toBe('')
    })
  })

  describe('generateLastfmArtistSlug', () => {
    it('converts artist name for Last.fm format', () => {
      expect(generateLastfmArtistSlug('Pink Floyd')).toBe('pink-floyd')
      expect(generateLastfmArtistSlug('The Beatles')).toBe('the-beatles')
    })

    it('handles special characters appropriately for Last.fm', () => {
      expect(generateLastfmArtistSlug('AC/DC')).toBe('ac-dc')
      expect(generateLastfmArtistSlug('Panic! at the Disco')).toBe('panic!-at-the-disco')
    })

    it('handles commas by taking first part only', () => {
      expect(generateLastfmArtistSlug('Artist, Extra Info')).toBe('artist')
    })
  })
})