let allCategoriesData = [];
let currentVideoObj = null;

document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});

async function loadContent() {
    const container = document.getElementById('categoryContainer');
    if (!container) return;

    // 1. Attempt to fetch from videos.json
    try {
        let response = await fetch('videos.json');
        if (response.ok) {
            allCategoriesData = await response.json();
            renderCategories(allCategoriesData);
            return;
        }
    } catch (e) {
        console.warn("videos.json fetch failed, falling back to GitHub API", e);
    }

    // 2. Fallback directly to GitHub Releases API if JSON fails
    try {
        const apiRes = await fetch('https://api.github.com/repos/Novex121/novex121.github.io/releases');
        if (apiRes.ok) {
            const releases = await apiRes.json();
            let releaseVideos = [];
            releases.forEach(rel => {
                if (rel.assets) {
                    rel.assets.forEach(asset => {
                        if (asset.name.endsWith('.mp4')) {
                            releaseVideos.push({
                                title: asset.name.replace(/[-_]/g, ' ').replace('.mp4', ''),
                                rating: "ALL",
                                thumbnail: "https://via.placeholder.com/150x200",
                                type: "mp4",
                                downloadFilename: asset.name,
                                versions: {
                                    "720p": asset.browser_download_url,
                                    "480p": asset.browser_download_url
                                }
                            });
                        }
                    });
                }
            });
            allCategoriesData = [{ categoryTitle: "Latest Releases", videos: releaseVideos }];
            renderCategories(allCategoriesData);
        }
    } catch (err) {
        console.error("Failed to load video feeds:", err);
        container.innerHTML = "<p style='color:#fff; padding:20px;'>Failed to load video catalog.</p>";
    }
}

function renderCategories(categories) {
    const container = document.getElementById('categoryContainer');
    if (!container) return;
    container.innerHTML = '';

    categories.forEach(cat => {
        if (!cat.videos || cat.videos.length === 0) return;

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
                <img src="${vid.thumbnail || 'https://via.placeholder.com/150x200'}" style="width:100%; border-radius:6px; height:180px; object-fit:cover;">
                <h3 style="font-size:14px; margin:8px 0 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${vid.title}</h3>
                <span style="font-size:10px; background:#ff4757; padding:2px 6px; border-radius:4px;">${vid.rating || 'ALL'}</span>
            `;

            card.onclick = () => openPlayer(vid);
            grid.appendChild(card);
        });

        sec.appendChild(grid);
        container.appendChild(sec);
    });
}

function openPlayer(video) {
    currentVideoObj = video;
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');

    if (!modal || !player) return;

    const streamUrl = video.versions ? (video.versions['720p'] || video.versions['480p']) : video.url;
    
    player.src = streamUrl;
    player.style.display = 'block';
    modal.style.display = 'flex';
    player.load();
    player.play().catch(e => console.log("Autoplay prevented:", e));
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

function filterByCategory(category) {
    if (category === 'All') {
        renderCategories(allCategoriesData);
        return;
    }
    const filtered = allCategoriesData.map(cat => ({
        categoryTitle: cat.categoryTitle,
        videos: cat.videos.filter(v => cat.categoryTitle.toLowerCase().includes(category.toLowerCase()))
    }));
    renderCategories(filtered);
}

function playFeatured() {
    if (allCategoriesData.length > 0 && allCategoriesData[0].videos.length > 0) {
        openPlayer(allCategoriesData[0].videos[0]);
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
