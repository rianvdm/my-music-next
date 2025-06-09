import { render } from '@testing-library/react';

// Custom render function that includes any providers your app needs
const customRender = (ui, options) => {
  // Add any providers here if needed (theme, context, etc.)
  return render(ui, {
    // Wrap with providers if needed
    // wrapper: ({ children }) => <Provider>{children}</Provider>,
    ...options,
  });
};

// Mock data for testing
export const mockAlbumData = {
  id: '123',
  name: 'Test Album',
  artist: 'Test Artist',
  image: 'https://example.com/test-image.jpg',
  basic_information: {
    title: 'Test Album',
    artists: [{ name: 'Test Artist' }],
  },
};

export const mockSearchData = [
  {
    id: '1',
    basic_information: {
      title: 'Dark Side of the Moon',
      artists: [{ name: 'Pink Floyd' }],
    },
  },
  {
    id: '2',
    basic_information: {
      title: 'Abbey Road',
      artists: [{ name: 'The Beatles' }],
    },
  },
];

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
