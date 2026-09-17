function openPlayer(video) {
    currentVideoObj = video;
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');

    if (!modal || !player) return;

    const streamUrl = video.versions ? (video.versions['720p'] || video.versions['480p']) : (video.url || '');
    if (!streamUrl) {
        alert("No video URL available for this item.");
        return;
    }

    // 1. Reset player state and clear child elements to prevent load conflicts
    player.pause();
    player.onerror = null; 
    while (player.firstChild) {
        player.removeChild(player.firstChild);
    }

    // 2. Display modal before loading media
    modal.style.display = 'flex';
    player.style.display = 'block';

    // 3. Set attributes for mobile inline playback
    player.setAttribute('playsinline', 'true');
    player.setAttribute('webkit-playsinline', 'true');
    player.controls = true;

    // 4. Assign source directly
    player.src = streamUrl;
    player.load();

    // 5. Attempt playback (handle mobile browser autoplay restrictions gracefully)
    const playPromise = player.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay held by browser. Press play manually.", error);
        });
    }
}
