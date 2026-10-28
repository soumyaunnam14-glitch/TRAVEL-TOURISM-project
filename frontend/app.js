const grid = document.querySelector("#destination-grid");
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const destinationSelect = document.querySelector("#destination-select");
const tripForm = document.querySelector("#trip-form");
const formStatus = document.querySelector("#form-status");
const menuToggle = document.querySelector("#menu-toggle");
const nav = document.querySelector("#main-nav");

let destinations = [];

document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelector("#travel-date").min = new Date().toISOString().slice(0, 10);

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderDestinations() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = destinations.filter(item => {
    const matchesTerm = `${item.name} ${item.country} ${item.description}`.toLowerCase().includes(term);
    return matchesTerm && (category === "all" || item.category === category);
  });
  grid.replaceChildren();

  if (!filtered.length) {
    grid.append(makeElement("div", "empty-state", "No destinations match your search. Try another place or category."));
    return;
  }

  filtered.forEach(item => {
    const card = makeElement("article", "destination-card");
    const imageWrap = makeElement("div", "destination-image");
    const image = document.createElement("img");
    image.src = item.image_url;
    image.alt = `${item.name} travel scenery`;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      imageWrap.style.background = "#d8dfd2";
      image.remove();
    });
    imageWrap.append(image, makeElement("span", "category-pill", item.category.toUpperCase()));

    const body = makeElement("div", "destination-body");
    body.append(makeElement("h3", "", item.name));
    body.append(makeElement("p", "destination-location", `${item.country} · ${item.duration_days} days suggested`));
    body.append(makeElement("p", "destination-description", item.description));

    const bottom = makeElement("div", "card-bottom");
    const price = makeElement("div");
    price.append(makeElement("span", "price-label", "ESTIMATED FROM"));
    price.append(makeElement("span", "price-value", `₹${Number(item.starting_price_inr).toLocaleString("en-IN")} / person`));
    const choose = makeElement("button", "card-link", "Plan this trip ↗");
    choose.type = "button";
    choose.addEventListener("click", () => {
      destinationSelect.value = String(item.id);
      document.querySelector("#plan").scrollIntoView({ behavior: "smooth" });
      destinationSelect.focus({ preventScroll: true });
    });
    bottom.append(price, choose);
    body.append(bottom);
    card.append(imageWrap, body);
    grid.append(card);
  });
}

function fillDestinationOptions() {
  const placeholder = destinationSelect.options[0];
  destinationSelect.replaceChildren(placeholder);
  destinations.forEach(item => {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = `${item.name}, ${item.country}`;
    destinationSelect.append(option);
  });
}

async function loadDestinations() {
  try {
    const response = await fetch("/api/destinations");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not load destinations.");
    destinations = payload.data;
    renderDestinations();
    fillDestinationOptions();
  } catch (error) {
    grid.replaceChildren(makeElement("div", "empty-state", "Destinations could not be loaded. Please check that the server and Supabase setup are running."));
  }
}

searchInput.addEventListener("input", renderDestinations);
categoryFilter.addEventListener("change", renderDestinations);

tripForm.addEventListener("submit", async event => {
  event.preventDefault();
  formStatus.className = "form-status";
  formStatus.textContent = "";
  const submitButton = tripForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Sending enquiry...";

  const formData = new FormData(tripForm);
  const requestBody = {
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    destinationId: Number(formData.get("destinationId")),
    travelDate: formData.get("travelDate"),
    travellers: Number(formData.get("travellers")),
    message: formData.get("message").trim()
  };

  try {
    const response = await fetch("/api/trip-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "We could not send your enquiry.");
    formStatus.className = "form-status success";
    formStatus.textContent = `Thanks, ${requestBody.name}! Your enquiry was saved. Reference: ${payload.data.reference}. This is an enquiry, not a confirmed booking.`;
    tripForm.reset();
    document.querySelector("#travel-date").min = new Date().toISOString().slice(0, 10);
  } catch (error) {
    formStatus.className = "form-status error";
    formStatus.textContent = `${error.message} If this is your first run, check the Supabase setup in README.md.`;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send trip enquiry <span aria-hidden="true">↗</span>';
  }
});

loadDestinations();
