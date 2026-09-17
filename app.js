document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});

let allCategoriesData = [];
let currentVideoObj = null;

async function loadContent() {
    const container = document.getElementById('categoryContainer');
    if (!container) {
        alert("Error: <main id='categoryContainer'> was not found in index.html");
        return;
    }

    container.innerHTML = '<p style="color:#888; padding:30px; text-align:center;">Loading content...</p>';

    try {
        const response = await fetch('videos.json');
        if (!response.ok) {
            throw new Error(`HTTP status ${response.status} - videos.json not found`);
        }
        
        allCategoriesData = await response.json();
        
        if (!Array.isArray(allCategoriesData) || allCategoriesData.length === 0) {
            container.innerHTML = '<p style="color:#ff4757; padding:30px; text-align:center;">videos.json is empty.</p>';
            return;
        }

        renderCategories(allCategoriesData);
    } catch (error) {
        console.error("Catalog Error:", error);
        container.innerHTML = `
            <div style="color:#ff4757; padding:30px; text-align:center;">
                <h3 style="margin-bottom:8px;">Catalog Load Failed</h3>
                <p style="color:#aaa; font-size:14px;">${error.message}</p>
                <p style="color:#666; font-size:12px; margin-top:10px;">Check your videos.json for syntax errors (missing brackets or extra commas).</p>
            </div>
        `;
    }
}

function renderCategories(categories) {
    const container = document.getElementById('categoryContainer');
    if (!container) return;
    container.innerHTML = '';

    let totalVideos = 0;

    categories.forEach(cat => {
        if (!cat.videos || cat.videos.length === 0) return;

        totalVideos += cat.videos.length;

        const sec = document.createElement('div');
        sec.className = 'category-section';
        sec.style.marginBottom = '30px';
        sec.innerHTML = `<h2 style="color: #fff; margin: 15px 0 10px; font-size: 1.2rem;">${cat.categoryTitle}</h2>`;

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        grid.style.gap = '15px';

        cat.videos.forEach(vid => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.style.background = '#1a1d24';
            card.style.borderRadius = '8px';
            card.style.padding = '10px';
            card.style.cursor = 'pointer';
            card.style.color = '#fff';

            card.innerHTML = `
                <img src="${vid.thumbnail || 'https://placehold.co/150x200'}" style="width:100%; border-radius:6px; height:180px; object-fit:cover;">
                <h3 style="font-size:14px; margin:8px 0 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${vid.title}</h3>
                <span style="font-size:10px; background:#ff4757; padding:2px 6px; border-radius:4px;">${vid.rating || 'ALL'}</span>
            `;

            card.onclick = () => openPlayer(vid);
            grid.appendChild(card);
        });

        sec.appendChild(grid);
        container.appendChild(sec);
    });

    if (totalVideos === 0) {
        container.innerHTML = '<p style="color:#aaa; padding:30px; text-align:center;">No videos found.</p>';
    }
}

function openPlayer(video) {
    currentVideoObj = video;
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');

    if (!modal || !player) {
        alert("Player components missing in HTML.");
        return;
    }

    const streamUrl = video.versions ? (video.versions['720p'] || video.versions['480p']) : video.url;

    player.onerror = () => {
        alert("Playback error. Unable to load stream:\n" + streamUrl);
    };

    player.src = streamUrl;
    player.style.display = 'block';
    modal.style.display = 'flex';
    player.load();
    player.play().catch(e => console.log("Autoplay blocked:", e));
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');
    if (player) {
        player.pause();
        player.src = '';
    }
    if (modal) modal.style.display = 'none';
}

function changeVideoQuality() {
    const select = document.getElementById('qualitySelect');
    const player = document.getElementById('mp4Player');
    if (!select || !player || !currentVideoObj) return;

    const quality = select.value;
    if (currentVideoObj.versions && currentVideoObj.versions[quality]) {
        const currentTime = player.currentTime;
        player.src = currentVideoObj.versions[quality];
        player.currentTime = currentTime;
        player.play();
    }
}

function filterVideos() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.toLowerCase();

    const filtered = allCategoriesData.map(cat => ({
        categoryTitle: cat.categoryTitle,
        videos: cat.videos.filter(v => v.title.toLowerCase().includes(query))
    }));

    renderCategories(filtered);
}

function playFeatured() {
    if (allCategoriesData.length > 0 && allCategoriesData[0].videos && allCategoriesData[0].videos.length > 0) {
        openPlayer(allCategoriesData[0].videos[0]);
    } else {
        alert("No featured content available.");
    }
}

function triggerDownload(url, filename) {
    const streamUrl = url || (allCategoriesData[0]?.videos[0]?.versions['720p']);
    if (!streamUrl) return;
    const a = document.createElement('a');
    a.href = streamUrl;
    a.download = filename || 'video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function toggleDataSaver() { alert("Data Saver Mode toggled."); }
function openParentalModal() { const m = document.getElementById('parentalModal'); if(m) m.style.display='flex'; }
function closeParentalModal() { const m = document.getElementById('parentalModal'); if(m) m.style.display='none'; }
function togglePremium() { alert("Premium Mode Active."); }
