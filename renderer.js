const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let slaveAddressInput;
let serialPortSelect;
let refreshPortsButton;
let baudRateSelect;
let parityInput;
let stopBitsInput;
let dataBitsInput;
let connectButtonElement;
let connectionIndicator;
let connectionStatusText;
let hexAddressFormatCheckboxRW;
let formatLabelRW;
let readAddressInput;
let readButtonElement;
let readResultDisplay;
let writeAddressInput;
let writeValueInput;
let writeButtonElement;
let writeStatusDisplay;

let setupComButton;
let singleRWButton;
let tableButton;
let applyComSettingsButton;

let readAllButton;
let writeAllButton;
let saveConfigButton;
let loadConfigButton;
let parameterTableBody;
let addRowButton;

let isConnected = false;

document.addEventListener('DOMContentLoaded', () => {
    slaveAddressInput = document.getElementById('slaveAddress');
    serialPortSelect = document.getElementById('serialPort');
    refreshPortsButton = document.getElementById('refreshPorts');
    baudRateSelect = document.getElementById('baudRate');
    parityInput = document.getElementById('parity');
    stopBitsInput = document.getElementById('stopBits');
    dataBitsInput = document.getElementById('dataBits');
    connectButtonElement = document.getElementById('connectButton');
    connectionIndicator = document.getElementById('connectionIndicator');
    connectionStatusText = document.getElementById('connectionStatusText');

    hexAddressFormatCheckboxRW = document.getElementById('hexAddressFormatRW');
    formatLabelRW = document.getElementById('formatLabelRW');

    readAddressInput = document.getElementById('readAddress');
    readButtonElement = document.getElementById('readButton');
    readResultDisplay = document.getElementById('readResult');
    writeAddressInput = document.getElementById('writeAddress');
    writeValueInput = document.getElementById('writeValue');
    writeButtonElement = document.getElementById('writeButton');
    writeStatusDisplay = document.getElementById('writeStatus');

    setupComButton = document.getElementById('setupComButton');
    singleRWButton = document.getElementById('singleRWButton');
    tableButton = document.getElementById('tableButton');
    applyComSettingsButton = document.getElementById('applyComSettings');

    readAllButton = document.getElementById('readAllButton');
    writeAllButton = document.getElementById('writeAllButton');
    saveConfigButton = document.getElementById('saveConfigButton');
    loadConfigButton = document.getElementById('loadConfigButton');
    parameterTableBody = document.getElementById('parameterTableBody');
    addRowButton = document.getElementById('addRowButton');

    const setupComSection = document.getElementById('setupComSection');
    const singleRWSection = document.getElementById('singleRWSection');
    const tableSection = document.getElementById('tableSection');

    async function populateSerialPorts() {
        const ports = await ipcRenderer.invoke('list-serial-ports');
        console.log("Porte ricevute dal main:", ports);
        serialPortSelect.innerHTML = '';
        ports.forEach(port => {
            const option = document.createElement('option');
            option.value = port;
            option.textContent = port;
            serialPortSelect.appendChild(option);
        });
    }

    setupComButton.addEventListener('click', () => {
        setupComSection.classList.toggle('collapse');
        singleRWSection.classList.add('collapse');
        tableSection.classList.add('collapse');
    });

    connectButtonElement.addEventListener('click', async () => {
        if (!isConnected) {
            const port = serialPortSelect.value;
            const baudRate = parseInt(baudRateSelect.value);
            const parity = parityInput.value.toUpperCase();
            const stopBits = parseInt(stopBitsInput.value);
            const dataBits = parseInt(dataBitsInput.value);
            const slaveAddress = parseInt(slaveAddressInput.value);

            try {
                const connected = await ipcRenderer.invoke('connect-modbus', port, baudRate, parity, stopBits, dataBits, slaveAddress);
                if (connected) {
                    connectionStatusText.textContent = `${port} connected!`;
                    connectionStatusText.className = '';
                    connectionStatusText.style.color = 'green';
                    connectionIndicator.classList.remove('disconnected');
                    connectionIndicator.classList.add('connected');
                    isConnected = true;
                    connectButtonElement.innerHTML = '<i class="fas fa-plug me-2"></i> Disconnect <span id="connectionIndicator" class="connected"></span>';
                    singleRWButton.disabled = false;
                    tableButton.disabled = false;
                } else {
                    connectionStatusText.textContent = `Error connecting to ${port}`;
                    connectionStatusText.className = 'error';
                    connectionIndicator.classList.remove('connected');
                    connectionIndicator.classList.add('disconnected');
                    isConnected = false;
                    connectButtonElement.innerHTML = '<i class="fas fa-plug me-2"></i> Connect <span id="connectionIndicator" class="disconnected"></span>';
                    singleRWButton.disabled = true;
                    tableButton.disabled = true;
                }
            } catch (error) {
                console.error("Error during connection", error);
                connectionStatusText.textContent = `Error: ${error.message}`;
                connectionStatusText.className = 'error';
                connectionIndicator.classList.remove('connected');
                connectionIndicator.classList.add('disconnected');
                isConnected = false;
                connectButtonElement.innerHTML = '<i class="fas fa-plug me-2"></i> Connect <span id="connectionIndicator" class="disconnected"></span>';
                singleRWButton.disabled = true;
                tableButton.disabled = true;
            }
        } else {
            try {
                const disconnected = await ipcRenderer.invoke('disconnect-modbus');
                if (disconnected) {
                    connectionStatusText.textContent = 'Disconnect';
                    connectionStatusText.className = '';
                    connectionStatusText.style.color = 'black';
                    connectionIndicator.classList.remove('connected');
                    connectionIndicator.classList.add('disconnected');
                    isConnected = false;
                    connectButtonElement.innerHTML = '<i class="fas fa-plug me-2"></i> Connect <span id="connectionIndicator" class="disconnected"></span>';
                    singleRWButton.disabled = true;
                    tableButton.disabled = true;
                } else {
                    connectionStatusText.textContent = 'Errore durante la disconnessione.';
                    connectionStatusText.className = 'error';
                }
            } catch (error) {
                console.error("Errore durante la disconnessione:", error);
                connectionStatusText.textContent = `Errore durante la disconnessione: ${error.message}`;
                connectionStatusText.className = 'error';
            }
        }
    });

    singleRWButton.addEventListener('click', () => {
        singleRWSection.classList.toggle('collapse');
        setupComSection.classList.add('collapse');
        tableSection.classList.add('collapse');
    
        // Inizializza l'event listener qui, quando la sezione è resa visibile

    
        if (hexAddressFormatCheckboxRW) {
            hexAddressFormatCheckboxRW.addEventListener('change', () => {
                if (hexAddressFormatCheckboxRW.checked) {
                    formatLabelRW.textContent = 'Hex';
                } else {
                    formatLabelRW.textContent = 'Dec';
                }
            });
        } else {
            console.error("Elemento con ID 'hexAddressFormatCheckboxRW' non trovato nell'HTML.");
        }
    });

    tableButton.addEventListener('click', () => {
        tableSection.classList.toggle('collapse');
        setupComSection.classList.add('collapse');
        singleRWSection.classList.add('collapse');
    });

    applyComSettingsButton.addEventListener('click', () => {
        connectButtonElement.disabled = false;
    });

    refreshPortsButton.addEventListener('click', populateSerialPorts);

    hexAddressFormatCheckboxRW.addEventListener('change', () => {
        if (hexAddressFormatCheckboxRW.checked) {
            formatLabelRW.textContent = 'Hex';
        } else {
            formatLabelRW.textContent = 'Dec';
        }
    });

    readButtonElement.addEventListener('click', async () => {
        const addressStr = readAddressInput.value;
        let address;

        if (hexAddressFormatCheckboxRW.checked) {
            address = parseInt(addressStr, 16);
            if (isNaN(address)) {
                readResultDisplay.textContent = 'Inserisci un indirizzo esadecimale valido.';
                return;
            }
        } else {
            address = parseInt(addressStr, 10);
            if (isNaN(address)) {
                readResultDisplay.textContent = 'Insert a valid address';
                return;
            }
        }

        try {
            const value = await ipcRenderer.invoke('read-register', address);
            if (value !== null) {
                readResultDisplay.textContent = `Value read: ${value}`;
            } else {
                readResultDisplay.textContent = 'Reading error';
            }
        } catch (error) {
            console.error("Errore durante la lettura:", error);
            readResultDisplay.textContent = `Errore durante la lettura: ${error.message}`;
        }
    });

    writeButtonElement.addEventListener('click', async () => {
        const addressStr = writeAddressInput.value;
        let address;

        if (hexAddressFormatCheckboxRW.checked) {
            address = parseInt(addressStr, 16);
            if (isNaN(address)) {
                writeStatusDisplay.textContent = 'Insert a valid address';
                return;
            }
        } else {
            address = parseInt(addressStr, 10);
            if (isNaN(address)) {
                writeStatusDisplay.textContent = 'Insert a valid address';
                return;
            }
        }

        const value = parseInt(writeValueInput.value);
        if (isNaN(value)) {
            writeStatusDisplay.textContent = 'Insert a valid value';
            return;
        }

        try {
            const success = await ipcRenderer.invoke('write-register', address, value);
            if (success) {
                writeStatusDisplay.textContent = `Value : ${value} Writed at address: ${address}.`;
            } else {
                writeStatusDisplay.textContent = 'Writing error.';
            }
        } catch (error) {
            console.error("Errore durante la scrittura:", error);
            writeStatusDisplay.textContent = `Errore durante la scrittura: ${error.message}`;
        }
    });

    // Funzione per leggere il valore di una singola riga della tabella
    const readSingleTableRow = async (row) => {
        if(!isConnected){
            alert('Modbus connection missing');
            return;
        }
        const decInput = row.querySelector('.dec-input');
        const valueDisplay = row.querySelector('.value-display');
        if (decInput) {
            const address = parseInt(decInput.value);
            if (!isNaN(address)) {
                try {
                    const value = await ipcRenderer.invoke('read-register', address);
                    if (value !== null) {
                        valueDisplay.value = value;
                    } else {
                        valueDisplay.value = 'Errore';
                    }
                } catch (error) {
                    console.error("Errore durante la lettura singola (tabella):", error);
                    valueDisplay.value = 'Errore';
                }
            } else {
                alert('Inserisci un indirizzo decimale valido per la lettura.');
            }
        }
    };

    // Funzione per scrivere il valore di una singola riga della tabella
    const writeSingleTableRow = async (row) => {
        if(!isConnected){
            alert('Modbus connection missing');
            return;
        }
        const decInput = row.querySelector('.dec-input');
        const newValueInput = row.querySelector('.new-value-input');
        if (decInput && newValueInput) {
            const address = parseInt(decInput.value);
            const valueToWrite = parseInt(newValueInput.value);
            if (!isNaN(address) && !isNaN(valueToWrite)) {
                try {
                    const success = await ipcRenderer.invoke('write-register', address, valueToWrite);
                    if (success) {
                        console.log(`Scritto ${valueToWrite} all'indirizzo ${address}`);
                        // Feedback visivo opzionale
                    } else {
                        console.error(`Errore durante la scrittura all'indirizzo ${address}`);
                        // Feedback visivo opzionale
                        await readSingleTableRow(row);
                    }
                } catch (error) {
                    console.error("Errore durante la scrittura singola (tabella):", error);
                    // Feedback visivo opzionale
                }
            } else {
                alert('Inserisci un indirizzo decimale e un nuovo valore validi per la scrittura.');
            }
        }
    };

    // Gestori eventi delegati per i pulsanti "Read Single" e "Write Single" della tabella
    parameterTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (row) {
            if (target.classList.contains('read-single-btn') || target.closest('.read-single-btn')) {
                await readSingleTableRow(row);
            } else if (target.classList.contains('write-single-btn') || target.closest('.write-single-btn')) {
                await writeSingleTableRow(row);
                await readSingleTableRow(row);
            }
        }
    });

    readAllButton.addEventListener('click', async () => {
        if(!isConnected){
            alert('Modbus connection missing');
            return;
        }
        const rows = Array.from(parameterTableBody.rows);
        for (const row of rows) {
            await readSingleTableRow(row);
        }
    });

    writeAllButton.addEventListener('click', async () => {
        if(!isConnected){
            alert('Modbus connection missing');
            return;
        }
        const rows = Array.from(parameterTableBody.rows);
        for (const row of rows) {
            const newValueInput = row.querySelector('.new-value-input');
            if (newValueInput && newValueInput.value !== '') {
                await writeSingleTableRow(row);
                await readSingleTableRow(row);
            }
        }
    });

    saveConfigButton.addEventListener('click', async () => {
        try {
            const filePath = await ipcRenderer.invoke('show-save-dialog');
            if (filePath) {
                const config = [];
                const rows = Array.from(parameterTableBody.rows);
                rows.forEach(row => {
                    const labelInput = row.querySelector('input[type="text"]');
                    const decInput = row.querySelector('.dec-input');
                    const hexInput = row.querySelector('.hex-input');
                    const valueDisplay = row.querySelector('.value-display'); // Ottieni l'elemento Value
                    config.push({
                        label: labelInput ? labelInput.value : '',
                        dec: decInput ? parseInt(decInput.value) : null,
                        hex: hexInput ? hexInput.value : '',
                        value: valueDisplay ? valueDisplay.value : '', // Salva il valore attuale
                    });
                });
                const success = await ipcRenderer.invoke('save-config', config, filePath);
                if (success) {
                    alert(`Configurazione salvata con successo in: ${filePath}`);
                } else {
                    alert('Errore durante il salvataggio della configurazione.');
                }
            }
        } catch (error) {
            console.error("Errore durante il salvataggio della configurazione:", error);
            alert(`Errore durante il salvataggio della configurazione: ${error.message}`);
        }
    });

    loadConfigButton.addEventListener('click', async () => {
        try {
            const filePath = await ipcRenderer.invoke('show-open-dialog');
            if (filePath) {
                const config = await ipcRenderer.invoke('load-config', filePath);
                if (config && Array.isArray(config)) {
                    const loadValues = confirm("Load saved parameter value?"); // Chiedi all'utente
                    parameterTableBody.innerHTML = '';
                    config.forEach(item => {
                        const newRow = parameterTableBody.insertRow();
    
                        const labelCell = newRow.insertCell();
                        labelCell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${item.label || ''}">`;
    
                        const decCell = newRow.insertCell();
                        decCell.innerHTML = `<input type="number" class="form-control form-control-sm dec-input" value="${item.dec !== null ? item.dec : ''}">`;
    
                        const hexCell = newRow.insertCell();
                        hexCell.innerHTML = `<input type="text" class="form-control form-control-sm hex-input" value="${item.hex || ''}">`;
    
                        const valueCell = newRow.insertCell();
                        valueCell.innerHTML = `<input type="text" class="form-control form-control-sm value-display" value="" readonly>`; // Carica il valore salvato
    
                        const newValueCell = newRow.insertCell();
                        newValueCell.innerHTML = `<input type="number" class="form-control form-control-sm new-value-input" value="${loadValues ? item.value || '' : ''}">`; // Carica in New Value se l'utente accetta
    
                        const actionsCell = newRow.insertCell();
                        actionsCell.innerHTML = '<div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary read-single-btn me-1"><i class="fas fa-glasses"></i></button><button class="btn btn-sm btn-outline-warning write-single-btn"><i class="fas fa-pen"></i></button></div>';
                    });
                } else {
                    alert('Nessuna configurazione caricata o formato non valido.');
                }
            }
        } catch (error) {
            console.error("Errore durante il caricamento della configurazione:", error);
            alert(`Errore durante il caricamento della configurazione: ${error.message}`);
        }
    });

    // Funzione per aggiungere una nuova riga alla tabella (eseguita lato client)
    const addTableRow = () => {
        const newRow = parameterTableBody.insertRow();

        const labelCell = newRow.insertCell();
        labelCell.innerHTML = '<input type="text" class="form-control form-control-sm">';

        const decCell = newRow.insertCell();
        decCell.innerHTML = '<input type="number" class="form-control form-control-sm dec-input">';

        const hexCell = newRow.insertCell();
        hexCell.innerHTML = '<input type="text" class="form-control form-control-sm hex-input">';
        
        const valueCell = newRow.insertCell();
        valueCell.innerHTML = '<input type="text" class="form-control form-control-sm value-display" readonly>';

        const newValueCell = newRow.insertCell();
        newValueCell.innerHTML = '<input type="number" class="form-control form-control-sm new-value-input">';

        const actionsCell = newRow.insertCell();
        actionsCell.innerHTML = '<div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary read-single-btn"><i class="fas fa-glasses"></i></button><button class="btn btn-sm btn-outline-warning write-single-btn"><i class="fas fa-pen"></i></button></div>';
    };

    addRowButton.addEventListener('click', addTableRow);
    
    parameterTableBody.addEventListener('input', (event) => {
        if (event.target.classList.contains('dec-input')) {
            const decValue = parseInt(event.target.value);
            const hexInput = event.target.closest('tr').querySelector('.hex-input');
            if (!isNaN(decValue)) {
                hexInput.value = decValue.toString(16).toUpperCase();
            } else {
                hexInput.value = '';
            }
        } else if (event.target.classList.contains('hex-input')) {
            const hexValue = event.target.value.toUpperCase();
            const decInput = event.target.closest('tr').querySelector('.dec-input');
            const parsedHex = parseInt(hexValue, 16);
            if (!isNaN(parsedHex)) {
                decInput.value = parsedHex;
            } else {
                decInput.value = '';
            }
        }
    });
    // Aggiungi una riga iniziale alla tabella al caricamento
    addTableRow();
    populateSerialPorts();
});