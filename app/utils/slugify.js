// ABOUTME: URL slug generation utilities that clean and format artist names, album titles, and genres for web-safe URLs
// ABOUTME: Provides consistent string sanitization for routing, removing special characters and normalizing spacing

export const generateArtistSlug = artistName => {
  return encodeURIComponent(
    artistName
      .split(',')[0] // Remove text after the first comma
      .replace(/\s*\(.*?\)\s*/g, '') // Remove any text inside parentheses
      .replace(/[\'’]/g, '') // Remove single quotation marks and backticks
      .replace(/\//g, '-') // Replace / with hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
  );
};

export const generateAlbumSlug = albumName => {
  return encodeURIComponent(
    albumName
      .replace(/\./g, '') // Remove periods
      .replace(/\s*\(.*?\)\s*/g, '') // Remove any text inside parentheses
      .replace(/[\'’]/g, '') // Remove single quotation marks and backticks
      .replace(/\//g, '-') // Replace / with hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
  );
};

export const generateLastfmArtistSlug = artistName => {
  return encodeURIComponent(
    artistName
      .split(',')[0] // Remove text after the first comma
      .replace(/\//g, '-') // Replace / with hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
  );
};

export const generateGenreSlug = genreName => {
  return encodeURIComponent(
    genreName
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
  );
};
