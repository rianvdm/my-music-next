import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Album Details'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }) {
  const { artistAndAlbum } = params
  const [artist, album] = decodeURIComponent(artistAndAlbum.replace(/-/g, ' ')).split('_')

  // Fetch album details
  const albumResponse = await fetch(
    `https://api-lastfm-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
  )
  const albumData = await albumResponse.json()

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={albumData.image} alt={albumData.name} width={200} height={200} />
        <div style={{ marginLeft: 20 }}>
          <div>{albumData.name}</div>
          <div style={{ fontSize: 36 }}>by {albumData.artist}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}