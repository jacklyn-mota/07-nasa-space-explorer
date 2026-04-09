// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

const button = document.getElementById('getImages');
const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');

const API_KEY = "lUellAtbLCzHJAPFdq1VGmwwqI1LO4KXCwnKNZ9j"; //NASA API KEY

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

button.addEventListener('click', () => {
  fetchImages();
});
// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

function fetchImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

const url = `https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&thumbs=true&api_key=${API_KEY}`;

  // Show loading message
  loading.textContent = "🔄 Loading space photos...";
  gallery.innerHTML = "";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        loading.textContent = data.msg || "No images are available for this date range yet.";
        return;
      }

      displayGallery(data);
      loading.textContent = "";
    })
    .catch(err => {
      console.error(err);
      loading.textContent = "Error loading images.";
    });
}

function displayGallery(items) {
  gallery.innerHTML = "";

  // Newest first (optional)
  items.reverse();

  items.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');

    // Handle videos vs images
    if (item.media_type === "image") {
      card.innerHTML = `
        <img src="${item.url}" alt="${item.title}" />
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      `;

      addMediaFallback(card, item);
    } else {
      // When available, show NASA's video thumbnail in the card.
      if (item.thumbnail_url) {
        card.innerHTML = `
          <img src="${item.thumbnail_url}" alt="${item.title}" />
          <h3>${item.title}</h3>
          <p>${item.date}</p>
        `;
        addMediaFallback(card, item);
      } else {
      card.innerHTML = `
        ${buildVideoMarkup(item.url, item.title)}
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      `;
      }
    }

    // Click → open modal
    card.addEventListener('click', () => openModal(item));

    gallery.appendChild(card);
  });
}


function openModal(item) {
  modal.classList.remove('hidden');

  modalBody.innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.date}</p>
    ${
      item.media_type === "image"
        ? `<img src="${item.url}" />`
        : buildVideoMarkup(item.url, item.title)
    }
    <p>${item.explanation}</p>
  `;

  addMediaFallback(modalBody, item);
}

function buildVideoMarkup(url, title) {
  // YouTube videos need embed URLs; direct .mp4 files should use <video>.
  if (url.includes('youtube.com/watch?v=')) {
    const embedUrl = url.replace('watch?v=', 'embed/');
    return `
      <iframe src="${embedUrl}" title="${title}" frameborder="0" allowfullscreen></iframe>
      <p class="media-link"><a href="${url}" target="_blank" rel="noopener noreferrer">Having trouble loading? Open video in a new tab.</a></p>
    `;
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1];
    return `
      <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allowfullscreen></iframe>
      <p class="media-link"><a href="${url}" target="_blank" rel="noopener noreferrer">Having trouble loading? Open video in a new tab.</a></p>
    `;
  }

  return `<video controls preload="metadata"><source src="${url}" type="video/mp4" />Your browser does not support the video tag.</video>`;
}

function addMediaFallback(container, item) {
  const image = container.querySelector('img');
  if (image) {
    image.addEventListener('error', () => replaceMediaWithFallback(container, item), { once: true });
  }

  const video = container.querySelector('video');
  if (video) {
    video.addEventListener('error', () => replaceMediaWithFallback(container, item), { once: true });

    const source = video.querySelector('source');
    if (source) {
      source.addEventListener('error', () => replaceMediaWithFallback(container, item), { once: true });
    }
  }
}

function replaceMediaWithFallback(container, item) {
  const mediaElement = container.querySelector('img, video, iframe');
  if (!mediaElement) {
    return;
  }

  mediaElement.outerHTML = `
    <div class="media-unavailable">
      <p>NASA media is unavailable right now.</p>
      <a href="${item.url}" target="_blank" rel="noopener noreferrer">Open original media</a>
    </div>
  `;
}

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Close the modal when users click the dark background.
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

const facts = [
  "Neutron stars can spin 600 times per second.",
  "A day on Venus is longer than a year on Venus.",
  "There are more stars than grains of sand on Earth.",
  "Black holes can warp time.",
  "The sunset on Mars is blue."
];

function showRandomFact() {
  const factBox = document.getElementById('spaceFact');
  const random = facts[Math.floor(Math.random() * facts.length)];
  factBox.textContent = "🚀 Did You Know? " + random;
}

showRandomFact();