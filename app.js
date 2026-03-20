// ============================================
// TASKFLOW - APLICACIÓN DE TAREAS (VERSIÓN COMPLETA)
// ============================================

// 1. SELECCIONAR ELEMENTOS DEL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const tasksContainer = document.getElementById('tasks-list');

// 2. ARRAY DE TAREAS Y VARIABLES DE ESTADO
let tasks = [];
let selectedCategory = null;      // Para filtro de categoría
let currentFilter = 'all';         // Para filtros principales: 'all', 'favorites', 'today'
let statusFilter = 'all';          // NUEVO: 'all', 'pending', 'completed'
let sortBy = 'default';            // Ordenación: 'default', 'high-to-low', 'low-to-high'

// 3. CARGAR TAREAS DE LocalStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

// 4. GUARDAR TAREAS EN LocalStorage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 5. RENDERIZAR TAREAS (VERSIÓN CORREGIDA)
function renderTasks() {
    tasksContainer.innerHTML = '';
    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
    addDeleteListeners();
    addEditListeners();
}

// 6. CREAR TARJETA DE TAREA 
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.id = task.id;
    
    // Asegurar que la tarea tiene la propiedad completed
    if (task.completed === undefined) {
        task.completed = false;
    }
    
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
    
    // Event listener para el checkbox
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

// 7. AÑADIR NUEVA TAREA
function addTask(event) {
    event.preventDefault();
    
    const taskText = taskInput.value.trim();
    const category = categorySelect.value;
    const priority = prioritySelect.value;
    
    if (taskText === '') {
        alert('Por favor, escribe una tarea');
        return;
    }
    
    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        category: category,
        priority: priority,
        completed: false,
        favorite: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasksToStorage();
    resetFilters();
    applyAllFilters();
    
    taskInput.value = '';
    taskInput.focus();
}

// 8. ELIMINAR TAREA
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage();
    applyAllFilters();
}

// 8.5 EDITAR TAREA
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newText = prompt('Editar tarea:', task.text);
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasksToStorage();
        applyAllFilters();
    }
}

// 8.6 FUNCIÓN PARA MARCAR/DESMARCAR TAREAS COMPLETADAS
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        applyAllFilters();
    }
}

// 8.7 MARCAR TODAS LAS TAREAS COMO COMPLETADAS
function markAllAsCompleted() {
    if (tasks.length === 0) {
        alert('No hay tareas para marcar');
        return;
    }
    
    const allCompleted = tasks.every(task => task.completed);
    tasks.forEach(task => {
        task.completed = !allCompleted;
    });
    saveTasksToStorage();
    applyAllFilters();
}

