// Search boxes for getting album recommendations from ChatGPT

            <h1>Album Recommendations</h1>
            <div style={{ textAlign: 'center' }}>
                <strong>Looking for something fresh? Look up an album you recently enjoyed, and ChatGPT will do the rest.</strong>
            </div>
            <div id="search-form">
                <input 
                    id="album-name" 
                    type="text" 
                    value={album} 
                    onChange={(e) => setAlbum(e.target.value)} 
                    placeholder="Enter album name..." 
                    onKeyDown={handleKeyDown} 
                    className="input-field"
                />
                <input 
                    id="artist-name" 
                    type="text" 
                    value={artist} 
                    onChange={(e) => setArtist(e.target.value)} 
                    placeholder="Enter artist name..." 
                    onKeyDown={handleKeyDown} 
                    className="input-field"
                />
                <button className="button" onClick={handleSearch}>Search</button>
            </div>
            {loading && (
                <div className="track_ul">
                    <p>Loading... (No look I promise, it really <em>is</em> loading. Just count to 10. It's going to be fine.)</p>
                    <br/>
                </div>
            )}
            {recommendation && (
                <div className="track_ul">
                    <div dangerouslySetInnerHTML={{ __html: marked(recommendation) }} />
                    <br/>
                </div>
            )}
            <div style={{ marginTop: '40px' }}></div>



function TopArtists({ data }) {
    if (!data) return <p>Loading artists...</p>;

    return (
        <div className="track-grid">
            {data.map(artist => {
                const artistSlug = encodeURIComponent(artist.name.replace(/ /g, '-').toLowerCase());
                const artistUrl = `artist/${artistSlug}`;
                const artistImage = artist.image || 'https://file.elezea.com/noun-no-image.png';

                return (
                    <div className="track" key={artist.name}>
                        <Link href={artistUrl} rel="noopener noreferrer">
                            <img src={artistImage} className="track_image" alt={artist.name} />
                        </Link>
                        <div className="track_content">
                            <h2 className="track_artist">
                                <Link href={artistUrl} rel="noopener noreferrer">
                                    {artist.name}
                                </Link>
                            </h2>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}