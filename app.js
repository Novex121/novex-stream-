// State Management
let isPremium = localStorage.getItem('novex_premium') === 'true';
let isDataSaver = localStorage.getItem('novex_datasaver') === 'true';
let parentPin = localStorage.getItem('novex_parent_pin') || '1234';
let currentRestriction = localStorage.getItem('novex_restriction') || 'ALL';
let activeCategoryFilter = 'All';
let activeVideoVersions = null;

// Cloud Catalog Data Holder
let videoData = [];

// Initialize UI & Fetch Catalog from GitHub
document.addEventListener('DOMContentLoaded', async () => {
  applyPremiumState();
  applyDataSaverState();
  await loadCatalog();
});

// Load Catalog from GitHub JSON
async function loadCatalog() {
  const container = document.getElementById('categoryContainer');
  container.innerHTML = '<p style="text-align:center; color:#888; margin-top:30px;">Loading catalog...</p>';

  try {
    const response = await fetch('https://raw.githubusercontent.com/Novex121/novex-stream/main/videos.json');
    videoData = await response.json();
    applyFiltersAndSearch();
  } catch (error) {
    console.error("Failed to load video catalog:", error);
    container.innerHTML = '<p style="text-align:center; color:#ef4444; margin-top:30px;">Failed to connect to streaming catalog.</p>';
  }
}

// 1. Category Filter Pill Action
function filterByCategory(categoryName) {
  activeCategoryFilter = categoryName;

  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    if (pill.textContent === categoryName) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  applyFiltersAndSearch();
}

// 2. Live Search Bar Filter
function filterVideos() {
  applyFiltersAndSearch();
}

// Combined Filter Engine (Search + Category + Parental Controls)
function applyFiltersAndSearch() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();

  const processedData = videoData.map(section => {
    if (activeCategoryFilter !== 'All' && section.categoryTitle !== activeCategoryFilter) {
      return null;
    }

    const matchingVideos = section.videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery);
      const matchesRestriction = (currentRestriction === 'KIDS') ? (v.rating === 'KIDS') : true;
      return matchesSearch && matchesRestriction;
    });

    if (matchingVideos.length === 0) return null;

    return {
      categoryTitle: section.categoryTitle,
      videos: matchingVideos
    };
  }).filter(section => section !== null);

  renderVideoRows(processedData);
}

// 3. Render Dynamic Rows
function renderVideoRows(dataToRender) {
  const container = document.getElementById('categoryContainer');
  container.innerHTML = '';

  if (dataToRender.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#888; margin-top:30px;">No shows found matching your filters.</p>';
    return;
  }

  dataToRender.forEach(section => {
    const rowSection = document.createElement('section');
    rowSection.className = 'content-row';

    const title = document.createElement('h3');
    title.textContent = section.categoryTitle;
    rowSection.appendChild(title);

    const scrollRow = document.createElement('div');
    scrollRow.className = 'scroll-row';

    section.videos.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      let downloadBtnHTML = '';
      if (item.type === 'mp4') {
        const defaultUrl = item.versions['720p'] || item.versions['480p'];
        downloadBtnHTML = `<button onclick="triggerDownload('${defaultUrl}', '${item.downloadFilename}')">📥 Download</button>`;
      }

      card.innerHTML = `
        <div class="card-img" style="background-image: url('${item.thumbnail}');" onclick='openVideoWithVersions(${JSON.stringify(item.versions)}, "${item.type}")'></div>
        <p>${item.title}</p>
        <div class="card-actions">
          <button onclick='openVideoWithVersions(${JSON.stringify(item.versions)}, "${item.type}")'>▶ Stream</button>
          ${downloadBtnHTML}
        </div>
      `;

      scrollRow.appendChild(card);
    });

    rowSection.appendChild(scrollRow);
    container.appendChild(rowSection);
  });
}

