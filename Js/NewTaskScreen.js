import { formatDateString, createTask, convertDateToISOString, playSound } from './main.js';

export function NewTaskScreen(){
    renderNewTaskScreenHTML();
    attachBtnEventListeners();
}

function renderNewTaskScreenHTML()  {
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.innerHTML = `
        <section class="container left center-elements">
            <form id="new-task-screen" class="task-form center-elements">
                <input type="text" id="task-form-title" name="task-form-title" placeholder="Escribe tu titulo aquí..." required>
                <textarea id="task-form-input" placeholder="Escribe tu tarea aquí..." required></textarea>
                <div class="schedules-container center-elements">
                    <div class="center-elements">
                        <label>Fecha de creación</label>
                        <p id="schedule">${formatDateString(new Date())}</p>
                    </div>
                </div>
                <div class="task-form-footer center-elements">
                    <div class="icon-container center-elements">
                        <select name="state-options" id="state-options" disabled>
                            <option value="pendiente">Pendiente</option>
                        </select>
                        <button type="button" id="btn-calendar-task" class="icon material-symbols-outlined">calendar_today</button>
                    </div>
                </div>
                <div class="btn-container center-elements">
                    <button id="btn-save-task" type="button" class="btn">Guardar</button>
                    <button id="btn-cancel-task" type="reset" class="btn">Cancelar</button>
                </div>
            </form>
        </section>
        <section class="container right center-elements">
            <h1>Mapa</h1>
            <div class="map-image-container center-elements">
            </div>
        </section>
    `;
}

function attachBtnEventListeners() {
    document.querySelector('#btn-calendar-task').addEventListener('click', () => {
        const calendarContainer = document.querySelector('.schedules-container');
        calendarContainer.classList.toggle('open');
    });
    document.querySelector('#btn-save-task').addEventListener('click', async ()=> {
        const title = document.querySelector('#task-form-title').value;
        const description = document.querySelector('#task-form-input').value;

        if (!title || !description) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        const state = document.querySelector('#state-options').value;
        const startDate = document.querySelector('#schedule').textContent;

        const newTask = generateNewTask(title, description, startDate, state);

        const main = document.querySelector('main');
        main.innerHTML = '';
        main.classList.add('completed');
        playSound('TaskCompleted'); 

        await createTask(newTask);

    });
}

function generateNewTask(title, description, startDate, state) {
    const task = {
        titulo: title,
        descripcion: description,
        fechacreacion: convertDateToISOString(startDate),
        fechaconclucion: "",
        estado: state
    }

    return task;
}
