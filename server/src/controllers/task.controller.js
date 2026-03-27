const taskService = require('../services/task.service');

const getAllTasks = (req, res) => {
  const tasks = taskService.getAllTasks();
  res.json(tasks);
};

const createTask = (req, res) => {
  const { text, category, priority } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'El texto de la tarea es obligatorio' });
  }
  const newTask = taskService.createTask({ text: text.trim(), category, priority });
  res.status(201).json(newTask);
};

const deleteTask = (req, res) => {
  const { id } = req.params;
  try {
    taskService.deleteTask(id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Tarea no encontrada' });
    throw error;
  }
};

const updateTask = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }
  try {
    const updatedTask = taskService.updateTask(id, updates);
    res.json(updatedTask);
  } catch (error) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Tarea no encontrada' });
    throw error;
  }
};

module.exports = { getAllTasks, createTask, deleteTask, updateTask };
