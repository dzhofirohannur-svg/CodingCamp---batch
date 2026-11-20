// === 1. GREETING, JAM, TANGGAL & CUSTOM NAME ===
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const greetingTextEl = document.getElementById('greeting-text');
const editNameBtn = document.getElementById('edit-name-btn');

let userName = localStorage.getItem('dashboard_username') || 'Teman';

function updateTimeAndGreeting() {
  const now = new Date();
  
  // Format Jam
  clockEl.textContent = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Format Tanggal
  dateEl.textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Logika Sapaan Berdasarkan Jam
  const hour = now.getHours();
  let greeting = 'Selamat Malam';
  if (hour >= 4 && hour < 11) greeting = 'Selamat Pagi';
  else if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';

  greetingTextEl.textContent = `${greeting}, ${userName}!`;
}

editNameBtn.addEventListener('click', () => {
  const newName = prompt('Masukkan nama Anda:', userName);
  if (newName && newName.trim() !== '') {
    userName = newName.trim();
    localStorage.setItem('dashboard_username', userName);
    updateTimeAndGreeting();
  }
});

setInterval(updateTimeAndGreeting, 1000);
updateTimeAndGreeting();

// === 2. LIGHT / DARK MODE (CHALLENGE 1) ===
const themeToggleBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('dashboard_theme');

if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggleBtn.textContent = '☀️ Light Mode';
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('dashboard_theme', isDark ? 'dark' : 'light');
  themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// === 3. FOCUS TIMER (POMODORO 25 MENIT) ===
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer');
const stopBtn = document.getElementById('stop-timer');
const resetBtn = document.getElementById('reset-timer');

let defaultTime = 25 * 60; // 25 menit dalam detik
let timeLeft = defaultTime;
let timerInterval = null;

function renderTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

startBtn.addEventListener('click', () => {
  if (timerInterval) return; // Cegah interval ganda
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      renderTimer();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert('Waktu fokus selesai! Saatnya istirahat sejenak.');
    }
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = defaultTime;
  renderTimer();
});

renderTimer();

// === 4. QUICK LINKS (LOCAL STORAGE) ===
const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const linksContainer = document.getElementById('links-container');

let quickLinks = JSON.parse(localStorage.getItem('dashboard_links')) || [
  { name: 'Google', url: 'https://google.com' },
  { name: 'GitHub', url: 'https://github.com' }
];

function saveAndRenderLinks() {
  localStorage.setItem('dashboard_links', JSON.stringify(quickLinks));
  linksContainer.innerHTML = '';

  quickLinks.forEach((link, index) => {
    const div = document.createElement('div');
    div.className = 'link-item';

    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = link.name;

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.title = 'Hapus tautan';
    delBtn.onclick = () => {
      quickLinks.splice(index, 1);
      saveAndRenderLinks();
    };

    div.appendChild(a);
    div.appendChild(delBtn);
    linksContainer.appendChild(div);
  });
}

linkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  const url = linkUrlInput.value.trim();
  if (!name || !url) return;

  quickLinks.push({ name, url });
  linkNameInput.value = '';
  linkUrlInput.value = '';
  saveAndRenderLinks();
});

saveAndRenderLinks();

// === 5. TO-DO LIST & PREVENT DUPLICATE TASKS (CHALLENGE 3) ===
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoError = document.getElementById('todo-error');

let todos = JSON.parse(localStorage.getItem('dashboard_todos')) || [];

function saveAndRenderTodos() {
  localStorage.setItem('dashboard_todos', JSON.stringify(todos));
  todoList.innerHTML = '';

  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const leftDiv = document.createElement('div');
    leftDiv.className = 'todo-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.style.flex = 'none';
    checkbox.onchange = () => {
      todos[index].completed = checkbox.checked;
      saveAndRenderTodos();
    };

    const span = document.createElement('span');
    span.className = `todo-text ${todo.completed ? 'completed' : ''}`;
    span.textContent = todo.text;

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'todo-actions';

    // Tombol Edit Tugas
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary';
    editBtn.style.padding = '4px 8px';
    editBtn.style.fontSize = '0.8rem';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      const updatedText = prompt('Edit tugas:', todo.text);
      if (updatedText !== null && updatedText.trim() !== '') {
        const cleanText = updatedText.trim();
        // Cek duplikat saat edit
        const isDuplicate = todos.some(
          (item, i) => i !== index && item.text.toLowerCase() === cleanText.toLowerCase()
        );
        if (isDuplicate) {
          alert('Tugas dengan nama tersebut sudah ada!');
          return;
        }
        todos[index].text = cleanText;
        saveAndRenderTodos();
      }
    };

    // Tombol Hapus Tugas
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Hapus';
    deleteBtn.onclick = () => {
      todos.splice(index, 1);
      saveAndRenderTodos();
    };

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);
    todoList.appendChild(li);
  });
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  // Validasi Cegah Tugas Duplikat (Case-Insensitive)
  const isDuplicate = todos.some(
    (todo) => todo.text.toLowerCase() === text.toLowerCase()
  );

  if (isDuplicate) {
    todoError.textContent = '⚠️ Tugas tersebut sudah ada dalam daftar!';
    return;
  }

  todoError.textContent = '';
  todos.push({ text: text, completed: false });
  todoInput.value = '';
  saveAndRenderTodos();
});

saveAndRenderTodos();
