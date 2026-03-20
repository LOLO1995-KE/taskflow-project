// ============================================
// TASKFLOW - APLICACIÓN DE TAREAS (VERSIÓN COMPLETA)
// ============================================

// 1. SELECCIONAR ELEMENTOS DEL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const tasksContainer = document.getElementById('tasks-list');
const progressRing = document.getElementById('progress-ring');
const progressPercent = document.getElementById('progress-percent');

// 2. ARRAY DE TAREAS Y VARIABLES DE ESTADO
let tasks = [];
let selectedCategory = null;      // Para filtro de categoría
let currentFilter = 'all';         // Para filtros principales: 'all', 'favorites', 'today'
let statusFilter = 'all';          // NUEVO: 'all', 'pending', 'completed'
let sortOption = 'default';        // Ordenación: 'default', 'high-to-low', 'low-to-high', 'newest', 'oldest'

// 3. CARGAR TAREAS DE LocalStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

// 4. GUARDAR TAREAS EN LocalStorage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ============================================
// PROGRESO (porcentaje completadas)
// ============================================
function updateProgress() {
    const total = tasks.length;
    const completedCount = tasks.filter(task => task.completed === true).length;
    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    if (progressPercent) progressPercent.textContent = `${percent}%`;

    if (progressRing) {
        const r = parseFloat(progressRing.getAttribute('r')) || 45;
        const circumference = 2 * Math.PI * r;
        const offset = circumference * (1 - percent / 100);

        // Inicializamos la animacion del stroke si aun no esta calculada.
        progressRing.style.strokeDasharray = `${circumference}`;
        progressRing.style.strokeDashoffset = `${offset}`;
    }
}

// ============================================
// EXPORTAR / IMPORTAR TAREAS (JSON)
// ============================================
function exportTasks() {
    try {
        const json = JSON.stringify(tasks, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'taskflow-backup.json';
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Liberamos el objeto URL después de disparar la descarga.
        setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (err) {
        console.error('Error exportando tareas:', err);
        alert('No se pudieron exportar las tareas.');
    }
}

function importTasks() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            let parsed;
            try {
                parsed = JSON.parse(reader.result);
            } catch (err) {
                alert('El archivo no contiene JSON válido.');
                return;
            }

            if (!Array.isArray(parsed)) {
                alert('El JSON importado debe ser un array de tareas.');
                return;
            }

            const importedTasks = [];

            for (const [index, item] of parsed.entries()) {
                const isObject = item && typeof item === 'object';
                const idOk = isObject && (typeof item.id === 'string' || typeof item.id === 'number');
                const textOk = isObject && (typeof item.text === 'string' || typeof item.text === 'number');
                const completedOk = isObject && (typeof item.completed === 'boolean' || typeof item.completed === 'string' || typeof item.completed === 'number');

                if (!isObject || !idOk || !textOk || !completedOk) {
                    alert(`Formato inválido en la tarea #${index + 1}. Se requiere al menos {id, text, completed}.`);
                    return;
                }

                const completed = (item.completed === true || item.completed === 'true' || item.completed === 1);

                const priority = (item.priority === 'high' || item.priority === 'medium' || item.priority === 'low')
                    ? item.priority
                    : 'medium';

                importedTasks.push({
                    id: String(item.id),
                    text: String(item.text),
                    category: typeof item.category === 'string' ? item.category : 'Trabajo',
                    priority,
                    completed,
                    favorite: Boolean(item.favorite),
                    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString()
                });
            }

            tasks = importedTasks;
            saveTasksToStorage();
            applyAllFilters();
        };

        reader.readAsText(file);

        // Permitimos volver a seleccionar el mismo archivo si hiciera falta.
        fileInput.value = '';
    });

    document.body.appendChild(fileInput);
    fileInput.click();

    fileInput.addEventListener('change', () => {
        fileInput.remove();
    }, { once: true });
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

// ============================================
// ORDENAR TAREAS POR FECHA DE CREACIÓN
// ============================================
function sortTasksByDate(tasksList, order) {
    // Creamos una copia para no mutar el array original.
    const sorted = [...tasksList];

    const toTime = (task) => {
        const t = task.createdAt ? new Date(task.createdAt).getTime() : NaN;
        return Number.isFinite(t) ? t : 0;
    };

    if (order === 'oldest') {
        // Más antiguo primero
        sorted.sort((a, b) => toTime(a) - toTime(b));
    } else {
        // Más reciente primero (default si viene un valor inesperado)
        sorted.sort((a, b) => toTime(b) - toTime(a));
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

    // Ordenación: prioridad primero, luego fecha (según la opción seleccionada).
    if (sortOption === 'high-to-low' || sortOption === 'low-to-high') {
        tasksToShow = sortTasksByPriority(tasksToShow, sortOption);
    }
    if (sortOption === 'newest' || sortOption === 'oldest') {
        tasksToShow = sortTasksByDate(tasksToShow, sortOption);
    }

    // El progreso se calcula sobre el total de tareas (no sobre el conjunto filtrado).
    updateProgress();
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
    updateProgress();
    if (taskForm) taskForm.addEventListener('submit', addTask);
    setupMainFilters();
    setupCategoryFilters();
    setupStatusFilters();
    setupSearchFilter();

    const sortPrioritySelect = document.getElementById('sort-priority');
    if (sortPrioritySelect) {
        sortPrioritySelect.addEventListener('change', (e) => {
            sortOption = e.target.value;
            applyAllFilters();
        });
    }

    const markAllBtn = document.getElementById('mark-all-btn');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllAsCompleted);
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    const exportBtn = document.getElementById('export-tasks');
    if (exportBtn) exportBtn.addEventListener('click', exportTasks);

    const importBtn = document.getElementById('import-tasks');
    if (importBtn) importBtn.addEventListener('click', importTasks);

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