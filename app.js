document.addEventListener('DOMContentLoaded', () => {
    const repoOwner = 'novex121';
    const repoName = 'novex121.github.io'; // Change this to your exact repository name if different
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases`;

    const videoPlayer = document.querySelector('video');

    async function loadDynamicVideos() {
        try {
            const response = await fetch(apiUrl);
            const releases = await response.json();

            let allVideos = [];

            // Check if the API returned an array of releases
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

            console.log("Automatically loaded videos from GitHub Releases:", allVideos);

            // Automatically load the first MP4 video into the player if available
            if (allVideos.length > 0 && videoPlayer) {
                videoPlayer.src = allVideos[0].url;
            }

            renderVideoList(allVideos);

        } catch (error) {
            console.error("Error fetching automatic video feeds:", error);
        }
    }

    function renderVideoList(videos) {
        const listElement = document.getElementById('playlist');
        if (!listElement) return;
        
        listElement.innerHTML = '';
        videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'video-item';
            item.innerHTML = `<p>${video.title}</p>`;
            item.onclick = () => {
                if (videoPlayer) {
                    videoPlayer.src = video.url;
                    videoPlayer.play();
                }
            };
            listElement.appendChild(item);
        });
    }

    loadDynamicVideos();
});
