/* Navigation, remembered progress and the quiet interactions of the illustrated room. */
const storageKey = "who-is-juli-progress";
const storyFade = document.querySelector(".story-fade");
const note = document.querySelector(".object-note");
const resumeButton = document.querySelector(".resume-story");
let noteTimer;

function getProgress() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || { discovered: [] }; }
  catch { return { discovered: [] }; }
}

function saveProgress(update) {
  const progress = { ...getProgress(), ...update };
  try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* Reading still works when storage is unavailable. */ }
}

function goToChapter(id, cinematic = true) {
  const target = document.getElementById(id);
  if (!target) return;
  if (cinematic) {
    storyFade?.classList.add("is-active");
    window.setTimeout(() => storyFade?.classList.remove("is-active"), 850);
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  if (id !== "cover") saveProgress({ chapter: id });
}

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
  button.addEventListener("click", () => goToChapter(button.dataset.scrollTo, button.id !== "back-to-cover"));
});

/* Objects are chapter shortcuts as well as small discoveries. */
document.querySelectorAll(".room-object").forEach((object) => {
  const showNote = () => {
    note.textContent = object.dataset.note;
    note.classList.add("is-visible");
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => note.classList.remove("is-visible"), 2600);
  };
  object.addEventListener("pointerenter", showNote);
  object.addEventListener("focus", showNote);
  object.addEventListener("click", () => {
    showNote();
    const progress = getProgress();
    saveProgress({ discovered: [...new Set([...(progress.discovered || []), object.classList[1]])] });
  });
});

/* Returning visitors receive one discreet way back to their last page. */
const savedProgress = getProgress();
if (savedProgress.chapter && document.getElementById(savedProgress.chapter)) {
  resumeButton.hidden = false;
  resumeButton.addEventListener("click", () => goToChapter(savedProgress.chapter));
}

/* A chapter is remembered only after it is meaningfully in view. */
const chapters = document.querySelectorAll("#chapter-one, .chapter[id]");
if ("IntersectionObserver" in window) {
  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) saveProgress({ chapter: entry.target.id });
    });
  }, { threshold: 0.52 });
  chapters.forEach((chapter) => chapterObserver.observe(chapter));
}

/* Content appears once, gently, as a reader reaches it. */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else { revealItems.forEach((item) => item.classList.add("is-visible")); }

/* The album lets the reader linger on one real photograph at a time. */
const album = document.querySelector(".photo-album");
const albumImage = album?.querySelector("img");
const albumCaption = album?.querySelector("figcaption");
const albumCount = album?.querySelector(".album-count");
const albumPhotos = [...document.querySelectorAll(".memory-photo img, .polaroid img, .love-frame img")];
let albumIndex = 0;

function renderAlbum() {
  const image = albumPhotos[albumIndex];
  if (!image || !album) return;
  const caption = image.closest("figure")?.querySelector("figcaption")?.textContent || image.alt;
  albumImage.src = image.currentSrc || image.src;
  albumImage.alt = image.alt;
  albumCaption.textContent = caption;
  albumCount.textContent = `${albumIndex + 1} / ${albumPhotos.length}`;
}

function openAlbum(index) {
  albumIndex = index;
  renderAlbum();
  album.classList.add("is-open");
  album.setAttribute("aria-hidden", "false");
  document.body.classList.add("album-open");
  album.querySelector(".album-close")?.focus();
}

function closeAlbum() {
  album?.classList.remove("is-open");
  album?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("album-open");
}

albumPhotos.forEach((image, index) => {
  const figure = image.closest("figure");
  if (!figure) return;
  figure.classList.add("album-photo");
  figure.tabIndex = 0;
  figure.setAttribute("role", "button");
  figure.setAttribute("aria-label", `Abrir fotografía: ${image.alt}`);
  figure.addEventListener("click", () => openAlbum(index));
  figure.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openAlbum(index); }
  });
});

album?.querySelector(".album-close")?.addEventListener("click", closeAlbum);
album?.querySelector(".album-prev")?.addEventListener("click", () => { albumIndex = (albumIndex - 1 + albumPhotos.length) % albumPhotos.length; renderAlbum(); });
album?.querySelector(".album-next")?.addEventListener("click", () => { albumIndex = (albumIndex + 1) % albumPhotos.length; renderAlbum(); });
album?.addEventListener("click", (event) => { if (event.target === album) closeAlbum(); });
document.addEventListener("keydown", (event) => {
  if (!album?.classList.contains("is-open")) return;
  if (event.key === "Escape") closeAlbum();
  if (event.key === "ArrowLeft") { albumIndex = (albumIndex - 1 + albumPhotos.length) % albumPhotos.length; renderAlbum(); }
  if (event.key === "ArrowRight") { albumIndex = (albumIndex + 1) % albumPhotos.length; renderAlbum(); }
});
