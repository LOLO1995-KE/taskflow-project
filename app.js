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
                <!-- 👇 BOTÓN COMPLETADA AÑADIDO -->
                <button class="complete-btn" data-id="${task.id}" style="background: transparent; border: 1px solid #27ae60; color: #27ae60; padding: 4px 10px; border-radius: 6px; cursor: pointer; margin-right: 5px;">
                    ✅ Completada
                </button>
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

// 8.5 EDITAR TAREA
function editTask(taskId) {
    // Buscar la tarea por su ID
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Preguntar nuevo título con un prompt
    const newText = prompt('Editar tarea:', task.text);
    
    // Si el usuario no canceló y escribió algo
    if (newText !== null && newText.trim() !== '') {
        // Actualizar el texto de la tarea
        task.text = newText.trim();
        
        // Guardar en localStorage
        saveTasksToStorage();
        
        // Volver a renderizar
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
    
    // Verificar si todas están completadas
    const allCompleted = tasks.every(task => task.completed);
    
    // Si todas están completadas, las desmarcamos. Si no, las marcamos todas
    tasks.forEach(task => {
        task.completed = !allCompleted;
    });
    
    saveTasksToStorage();
    applyAllFilters();
}

// 8.8 BORRAR TAREAS COMPLETADAS
function clearCompletedTasks() {
    console.log('Botón borrar clickeado'); // Para depurar
    
    const completedCount = tasks.filter(task => task.completed).length;
    console.log('Tareas completadas:', completedCount);
    
    if (completedCount === 0) {
        alert('No hay tareas completadas para borrar');
        return;
    }
    
    if (confirm(`¿Borrar ${completedCount} tarea(s) completada(s)?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasksToStorage();
        applyAllFilters();
        console.log('Tareas borradas, restantes:', tasks.length);
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
// MODO OSCURO - SECCIÓN NUEVA
// ============================================

// Cargar preferencia de modo oscuro al iniciar
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Alternar modo oscuro
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Cambiar texto del botón
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.textContent = isDarkMode ? '☀️ Modo claro' : '🌙 Modo oscuro';
    }
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

// 11.5 CONFIGURAR FILTROS DE ESTADO (TODAS/PENDIENTES/COMPLETADAS)
function setupStatusFilters() {
    // Seleccionar todos los botones de estado
    const statusButtons = document.querySelectorAll('.status-filter');
    
    // Añadir evento click a cada botón
    statusButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Quitar clase active de todos los botones
            statusButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase active al botón clickeado
            button.classList.add('active');
            
            // Actualizar la variable statusFilter con el valor del data-status
            statusFilter = button.dataset.status;
            
            // Aplicar todos los filtros para actualizar la vista
            applyAllFilters();
            
            console.log('Filtro cambiado a:', statusFilter); // Para verificar
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
    
    document.querySelector('.tasks-section').insertBefore(searchBox, tasksContainer);
    
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
    
    // 3. Filtrar por estado (pendientes/completadas)
    if (statusFilter === 'pending') {
        tasksToShow = tasksToShow.filter(task => !task.completed);
    } else if (statusFilter === 'completed') {
        tasksToShow = tasksToShow.filter(task => task.completed);
    }
    
    // 4. Filtrar por búsqueda
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
    addEditListeners(); // NUEVA LÍNEA DE EDITAR LA TAREA
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
    setupMainFilters();
    setupCategoryFilters();
    setupStatusFilters();
    setupSearchFilter();
    
    // Conectar botón marcar todas
    const markAllBtn = document.getElementById('mark-all-btn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', markAllAsCompleted);
    }
    
    // CONECTAR BORRAR COMPLETADAS
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    }
    
    // LÍNEAS PARA MODO OSCURO
    loadDarkModePreference();
    
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }
    
    // 👇 AÑADE ESTAS LÍNEAS PARA CREAR UNA TAREA DE PRUEBA
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
    init(); // DOM ya está cargado
    // Función para marcar/desmarcar tarea completada
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        applyAllFilters();
    }
}
}