// 4. Offline Video Downloads
function triggerDownload(fileUrl, fileName) {
  const anchor = document.createElement('a');
  anchor.href = fileUrl;
  anchor.download = fileName || 'video.mp4';
  anchor.target = '_blank';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

// 5. Data Saver Mode Toggle
function toggleDataSaver() {
  isDataSaver = !isDataSaver;
  localStorage.setItem('novex_datasaver', isDataSaver);
  applyDataSaverState();
}

function applyDataSaverState() {
  const btn = document.getElementById('dataSaverBtn');
  if (isDataSaver) {
    btn.textContent = "⚡ Data Saver ON";
    btn.style.background = "#f59e0b";
  } else {
    btn.textContent = "⚡ Data Normal";
    btn.style.background = "#1a1f2c";
  }
}

// 6. Premium Mode (Ad-Free Toggle)
function togglePremium() {
  isPremium = !isPremium;
  localStorage.setItem('novex_premium', isPremium);
  applyPremiumState();
}

function applyPremiumState() {
  const badge = document.getElementById('premiumBadge');
  const topAd = document.getElementById('topAd');
  const bottomAd = document.getElementById('bottomAd');

  if (isPremium) {
    badge.textContent = "⭐ Premium Active";
    badge.classList.add('active');
    if (topAd) topAd.style.display = 'none';
    if (bottomAd) bottomAd.style.display = 'none';
  } else {
    badge.textContent = "⭐ Get Premium";
    badge.classList.remove('active');
    if (topAd) topAd.style.display = 'block';
    if (bottomAd) bottomAd.style.display = 'block';
  }
}

// 7. Parental Control PIN Logic
function openParentalModal() {
  document.getElementById('parentalModal').style.display = 'flex';
  document.getElementById('pinSection').style.display = 'block';
  document.getElementById('parentSettingsSection').style.display = 'none';
  document.getElementById('parentPinInput').value = '';
}

function closeParentalModal() {
  document.getElementById('parentalModal').style.display = 'none';
}

function unlockParentSettings() {
  const pinEntered = document.getElementById('parentPinInput').value;
  if (pinEntered === parentPin) {
    document.getElementById('pinSection').style.display = 'none';
    document.getElementById('parentSettingsSection').style.display = 'block';
    document.getElementById('ratingSelect').value = currentRestriction;
  } else {
    alert("Incorrect Parent PIN. Default PIN is 1234.");
  }
}

function saveNewPin() {
  const newPin = document.getElementById('newPinInput').value;
  if (newPin.length === 4) {
    parentPin = newPin;
    localStorage.setItem('novex_parent_pin', newPin);
    alert("Parent PIN updated successfully!");
  } else {
    alert("Please enter a valid 4-digit PIN.");
  }
}

function updateContentFilter() {
  currentRestriction = document.getElementById('ratingSelect').value;
  localStorage.setItem('novex_restriction', currentRestriction);
  applyFiltersAndSearch();
}

// 8. Video Versions & Quality Switching
function openVideoWithVersions(versionsObj, type) {
  activeVideoVersions = versionsObj;
  
  let selectedQuality = "720p";
  if (isDataSaver && versionsObj["480p"]) {
    selectedQuality = "480p";
  } else if (versionsObj["1080p"]) {
    selectedQuality = "1080p";
  }

  document.getElementById('qualitySelect').value = selectedQuality;
  playVideo(versionsObj[selectedQuality] || Object.values(versionsObj)[0], type);
}

function changeVideoQuality() {
  if (!activeVideoVersions) return;
  const quality = document.getElementById('qualitySelect').value;
  const selectedUrl = activeVideoVersions[quality] || Object.values(activeVideoVersions)[0];
  
  const mp4Player = document.getElementById('mp4Player');
  const currentTime = mp4Player.currentTime;
  
  mp4Player.src = selectedUrl;
  mp4Player.currentTime = currentTime;
  mp4Player.play();
}

function playFeatured() {
  if (videoData.length > 0 && videoData[0].videos.length > 0) {
    openVideoWithVersions(videoData[0].videos[0].versions, videoData[0].videos[0].type);
  }
}

function playVideo(url, type) {
  const playerModal = document.getElementById('playerModal');
  const mp4Player = document.getElementById('mp4Player');
  const youtubePlayer = document.getElementById('youtubePlayer');

  playerModal.style.display = 'flex';

  if (type === 'youtube') {
    mp4Player.style.display = 'none';
    mp4Player.pause();
    youtubePlayer.src = url + "?autoplay=1";
    youtubePlayer.style.display = 'block';
  } else {
    youtubePlayer.style.display = 'none';
    youtubePlayer.src = "";
    mp4Player.src = url;
    mp4Player.style.display = 'block';
    mp4Player.play();
  }
}

function closePlayer() {
  const playerModal = document.getElementById('playerModal');
  const mp4Player = document.getElementById('mp4Player');
  const youtubePlayer = document.getElementById('youtubePlayer');

  mp4Player.pause();
  mp4Player.src = "";
  youtubePlayer.src = "";
  playerModal.style.display = 'none';
}