// 8.8 BORRAR TAREAS COMPLETADAS
function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        alert('No hay tareas completadas para borrar');
        return;
    }
    if (confirm(`¿Borrar ${completedCount} tarea(s) completada(s)?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasksToStorage();
        applyAllFilters();
    }
}

// 9. AÑADIR LISTENERS A BOTONES DE ELIMINAR
function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = e.target.dataset.id;
            deleteTask(taskId);
        });
    });
}

// 9.5 AÑADIR LISTENERS A BOTONES DE EDITAR
function addEditListeners() {
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = button.dataset.id;
            editTask(taskId);
        });
    });
}

// ============================================
// MODO OSCURO
// ============================================
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.textContent = isDarkMode ? '☀️ Modo claro' : '🌙 Modo oscuro';
    }
}

// ============================================
// FILTROS POR CATEGORÍA
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

// ============================================
// FILTROS PRINCIPALES
// ============================================
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

// 11.5 FILTROS DE ESTADO
function setupStatusFilters() {
    const statusButtons = document.querySelectorAll('.status-option');
    statusButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            statusFilter = button.dataset.status;
            applyAllFilters();
            console.log('Filtro cambiado a:', statusFilter);
        });
    });
}

// ============================================
// FILTRO DE BÚSQUEDA
// ============================================
function setupSearchFilter() {
    if (document.querySelector('.search-box')) return;
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = '🔍 Buscar tareas...';
    searchBox.className = 'search-box';
    document.querySelector('.tasks-section').insertBefore(searchBox, tasksContainer);
    searchBox.addEventListener('input', () => {
        applyAllFilters();
    });
}

// ============================================
// FUNCIONES AUXILIARES DE FILTRADO
// ============================================
function filterByMain(tasksList) {
    switch(currentFilter) {
        case 'favorites':
            return tasksList.filter(task => task.favorite);
        case 'today':
            const today = new Date().toDateString();
            return tasksList.filter(task => task.createdAt && new Date(task.createdAt).toDateString() === today);
        default:
            return tasksList;
    }
}

function filterByCategory(tasksList) {
    if (selectedCategory) {
        return tasksList.filter(task => task.category === selectedCategory);
    }
    return tasksList;
}

function filterByStatus(tasksList) {
    if (statusFilter === 'pending') {
        return tasksList.filter(task => !task.completed);
    } else if (statusFilter === 'completed') {
        return tasksList.filter(task => task.completed);
    }
    return tasksList;
}

function filterBySearch(tasksList) {
    const searchBox = document.querySelector('.search-box');
    if (searchBox && searchBox.value) {
        const searchTerm = searchBox.value.toLowerCase();
        return tasksList.filter(task => 
            (task.text && task.text.toLowerCase().includes(searchTerm)) ||
            (task.category && task.category.toLowerCase().includes(searchTerm))
        );
    }
    return tasksList;
}

// ============================================
// ORDENAR TAREAS POR PRIORIDAD
// ============================================
function sortTasksByPriority(tasksList, order) {
    const rank = {
        high: 3,
        medium: 2,
        low: 1
    };

    // Creamos una copia para no mutar el array original.
    const sorted = [...tasksList];

    if (order === 'low-to-high') {
        // Baja -> alta
        sorted.sort((a, b) => (rank[a.priority] ?? 0) - (rank[b.priority] ?? 0));
    } else {
        // Alta -> baja (default si viene un valor inesperado)
        sorted.sort((a, b) => (rank[b.priority] ?? 0) - (rank[a.priority] ?? 0));
    }

    return sorted;
}

// 13. APLICAR TODOS LOS FILTROS
function applyAllFilters() {
    let tasksToShow = [...tasks];
    tasksToShow = filterByMain(tasksToShow);
    tasksToShow = filterByCategory(tasksToShow);
    tasksToShow = filterByStatus(tasksToShow);
    tasksToShow = filterBySearch(tasksToShow);

    if (sortBy !== 'default') {
        tasksToShow = sortTasksByPriority(tasksToShow, sortBy);
    }

    renderFilteredTasks(tasksToShow);
}

// 14. RENDERIZAR TAREAS FILTRADAS
function renderFilteredTasks(tasksToRender) {
    tasksContainer.innerHTML = '';
    if (tasksToRender.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '✨ No hay tareas que mostrar';
        emptyMessage.style.cssText = `
            text-align: center;
            padding: var(--spacing-xl);
            color: var(--text-secondary);
            font-size: var(--font-size-lg);
        `;
        tasksContainer.appendChild(emptyMessage);
        return;
    }
    tasksToRender.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
    addDeleteListeners();
    addEditListeners();
}

// 15. RESETEAR FILTROS
function resetFilters() {
    selectedCategory = null;
    document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active'));
    currentFilter = 'all';
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach(f => f.classList.remove('active'));
    const allFilter = Array.from(filterItems).find(f => f.textContent.includes('Todas'));
    if (allFilter) allFilter.classList.add('active');
    const searchBox = document.querySelector('.search-box');
    if (searchBox) searchBox.value = '';
}

// ============================================
// INICIALIZACIÓN
// ============================================
function init() {
    loadTasksFromStorage();
    renderTasks();
    if (taskForm) taskForm.addEventListener('submit', addTask);
    setupMainFilters();
    setupCategoryFilters();
    setupStatusFilters();
    setupSearchFilter();

    const sortPrioritySelect = document.getElementById('sort-priority');
    if (sortPrioritySelect) {
        sortPrioritySelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            applyAllFilters();
        });
    }

    const markAllBtn = document.getElementById('mark-all-btn');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllAsCompleted);
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    loadDarkModePreference();
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) darkModeBtn.addEventListener('click', toggleDarkMode);
    if (tasks.length === 0) {
        const tareaPrueba = {
            id: Date.now().toString(),
            text: "Tarea de prueba",
            category: "Trabajo",
            priority: "high",
            completed: false,
            favorite: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(tareaPrueba);
        saveTasksToStorage();
        renderTasks();
        console.log("✅ Tarea de prueba creada");
    }
}

// 17. ESPERAR A QUE EL DOM ESTÉ LISTO
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}