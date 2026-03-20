# Experimentos con IA en programación

Registraré tres experimentos comparativos:
1. Resolver problemas de programación sin IA vs con IA (tiempo, calidad, comprensión).
2. Mejoras en TaskFlow con ayuda de IA (filtros, búsqueda, etc.).
3. Comparación de productividad.

Cada experimento incluirá observaciones y conclusiones.

## Refactorización con IA en TaskFlow

Usando Cursor (chat contextual), pedí separar la lógica de filtros de `applyAllFilters` en funciones auxiliares. La IA generó `filterByMain`, `filterByCategory`, `filterByStatus` y `filterBySearch`. Revisé el código, corregí un error de sintaxis (un `</button>` suelto) y lo integré. El código quedó más legible y mantenible.

**Tiempo invertido:** 20 minutos (incluyendo revisión manual).  
**Calidad:** El código generado era correcto en su mayor parte, pero necesité corregir la separación de la búsqueda y añadir la función `filterByMain`.

## Experimento con MCP (y alternativa con comandos)

### Configuración inicial
Intenté usar el servidor MCP oficial `@modelcontextprotocol/server-filesystem`, pero el servidor activo en Cursor era `user-filesystem` y mostraba error. Para cumplir con el ejercicio, utilicé la capacidad de Cursor de ejecutar comandos del sistema desde el chat, lo que equivale a interactuar con el terminal vía MCP.



### Consultas realizadas
1. ## contenido ## 
   Comando: cat /Users/lolo/Desktop/taskflow-project/taskflow-project/app.js 
   Respuesta: // ============================================
// TASKFLOW - APLICACIÓN DE TAREAS (VERSIÓN COMPLETA)
// ============================================
//
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

2  ## listado ## 
   Comando: ls -la /Users/lolo/Desktop/taskflow-project/taskflow-project 
   Respuesta: [primeras líneas o resumen]

3. ## tamaño ##
   Comando: wc -c /Users/lolo/Desktop/taskflow-project/taskflow-project/styles.c
   Respuesta: styles.css tiene 11102 bytes.

4. ## Existencia ## 
   Comando: test -f /Users/lolo/Desktop/taskflow-project/taskflow-project/README.md && echo "Sí existe" || echo "No existe"
   Respuesta: "Sí existe"

5. ## archivos en docs/ai ##  
   Comando:   ls -la /Users/lolo/Desktop/taskflow-project/taskflow-project/docs/ai
   Respuesta: total 80
drwxr-xr-x@ 7 lolo  staff    224 Mar 20 12:45 .
drwxr-xr-x@ 3 lolo  staff     96 Mar 20 12:43 ..
-rw-r--r--@ 1 lolo  staff  21688 Mar 20 16:20 ai-comparison.md
-rw-r--r--@ 1 lolo  staff    293 Mar 20 16:39 cursor-workflow.md
-rw-r--r--@ 1 lolo  staff    933 Mar 20 16:32 experiments.md
-rw-r--r--@ 1 lolo  staff    346 Mar 20 16:32 prompt-engineering.md
-rw-r--r--@ 1 lolo  staff    274 Mar 20 16:20 reflection.md

### Conclusión
Aunque el servidor MPC específico no funcionó, la integración con el terminal de Cursor permite realizar consultas equivalentes. En un entorno real, MCP servidores como filesystem son útiles para dar a la IA acceso controlado al sistema de archivos sin necesidad de que el usuario ejecute comandos manualmente.