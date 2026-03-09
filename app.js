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

// 3. CARGAR TAREAS DE LocalStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

// 4. GUARDAR TAREAS EN LocalStorage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 5. RENDERIZAR TAREAS (VERSIÓN MEJORADA)
function renderTasks() {
    tasksContainer.innerHTML = '';
    
    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
    
    addDeleteListeners();
}

// 6. CREAR TARJETA DE TAREA (FUNCIÓN AUXILIAR)
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.dataset.id = task.id;
    
    taskCard.innerHTML = `
        <div class="task-info">
            <h4 class="task-title">${task.text}</h4>
            <span class="task-category">${task.category}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <span class="priority-badge ${task.priority}">
                ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
            <button class="delete-btn" data-id="${task.id}">✕ Eliminar</button>
        </div>
    `;
    
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
        favorite: false,      // Para futura funcionalidad
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasksToStorage();
    
    // Resetear filtros al añadir una nueva tarea
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

// ============================================
// FILTROS POR CATEGORÍA
// ============================================

// 10. CONFIGURAR FILTROS DE CATEGORÍA
function setupCategoryFilters() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryText = item.textContent.trim();
            
            // Toggle de categoría seleccionada
            if (selectedCategory === categoryText) {
                selectedCategory = null;
                item.classList.remove('active');
            } else {
                // Quitar active de todas
                categoryItems.forEach(cat => cat.classList.remove('active'));
                // Activar la seleccionada
                item.classList.add('active');
                selectedCategory = categoryText;
            }
            
            applyAllFilters();
        });
    });
}

// ============================================
// FILTROS PRINCIPALES (TODAS, IMPORTANTES, HOY, COMPLETADAS)
// ============================================

// 11. CONFIGURAR FILTROS PRINCIPALES
function setupMainFilters() {
    const filterItems = document.querySelectorAll('.filter-item');
    
    filterItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Quitar active de todos los filtros principales
            filterItems.forEach(f => f.classList.remove('active'));
            
            // Activar el seleccionado
            item.classList.add('active');
            
            // Determinar qué filtro aplicar
            const filterText = item.textContent.trim();
            
            if (filterText.includes('Todas')) currentFilter = 'all';
            else if (filterText.includes('Importantes')) currentFilter = 'favorites';
            else if (filterText.includes('Hoy')) currentFilter = 'today';
            else if (filterText.includes('Completadas')) currentFilter = 'completed';
            
            applyAllFilters();
        });
    });
}

// ============================================
// FILTRO DE BÚSQUEDA
// ============================================

// 12. CONFIGURAR FILTRO DE BÚSQUEDA
function setupSearchFilter() {
    // Verificar si ya existe para no duplicar
    if (document.querySelector('.search-box')) return;
    
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = '🔍 Buscar tareas...';
    searchBox.className = 'search-box';
    
    tasksContainer.parentNode.insertBefore(searchBox, tasksContainer);
    
    searchBox.addEventListener('input', () => {
        applyAllFilters();
    });
}

// ============================================
// FUNCIÓN PRINCIPAL DE FILTRADO
// ============================================

// 13. APLICAR TODOS LOS FILTROS
function applyAllFilters() {
    let tasksToShow = [...tasks];
    
    // 1. Filtrar por filtro principal (Todas, Importantes, Hoy)
    switch(currentFilter) {
        case 'favorites':
            tasksToShow = tasksToShow.filter(task => task.favorite);
            break;
        case 'today':
            const today = new Date().toDateString();
            tasksToShow = tasksToShow.filter(task => {
                return task.createdAt && new Date(task.createdAt).toDateString() === today;
            });
            break;
        case 'completed':
            // Por implementar
            break;
        default: // 'all' - no filtrar
            break;
    }
    
    // 2. Filtrar por categoría
    if (selectedCategory) {
        tasksToShow = tasksToShow.filter(task => task.category === selectedCategory);
    }
    
    // 3. Filtrar por búsqueda
    const searchBox = document.querySelector('.search-box');
    if (searchBox && searchBox.value) {
        const searchTerm = searchBox.value.toLowerCase();
        tasksToShow = tasksToShow.filter(task => 
            task.text.toLowerCase().includes(searchTerm) ||
            task.category.toLowerCase().includes(searchTerm)
        );
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
}

// 15. RESETEAR FILTROS
function resetFilters() {
    // Resetear categoría seleccionada
    selectedCategory = null;
    document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active'));
    
    // Resetear filtro principal a 'Todas'
    currentFilter = 'all';
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach(f => f.classList.remove('active'));
    const allFilter = Array.from(filterItems).find(f => f.textContent.includes('Todas'));
    if (allFilter) allFilter.classList.add('active');
    
    // Limpiar búsqueda
    const searchBox = document.querySelector('.search-box');
    if (searchBox) searchBox.value = '';
}

// ============================================
// INICIALIZACIÓN
// ============================================

// 16. INICIALIZAR LA APLICACIÓN
function init() {
    loadTasksFromStorage();
    renderTasks();
    
    // Configurar todos los eventos
    if (taskForm) taskForm.addEventListener('submit', addTask);
    setupMainFilters();       // Filtros: Todas, Importantes, Hoy
    setupCategoryFilters();   // Filtros: Trabajo, Personal, etc.
    setupSearchFilter();      // Búsqueda
}

// 17. ESPERAR A QUE EL DOM ESTÉ LISTO
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // DOM ya está cargado
}