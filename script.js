const STORAGE_KEY = 'todo-flow-items';
const API_CONFIG_KEY = 'todo-flow-api-config';

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const activeCount = document.getElementById('activeCount');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');
const apiGetUrlInput = document.getElementById('apiGetUrl');
const apiGetButton = document.getElementById('apiGetButton');
const apiPostUrlInput = document.getElementById('apiPostUrl');
const apiPostBodyInput = document.getElementById('apiPostBody');
const apiPostButton = document.getElementById('apiPostButton');
const apiStatus = document.getElementById('apiStatus');
const apiResponse = document.getElementById('apiResponse');

let currentFilter = 'all';
let todos = readTodos();

function readTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function readApiConfig() {
  try {
    const saved = localStorage.getItem(API_CONFIG_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persistApiConfig() {
  if (!apiGetUrlInput || !apiPostUrlInput || !apiPostBodyInput) return;
  localStorage.setItem(
    API_CONFIG_KEY,
    JSON.stringify({
      getUrl: apiGetUrlInput.value.trim(),
      postUrl: apiPostUrlInput.value.trim(),
      postBody: apiPostBodyInput.value,
    })
  );
}

function formatApiPayload(value) {
  if (typeof value === 'string') {
    try {
      return formatApiPayload(JSON.parse(value));
    } catch {
      return value;
    }
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (typeof value.body === 'string') {
    try {
      return { ...value, body: JSON.parse(value.body) };
    } catch {
      return value;
    }
  }

  return value;
}

function setApiStatus(message, isError = false) {
  if (!apiStatus) return;
  apiStatus.textContent = message;
  apiStatus.classList.toggle('error', isError);
}

async function callApi(method) {
  if (!apiGetUrlInput || !apiPostUrlInput || !apiPostBodyInput || !apiResponse) return;

  const isPost = method === 'POST';
  const url = isPost ? apiPostUrlInput.value.trim() : apiGetUrlInput.value.trim();

  if (!url) {
    setApiStatus(`${method} URL is required.`, true);
    return;
  }

  let body;
  if (isPost) {
    const rawBody = apiPostBodyInput.value.trim();
    if (rawBody) {
      try {
        body = JSON.stringify(JSON.parse(rawBody));
      } catch {
        setApiStatus('POST body must be valid JSON.', true);
        return;
      }
    }
  }

  setApiStatus(`Calling ${method} endpoint...`);
  apiResponse.textContent = 'Loading...';

  try {
    const response = await fetch(url, {
      method,
      headers: isPost ? { 'Content-Type': 'application/json' } : undefined,
      body: isPost ? body : undefined,
    });

    const raw = await response.text();
    let parsed = raw;
    try {
      parsed = formatApiPayload(JSON.parse(raw));
    } catch {
      parsed = raw;
    }

    apiResponse.textContent =
      typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    setApiStatus(
      `${method} request completed with status ${response.status} ${response.statusText}.`,
      !response.ok
    );
  } catch (error) {
    setApiStatus(`${method} request failed: ${error.message}`, true);
    apiResponse.textContent = 'Request failed.';
  }
}

function initApiPanel() {
  if (!apiGetUrlInput || !apiPostUrlInput || !apiPostBodyInput || !apiGetButton || !apiPostButton) {
    return;
  }

  const savedConfig = readApiConfig();
  if (typeof savedConfig.getUrl === 'string' && savedConfig.getUrl) {
    apiGetUrlInput.value = savedConfig.getUrl;
  }
  if (typeof savedConfig.postUrl === 'string') {
    apiPostUrlInput.value = savedConfig.postUrl;
  }
  if (typeof savedConfig.postBody === 'string') {
    apiPostBodyInput.value = savedConfig.postBody;
  }

  [apiGetUrlInput, apiPostUrlInput, apiPostBodyInput].forEach((field) => {
    field.addEventListener('input', persistApiConfig);
  });

  apiGetButton.addEventListener('click', () => {
    persistApiConfig();
    callApi('GET');
  });

  apiPostButton.addEventListener('click', () => {
    persistApiConfig();
    callApi('POST');
  });
}

function createTodoElement(todo) {
  const item = document.createElement('li');
  item.className = `todo-item${todo.completed ? ' completed' : ''}`;
  item.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.setAttribute('aria-label', `Mark ${todo.text} as complete`);

  const text = document.createElement('p');
  text.textContent = todo.text;

  const removeButton = document.createElement('button');
  removeButton.className = 'delete-btn';
  removeButton.type = 'button';
  removeButton.setAttribute('aria-label', `Delete ${todo.text}`);
  removeButton.textContent = '×';

  checkbox.addEventListener('change', () => {
    todos = todos.map((entry) =>
      entry.id === todo.id ? { ...entry, completed: checkbox.checked } : entry
    );
    persistTodos();
    renderTodos();
  });

  removeButton.addEventListener('click', () => {
    todos = todos.filter((entry) => entry.id !== todo.id);
    persistTodos();
    renderTodos();
  });

  item.append(checkbox, text, removeButton);
  return item;
}

function getFilteredTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

function renderTodos() {
  const visibleTodos = getFilteredTodos();
  todoList.innerHTML = '';

  visibleTodos.forEach((todo) => {
    todoList.appendChild(createTodoElement(todo));
  });

  const pending = todos.filter((todo) => !todo.completed).length;
  activeCount.textContent = String(pending);
  emptyState.style.display = visibleTodos.length === 0 ? 'block' : 'none';
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = todoInput.value.trim();
  if (!value) return;

  todos.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: value,
    completed: false,
  });

  todoInput.value = '';
  persistTodos();
  renderTodos();
  todoInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter || 'all';
    filterButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    renderTodos();
  });
});

clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  persistTodos();
  renderTodos();
});

renderTodos();
initApiPanel();
