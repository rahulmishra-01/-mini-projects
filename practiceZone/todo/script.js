// Elements
const themeToggle = document.getElementById("themeToggle");
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const dueDateInput = document.getElementById("dueDateInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const errorMessage = document.getElementById("errorMessage");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const clearAllBtn = document.getElementById("clearAllBtn");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const overdueTasksEl = document.getElementById("overdueTasks");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const notification = document.getElementById("notification");
const clearAllModal = document.getElementById("clearAllModal");
const confirmClearBtn = document.getElementById("confirmClearBtn");
const cancelClearBtn = document.getElementById("cancelClearBtn");
const closeModalBtn = document.querySelector(".close-modal");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFileInput");
const sortSelect = document.getElementById("sortSelect");
const toggleCompletedBtn = document.getElementById("toggleCompletedBtn");

// State
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentPage = 1;
const tasksPerPage = 10;
let currentFilter = "all";
let searchQuery = "";
let showCompleted = true;
let sortBy = "newest";
let dragSrcEl = null;

// Initialize
updatePagination();
renderTasks();
updateStats();
updateThemeIcon();
updateClearAllButton();

// Theme toggle
themeToggle.addEventListener("click", function () {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  document.body.setAttribute("data-theme", isDark ? "light" : "dark");
  localStorage.setItem("theme", isDark ? "light" : "dark");
  updateThemeIcon();
});

function updateThemeIcon() {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  themeToggle.textContent = isDark ? "☀️" : "🌙";
}

// Check for saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.setAttribute("data-theme", savedTheme);
}

// Add task
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const taskText = taskInput.value.trim();
  const category = categorySelect.value;
  const dueDate = dueDateInput.value;

  if (taskText === "") {
    showError("Task cannot be empty!");
    return;
  }

  errorMessage.style.display = "none";

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
    priority: "medium",
    category: category,
    dueDate: dueDate || null,
  };

  tasks.unshift(newTask);
  saveTasks();
  taskInput.value = "";
  dueDateInput.value = "";

  // Reset to first page when adding a new task
  currentPage = 1;
  updatePagination();
  renderTasks();
  updateStats();
  updateClearAllButton();
  showNotification("Task added successfully!");
}

// Clear all tasks
clearAllBtn.addEventListener("click", function () {
  if (tasks.length > 0) {
    clearAllModal.style.display = "flex";
  }
});

confirmClearBtn.addEventListener("click", function () {
  tasks = [];
  saveTasks();
  currentPage = 1;
  updatePagination();
  renderTasks();
  updateStats();
  updateClearAllButton();
  clearAllModal.style.display = "none";
  showNotification("All tasks cleared!");
});

cancelClearBtn.addEventListener("click", function () {
  clearAllModal.style.display = "none";
});

closeModalBtn.addEventListener("click", function () {
  clearAllModal.style.display = "none";
});

window.addEventListener("click", function (e) {
  if (e.target === clearAllModal) {
    clearAllModal.style.display = "none";
  }
});

function updateClearAllButton() {
  clearAllBtn.disabled = tasks.length === 0;
}

// Export/Import functionality
exportBtn.addEventListener("click", exportTasks);
importBtn.addEventListener("click", function () {
  importFileInput.click();
});

importFileInput.addEventListener("change", importTasks);

function exportTasks() {
  const dataStr = JSON.stringify(tasks);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "tasks.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();

  showNotification("Tasks exported successfully!");
}

function importTasks(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const importedTasks = JSON.parse(e.target.result);

      if (Array.isArray(importedTasks)) {
        // Merge with existing tasks
        tasks = [...importedTasks, ...tasks];
        saveTasks();
        currentPage = 1;
        updatePagination();
        renderTasks();
        updateStats();
        updateClearAllButton();
        showNotification("Tasks imported successfully!");
      } else {
        showError("Invalid file format!");
      }
    } catch (error) {
      showError("Error parsing the file!");
    }
  };

  reader.readAsText(file);
  // Reset the file input
  event.target.value = "";
}

// Toggle completed tasks visibility
toggleCompletedBtn.addEventListener("click", function () {
  showCompleted = !showCompleted;
  this.textContent = showCompleted ? "Hide Completed" : "Show Completed";
  renderTasks();
});

// Sort functionality
sortSelect.addEventListener("change", function () {
  sortBy = this.value;
  renderTasks();
});

// Task actions
function handleCheckboxChange(taskId) {
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    saveTasks();
    renderTasks();
    updateStats();
    showNotification(
      task.completed ? "Task completed!" : "Task marked as active!"
    );
  }
}

