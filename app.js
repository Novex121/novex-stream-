document.addEventListener('DOMContentLoaded', () => {
    const repoOwner = 'novex121';
    const repoName = 'novex121.github.io';
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases`;

    console.log("NOVEX Script Initialized. Fetching from:", apiUrl);

    async function loadDynamicVideos() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const releases = await response.json();
            console.log("Fetched releases data:", releases);

            let allVideos = [];

            if (Array.isArray(releases)) {
                releases.forEach(release => {
                    if (release.assets) {
                        release.assets.forEach(asset => {
                            if (asset.name.endsWith('.mp4')) {
                                let cleanTitle = asset.name
                                    .replace(/[-_]/g, ' ')
                                    .replace('.mp4', '');

                                allVideos.push({
                                    title: cleanTitle,
                                    url: asset.browser_download_url
                                });
                            }
                        });
                    }
                });
            }

            console.log("Processed videos list:", allVideos);

            const videoPlayer = document.querySelector('video') || document.getElementById('video-player');
            if (allVideos.length > 0 && videoPlayer) {
                videoPlayer.src = allVideos[0].url;
                console.log("Loaded first video into player:", allVideos[0].url);
            }

            renderVideoList(allVideos);

        } catch (error) {
            console.error("Error fetching automatic video feeds:", error);
        }
    }

    function renderVideoList(videos) {
        // Look for common container slots, or create one if none exist in your HTML
        let listElement = document.getElementById('playlist') || 
                          document.getElementById('video-container') || 
                          document.querySelector('.video-list');
        
        if (!listElement) {
            console.warn("No playlist container found in HTML. Creating one dynamically.");
            listElement = document.createElement('div');
            listElement.id = 'playlist';
            listElement.style.padding = '20px';
            listElement.style.color = '#ffffff';
            document.body.appendChild(listElement);
        }
        
        listElement.innerHTML = '';
        
        if (videos.length === 0) {
            listElement.innerHTML = '<p style="padding: 10px;">No .mp4 video assets found in GitHub releases yet.</p>';
            return;
        }

        videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'video-item';
            item.style.padding = '10px';
            item.style.margin = '5px 0';
            item.style.background = '#1a1a1a';
            item.style.cursor = 'pointer';
            item.style.borderRadius = '5px';
            item.innerHTML = `<p style="margin: 0; font-weight: bold;">📺 ${video.title}</p>`;
            
            item.onclick = () => {
                const player = document.querySelector('video');
                if (player) {
                    player.src = video.url;
                    player.play();
                }
            };
            listElement.appendChild(item);
        });
    }

    loadDynamicVideos();
});
