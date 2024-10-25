// Inizializza le note e le categorie dal localStorage e visualizzale subito
let notes = []; // Inizializza le note come un array vuoto
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let editIndex = null;
let deleteIndex = null;

// Visualizza subito le note già esistenti all'avvio dell'app
displayNotes();

// Funzione per mostrare un alert di Bootstrap
function showAlert(message, type = 'success') {
    const alertMessage = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');

    alertText.textContent = message;
    alertMessage.className = `alert alert-${type} alert-dismissible fade show`;

    // Nasconde l'alert dopo 3 secondi
    setTimeout(() => {
        alertMessage.classList.remove('show');
    }, 3000);
}

// Funzione per salvare le note nel localStorage
function saveNotesToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Funzione per salvare le categorie nel localStorage
function saveCategoriesToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Funzione per visualizzare le note
function displayNotes(filteredNotes = notes) {
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = ''; // Svuota la lista delle note

    const groupedNotes = groupNotesByMonth(filteredNotes);

    for (const monthYear in groupedNotes) {
        const monthHeader = document.createElement('h5');
        monthHeader.textContent = monthYear;
        noteList.appendChild(monthHeader);

        groupedNotes[monthYear].forEach((note) => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('list-group-item', 'note-item', 'p-3', 'mb-2', 'border');
            noteElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="note-title m-0">${note.title}</h5>
                    <span class="badge" style="background-color: ${note.color}; color: white;">
                        ${note.category || 'Nessuna categoria'}
                    </span>
                </div>
                <div class="note-body">
                    <p class="note-content mb-1">${note.content}</p>
                    <small class="text-muted">Creato il: ${note.createdAt}</small>
                </div>
                <div class="mt-2">
                    <button class="btn btn-secondary btn-sm me-2" onclick="editNote(${notes.indexOf(note)})"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm me-2" data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="confirmDelete(${notes.indexOf(note)})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            noteList.appendChild(noteElement);
        });
    }
}

// Funzione per raggruppare le note per mese
function groupNotesByMonth(notes) {
    return notes.reduce((acc, note) => {
        const monthYear = new Date(note.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(note);
        return acc;
    }, {});
}

// Funzione per aggiungere o modificare una nota
document.getElementById('addNoteButton').addEventListener('click', () => {
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
        showAlert('Il titolo e il contenuto sono obbligatori.', 'danger');
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
    const editAlert = document.getElementById('editAlert');

    if (isEditing) {
        addButton.textContent = 'Salva';
        editAlert.classList.add('show'); // Mostra il messaggio di modalità modifica
    } else {
        addButton.textContent = 'Aggiungi';
        editAlert.classList.remove('show'); // Nasconde il messaggio di modalità modifica
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

    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    deleteModal.hide();
});

// Funzione per filtrare le note
function filterNotes() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchValue) || 
        note.content.toLowerCase().includes(searchValue) || 
        note.category.toLowerCase().includes(searchValue) // Cerca anche nella categoria
    );

    displayNotes(filteredNotes);
}

// Aggiungi l'event listener per il campo di ricerca
document.getElementById('searchInput').addEventListener('input', filterNotes);