function handleEditTask(taskId) {
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    const newText = prompt("Edit your task:", task.text);
    if (newText !== null && newText.trim() !== "") {
      task.text = newText.trim();
      saveTasks();
      renderTasks();
      showNotification("Task updated successfully!");
    }
  }
}

function handleDeleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();

    // Adjust current page if needed after deletion
    const totalPages = Math.ceil(tasks.length / tasksPerPage);
    if (currentPage > totalPages) {
      currentPage = Math.max(1, totalPages);
    }

    updatePagination();
    renderTasks();
    updateStats();
    updateClearAllButton();
    showNotification("Task deleted!");
  }
}

function handlePriorityChange(taskId, priority) {
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    task.priority = priority;
    saveTasks();
    renderTasks();
    showNotification("Priority updated!");
  }
}

function handleCategoryChange(taskId, category) {
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    task.category = category;
    saveTasks();
    renderTasks();
    showNotification("Category updated!");
  }
}

function handleDueDateChange(taskId, dueDate) {
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    task.dueDate = dueDate;
    saveTasks();
    renderTasks();
    showNotification("Due date updated!");
  }
}

// Drag and drop functionality
function handleDragStart(e) {
  this.style.opacity = "0.4";
  dragSrcEl = this;

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  this.classList.add("drag-over");
}

function handleDragLeave(e) {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (dragSrcEl !== this) {
    // Get task IDs from data attributes
    const sourceId = parseInt(dragSrcEl.getAttribute("data-id"));
    const targetId = parseInt(this.getAttribute("data-id"));

    // Find indices of tasks
    const sourceIndex = tasks.findIndex((task) => task.id === sourceId);
    const targetIndex = tasks.findIndex((task) => task.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      // Reorder tasks array
      const [movedTask] = tasks.splice(sourceIndex, 1);
      tasks.splice(targetIndex, 0, movedTask);

      saveTasks();
      renderTasks();
      showNotification("Task order updated!");
    }
  }

  return false;
}

function handleDragEnd(e) {
  this.style.opacity = "1";

  document.querySelectorAll(".task-item").forEach((item) => {
    item.classList.remove("drag-over");
  });
}

// Filtering
filterBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    if (this.id === "toggleCompletedBtn") return;

    filterBtns.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.filter;
    currentPage = 1;
    updatePagination();
    renderTasks();
  });
});

// Search functionality
searchInput.addEventListener("input", function () {
  searchQuery = this.value.toLowerCase();
  currentPage = 1;
  updatePagination();
  renderTasks();
});

// Filter tasks based on current filter and search query
function getFilteredTasks() {
  let filtered = tasks;

  // Apply filter
  if (currentFilter === "active") {
    filtered = filtered.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter((task) => task.completed);
  } else if (["personal", "work", "study"].includes(currentFilter)) {
    filtered = filtered.filter((task) => task.category === currentFilter);
  } else if (currentFilter === "overdue") {
    const today = new Date().toISOString().split("T")[0];
    filtered = filtered.filter(
      (task) => task.dueDate && !task.completed && task.dueDate < today
    );
  }

  // Apply search
  if (searchQuery) {
    filtered = filtered.filter((task) =>
      task.text.toLowerCase().includes(searchQuery)
    );
  }

  // Hide completed tasks if needed
  if (!showCompleted) {
    filtered = filtered.filter((task) => !task.completed);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === "alphabetical") {
      return a.text.localeCompare(b.text);
    }
    return 0;
  });

  return filtered;
}

// Check for overdue tasks
function checkOverdueTasks() {
  const today = new Date().toISOString().split("T")[0];
  return tasks.filter(
    (task) => task.dueDate && !task.completed && task.dueDate < today
  ).length;
}

// Pagination
function updatePagination() {
  const filteredTasks = getFilteredTasks();
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

  pageInfo.textContent =
    totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : "Page 1 of 1";
}

prevPageBtn.addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    updatePagination();
    renderTasks();
  }
});

nextPageBtn.addEventListener("click", function () {
  const filteredTasks = getFilteredTasks();
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updatePagination();
    renderTasks();
  }
});

// Update stats
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const overdue = checkOverdueTasks();

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
  overdueTasksEl.textContent = overdue;
}

