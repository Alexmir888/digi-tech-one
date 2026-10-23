const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || "/data";
const FILE = path.join(DATA_DIR, "notes.txt");

// Папка для данных (сюда будет примонтирован volume)
fs.mkdirSync(DATA_DIR, { recursive: true });

function readNotes() {
  if (!fs.existsSync(FILE)) return [];
  return fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean);
}

function addNote(text) {
  // appendFileSync - безопаснее для нескольких инстансов, пишущих в один файл
  fs.appendFileSync(FILE, text.replace(/\n/g, " ") + "\n");
}

// Главная страница: HTML-форма + список заметок + имя контейнера
app.get("/", (req, res) => {
  const items = readNotes().map((n) => `<li>${n}</li>`).join("");
  res.send(`
    <h1>digi-tech-one</h1>
    <p>Odpovedá kontajner: <b>${os.hostname()}</b></p>
    <form method="POST" action="/notes">
      <input name="text" placeholder="Nová poznámka" required>
      <button>Pridať</button>
    </form>
    <ul>${items}</ul>
  `);
});

// Добавление из формы (клавиатура/браузер)
app.post("/notes", (req, res) => {
  addNote(String(req.body.text || ""));
  res.redirect("/");
});

// WEB API
app.get("/api/notes", (req, res) => res.json(readNotes()));
app.post("/api/notes", (req, res) => {
  addNote(String(req.body.text || ""));
  res.status(201).json({ ok: true });
});

// Какой контейнер ответил (для проверки балансировки)
app.get("/api/whoami", (req, res) => res.json({ container: os.hostname() }));

app.listen(PORT, () => console.log(`Listening on ${PORT}, host ${os.hostname()}`));