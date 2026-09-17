function renderVideoList(videos) {
    // Try to find common playlist container IDs
    const listElement = document.getElementById('playlist') || document.getElementById('video-container') || document.querySelector('.video-list');
    
    if (!listElement) {
        console.warn("Playlist container element not found in HTML!");
        return;
    }
    
    listElement.innerHTML = '';
    videos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.innerHTML = `<p>📺 ${video.title}</p>`;
        item.onclick = () => {
            if (videoPlayer) {
                videoPlayer.src = video.url;
                videoPlayer.play();
            }
        };
        listElement.appendChild(item);
    });
}
