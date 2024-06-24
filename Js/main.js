import { TaskListScreen } from './TaskListScreen.js';
import { NewTaskScreen } from './NewTaskScreen.js';
import { SettingsScreen } from './SettingsScreen.js';

////////////////////////////////////////////////////////////////////////////////
// Api Logic
////////////////////////////////////////////////////////////////////////////////

const ApiURL = 'https://6675fdd6a8d2b4d072f21b95.mockapi.io/Pip-Task/Task';

function getTasks(done) {
    fetch(ApiURL)
    .then((response)=> response.json())
    .then((data)=> {
        done(data);
    })
}

export async function createTask(newTask) {
    try {
        await fetch(ApiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        setTimeout(() => {
            window.location.reload();
        }, 2500) 
    } catch (error) {
        console.log(error);
    }
}

export async function updateTask(taskId, taskToUpdate) {
    try {
        await fetch(`${ApiURL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskToUpdate)
        });

        setTimeout(() => {
            window.location.reload();
        }, 2500)  
    } catch (error) {
        console.log(error);
    }
}

export async function deleteTask(taskId) {
    try {
        await fetch(`${ApiURL}/${taskId}`, {
            method: 'DELETE'
        });

       window.location.reload();
    } catch (error) {
        console.log(error);
    }
}

////////////////////////////////////////////////////////////////////////////////
// Navigation Logic
////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
    getTasks((data)=> {
        //Initialization page
       TaskListScreen(data);

        document.querySelector('a[href="#NewTask"]').addEventListener('click', ()=> {
             NewTaskScreen()
             setTimeout(chargeAnimation, 100); 
             playSound('changeScreen');  
            });
        document.querySelector('a[href="#TaskList"]').addEventListener('click', ()=> {
             TaskListScreen(data) 
             setTimeout(chargeAnimation, 100);
             playSound('changeScreen');
        });
        document.querySelector('a[href="#Settings"]').addEventListener('click', ()=> {
            SettingsScreen();
            setTimeout(chargeAnimation, 100);
            playSound('changeScreen');
        });

        setTimeout(chargeAnimation, 100);
    });

    document.addEventListener('input', ()=> {
        playSound('OnKeyPress');
    })
});

function chargeAnimation() {
    const right = document.querySelector('.right');
    const left = document.querySelector('.left');

    if (right.classList.contains('charge-animation') || left.classList.contains('charge-animation')) {
        right.classList.remove('charge-animation');
        left.classList.remove('charge-animation');
    }

    right.classList.add('charge-animation');
    left.classList.add('charge-animation');
}

export function playSound(soundName) {
    let sound;
    switch (soundName) {
        case 'changeScreen': 
            sound = new Audio('Assets/Sounds/ChangeScreenFalloutSound.mp3');
            sound.play();
            break;
        case 'OnKeyPress':
            sound = new Audio('Assets/Sounds/KeyFalloutSound.mp3');
            sound.play();
            break;
        case 'TaskCompleted':
            sound = new Audio('Assets/Sounds/FalloutLikeSound.mp3');
            sound.play();
            break;
    }
    
}

////////////////////////////////////////////////////////////////////////////////
// Nav Bar Logic
////////////////////////////////////////////////////////////////////////////////

const nav = document.querySelector('header nav');
const navLinks = nav.querySelectorAll('ul li a');

navLinks.forEach((link)=> {
    link.addEventListener('click', ()=> {
        if (link.classList.contains('active')) { return; }

        navLinks.forEach((navLink)=> {
            navLink.classList.remove('active');
        })
        link.classList.add('active');
    })
})

function navBarAnimation() {
    const containerLeft = nav.getBoundingClientRect().left;
    const containerRight = nav.getBoundingClientRect().right;

    let left = navLinks[1].getBoundingClientRect().left - containerLeft;
    let right = containerRight - navLinks[1].getBoundingClientRect().right;

    setProperty();

    nav.addEventListener('click', (e)=> {
        navLinks.forEach((link)=> {
            if (e.target !== link) { return; }

            left = link.getBoundingClientRect().left - containerLeft;
            right = containerRight - link.getBoundingClientRect().right;

            setProperty();
        })
    })

    function setProperty() {
        nav.style.setProperty('--nav-before-width', `${left - 20}px`);
        nav.style.setProperty('--nav-after-width', `${right - 20}px`);
    
        nav.style.setProperty('--nav-before-ul-left-position', `${left - 25}px`);
        nav.style.setProperty('--nav-after-ul-right-position', `${right - 25}px`);
    }
}

navBarAnimation();

window.addEventListener('resize', ()=> {navBarAnimation()});

////////////////////////////////////////////////////////////////////////////////
// Global Functions Logic
////////////////////////////////////////////////////////////////////////////////

export function convertDateToISOString(dateTimeString) {
    // Separar la fecha y la hora
    let [datePart, timePart, period] = dateTimeString.split(' ');

    // Separar día, mes y año
    let [day, month, year] = datePart.split('-');

    // Convertir PM/AM a 24 horas
    let [time] = timePart.split(' ');
    let [hour, minute] = time.split(':');
    if (period === 'PM' && hour !== '12') {
        hour = String(Number(hour) + 12);
    } else if (period === 'AM' && hour === '12') {
        hour = '00';
    }

    // Formatear día y mes a dos dígitos si es necesario
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');

    // Crear la fecha en formato ISO 8601
    let isoDateTime = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();

    return isoDateTime;
}


export function formatDateString(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

// Cambia la apariencia del botón y activa/desactiva el ecualizador según el estado de la tarea.
export function togglePlay(btn) {
    const taskState = btn.getAttribute('data-taskState');
    const needTogglePlay = btn.getAttribute('data-needToglePlay');

    if (taskState === "completado") { return; } 

    if (taskState !== null || needTogglePlay === 'true') {
        const equalizer = document.querySelector('.equalizer');
    
        if (btn.parentElement.parentElement.classList.contains('active') || needTogglePlay === 'true' ) {
            const wasActive = btn.classList.contains('active');
            btn.classList.toggle('active');
            toggleEqualizer(!wasActive);
            btn.innerHTML = btn.classList.contains('active') ? 'Pause' : 'play_circle';
        } else {
            btn.classList.remove('active');
            toggleEqualizer(false);
            btn.innerHTML = 'play_circle';
        }
    
        function toggleEqualizer(state) {
            const anyActiveButton = document.querySelector('.play-btn.active');
    
            if (state) {
                equalizer.parentElement.classList.add('on');
                equalizer.classList.add('on');
            } else if (!anyActiveButton) {
                equalizer.parentElement.classList.remove('on');
                equalizer.classList.remove('on');
            }
        }
    }
}

let initialLangValue;
let initialVoiceValue;
let initialPitchValue;

let langSelected = localStorage.getItem('settingsVoices') ? JSON.parse(localStorage.getItem('settingsVoices')).lang : initialLangValue = 'es-MX';
let voiceSelected = localStorage.getItem('settingsVoices') ? JSON.parse(localStorage.getItem('settingsVoices')).voice : initialVoiceValue = 'Microsoft Sabina - Spanish (Mexico)';
let rangePitch = localStorage.getItem('settingsVoices') ? JSON.parse(localStorage.getItem('settingsVoices')).utterancePitch : initialPitchValue = 1;

updateSettingsVoices({ lang: initialLangValue, voice: initialVoiceValue, utterancePitch: initialPitchValue });

export async function readText(text) {
    Speakit.utterancePitch = rangePitch;
    await Speakit.readText(text, langSelected, voiceSelected);
}

export function changeVoice(lang, voice, uPitch) {
    langSelected = lang;
    voiceSelected = voice;
    rangePitch = uPitch;
    updateSettingsVoices({ lang: langSelected, voice: voiceSelected, utterancePitch: rangePitch });
}

async function updateSettingsVoices(voiceData) {
    let dataJson = JSON.stringify(voiceData);
    localStorage.setItem('settingsVoices', dataJson);
}

export function getPreSelectedVoice(type) {
    if (localStorage.getItem('settingsVoices')) {
        switch (type) {
            case 'lang':
                return langSelected;
            case 'voice':
                return voiceSelected;
            case 'utterancePitch':
                return utterancePitch;
        }
    };
}
