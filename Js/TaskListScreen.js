import { formatDateString, togglePlay, readText, updateTask, deleteTask, convertDateToISOString } from "./main.js";

export function TaskListScreen(TaskListFromServer) {
    TaskList = TaskListFromServer;
    renderTaskListScreenHTML();
    attachEventListeners();
}

let TaskList = [];

// Esta función configura y muestra la estructura principal de la pantalla de la lista de tareas.
// Añade secciones para las tareas pendientes y completadas, así como un formulario para agregar nuevas tareas.
// Si no hay tareas en TaskList, llama a tasksNotFoud() para mostrar un mensaje de "No se encontraron tareas".
// Luego, clasifica cada tarea en pendiente o completada usando classifyTask().
function renderTaskListScreenHTML() {
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.innerHTML = `
        <section class="container left center-elements">
            <div class="task-list center-elements">
                <ul id="pending-tasks" class="tasks-container center-elements"></ul>
                <ul id="completed-tasks" class="tasks-container center-elements"></ul>
            </div>
        </section>
        <section class="container right center-elements">
            <form id="task-list-screen" class="task-form closed center-elements"></form>
            <div class="equalizer-container">
                <div class="equalizer"></div>
            </div>
        </section>
    `;

    renderTasksIntoScreen();
}

let cacheValid = false;
let pendingTask = []
let completedTask = []

// Esta función clasifica cada tarea en pendiente o completada y la añade al contenedor correspondiente.
// Usa las propiedades de la tarea (estado, título, fechas) para crear y añadir el HTML de la tarea en el contenedor adecuado.
function renderTasksIntoScreen() {
    const pendingTasksContainer = document.getElementById('pending-tasks');
    const completedTasksContainer = document.getElementById('completed-tasks');

    if (!cacheValid) {
        classifyTasks(TaskList);
    }

    if (pendingTask.length === 0) {
        pendingTasksContainer.innerHTML = '';
        taskNotFound(pendingTasksContainer, 'pendientes');
    } else {
        pendingTasksContainer.innerHTML = '';
        pendingTasksContainer.classList.remove('not-found');
        orderByDateDescending(pendingTask);
        writeTaskList(pendingTask, pendingTasksContainer);
    }

    if (completedTask.length === 0) {
        completedTasksContainer.innerHTML = '';
        taskNotFound(completedTasksContainer, 'completadas');
    } else {
        completedTasksContainer.innerHTML = '';
        completedTasksContainer.classList.remove('not-found');
        orderByDateDescending(completedTask);
        writeTaskList(completedTask, completedTasksContainer);
    }

    cacheValid = true;
    
    function orderByDateDescending(list) {
        list.sort((a, b) => new Date(b.fechaconclucion) - new Date(a.fechaconclucion));
    }
    
    function writeTaskList(array, container) {
        container.innerHTML = '';
        array.forEach(task => {
            container.innerHTML += `
                <li id="${task.id}" title="${task.titulo}" data-schedule-start="${task.fechacreacion}" data-schedule-end="${task.fechaconclucion}" data-taskState="${task.estado}">
                    <div class="task ${task.estado} center-elements">
                        <div class="task-info center-elements">
                            <p>${task.titulo}</p>
                            <small>${task.estado === 'pendiente' ? formatDateString(task.fechacreacion) : formatDateString(task.fechaconclucion)}</small>
                        </div>
                        <button id="btn-${task.id - 1}" data-taskState="${task.estado}" class="play-btn icon material-symbols-outlined">
                            ${task.estado === 'pendiente' ? 'play_circle' : 'check_circle'}
                        </button>
                    </div>
                </li>
            `;
        });
    }

    function taskNotFound(container, type) {
        container.classList.add('not-found');
        container.innerHTML = `
            <div class="not-found center-elements">
                <p>No se encontraron ${type} tareas</p>
            </div>
        `;
    }

}

function classifyTasks(tasksToClassify) {
    pendingTask = [];
    completedTask = [];

    tasksToClassify.forEach(task => {
        if (task.estado === 'pendiente') {
            pendingTask.push(task);
        } else {
            completedTask.push(task);
        }
    });

    cacheValid = true; 
}

// Esta función añade los listeners de eventos a los elementos de la lista de tareas.
// Configura los eventos de clic para abrir el formulario de la tarea y para los botones de reproducción/pausa de las tareas pendientes.
function attachEventListeners() {
    document.querySelectorAll('.tasks-container li').forEach(task => {
        task.addEventListener('click', () => openTaskForm(task));
    });

    document.querySelectorAll('.play-btn[data-taskState="pendiente"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            togglePlay(btn);

            if(btn.classList.contains('active')) {
                await readText(document.getElementById('task-form-input').value);
            }
    
            togglePlay(btn);
        });
    });
}