// Render tasks
function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    emptyState.style.display = "block";
    taskList.innerHTML = "";
    taskList.appendChild(emptyState);
    return;
  }

  emptyState.style.display = "none";

  // Calculate tasks for current page
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const tasksToRender = filteredTasks.slice(startIndex, endIndex);

  taskList.innerHTML = "";

  tasksToRender.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.setAttribute("data-id", task.id);
    li.draggable = true;

    const createdDate = new Date(task.createdAt).toLocaleDateString();
    const completedDate = task.completedAt
      ? new Date(task.completedAt).toLocaleDateString()
      : "";

    // Check if task is overdue
    const today = new Date().toISOString().split("T")[0];
    const isOverdue = task.dueDate && !task.completed && task.dueDate < today;
    const isDueSoon = task.dueDate && !task.completed && task.dueDate === today;

    if (isOverdue) {
      li.classList.add("overdue");
    } else if (isDueSoon) {
      li.classList.add("due-soon");
    }

    li.innerHTML = `
                        <div class="priority-indicator priority-${
                          task.priority
                        }"></div>
                        <input type="checkbox" class="task-checkbox" ${
                          task.completed ? "checked" : ""
                        }>
                        <div class="task-details">
                            <span class="task-text ${
                              task.completed ? "completed" : ""
                            }">${task.text}</span>
                            <div class="task-meta">
                                <span class="task-category category-${
                                  task.category
                                }">${task.category}</span>
                                ${
                                  task.dueDate
                                    ? `
                                    <span class="task-due-date">
                                        <i class="far fa-calendar-alt"></i>
                                        ${new Date(
                                          task.dueDate
                                        ).toLocaleDateString()}
                                        ${
                                          isOverdue
                                            ? '<i class="fas fa-exclamation-circle" style="color: var(--danger-color);"></i>'
                                            : ""
                                        }
                                        ${
                                          isDueSoon
                                            ? '<i class="fas fa-clock" style="color: var(--warning-color);"></i>'
                                            : ""
                                        }
                                    </span>
                                `
                                    : ""
                                }
                                <span>Added: ${createdDate}</span>
                                ${
                                  completedDate
                                    ? `<span>Completed: ${completedDate}</span>`
                                    : ""
                                }
                            </div>
                        </div>
                        <div class="task-actions">
                            <div class="priority-select">
                                <select id="priority-${task.id}">
                                    <option value="high" ${
                                      task.priority === "high" ? "selected" : ""
                                    }>High</option>
                                    <option value="medium" ${
                                      task.priority === "medium"
                                        ? "selected"
                                        : ""
                                    }>Medium</option>
                                    <option value="low" ${
                                      task.priority === "low" ? "selected" : ""
                                    }>Low</option>
                                </select>
                            </div>
                            <div class="category-select">
                                <select id="category-${task.id}">
                                    <option value="personal" ${
                                      task.category === "personal"
                                        ? "selected"
                                        : ""
                                    }>Personal</option>
                                    <option value="work" ${
                                      task.category === "work" ? "selected" : ""
                                    }>Work</option>
                                    <option value="study" ${
                                      task.category === "study"
                                        ? "selected"
                                        : ""
                                    }>Study</option>
                                    <option value="other" ${
                                      task.category === "other"
                                        ? "selected"
                                        : ""
                                    }>Other</option>
                                </select>
                            </div>
                            <input type="date" id="dueDate-${task.id}" value="${
      task.dueDate || ""
    }" style="padding: 5px; border: 1px solid var(--border-color); border-radius: 4px;">
                            <button class="edit-btn"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    `;

    const checkbox = li.querySelector(".task-checkbox");
    const editBtn = li.querySelector(".edit-btn");
    const deleteBtn = li.querySelector(".delete-btn");
    const prioritySelect = li.querySelector(`#priority-${task.id}`);
    const categorySelect = li.querySelector(`#category-${task.id}`);
    const dueDateInput = li.querySelector(`#dueDate-${task.id}`);

    checkbox.addEventListener("change", () => handleCheckboxChange(task.id));
    editBtn.addEventListener("click", () => handleEditTask(task.id));
    deleteBtn.addEventListener("click", () => handleDeleteTask(task.id));
    prioritySelect.addEventListener("change", () =>
      handlePriorityChange(task.id, prioritySelect.value)
    );
    categorySelect.addEventListener("change", () =>
      handleCategoryChange(task.id, categorySelect.value)
    );
    dueDateInput.addEventListener("change", () =>
      handleDueDateChange(task.id, dueDateInput.value)
    );

    // Drag and drop event listeners
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragenter", handleDragEnter);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("dragleave", handleDragLeave);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    taskList.appendChild(li);
  });
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Notification system
function showNotification(message) {
  notification.textContent = message;
  notification.classList.remove("error");
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";

  notification.textContent = message;
  notification.classList.add("error", "show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}
