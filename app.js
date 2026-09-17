function openPlayer(video) {
    currentVideoObj = video;
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');

    if (!modal || !player) return;

    const streamUrl = video.versions ? (video.versions['720p'] || video.versions['480p']) : video.url;

    player.onerror = () => {
        alert("Failed to load video. The link is broken or returned 404:\n" + streamUrl);
    };

    player.src = streamUrl;
    player.style.display = 'block';
    modal.style.display = 'flex';
    player.load();
    player.play().catch(e => console.log("Autoplay prevented:", e));
}
