import { Component } from '@angular/core';

interface Note {
  date: Date;
  user: string;
  text: string;
}

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html'
})
export class NotesComponent {
  notes: Note[] = [];
  showModal = false;
  newNoteText: string = '';
  searchText: string = '';

  // Modal open/close
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newNoteText = '';
  }

  // Save note
  saveNote() {
    if (this.newNoteText.trim() !== '') {
      this.notes.push({
        date: new Date(),
        user: 'Admin',
        text: this.newNoteText
      });
      this.closeModal();
    }
  }

  // Search filter
  get filteredNotes(): Note[] {
    return this.notes.filter(note =>
      note.text.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
