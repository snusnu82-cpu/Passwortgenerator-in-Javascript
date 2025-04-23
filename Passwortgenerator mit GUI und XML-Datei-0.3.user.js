// ==UserScript==
// @name         Passwortgenerator mit GUI und XML-Datei
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Passwortgenerator mit XML-Datei-Export für Tampermonkey
// @author       Dein Name
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // Stil für die GUI hinzufügen
    GM_addStyle(`
        #passwordGenerator {
            position: fixed;
            top: 10px;
            left: 10px;
            background-color: rgba(255, 255, 255, 0.9);
            border: 1px solid #ccc;
            padding: 20px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            width: 300px;
            font-family: Arial, sans-serif;
        }
        #passwordGenerator input, #passwordGenerator button {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        #passwordGenerator #passwordOutput {
            font-size: 14px;
            font-weight: bold;
            word-wrap: break-word;
            margin-top: 10px;
        }
        .passwordList {
            margin-top: 10px;
        }
        .passwordItem {
            padding: 5px;
            border: 1px solid #ddd;
            margin-bottom: 5px;
            word-wrap: break-word;
        }
    `);

    // Passwort-Generator-Funktion
    function generatePassword(length) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?/";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    // XML-Datei erstellen
    function generateXML(passwords) {
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<passwörter>\n';

        passwords.forEach((password, index) => {
            xmlContent += `  <passwort id="${index + 1}">${password}</passwort>\n`;
        });

        xmlContent += '</passwörter>';

        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'passwörter.xml';
        link.click();
        URL.revokeObjectURL(url);
    }

    // GUI erstellen
    const div = document.createElement('div');
    div.id = 'passwordGenerator';
    div.innerHTML = `
        <h3>Passwortgenerator</h3>
        <label for="passwordLength">Länge (8-32 Zeichen):</label>
        <input type="number" id="passwordLength" min="8" max="32" value="16" />

        <label for="passwordCount">Anzahl (1-10 Passwörter):</label>
        <input type="number" id="passwordCount" min="1" max="10" value="1" />

        <button id="generatePassword">Passwörter generieren</button>
        <div id="passwordOutput" class="passwordList"></div>
        <button id="copyPassword">Passwörter kopieren</button>
        <button id="downloadXML">XML herunterladen</button>
    `;
    document.body.appendChild(div);

    // Passwort generieren und anzeigen
    const generateButton = document.getElementById('generatePassword');
    const passwordOutput = document.getElementById('passwordOutput');
    const passwordLengthInput = document.getElementById('passwordLength');
    const passwordCountInput = document.getElementById('passwordCount');

    generateButton.addEventListener('click', () => {
        const length = parseInt(passwordLengthInput.value, 10);
        const count = parseInt(passwordCountInput.value, 10);
        passwordOutput.innerHTML = ''; // Vorherige Passwörter löschen

        let passwords = [];
        for (let i = 0; i < count; i++) {
            const password = generatePassword(length);
            passwords.push(password);
            const passwordItem = document.createElement('div');
            passwordItem.className = 'passwordItem';
            passwordItem.textContent = password;
            passwordOutput.appendChild(passwordItem);
        }
    });

    // Passwörter kopieren
    const copyButton = document.getElementById('copyPassword');
    copyButton.addEventListener('click', () => {
        const passwords = Array.from(passwordOutput.getElementsByClassName('passwordItem')).map(item => item.textContent);
        if (passwords.length > 0) {
            GM_setClipboard(passwords.join('\n')); // Alle Passwörter in die Zwischenablage kopieren
            alert("Passwörter in die Zwischenablage kopiert!");
        } else {
            alert("Generiere zuerst Passwörter!");
        }
    });

    // XML-Datei herunterladen
    const downloadButton = document.getElementById('downloadXML');
    downloadButton.addEventListener('click', () => {
        const passwords = Array.from(passwordOutput.getElementsByClassName('passwordItem')).map(item => item.textContent);
        if (passwords.length > 0) {
            generateXML(passwords);
        } else {
            alert("Generiere zuerst Passwörter, bevor du die XML herunterlädst!");
        }
    });
})();
