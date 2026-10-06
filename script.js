const STORAGE_KEY = 'todo-flow-items';

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const activeCount = document.getElementById('activeCount');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');

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
