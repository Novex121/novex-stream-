document.addEventListener('DOMContentLoaded', () => {
    const repoOwner = 'novex121';
    const repoName = 'novex-stream'; // Update if your repo name is different
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases`;

    const videoContainer = document.getElementById('video-container'); // Adjust to match your HTML container ID
    const videoPlayer = document.querySelector('video');

    async function loadDynamicVideos() {
        try {
            const response = await fetch(apiUrl);
            const releases = await response.json();

            let allVideos = [];

            releases.forEach(release => {
                // Look through each asset attached to the release
                release.assets.forEach(asset => {
                    if (asset.name.endsWith('.mp4')) {
                        // Clean up the filename for a nice display title
                        let cleanTitle = asset.name
                            .replace(/[-_]/g, ' ')
                            .replace('.mp4', '');

                        allVideos.push({
                            title: cleanTitle,
                            url: asset.browser_download_url,
                            thumbnail: "https://via.placeholder.com/150x200" // Default thumbnail or preview
                        });
                    }
                });
            });

            console.log("Automatically loaded videos from GitHub Releases:", allVideos);

            // If you have a default video player element, load the first one automatically
            if (allVideos.length > 0 && videoPlayer) {
                videoPlayer.src = allVideos[0].url;
            }

            // Render them to your page UI if desired
            renderVideoList(allVideos);

        } catch (error) {
            console.error("Error fetching automatic video feeds:", error);
        }
    }

    function renderVideoList(videos) {
        // Optional: If you want to dynamically build UI cards for your list
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
