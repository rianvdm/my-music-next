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

