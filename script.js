let categories = [];
let cards = [];

const board = document.getElementById("board");
const detailsPanel = document.getElementById("detailsPanel");

async function init() {
  const saved = localStorage.getItem("tokCards");

  categories = await fetch("data/categories.json").then(r => r.json());

  if (saved) {
    cards = JSON.parse(saved);
  } else {
    cards = await fetch("data/cards.json").then(r => r.json());
  }

  renderBoard();
}

function renderBoard() {
  board.innerHTML = "";

  categories.forEach(category => {
    const column = document.createElement("section");
    column.className = "column";
    column.dataset.category = category.id;

    column.innerHTML = `<h2>${category.title}</h2>`;

    column.addEventListener("dragover", e => e.preventDefault());

    column.addEventListener("drop", e => {
      const cardId = e.dataTransfer.getData("text/plain");
      const card = cards.find(c => c.id === cardId);
      card.category = category.id;
      saveCards();
      renderBoard();
    });

    cards
      .filter(card => card.category === category.id)
      .sort((a, b) => (a.day || 999) - (b.day || 999))
      .forEach(card => column.appendChild(createCard(card)));

    board.appendChild(column);
  });
}

function createCard(card) {
  const div = document.createElement("article");
  div.className = "card";
  div.draggable = true;

  div.innerHTML = `
    <h3>${card.day ? `Day ${card.day}: ` : ""}${card.title}</h3>
    <p><strong>${card.status}</strong> · ${card.durationMinutes} minutes</p>
    <small>${(card.concepts || []).join(", ")}</small>
  `;

  div.addEventListener("dragstart", e => {
    div.classList.add("dragging");
    e.dataTransfer.setData("text/plain", card.id);
  });

  div.addEventListener("dragend", () => {
    div.classList.remove("dragging");
  });

  div.addEventListener("click", () => showDetails(card));

  return div;
}

function showDetails(card) {
  document.getElementById("detailTitle").textContent = card.title;
  document.getElementById("detailMeta").textContent =
    `Term ${card.term} · Day ${card.day} · ${card.durationMinutes} minutes · ${card.status}`;

  document.getElementById("detailKQ").textContent = card.knowledgeQuestion || "";
  document.getElementById("detailActivity").textContent = card.activity || "";
  document.getElementById("detailAssignment").textContent = card.assignment || "";
  document.getElementById("detailConcepts").textContent = (card.concepts || []).join(", ");
  document.getElementById("detailNotes").textContent = card.notes || "";

  detailsPanel.classList.remove("hidden");
}

function saveCards() {
  localStorage.setItem("tokCards", JSON.stringify(cards, null, 2));
}

document.getElementById("closePanel").addEventListener("click", () => {
  detailsPanel.classList.add("hidden");
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem("tokCards");
  location.reload();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(cards, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tok-cards-export.json";
  a.click();
});

init();
