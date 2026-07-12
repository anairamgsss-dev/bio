/* Book navigation and quiet, accessible room interactions. */
const scrollButtons = document.querySelectorAll("[data-scroll-to]");
const note = document.querySelector(".object-note");
let noteTimer;

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("begin-button")) {
      document.querySelector(".story-fade")?.classList.add("is-active");
      window.setTimeout(() => document.querySelector(".story-fade")?.classList.remove("is-active"), 850);
    }
    document.getElementById(button.dataset.scrollTo)?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".room-object").forEach((object) => {
  const showNote = () => {
    note.textContent = object.dataset.note;
    note.classList.add("is-visible");
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => note.classList.remove("is-visible"), 3000);
  };
  object.addEventListener("pointerenter", showNote);
  object.addEventListener("focus", showNote);
  object.addEventListener("click", showNote);
});

/* Chapters enter softly once, preserving the feeling of reading a book. */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else { revealItems.forEach((item) => item.classList.add("is-visible")); }
