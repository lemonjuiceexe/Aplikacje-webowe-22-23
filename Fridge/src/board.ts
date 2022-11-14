import tinymce from "tinymce";
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
    public addNote(title: string, content: string){
        /* Setup the note HTML element */
        const noteElement = this.createNoteElement(this.allCount, title, content);
        noteElement.style.left = this.defaultNotePosition.x + "px";
        noteElement.style.top = this.defaultNotePosition.y + "px";
        
        noteElement.querySelector(".note-content")!.addEventListener("mousedown", (e) => {
            let textArea = document.createElement("textarea");
            // textArea.style.display = "none";
            this.wrapper.appendChild(textArea);
            tinymce.init({
                selector: "textarea"
            }).then(() => {
                // Replace tinymce's bottom bar with a custom one
                let tinymceBottomRightBar = document.querySelector(".tox-statusbar__branding") as HTMLSpanElement;
                tinymceBottomRightBar.innerHTML = "";
                tinymceBottomRightBar.appendChild(this.createCustomTinymceBar());
                
                let closeEditor = () => {
                    tinymce.remove();
                    textArea.remove();
                }

                tinymceBottomRightBar.querySelector(".tinymce-button-exit")!.addEventListener("click", closeEditor);
                tinymceBottomRightBar.querySelector(".tinymce-button-save")!.addEventListener("click", () => {
                    content = tinymce.activeEditor!.getContent();
                    noteElement.querySelector(".note-content")!.innerHTML = content;
                    closeEditor();
                });

                tinymce.activeEditor!.setContent(content);
                tinymce.activeEditor!.focus();
            });
            
        });

        this.wrapper.appendChild(noteElement);
        
        // Logic
        const position = {...this.defaultNotePosition};
        const size = {...this.defaultNoteSize};

        let note = new Note(this, noteElement, this.allCount, title, position, size, content);
        this.notes.push(note);
        this.updateCounters(Boolean(1));
    }
    public removeNote(note: Note){
        this.notes = this.notes.filter(el => el.id != note.id);
        this.updateCounters(Boolean(0));

        const noteToRemove = this.wrapper.querySelector("#note-" + note.id);
        if(noteToRemove) { this.wrapper.removeChild(noteToRemove); }
        else { console.error("Note with id " + note.id + " not found"); return; }
        console.log(this.notes);
    }

    /* Private methods */
    /* 1 - increase number of notes; 0 - decrease */
    private updateCounters(increase: boolean){
        this.activeCount = this.notes.length;
        this.allCount += increase ? 1 : 0;
        this.counterAll.innerText = this.allCount.toString();
        this.counterActive.innerText = this.activeCount.toString();
    }
    private createNoteElement(id: number, title: string, content: string){
        // Create note HTML element structure
        let noteElement = document.createElement("div");
        noteElement.classList.add("note");
        noteElement.id = "note-" + id;
        
        let dragzone = document.createElement("div");
        dragzone.classList.add("note-drag-zone");
        noteElement.appendChild(dragzone);
        
        let noteTitleElement = document.createElement("h3");
        noteTitleElement.innerText = title;
        dragzone.appendChild(noteTitleElement);
        
        let noteCloseElement = document.createElement("div");
        noteCloseElement.classList.add("note-close");
        noteCloseElement.innerHTML = "&#10006;";
        dragzone.appendChild(noteCloseElement);
        
        let noteContentElement = document.createElement("p");
        noteContentElement.classList.add("note-content");
        noteContentElement.innerText = content;
        dragzone.appendChild(noteContentElement);
    
    
        return noteElement;
    }
    private createCustomTinymceBar(){
        // Create custom bar html structure
        let customBar = document.createElement("span");

        let exitButton = document.createElement("button");
        exitButton.innerText = "Exit";
        exitButton.classList.add("tinymce-button-exit");
        
        let saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        saveButton.classList.add("tinymce-button-save");

        customBar.appendChild(exitButton);
        customBar.appendChild(saveButton);


        return customBar;
    }
}