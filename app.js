// ============================================
// TASKFLOW - APLICACIÓN DE TAREAS (CON BACKEND)
// ============================================

// 1. SELECCIONAR ELEMENTOS DEL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const tasksContainer = document.getElementById('tasks-list');

// 2. ARRAY DE TAREAS (se cargará desde el servidor)
let tasks = [];

// 3. VARIABLES DE ESTADO PARA FILTROS
let selectedCategory = null;
let currentFilter = 'all';
let statusFilter = 'all';

// ============================================
// CLIENTE API
// ============================================
const API_BASE_URL = 'http://localhost:3000/api/v1/tasks';

const api = {
  async getAllTasks() {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Error al obtener tareas');
    return await res.json();
  },
  async createTask(taskData) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error('Error al crear tarea');
    return await res.json();
  },
  async deleteTask(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar tarea');
  },
  async updateTask(id, updates) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Error al actualizar tarea');
    return await res.json();
  }
};

// ============================================
// FUNCIONES DE CARGA Y RENDERIZADO
// ============================================

async function loadTasks() {
  try {
    tasks = await api.getAllTasks();
    renderTasks();
  } catch (error) {
    console.error('Error al cargar tareas:', error);
    alert('No se pudieron cargar las tareas. ¿El servidor está funcionando?');
  }
}

function renderTasks() {
  tasksContainer.innerHTML = '';
  tasks.forEach(task => {
    const taskCard = createTaskCard(task);
    tasksContainer.appendChild(taskCard);
  });
  addDeleteListeners();
  addEditListeners();
}

