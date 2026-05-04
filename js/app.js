const k = {
  name: 'fd_name', mode: 'fd_mode', todo: 'fd_todo', links: 'fd_links', minutes: 'fd_minutes'
};

const el = {
  datetime: document.getElementById('tanggal-waktu'),
  greeting: document.getElementById('sapaan'),
  nameInput: document.getElementById('nama-pengguna'),
  saveName: document.getElementById('simpan-nama'),
  modeToggle: document.getElementById('mode-toggle'),
  minutesInput: document.getElementById('durasi-menit'),
  timerDisplay: document.getElementById('tampilan-timer'),
  startTimer: document.getElementById('mulai-timer'),
  stopTimer: document.getElementById('henti-timer'),
  resetTimer: document.getElementById('reset-timer'),
  taskInput: document.getElementById('input-tugas'),
  addTask: document.getElementById('tambah-tugas'),
  sortTask: document.getElementById('urutkan-tugas'),
  taskList: document.getElementById('daftar-tugas'),
  linkName: document.getElementById('nama-link'),
  linkUrl: document.getElementById('url-link'),
  addLink: document.getElementById('tambah-link'),
  linkList: document.getElementById('daftar-link')
};

let timerId = null;
let secondsLeft = Number(localStorage.getItem(k.minutes) || 25) * 60;
let tasks = JSON.parse(localStorage.getItem(k.todo) || '[]');
let links = JSON.parse(localStorage.getItem(k.links) || '[]');

function waktuDanSapaan() {
  const now = new Date();
  el.datetime.textContent = now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });
  const jam = now.getHours();
  const sapaan = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';
  const nama = localStorage.getItem(k.name) || 'Teman';
  el.greeting.textContent = `${sapaan}, ${nama}! Tetap fokus hari ini.`;
}

function renderTimer() {
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const s = String(secondsLeft % 60).padStart(2, '0');
  el.timerDisplay.textContent = `${m}:${s}`;
}

function renderTasks() {
  const sorted = [...tasks];
  const mode = el.sortTask.value;
  if (mode === 'lama') sorted.sort((a,b) => a.createdAt - b.createdAt);
  if (mode === 'baru') sorted.sort((a,b) => b.createdAt - a.createdAt);
  if (mode === 'az') sorted.sort((a,b) => a.text.localeCompare(b.text, 'id'));
  if (mode === 'selesai') sorted.sort((a,b) => Number(a.done) - Number(b.done));
  el.taskList.innerHTML = '';
  sorted.forEach((t) => {
    const li = document.createElement('li');
    li.dataset.done = t.done;
    li.innerHTML = `<p><strong>${t.text}</strong></p><menu>
      <li><button type="button" data-act="done" data-id="${t.id}">${t.done ? 'Batal Selesai' : 'Selesai'}</button></li>
      <li><button type="button" data-act="edit" data-id="${t.id}">Edit</button></li>
      <li><button type="button" data-act="hapus" data-id="${t.id}">Hapus</button></li>
    </menu>`;
    el.taskList.appendChild(li);
  });
}

function renderLinks() {
  el.linkList.innerHTML = '';
  links.forEach((l, i) => {
    const a = document.createElement('a');
    a.href = l.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = l.name;
    a.title = `Klik untuk membuka ${l.url}`;
    el.linkList.appendChild(a);

    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Hapus ${l.name}`;
    b.dataset.id = String(i);
    b.style.width = 'auto';
    b.style.background = 'var(--danger)';
    el.linkList.appendChild(b);
  });
}

el.saveName.addEventListener('click', () => {
  localStorage.setItem(k.name, el.nameInput.value.trim() || 'Teman');
  waktuDanSapaan();
});

el.modeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', el.modeToggle.checked);
  localStorage.setItem(k.mode, el.modeToggle.checked ? 'dark' : 'light');
});

el.minutesInput.addEventListener('change', () => {
  const minutes = Math.max(1, Math.min(120, Number(el.minutesInput.value) || 25));
  localStorage.setItem(k.minutes, String(minutes));
  secondsLeft = minutes * 60;
  renderTimer();
});

el.startTimer.addEventListener('click', () => {
  if (timerId) return;
  timerId = setInterval(() => {
    if (secondsLeft > 0) {
      secondsLeft -= 1;
      renderTimer();
    } else {
      clearInterval(timerId);
      timerId = null;
      alert('Waktu fokus selesai!');
    }
  }, 1000);
});

el.stopTimer.addEventListener('click', () => { clearInterval(timerId); timerId = null; });
el.resetTimer.addEventListener('click', () => {
  clearInterval(timerId);
  timerId = null;
  secondsLeft = Number(localStorage.getItem(k.minutes) || 25) * 60;
  renderTimer();
});

el.addTask.addEventListener('click', () => {
  const text = el.taskInput.value.trim();
  if (!text) return;
  if (tasks.some((t) => t.text.toLowerCase() === text.toLowerCase())) {
    alert('Tugas duplikat tidak diizinkan.');
    return;
  }
  tasks.push({ id: crypto.randomUUID(), text, done: false, createdAt: Date.now() });
  localStorage.setItem(k.todo, JSON.stringify(tasks));
  el.taskInput.value = '';
  renderTasks();
});

el.sortTask.addEventListener('change', renderTasks);

el.taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const act = btn.dataset.act;
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx < 0) return;
  if (act === 'done') tasks[idx].done = !tasks[idx].done;
  if (act === 'edit') {
    const baru = prompt('Edit tugas:', tasks[idx].text);
    if (baru && baru.trim()) {
      const clean = baru.trim();
      const duplicate = tasks.some((t) => t.id !== id && t.text.toLowerCase() === clean.toLowerCase());
      if (duplicate) return alert('Tugas duplikat tidak diizinkan.');
      tasks[idx].text = clean;
    }
  }
  if (act === 'hapus') tasks.splice(idx, 1);
  localStorage.setItem(k.todo, JSON.stringify(tasks));
  renderTasks();
});

el.addLink.addEventListener('click', () => {
  const name = el.linkName.value.trim();
  const url = el.linkUrl.value.trim();
  if (!name || !url) return;
  links.push({ name, url: url.startsWith('http') ? url : `https://${url}` });
  localStorage.setItem(k.links, JSON.stringify(links));
  el.linkName.value = '';
  el.linkUrl.value = '';
  renderLinks();
});

el.linkList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const i = Number(btn.dataset.id);
  links.splice(i, 1);
  localStorage.setItem(k.links, JSON.stringify(links));
  renderLinks();
});

(function init() {
  const savedMode = localStorage.getItem(k.mode) || 'light';
  document.body.classList.toggle('dark', savedMode === 'dark');
  el.modeToggle.checked = savedMode === 'dark';
  el.nameInput.value = localStorage.getItem(k.name) || '';
  el.minutesInput.value = String(Number(localStorage.getItem(k.minutes) || 25));
  waktuDanSapaan();
  renderTimer();
  renderTasks();
  renderLinks();
  setInterval(waktuDanSapaan, 1000);
})();
