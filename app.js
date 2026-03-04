// ============================================
// TASKFLOW - APLICACIÓN DE TAREAS
// ============================================

// 1. SELECCIONAR ELEMENTOS DEL DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const tasksContainer = document.getElementById('tasks-list');

// 2. ARRAY DE TAREAS (estado de la aplicación)
let tasks = [];

// 3. CARGAR TAREAS DE LocalStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

// 4. GUARDAR TAREAS EN LocalStorage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 5. RENDERIZAR TAREAS
function renderTasks() {
    tasksContainer.innerHTML = '';
    
    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.dataset.id = task.id;
        
        taskCard.innerHTML = `
            <div class="task-info">
                <h4 class="task-title">${task.text}</h4>
                <span class="task-category">${task.category}</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="priority-badge ${task.priority}">
                    ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
                <button class="delete-btn" data-id="${task.id}">✕ Eliminar</button>
            </div>
        `;
        
        tasksContainer.appendChild(taskCard);
    });
    
    addDeleteListeners();
}

// 6. AÑADIR NUEVA TAREA
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
        priority: priority
    };
    
    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();
    
    taskInput.value = '';
    taskInput.focus();
}

// 7. ELIMINAR TAREA
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage();
    renderTasks();
}

// 8. AÑADIR LISTENERS A BOTONES DE ELIMINAR
function addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.dataset.id;
            deleteTask(taskId);
        });
    });
}

// 9. FILTRO DE BÚSQUEDA (BONUS)
function setupSearchFilter() {
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = '🔍 Buscar tareas...';
    searchBox.className = 'search-box';
    
    tasksContainer.parentNode.insertBefore(searchBox, tasksContainer);
    
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        const filteredTasks = tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm) ||
            task.category.toLowerCase().includes(searchTerm)
        );
        
        renderFilteredTasks(filteredTasks);
    });
}

// 10. RENDERIZAR TAREAS FILTRADAS
function renderFilteredTasks(tasksToRender) {
    tasksContainer.innerHTML = '';
    
    tasksToRender.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-info">
                <h4 class="task-title">${task.text}</h4>
                <span class="task-category">${task.category}</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="priority-badge ${task.priority}">
                    ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
                <button class="delete-btn" data-id="${task.id}">✕ Eliminar</button>
            </div>
        `;
        tasksContainer.appendChild(taskCard);
    });
    
    addDeleteListeners();
}

// 11. INICIALIZAR
function init() {
    loadTasksFromStorage();
    renderTasks();
    taskForm.addEventListener('submit', addTask);
    setupSearchFilter(); // Quita esta línea si no quieres el bonus
}

// 12. ARRANCAR
document.addEventListener('DOMContentLoaded', init);