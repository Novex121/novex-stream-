let allCategoriesData = [];
let currentVideoObj = null;

document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});

async function loadContent() {
    const container = document.getElementById('categoryContainer');
    if (!container) return;

    container.innerHTML = '<p style="color:#888; text-align:center; padding:40px;">Loading catalog...</p>';

    try {
        const response = await fetch('videos.json');
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: Could not load videos.json`);
        }

        allCategoriesData = await response.json();

        if (!Array.isArray(allCategoriesData) || allCategoriesData.length === 0) {
            container.innerHTML = '<p style="color:#aaa; text-align:center; padding:40px;">No video categories available.</p>';
            return;
        }

        renderCategories(allCategoriesData);
    } catch (error) {
        console.error("Load Error:", error);
        container.innerHTML = `
            <div style="color:#ff4757; text-align:center; padding:40px; background:#1a1d24; border-radius:8px; max-width:500px; margin:20px auto;">
                <h3 style="margin-bottom:10px;">Failed to Load Catalog</h3>
                <p style="color:#ccc; font-size:14px;">${error.message}</p>
            </div>
        `;
    }
}

function renderCategories(categories) {
    const container = document.getElementById('categoryContainer');
    if (!container) return;
    container.innerHTML = '';

    let renderedCount = 0;

    categories.forEach(category => {
        if (!category.videos || category.videos.length === 0) return;

        renderedCount += category.videos.length;

        const section = document.createElement('section');
        section.className = 'category-section';

        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.categoryTitle || 'Category';
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'video-grid';

        category.videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.onclick = () => openPlayer(video);

            const thumbUrl = video.thumbnail || 'https://placehold.co/300x400/1a1d24/ffffff?text=No+Image';

            card.innerHTML = `
                <div class="thumbnail-container">
                    <img src="${thumbUrl}" alt="${video.title}" loading="lazy">
                </div>
                <div class="card-info">
                    <div class="card-title">${video.title || 'Untitled'}</div>
                    <span class="card-rating">${video.rating || 'ALL'}</span>
                </div>
            `;

            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    });

    if (renderedCount === 0) {
        container.innerHTML = '<p style="color:#aaa; text-align:center; padding:40px;">No matching videos found.</p>';
    }
}

function openPlayer(video) {
    currentVideoObj = video;
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');
    const qualitySelect = document.getElementById('qualitySelect');

    if (!modal || !player) return;

    let streamUrl = '';
    if (video.versions) {
        streamUrl = video.versions['720p'] || video.versions['480p'] || '';
    } else if (video.url) {
        streamUrl = video.url;
    }

    if (!streamUrl) {
        alert("No stream URL available for this video.");
        return;
    }

    if (qualitySelect) {
        qualitySelect.value = video.versions && video.versions['720p'] ? '720p' : '480p';
    }

    modal.style.display = 'flex';

    player.pause();
    player.removeAttribute('src');
    player.load();

    player.src = streamUrl;
    player.load();

    const playPromise = player.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            console.log("Autoplay paused by mobile browser. Tap play on controls.");
        });
    }
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('mp4Player');

    if (player) {
        player.pause();
        player.removeAttribute('src');
        player.load();
    }

    if (modal) {
        modal.style.display = 'none';
    }

    currentVideoObj = null;
}

function changeVideoQuality() {
    const select = document.getElementById('qualitySelect');
    const player = document.getElementById('mp4Player');

    if (!select || !player || !currentVideoObj || !currentVideoObj.versions) return;

    const selectedQuality = select.value;
    const newUrl = currentVideoObj.versions[selectedQuality];

    if (newUrl) {
        const currentTime = player.currentTime;
        const wasPlaying = !player.paused;

        player.src = newUrl;
        player.currentTime = currentTime;

        if (wasPlaying) {
            player.play().catch(() => {});
        }
    }
}

function filterVideos() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        renderCategories(allCategoriesData);
        return;
    }

    const filteredData = allCategoriesData.map(category => ({
        categoryTitle: category.categoryTitle,
        videos: category.videos.filter(v => v.title && v.title.toLowerCase().includes(query))
    }));

    renderCategories(filteredData);
}
