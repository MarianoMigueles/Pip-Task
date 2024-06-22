import { togglePlay, readText, changeVoice } from "./main.js";

export function SettingsScreen() {
    renderSettingsScreenHTML();
    attachBtnEventListeners();
}

function renderSettingsScreenHTML() {
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.innerHTML = `
        <section class="container left center-elements">
            <div class="settings-container center-elements">
                <h1>Configuración de lectura</h1>
                <div class="voice-test-container center-elements">
                    <div class="voice-test center-elements">
                        <h3>Escuhar<h3>
                        <button id="btn-play" data-needToglePlay="true" class="icon center-elements material-symbols-outlined">play_circle</button>
                    </div>
                    <textarea id="task-form-input" placeholder="Escribe el texto aquí..."></textarea>
                    <div id="lang-options-container" class="voice-test-options center-elements">
                        <select name="lang-options" id="lang-options" default="${changeSelectVoice('lang')}">  
                        </select>
                    </div>
                    <div id="voice-options-container" class="voice-test-options center-elements">
                        <select name="voices-options" id="voices-options" default="${changeSelectVoice('voice')}">
                        </select>
                    </select>
                    </div>
                </div>
            </div>
        </section>
        <section class="container right center-elements">
            <div class="equalizer-container">
                <div class="equalizer"></div>
            </div>
        </section>
    `;

    getVoices()

    function getVoices() {
        const langContainer = document.querySelector('#lang-options');
        const voicesContainer = document.querySelector('#voices-options');

        Speakit.getVoices().then(voices => {
            if (voices.length > 0) {
                voices.forEach(voice => {
                    langContainer.innerHTML += `
                    <option value="${voice.lang}">
                        ${voice.lang}
                    </option>
                    `;
                });

                 clasifyVoices(langContainer.value, voices);

                langContainer.addEventListener('change', () => {
                    clasifyVoices(langContainer.value, voices); 
                });
            }
                
        });

        function clasifyVoices(lang, voices) {
            voicesContainer.innerHTML = '';
            voices.forEach(voice => {
                if(voice.lang === lang) {
                    voicesContainer.innerHTML += `
                    <option value="${voice.name}">
                        ${voice.name}
                    </option>
                    `;
                }
            });

        }

    }
}

function attachBtnEventListeners() {
    const btnPlay = document.querySelector('#btn-play');
    const textTest = document.querySelector('#task-form-input');
    
    btnPlay.addEventListener('click', async () => {
        togglePlay(btnPlay);

        if(btnPlay.classList.contains('active')) {
            await readText(textTest.value);
        }

        togglePlay(btnPlay);
    });

    const voicesSelect = document.querySelector('#voices-options');
    const langSelect = document.querySelector('#lang-options');
    voicesSelect.addEventListener('change', () => {
        const lang = langSelect.value;
        const voice = voicesSelect.value;
        changeVoice(lang, voice);
    });
    langSelect.addEventListener('change', () => {
        const lang = langSelect.value;
        const voice = voicesSelect.value;
        changeVoice(lang, voice);
    });
}

export function changeSelectVoice(type) {
    if (localStorage.getItem('settingsVoices')) {
        switch (type) {
            case 'lang':
                return localStorage.getItem('settingsVoices').lang;
            case 'voice':
                return localStorage.getItem('settingsVoices').voice;
        }
    };
}


