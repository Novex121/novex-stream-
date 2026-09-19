// Step 1: Register at themoviedb.org to get an API key and paste it between the quotes.
const API_KEY = ''; 

// Backup Simulation Data (Ensures a 100% successful render even before you add the API Key)
const DEMO_MOVIES = [
  { id: 533535, title: "Deadpool & Wolverine", poster_path: "/8cdWjvZQUrmU655K0fU18X1c9kI.jpg" },
  { id: 693134, title: "Dune: Part Two", poster_path: "/1pdfLvkbY9ohJlCjQH2TokxnuS9.jpg" },
  { id: 823464, title: "Godzilla x Kong", poster_path: "/tMefVNw21p1OEID419DtickZEl2.jpg" },
  { id: 1011985, title: "Kung Fu Panda 4", poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg" }
];

async function loadLatestMovies() {
  const container = document.getElementById('movieContainer');
  
  if (!API_KEY) {
    console.log("Simulation Mode Active: API Key missing. Rendering backup catalog.");
    renderMovies(DEMO_MOVIES, container);
    return;
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
    const data = await response.json();
    renderMovies(data.results, container);
  } catch (error) {
    console.error("Fetch failed. Loading backup simulation.", error);
    renderMovies(DEMO_MOVIES, container);
  }
}

function renderMovies(movies, container) {
  container.innerHTML = movies.map(movie => `
    <div class="movie-card" onclick="playMovie(${movie.id})">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <p class="movie-title">${movie.title}</p>
    </div>
  `).join('');
}

function playMovie(tmdbId) {
  const iframe = document.getElementById('player');
  iframe.src = `https://vidsrc.to/embed/movie/${tmdbId}`; 
  document.getElementById('videoModal').style.display = 'flex';
}

function closePlayer() {
  const iframe = document.getElementById('player');
  iframe.src = ''; // Stops playback immediately when closed
  document.getElementById('videoModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadLatestMovies);