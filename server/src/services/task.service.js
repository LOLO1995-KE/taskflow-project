let tasks = [];
let nextId = 1;

const getAllTasks = () => [...tasks];

const createTask = (taskData) => {
  const newTask = {
    id: nextId++,
    text: taskData.text,
    category: taskData.category || 'Personal',
    priority: taskData.priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  return { ...newTask };
};

const deleteTask = (id) => {
  const numericId = Number(id);
  const index = tasks.findIndex(task => task.id === numericId);
  if (index === -1) throw new Error('NOT_FOUND');
  tasks.splice(index, 1);
};

const updateTask = (id, updates) => {
  const numericId = Number(id);
  const task = tasks.find(task => task.id === numericId);
  if (!task) throw new Error('NOT_FOUND');
  if (updates.text !== undefined) task.text = updates.text;
  if (updates.completed !== undefined) task.completed = updates.completed;
  if (updates.category !== undefined) task.category = updates.category;
  if (updates.priority !== undefined) task.priority = updates.priority;
  return { ...task };
};

module.exports = { getAllTasks, createTask, deleteTask, updateTask };