// 4. CREAR TARJETA DE TAREA
function createTaskCard(task) {
  const taskCard = document.createElement('div');
  taskCard.className = 'task-card';
  taskCard.dataset.id = task.id;

  if (task.completed === undefined) task.completed = false;

  taskCard.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px; width: 100%; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          data-id="${task.id}" 
          ${task.completed ? 'checked' : ''}
          style="width: 20px; height: 20px; cursor: pointer;"
        >
        <div>
          <h4 class="task-title" style="margin: 0 0 5px 0; ${task.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
            ${task.text}
          </h4>
          <span class="task-category" style="font-size: 0.8rem; background: #e9ecef; padding: 3px 8px; border-radius: 12px;">
            ${task.category}
          </span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="priority-badge" style="padding: 4px 12px; border-radius: 16px; font-size: 0.75rem; font-weight: bold; color: white; background-color: ${
          task.priority === 'high' ? '#A1355B' : task.priority === 'medium' ? '#B58B7C' : '#7C9EB2'
        };">
          ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
        </span>
        <button class="edit-btn" data-id="${task.id}" style="background: transparent; border: 1px solid #408EC6; color: #408EC6; padding: 4px 10px; border-radius: 6px; cursor: pointer; margin-right: 5px;">
          ✏️ Editar
        </button>
        <button class="delete-btn" data-id="${task.id}" style="background: transparent; border: 1px solid #A1355B; color: #A1355B; padding: 4px 10px; border-radius: 6px; cursor: pointer;">
          ✕ Eliminar
        </button>
      </div>
    </div>
  `;

  const checkbox = taskCard.querySelector('.task-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', function(e) {
      e.stopPropagation();
      const taskId = this.dataset.id;
      toggleTaskCompletion(taskId);
    });
  }
  return taskCard;
}

// ============================================
// OPERACIONES CON EL SERVIDOR
// ============================================

async function addTask(event) {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;

  if (taskText === '') {
    alert('Por favor, escribe una tarea');
    return;
  }

  try {
    await api.createTask({ text: taskText, category, priority });
    await loadTasks();
    taskInput.value = '';
    taskInput.focus();
  } catch (error) {
    console.error('Error al añadir tarea:', error);
    alert('Error al crear la tarea');
  }
}

async function deleteTask(taskId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    try {
      await api.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea');
    }
  }
}

async function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === Number(taskId));
  if (task) {
    try {
      await api.updateTask(taskId, { completed: !task.completed });
      await loadTasks();
    } catch (error) {
      console.error('Error al cambiar estado de la tarea:', error);
      alert('Error al actualizar la tarea');
    }
  }
}

async function editTask(taskId) {
  const task = tasks.find(t => t.id === Number(taskId));
  if (!task) return;
  const newText = prompt('Editar tarea:', task.text);
  if (newText !== null && newText.trim() !== '') {
    try {
      await api.updateTask(taskId, { text: newText.trim() });
      await loadTasks();
    } catch (error) {
      console.error('Error al editar tarea:', error);
      alert('Error al editar la tarea');
    }
  }
}

async function markAllAsCompleted() {
  if (tasks.length === 0) {
    alert('No hay tareas para marcar');
    return;
  }
  const allCompleted = tasks.every(task => task.completed);
  if (allCompleted) {
    alert('Todas las tareas ya están completadas');
    return;
  }
  try {
    for (const task of tasks) {
      if (!task.completed) {
        await api.updateTask(task.id, { completed: true });
      }
    }
    await loadTasks();
  } catch (error) {
    console.error('Error al marcar todas:', error);
    alert('Error al marcar tareas');
  }
}

async function clearCompletedTasks() {
  const completedTasks = tasks.filter(task => task.completed);
  if (completedTasks.length === 0) {
    alert('No hay tareas completadas para borrar');
    return;
  }
  if (confirm(`¿Borrar ${completedTasks.length} tarea(s) completada(s)?`)) {
    try {
      for (const task of completedTasks) {
        await api.deleteTask(task.id);
      }
      await loadTasks();
    } catch (error) {
      console.error('Error al borrar completadas:', error);
      alert('Error al eliminar tareas');
    }
  }
}

// ============================================
// LISTENERS DE BOTONES
// ============================================

function addDeleteListeners() {
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = e.target.dataset.id;
      deleteTask(taskId);
    });
  });
}

function addEditListeners() {
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = button.dataset.id;
      editTask(taskId);
    });
  });
}

// ============================================
// FILTROS Y OTROS (sin cambios)
// ============================================

function setupCategoryFilters() {
  const categoryItems = document.querySelectorAll('.category-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryText = item.textContent.trim();
      if (selectedCategory === categoryText) {
        selectedCategory = null;
        item.classList.remove('active');
      } else {
        categoryItems.forEach(cat => cat.classList.remove('active'));
        item.classList.add('active');
        selectedCategory = categoryText;
      }
      applyAllFilters();
    });
  });
}

function setupMainFilters() {
  const filterItems = document.querySelectorAll('.filter-item');
  filterItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      filterItems.forEach(f => f.classList.remove('active'));
      item.classList.add('active');
      const filterText = item.textContent.trim();
      if (filterText.includes('Todas')) currentFilter = 'all';
      else if (filterText.includes('Importantes')) currentFilter = 'favorites';
      else if (filterText.includes('Hoy')) currentFilter = 'today';
      else if (filterText.includes('Completadas')) currentFilter = 'completed';
      applyAllFilters();
    });
  });
}

function setupStatusFilters() {
  const statusButtons = document.querySelectorAll('.status-option');
  statusButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      statusButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      statusFilter = button.dataset.status;
      applyAllFilters();
    });
  });
}

function setupSearchFilter() {
  if (document.querySelector('.search-box')) return;
  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = '🔍 Buscar tareas...';
  searchBox.className = 'search-box';
  document.querySelector('.tasks-section').insertBefore(searchBox, tasksContainer);
  searchBox.addEventListener('input', () => applyAllFilters());
}

function applyAllFilters() {
  let tasksToShow = [...tasks];
  // filtrar por estado principal
  if (statusFilter === 'pending') tasksToShow = tasksToShow.filter(task => !task.completed);
  else if (statusFilter === 'completed') tasksToShow = tasksToShow.filter(task => task.completed);
  if (selectedCategory) tasksToShow = tasksToShow.filter(task => task.category === selectedCategory);
  const searchBox = document.querySelector('.search-box');
  if (searchBox && searchBox.value) {
    const term = searchBox.value.toLowerCase();
    tasksToShow = tasksToShow.filter(task => 
      task.text.toLowerCase().includes(term) || task.category.toLowerCase().includes(term)
    );
  }
  renderFilteredTasks(tasksToShow);
}

function renderFilteredTasks(tasksToRender) {
  tasksContainer.innerHTML = '';
  if (tasksToRender.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '✨ No hay tareas que mostrar';
    tasksContainer.appendChild(emptyMsg);
    return;
  }
  tasksToRender.forEach(task => {
    const card = createTaskCard(task);
    tasksContainer.appendChild(card);
  });
  addDeleteListeners();
  addEditListeners();
}

function resetFilters() {
  selectedCategory = null;
  document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
  currentFilter = 'all';
  document.querySelectorAll('.filter-item').forEach(f => f.classList.remove('active'));
  const allFilter = Array.from(document.querySelectorAll('.filter-item')).find(f => f.textContent.includes('Todas'));
  if (allFilter) allFilter.classList.add('active');
  const searchBox = document.querySelector('.search-box');
  if (searchBox) searchBox.value = '';
  statusFilter = 'all';
  const statusBtn = document.querySelector('.status-option[data-status="all"]');
  if (statusBtn) statusBtn.classList.add('active');
  applyAllFilters();
}

// ============================================
// MODO OSCURO
// ============================================
function loadDarkModePreference() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) document.body.classList.add('dark-mode');
}
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  const btn = document.getElementById('dark-mode-toggle');
  if (btn) btn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo claro' : '🌙 Modo oscuro';
}

// ============================================
// INICIALIZACIÓN
// ============================================
async function init() {
  await loadTasks();
  if (taskForm) taskForm.addEventListener('submit', addTask);
  setupMainFilters();
  setupCategoryFilters();
  setupStatusFilters();
  setupSearchFilter();
  const markAllBtn = document.getElementById('mark-all-btn');
  if (markAllBtn) markAllBtn.addEventListener('click', markAllAsCompleted);
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompletedTasks);
  loadDarkModePreference();
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  if (darkModeBtn) darkModeBtn.addEventListener('click', toggleDarkMode);
}

// ============================================
// ARRANQUE
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}