// Esta función abre el formulario de una tarea específica para mostrar su información detallada.
// Rellena el formulario con los datos de la tarea y añade listeners de eventos para interactuar con el formulario.
function openTaskForm(task) {
    const taskForm = document.querySelector('.task-form');
    const taskIndex = TaskList.findIndex(t => t.id == task.id);

    document.querySelectorAll('.tasks-container li').forEach(t => {
        if (t !== task) {
            t.classList.remove('active');
            togglePlay(t.querySelector('.play-btn'));
        }
    });

    task.classList.add('active');
    taskForm.setAttribute('data-task-title', task.titulo);
    taskForm.classList.remove('closed');

    taskForm.innerHTML = `
        <button id="btn-close-task-form" class="icon material-symbols-outlined">close</button>
        <input type="text" id="task-form-title" name="task-form-title" placeholder="Escribe tu titulo aquí..." value="${task.getAttribute('title')}" readonly>
        <textarea id="task-form-input" placeholder="Escribe tu tarea aquí..." readonly></textarea>
        <div class="task-form-footer center-elements">
            <div class="icon-container center-elements">
                <button id="btn-delete-task" type="button" class="icon material-symbols-outlined">delete</button>
                <select name="state-options" id="state-options">
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                </select>
            </div>
            <div class="icon-container center-elements">
                <button id="btn-edit-task" type="button" class="icon material-symbols-outlined">edit</button>
                <button id="btn-complete-task" type="button" class="icon material-symbols-outlined">check</button>
            </div>
        </div>
    `;

    stateSelected();
    document.getElementById('task-form-input').value = TaskList[taskIndex].descripcion;
    attachFormEventListeners(task, taskForm);

    function stateSelected() {
        const estadoInicial = task.getAttribute('data-taskState');
        const selectElement = taskForm.querySelector('#state-options');

        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].value === estadoInicial) {
                selectElement.options[i].selected = true;
                break;
            }
        }
    } 
}

// Esta función añade listeners de eventos al formulario de una tarea específica.
// Maneja las acciones de cerrar el formulario, eliminar la tarea, editar la tarea y marcar la tarea como completada.
function attachFormEventListeners(task, taskForm) {

    // TODO: Implementar el evento de cerrar el formulario
    document.getElementById('btn-close-task-form').addEventListener('click', closeForm);

    // TODO: Implementar el evento de eliminar la tarea
    document.getElementById('btn-delete-task').addEventListener('click', () => {
        deleteTask(task.id);
    });

    // TODO: Implementar el evento de editar la tarea
    document.getElementById('btn-edit-task').addEventListener('click', () => {
        const taskFormInput = document.getElementById('task-form-input');
        const taskFormTitle = document.getElementById('task-form-title');

        taskFormTitle.readOnly = false;
        taskFormInput.readOnly = false;
        taskFormInput.focus();
    });

    // TODO: Implementar el evento de completar la tarea
    document.getElementById('btn-complete-task').addEventListener('click', () => {
        closeForm();
        taskForm.classList.add('completed');
        updateEditedTask(task, taskForm); 
    });

    function closeForm() {
        taskForm.classList.add('closed');
        task.classList.remove('active');
        task.querySelector('.play-btn').classList.remove('active');
        togglePlay(task.querySelector('.play-btn'));
    }
}

// Esta función actualiza la información de una tarea en la lista de tareas (TaskList) y guarda los cambios.
// Extrae los nuevos valores del formulario y los asigna a la tarea correspondiente.
function updateEditedTask(task, taskForm) {

    const taskIndex = TaskList.findIndex(t => t.id == task.id);
    if (taskIndex === -1) {
        console.error('Task not found');
        return;
    }

    const newTitle = getAttributeValue('#task-form-title');
    const newDescription = getAttributeValue('#task-form-input');
    const newState = getAttributeValue('#state-options');
    const newFechaConcluida = task.getAttribute('data-taskState') === 'completado' ? task.getAttribute('data-schedule-end') : new Date().toISOString();
    const newFechaCreada = task.getAttribute('data-schedule-start');

    const taskToUpdate = {
        titulo: newTitle,
        descripcion: newDescription,
        estado: newState,
        fechaconclucion: newFechaConcluida,
        fechacreacion: newFechaCreada
    }

    updateTask(taskIndex + 1, taskToUpdate);

    function getAttributeValue(selector) {
        const element = taskForm.querySelector(selector);
        return element ? element.value : null;
    }

}


