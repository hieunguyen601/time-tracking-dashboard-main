
const PREV_LABEL = {
  daily: "Yesterday",
  weekly: "Last Week",
  monthly: "Last Month",
};

const ICONS = {
  work: "icon-work.svg",
  play: "icon-play.svg",
  study: "icon-study.svg",
  exercise: "icon-exercise.svg",
  social: "icon-social.svg",
  "self care": "icon-self-care.svg",
};

const BG_CLASS = {
  work: "bg-work",
  play: "bg-play",
  study: "bg-study",
  exercise: "bg-exercise",
  social: "bg-social",
  "self care": "bg-self",
};

const norm = (s) => s.trim().toLowerCase();

let DATA = []; 

function buildCards(data) {
  const grid = document.querySelector(".time-tracking");
  if (!grid) return;

  if (grid.querySelector(".activity")) return;

  const frag = document.createDocumentFragment();

  data.forEach((item) => {
    const key = norm(item.title);

    const card = document.createElement("div");
    card.className = "activity";

    const bg = document.createElement("div");
    bg.className = `activity-bg ${BG_CLASS[key] || ""}`;

    const img = document.createElement("img");
    img.src = `./images/${ICONS[key] || ""}`;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    bg.appendChild(img);

    const content = document.createElement("div");
    content.className = "activity-content";
    content.innerHTML = `
      <div class="row">
        <h2>${item.title}</h2>
        <button class="menu" aria-label="More options" aria-hidden="true">•••</button>
      </div>
      <p class="hours"></p>
      <p class="previous"></p>
    `;

    card.appendChild(bg);
    card.appendChild(content);
    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

function render(timeframe = "weekly") {
  const cards = document.querySelectorAll(".time-tracking .activity");
  cards.forEach((card) => {
    const titleEl = card.querySelector("h2");
    const hoursEl = card.querySelector(".hours");
    const prevEl = card.querySelector(".previous");
    if (!titleEl || !hoursEl || !prevEl) return;

    const key = norm(titleEl.textContent);
    const record = DATA.find((d) => norm(d.title) === key);
    if (!record) return;

    const tf = record.timeframes[timeframe];
    hoursEl.textContent = `${tf.current}hrs`;
    prevEl.textContent = `${PREV_LABEL[timeframe]} - ${tf.previous}hrs`;
  });
}

function wireFilters() {
  const filters = document.querySelector(".filters");
  if (!filters) return;

  const buttons = filters.querySelectorAll(".button");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".button");
    if (!btn) return;

    // Toggle classes + ARIA
    buttons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
      b.removeAttribute("aria-current");
    });

    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    btn.setAttribute("aria-current", "page");

    const timeframe = norm(btn.textContent);
    render(timeframe);
  });

  const activeBtn =
    document.querySelector(".filters .button.active") ||
    buttons[1] ||
    buttons[0];
  if (activeBtn) {
    buttons.forEach((b) =>
      b.setAttribute("aria-pressed", b === activeBtn ? "true" : "false")
    );
    render(norm(activeBtn.textContent));
  } else {
    render("weekly");
  }
}

function init(data) {
  DATA = data;
  buildCards(DATA);
  wireFilters();


  if (!document.querySelector(".filters .button")) {
    render("weekly");
  }
}

fetch("./data.json")
  .then((res) => {
    if (!res.ok)
      throw new Error(`Failed to load data.json (HTTP ${res.status})`);
    return res.json();
  })
  .then(init)
  .catch((err) => {
    console.error("data.json load error:", err);
  });
