Vue.component('task-form', {
    props: [],
    template: `
    <div class="content_form">
    <form @submit.prevent="addTask">
    <label for="task-name">Create a new task:</label>
    <input class="input" id="task-name" type="text" v-model="taskName"><br><br>
    <label for="task-desc">Description of the task:</label>
    <textarea id="task-desc" v-model="description"></textarea><br><br>
    <label for="deadline">Deadline:</label>
    <input type="date" id="deadline" v-model="deadline" name="deadline-task" min="2024-01-01" max="2025-12-31" required />
    <button type="submit">Create</button>
    </form>
    </div>
    `,
    data() {
    return {
    taskName: '',
    description: '',
    deadline: ''
    };
    },
    methods: {
    addTask() {
    if (this.taskName !== '') {
    const newTask = {
    title: this.taskName,
    description: this.description,
    deadline: this.deadline,
    reason: ''
    };
    newTask.createdDate = new Date().toLocaleDateString();
    this.$emit('add', newTask);
    this.taskName = '';
    this.description = '';
    this.deadline = '';
    } else {
    alert("Enter a task name");
    }
    }
    }
    });
    
    Vue.component('task', {
    props: ['task', 'type'],
    data() {
    return {
    editingDescription: false,
    editedDescription: '',
    returnReason: ''
    };
    },
    methods: {
    handleEditDescription() {
    if (this.editingDescription) {
    this.task.description = this.editedDescription;
    this.task.lastEdited = new Date().toLocaleString();
    }
    this.editingDescription = !this.editingDescription;
    },
    handleDeleteTask() {
    this.$emit('delete', this.task);
    },
    handleMoveTask() {
    if (this.type === 'plan') {
    this.$emit('move', this.task);
    } else if (this.type === 'work') {
    this.$emit('move-to-next', this.task);
    }
    },
    handleMoveToNext() {
    if (this.type === 'work') {
    this.$emit('move-to-next', this.task);
    }
    },
    handleReturnToPrevious() {
    if (this.returnReason !== '') {
    this.task.reason = this.returnReason;
    this.$emit('return', this.task);
    } else {
    alert("Enter reason for return");
    }
    },
    handleCompleteTask() {
    this.$emit('complete', this.task);
    }
    },
    template: `
    <div class="task">
    <span>Создано: {{ task.createdDate }}</span>
    <h3>{{ task.title }}</h3>
    <p v-if="!editingDescription">{{ task.description }}</p>
    <textarea v-model="editedDescription" v-if="editingDescription"></textarea>
    <span v-if="task.lastEdited">Edited: {{ task.lastEdited }}</span><br><br>
    <span>Срок сдачи: {{ task.deadline }}</span><br><br>
    <button v-if="type === 'plan'" @click="handleDeleteTask">Delete</button>
    <button v-if="type !== 'completed'" @click="handleEditDescription">{{ editingDescription ? 'Save' : 'Edit' }}</button>
    <button v-if="type === 'plan'" @click="handleMoveTask">Move</button>
    <button v-if="type === 'work'" @click="handleMoveToNext">Move</button>
    <button v-if="type === 'testing'" @click="handleReturnToPrevious">Return</button>
    <button v-if="type === 'testing'" @click="handleCompleteTask">Done</button>
    <br>
    <textarea v-if="type === 'testing'" v-model="returnReason" placeholder="Enter reason for return"></textarea>
    <span v-if="type === 'work' && task.reason">Reason for return: {{ task.reason }}</span>
    <span v-if="type === 'completed'">{{ task.check }}</span>
    </div>
    `
    });
    
    Vue.component('task-column', {
    props: ['title', 'tasks', 'type'],
    template: `
    <div class="column">
    <h2 class="title_column">{{ title }}</h2>
    <task v-for="task in tasks" :key="task.id" :task="task" :type="type" @delete="handleDeleteTask" @move="moveTask" @move-to-next="moveToNext" @return="returnTask" @complete="completeTask"></task>
    </div>
    `,
    methods: {
    handleDeleteTask(task) {
    this.$emit('delete-task', task);
    },
    moveTask(task) {
    this.$emit('move-task', task);
    },
    moveToNext(task) {
    const indexTesting = this.tasks.indexOf(task);
    if (this.type === 'work' && indexTesting !== -1 && task.reason) {
    task.reason = '';
    }
    this.$emit('move-to-next', task);
    },
    returnTask(task) {
    this.$emit('return-task', task);
    },
    completeTask(task) {
    this.$emit('complete-task', task);
    }
    }
    });
    Vue.component('app', {
    template: `
    <div id="app">
    <task-form @add="addTask"></task-form>
    <div class="board">
    <task-column title="Scheduled tasks" :tasks="planTask" type="plan" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask"></task-column>
    <task-column title="In progress" :tasks="workTask" type="work" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask"></task-column>
    <task-column title="Testing" :tasks="testingTask" type="testing" @delete-task="deleteTask" @move-task="moveTask" @move-to-next="moveToNext" @return-task="returnTask" @complete-task="completeTask"></task-column>
    <task-column title="Completed tasks" :tasks="completedTask" type="completed"></task-column>
    </div>
    </div>
    `,
    data() {
    return {
    planTask: [],
    workTask: [],
    testingTask: [],
    completedTask: []
    };
    },
    created() {
    this.loadTasks();
    },
    methods: {
    addTask(task) {
    this.planTask.push(task);
    this.saveTasks();
    },
    deleteTask(task) {
    const indexPlan = this.planTask.indexOf(task);
    const indexWork = this.workTask.indexOf(task);
    const indexTesting = this.testingTask.indexOf(task);
    const indexCompleted = this.completedTask.indexOf(task);
    
    if (indexPlan !== -1) {
    this.planTask.splice(indexPlan, 1);
    } else if (indexWork !== -1) {
    this.workTask.splice(indexWork, 1);
    } else if (indexTesting !== -1) {
    this.testingTask.splice(indexTesting, 1);
    } else if (indexCompleted !== -1) {
    this.completedTask.splice(indexCompleted, 1);
    }
    this.saveTasks();
    },
    moveTask(task) {
    const indexPlan = this.planTask.indexOf(task);
    const indexWork = this.workTask.indexOf(task);
    const indexTesting = this.testingTask.indexOf(task);
    
    if (indexPlan !== -1) {
    this.planTask.splice(indexPlan, 1);
    this.workTask.push(task);
    } else if (indexWork !== -1) {
    this.workTask.splice(indexWork, 1);
    this.testingTask.push(task);
    } else if (indexTesting !== -1) {
    this.testingTask.splice(indexTesting, 1);
    this.completedTask.push(task);
    if (dateCompleted >= dateNow) {
    task.check = 'Completed on time';
    } else {
    task.check = 'Overdue';
    }
    }
    this.saveTasks();
    },
    moveToNext(task) {
    const indexWork = this.workTask.indexOf(task);
    const indexTesting = this.testingTask.indexOf(task);
    
    if (indexWork !== -1) {
    this.workTask.splice(indexWork, 1);
    this.testingTask.push(task);
    } else if (indexTesting !== -1) {
    this.testingTask.splice(indexTesting, 1);
    this.completedTask.push(task);
    if (dateCompleted >= dateNow) {
    task.check = 'Completed on time';
    } else {
    task.check = 'Overdue';
    }
    }
    this.saveTasks();
    },
    returnTask(task) {
    this.testingTask.splice(this.testingTask.indexOf(task), 1);
    this.workTask.push(task);
    this.saveTasks();
    },
    completeTask(task) {
    this.testingTask.splice(this.testingTask.indexOf(task), 1);
    this.completedTask.push(task);
    if (dateCompleted >= dateNow) {
    task.check = 'Completed on time';
    } else {
    task.check = 'Overdue';
    }
    this.saveTasks();
    },
    saveTasks() {
    localStorage.setItem('tasks', JSON.stringify({
    planTask: this.planTask,
    workTask: this.workTask,
    testingTask: this.testingTask,
    completedTask: this.completedTask
    }));
    },
    loadTasks() {
    const tasksData = JSON.parse(localStorage.getItem('tasks'));
    if (tasksData) {
    this.planTask = tasksData.planTask || [];
    this.workTask = tasksData.workTask || [];
    this.testingTask = tasksData.testingTask || [];
    this.completedTask = tasksData.completedTask || [];
    }
    }
    }
    });
    
    new Vue({
    el: '#app'
    });
    Файл не выбран
    Ещё
    
    