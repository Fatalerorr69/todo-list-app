// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todos';
        
        // DOM elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.clearBtn = document.getElementById('clearBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalTasksSpan = document.getElementById('totalTasks');
        this.completedTasksSpan = document.getElementById('completedTasks');
        
        this.init();
    }

    init() {
        // Load todos from local storage
        this.loadTodos();
        
        // Event listeners
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Initial render
        this.render();
    }

    loadTodos() {
        const stored = localStorage.getItem(this.storageKey);
        this.todos = stored ? JSON.parse(stored) : [];
    }

    saveTodos() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            this.showError('Please enter a task');
            return;
        }
        
        if (text.length > 200) {
            this.showError('Task is too long (max 200 characters)');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) return;
        
        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalTasksSpan.textContent = `Total: ${total}`;
        this.completedTasksSpan.textContent = `Completed: ${completed}`;
        this.clearBtn.disabled = completed === 0;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">
                        ${this.currentFilter === 'completed' 
                            ? 'No completed tasks yet' 
                            : this.currentFilter === 'active'
                            ? 'All done! No active tasks'
                            : 'No tasks yet. Add one to get started!'}
                    </div>
                </div>
            `;
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        data-id="${todo.id}"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn" data-id="${todo.id}">Delete</button>
                `;
                
                // Add event listeners
                li.querySelector('.checkbox').addEventListener('change', () => {
                    this.toggleTodo(todo.id);
                });
                
                li.querySelector('.delete-btn').addEventListener('click', () => {
                    this.deleteTodo(todo.id);
                });
                
                this.todoList.appendChild(li);
            });
        }
        
        this.updateStats();
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showError(message) {
        // Simple error feedback
        const originalPlaceholder = this.todoInput.placeholder;
        this.todoInput.placeholder = message;
        this.todoInput.style.borderColor = '#ff6b6b';
        
        setTimeout(() => {
            this.todoInput.placeholder = originalPlaceholder;
            this.todoInput.style.borderColor = '';
        }, 2000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});