const API_KEY = '4cace2e053c8bc8ae6ed960c3518c853';
const API_URL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

const backupMovies = [
    { title: "Deadpool & Wolverine", poster_path: "/8cdWjvZQUrmU11cdq362544n62e.jpg", id: 533535, vote_average: 8.5 },
    { title: "Inside Out 2", poster_path: "/vpnVM9B6NMmQpWeZq2n9a53pBti.jpg", id: 1022789, vote_average: 7.9 },
    { title: "Alien: Romulus", poster_path: "/b33nnKl1GSFbao4l3fZj328K46j.jpg", id: 1226578, vote_average: 7.3 },
    { title: "Despicable Me 4", poster_path: "/wWba3TaojhK7Nhn4GUzWJc5h00e.jpg", id: 519182, vote_average: 7.1 }
];

getMovies(API_URL);

async function getMovies(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            showMovies(data.results);
        } else {
            showMovies(backupMovies);
        }
    } catch (error) {
        showMovies(backupMovies);
    }
}

function showMovies(movies) {
    if (!main) return;
    main.innerHTML = '';
    movies.forEach((movie) => {
        const { title, poster_path, vote_average, id } = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        const imageSrc = poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/500x750?text=No+Image';
        movieEl.innerHTML = `
            <img src="${imageSrc}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average ? vote_average.toFixed(1) : 'NR'}</span>
            </div>
        `;
        movieEl.addEventListener('click', () => openModal(id, title));
        main.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
    if (vote >= 8) return 'green';
    else if (vote >= 5) return 'orange';
    else return 'red';
}

function openModal(movieId, movieTitle) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0,0,0,0.98)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '99999';
    modal.style.padding = '10px';
    modal.style.overflowY = 'auto';

    const titleEl = document.createElement('h2');
    titleEl.innerText = movieTitle;
    titleEl.style.color = '#ff0055';
    titleEl.style.fontSize = '1.2rem';
    titleEl.style.marginBottom = '8px';
    titleEl.style.textAlign = 'center';

    const iframe = document.createElement('iframe');
    iframe.src = `https://vidsrc.me/embed/movie?tmdb=${movieId}`;
    iframe.style.width = '100%';
    iframe.style.maxWidth = '850px';
    iframe.style.height = '55vh';
    iframe.style.border = '2px solid #333';
    iframe.style.borderRadius = '8px';
    iframe.allowFullscreen = true;

    // Multi-Mirror Download Container
    const downloadContainer = document.createElement('div');
    downloadContainer.style.display = 'flex';
    downloadContainer.flexWrap = 'wrap';
    downloadContainer.style.gap = '10px';
    downloadContainer.style.marginTop = '12px';
    downloadContainer.style.justifyContent = 'center';
    downloadContainer.style.width = '100%';
    downloadContainer.style.maxWidth = '850px';

    const mirrors = [
        { name: '📥 Mirror 1 (VidSrc)', url: `https://vidsrc.me/embed/movie?tmdb=${movieId}` },
        { name: '📥 Mirror 2 (MultiEmbed)', url: `https://multiembed.mov/?video_id=${movieId}&tmdb=1` },
        { name: '📥 Mirror 3 (2Embed)', url: `https://www.2embed.cc/embed/${movieId}` }
    ];

    mirrors.forEach(mirror => {
        const btn = document.createElement('a');
        btn.innerText = mirror.name;
        btn.href = mirror.url;
        btn.target = '_blank';
        btn.style.padding = '10px 16px';
        btn.style.fontSize = '14px';
        btn.style.color = 'white';
        btn.style.backgroundColor = '#00cc44';
        btn.style.textDecoration = 'none';
        btn.style.borderRadius = '6px';
        btn.style.fontWeight = 'bold';
        btn.style.flex = '1';
        btn.style.textAlign = 'center';
        btn.style.minWidth = '140px';
        downloadContainer.appendChild(btn);
    });

    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕ CLOSE PLAYER';
    closeBtn.style.marginTop = '12px';
    closeBtn.style.padding = '10px 24px';
    closeBtn.style.fontSize = '14px';
    closeBtn.style.color = 'white';
    closeBtn.style.backgroundColor = '#ff3333';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));

    modal.appendChild(titleEl);
    modal.appendChild(iframe);
    modal.appendChild(downloadContainer);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
}

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = search.value;
        if (searchTerm && searchTerm !== '') {
            getMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`);
            search.value = '';
        } else {
            window.location.reload();
        }
    });
}
