function openPlayer(video) {
    currentVideoObj = video;
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');

    if (!modal || !player) return;

    const streamUrl = video.versions ? (video.versions['720p'] || video.versions['480p']) : (video.url || '');
    if (!streamUrl) {
        alert("No video URL found for this selection.");
        return;
    }

    // Reset previous errors
    player.onerror = null;

    // Show modal first so video has visible layout dimensions
    modal.style.display = 'flex';
    player.style.display = 'block';

    // Set mobile inline play attributes
    player.setAttribute('playsinline', 'true');
    player.setAttribute('webkit-playsinline', 'true');
    player.controls = true;

    // Update video source
    player.src = streamUrl;
    const innerSource = player.querySelector('source');
    if (innerSource) innerSource.src = streamUrl;

    player.load();

    // Attach error listener only after load is initialized
    player.onerror = () => {
        alert("Unable to stream video. Check network connection or cross-origin restrictions:\n" + streamUrl);
    };

    // Safely attempt play
    const playPromise = player.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Autoplay blocked by mobile browser - user can press play manually
            console.log("Autoplay blocked. Tap play button on controls.");
        });
    }
}
