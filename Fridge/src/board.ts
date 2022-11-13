import "./css/board.css";
import { Note } from "./note";

/*TODO: reorganise the files, so board.ts is a file for board class and some other files is to be included in board.html (probably change htmls name as well) */

export class Board{
    /* References to HTML elements in a board */
    private wrapper: HTMLDivElement;
    private counterAll: HTMLSpanElement;
    private counterActive: HTMLSpanElement;

    /* Readonly consts */
    private readonly defaultNotePosition: {x: number, y: number} = {x: 200, y: 200};
    private readonly defaultNoteSize: {width: number, height: number} = {width: 200, height: 200};

    /* Private vars */
    private notes: Note[] = [];
    private allCount: number = 0;
    private activeCount: number = 0;

    constructor(wrapper: HTMLDivElement, counterAll: HTMLSpanElement, counterActive: HTMLSpanElement){
        this.wrapper = wrapper;
        this.counterAll = counterAll;
        this.counterActive = counterActive;
    }
    
    /*Public methods */
    public addNote(title: string, content: string, position: {x: number, y: number} = this.defaultNotePosition, size: {width: number, height: number} = this.defaultNoteSize){
        const noteElement = this.createNoteElement(title, content);
        noteElement.style.left = position.x + "px";
        noteElement.style.top = position.y + "px";
        this.wrapper.appendChild(noteElement);
        
        // Logic
        let note = new Note(noteElement, this.allCount, title, position, size, content);
        this.notes.push(note);
        this.updateCounters(Boolean(1));
    }
    public removeNote(note: Note){
        this.notes = this.notes.filter(el => el != note);
        this.updateCounters(Boolean(-1));

        /*TODO: remove DOM element from wrapper */
    }

    /* Private methods */
    /* 1 - increase number of notes; 0 - decrease */
    private updateCounters(increase: boolean){
        this.activeCount = this.notes.length;
        this.allCount += increase ? 1 : -1;
        this.counterAll.innerText = this.allCount.toString();
        this.counterActive.innerText = this.activeCount.toString();
    }
    private createNoteElement(title: string, content: string){
        // Create note HTML element structure
        const noteElement = document.createElement("div");
        noteElement.classList.add("note");
        
        let dragzone = document.createElement("div");
        dragzone.classList.add("note-drag-zone");
        noteElement.appendChild(dragzone);
        
        let noteTitleElement = document.createElement("h3");
        noteTitleElement.innerText = title;
        dragzone.appendChild(noteTitleElement);
        
        let noteCloseElement = document.createElement("div");
        noteCloseElement.classList.add("note-close");
        noteCloseElement.innerText = "X";
        dragzone.appendChild(noteCloseElement);
        
        let noteContentElement = document.createElement("p");
        noteContentElement.classList.add("note-content");
        noteContentElement.innerText = content;
        dragzone.appendChild(noteContentElement);
    
    
        return noteElement;
    }
}