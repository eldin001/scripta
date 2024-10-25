// Inizializza le note e le categorie dal localStorage e visualizzale subito
let notes = JSON.parse(localStorage.getItem('notes')) || []; // Recupera le note dal localStorage
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let editIndex = null;
let deleteIndex = null;

// Visualizza subito le note già esistenti all'avvio dell'app
displayNotes();

// Funzione per mostrare un alert centrato in alto
function showAlert(message, type = 'success') {
    const alertMessage = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');

    alertText.textContent = message;
    alertMessage.className = `fixed top-4 left-1/2 transform -translate-x-1/2 p-4 max-w-xs w-full rounded shadow-lg ${
        type === 'success' ? 'bg-green-500' : type === 'info' ? 'bg-blue-500' : 'bg-red-500'
    } text-white text-center whitespace-normal`;

    // Mostra l'alert
    alertMessage.classList.remove('hidden');
    alertMessage.classList.add('show'); // Aggiungi classe per mostrare l'alert

    // Nasconde l'alert dopo 3 secondi
    setTimeout(() => {
        alertMessage.classList.remove('show'); // Rimuovi classe per nascondere l'alert
        alertMessage.classList.add('hidden');
    }, 3000);
}

// Funzione per salvare le note nel localStorage
function saveNotesToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Funzione per raggruppare le note per mese
function groupNotesByMonth(notes) {
    return notes.reduce((acc, note) => {
        const monthYear = new Date(note.createdAt).toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(note);
        return acc;
    }, {});
}

// Funzione per visualizzare le note
function displayNotes(filteredNotes = notes) {
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = ''; // Svuota la lista delle note

    const groupedNotes = groupNotesByMonth(filteredNotes);

    if (Object.keys(groupedNotes).length === 0) {
        // Se non ci sono note, mostra un messaggio
        if (notes.length === 0) {
            noteList.innerHTML = '<div class="text-gray-400 text-center">Aggiungi una nota!</div>';
        } else {
            noteList.innerHTML = '<div class="text-gray-400 text-center">Nessuna nota trovata.</div>';
        }
        return; // Esci dalla funzione
    }

    for (const monthYear in groupedNotes) {
        const monthHeader = document.createElement('h5');
        monthHeader.textContent = monthYear;
        monthHeader.classList.add('text-lg', 'font-semibold', 'text-gray-300', 'my-2');
        noteList.appendChild(monthHeader);

        groupedNotes[monthYear].forEach((note) => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('bg-gray-700', 'text-white', 'p-3', 'mb-4', 'rounded', 'shadow-lg');

            noteElement.innerHTML = `
<div class="flex justify-between items-center mb-2 border-b border-gray-500 pb-2">
    <h5 class="font-semibold">${truncateText(note.title, 10)}</h5>
    <span class="px-2 py-1 rounded text-sm" style="background-color: ${note.color}; color: white;">
        ${truncateText(note.category || 'Nessuna categoria', 10)}
    </span>
</div>
<div class="mb-3">
    <p>${truncateText(note.content, 200)}</p>
</div>
<div class="text-gray-400 text-sm flex justify-between items-center border-t border-gray-500 pt-2">
    <small>Creato il: ${new Date(note.createdAt).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}</small>
    <div>
        <button class="bg-gray-500 text-white px-2 py-1 rounded mr-2" onclick="editNote(${notes.indexOf(note)})">
            <i class="fa-solid fa-edit"></i>
        </button>
        <button class="bg-red-600 text-white px-2 py-1 rounded" onclick="confirmDelete(${notes.indexOf(note)})">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
</div>
`;
            noteList.appendChild(noteElement);
        });
    }
}

// Funzione per troncare il testo e aggiungere i puntini di sospensione
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Funzione per aggiungere o modificare una nota
document.getElementById('addNoteButton').addEventListener('click', () => {
    if (document.getElementById('deleteModal').classList.contains('hidden')) { // Verifica se la modale è chiusa
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const category = document.getElementById('noteCategory').value.trim();
        const color = document.getElementById('categoryColor').value;

        if (title && content) {
            const note = { title, content, category, color, createdAt: new Date().toLocaleString() };

            if (editIndex === null) {
                notes.unshift(note); // Aggiunge la nota all'inizio
                showAlert('Nota aggiunta con successo!');
            } else {
                notes[editIndex] = note;
                editIndex = null;
                showAlert('Nota modificata con successo!');
            }

            saveNotesToLocalStorage(); // Salva le note
            displayNotes(); // Mostra tutte le note
            resetFormFields(); // Resetta i campi del modulo
            toggleEditMode(false); // Disattiva modalità di modifica
        } else {
            showAlert('Titolo e contenuto sono obbligatori.', 'danger');
        }
    }
});

// Funzione per resettare i campi del modulo
function resetFormFields() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteCategory').value = '';
    document.getElementById('categoryColor').value = '#0d6efd';
}

// Funzione per attivare/disattivare la modalità di modifica
function toggleEditMode(isEditing) {
    const addButton = document.getElementById('addNoteButton');
    if (isEditing) {
        addButton.textContent = 'Salva';
        showAlert('Modalità modifica attivata', 'info');
    } else {
        addButton.textContent = 'Aggiungi';
    }
}

// Funzione per modificare una nota
function editNote(index) {
    const note = notes[index];
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteCategory').value = note.category;
    document.getElementById('categoryColor').value = note.color;
    editIndex = index;
    toggleEditMode(true); // Attiva modalità di modifica
}

// Funzione per confermare la cancellazione
function confirmDelete(index) {
    deleteIndex = index;
    toggleModal(true); // Mostra la modale di cancellazione
}

// Funzione per attivare/disattivare il modale di cancellazione
function toggleModal(show = false) {
    const modal = document.getElementById('deleteModal');
    const inputs = document.querySelectorAll('#noteTitle, #noteContent, #noteCategory, #categoryColor, #addNoteButton');
    
    if (show) {
        modal.classList.remove('hidden'); // Mostra il modal
        inputs.forEach(input => input.disabled = true); // Disabilita i campi di input e il pulsante
    } else {
        modal.classList.add('hidden'); // Nasconde il modal
        inputs.forEach(input => input.disabled = false); // Riabilita i campi di input e il pulsante
    }
}

// Event listener per la conferma della cancellazione
document.getElementById('confirmDeleteButton').addEventListener('click', () => {
    if (deleteIndex !== null) {
        notes.splice(deleteIndex, 1);
        saveNotesToLocalStorage(); // Salva le note
        displayNotes(); // Aggiorna la visualizzazione
        showAlert('Nota cancellata con successo!', 'danger');
        deleteIndex = null;
    }
    toggleModal(false); // Nascondi la modale
});

// Funzione per filtrare le note
function filterNotes() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchValue) || 
        note.content.toLowerCase().includes(searchValue)
    );
    displayNotes(filteredNotes); // Mostra le note filtrate

    // Mostra il messaggio "Nessuna nota trovata" se non ci sono risultati
    if (filteredNotes.length === 0) {
        const noteList = document.getElementById('noteList');
        noteList.innerHTML = '<div class="text-gray-400 text-center">Nessuna nota trovata.</div>';
    }
}

// Event listener per il campo di ricerca
document.getElementById('searchInput').addEventListener('input', filterNotes);
