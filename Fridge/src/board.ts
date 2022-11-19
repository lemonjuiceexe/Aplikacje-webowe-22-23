import { IBoard, INote } from "./objectTemplates"; // Templates for how the data should look like
import { Note } from "./note";
import "./css/board.css";

//TODO: encodeURI for anything user can input

export class Board{
    /* References to HTML elements in a board */
    public wrapper: HTMLDivElement;
    private counterAll: HTMLSpanElement;
    private counterActive: HTMLSpanElement;

    /* Readonly consts */
    public readonly boardId: string; 
    private readonly defaultNotePosition: {x: number, y: number} = {x: 200, y: 200};
    private readonly defaultNoteSize: {width: number, height: number} = {width: 200, height: 200};

    /* Private vars */
    private notes: Note[] = [];
    private allCount: number = 0;
    private activeCount: number = 0;
    public maxZIndex: number = 0;

    constructor(boardId: string, wrapper: HTMLDivElement, counterAll: HTMLSpanElement, counterActive: HTMLSpanElement){
        this.boardId = boardId;
        this.wrapper = wrapper;
        this.counterAll = counterAll;
        this.counterActive = counterActive;
    }
    
    /*Public methods */
    public addNote(
                    title: string, content: string, 
                    // optional arguments
                    id: number = this.allCount, 
                    position: {x: number, y: number} = {...this.defaultNotePosition},
                    size: {width: number, height: number} = {...this.defaultNoteSize},
                    zindex: number = this.maxZIndex + 1){
        
        /* Setup the note HTML element */
        const noteElement = this.createNoteElement(this.allCount, title, content);
        noteElement.style.left = this.defaultNotePosition.x + "px";
        noteElement.style.top = this.defaultNotePosition.y + "px";
<<<<<<< HEAD
        
        // noteElement.style.zIndex = this.maxZIndex.toString();
=======
>>>>>>> 986b8eff027bbe79bf49883e9f8b03f8a5541ff3

        this.wrapper.appendChild(noteElement);

        // Logic
<<<<<<< HEAD
        const position = {...this.defaultNotePosition};
        const size = {...this.defaultNoteSize};

        let note = new Note(this, noteElement, this.allCount, title, position, size, content);
        // this.maxZIndex++;
=======
        let note = new Note(this, noteElement, this.allCount, title, position, size, zindex, content);
>>>>>>> 986b8eff027bbe79bf49883e9f8b03f8a5541ff3
        note.setZIndex(this.maxZIndex++);
        this.notes.push(note);
        this.updateCounters(Boolean(1));
    }
    public removeNote(note: Note){
        this.notes = this.notes.filter(el => el.noteId != note.noteId);
        this.updateCounters(Boolean(0));

        const noteToRemove = this.wrapper.querySelector("#note-" + note.noteId);
        if(noteToRemove) { this.wrapper.removeChild(noteToRemove); }
        else { console.error("Note with id " + note.noteId + " not found"); return; }
        console.log(this.notes);
    }

    /* Fetching */
    public getBoardData(){

        this.addNote("test", "test");
        this.addNote("hehe", "<b>dzien dobry</b>");

        let data: IBoard = {
            boardId: this.boardId,
            defaultNotePosition: this.defaultNotePosition,
            defaultNoteSize: this.defaultNoteSize,
            // notes: this.notes,
            notes: this.notes.map(note => {
                return {
                    noteId: note.noteId,
                    title: note.title,
                    content: note.content,
                    position: note.position,
                    size: note.size,
                    zindex: note.zindex
                }
            }),
            allCount: this.allCount
        }

        return JSON.stringify(data);
    }
    public sendBoardData(){
        fetch("./send.php",
        {
            method: "POST",
            body: this.getBoardData()
        }).then(res => res.text()).then(res => 
            console.log(res)
        );
    }
    public importBoardData(){
        fetch("./get.php", 
        {
            method: "GET"
        }).then(res => res.text()).then(res => {
            let data: IBoard = JSON.parse(res);
            this.defaultNotePosition.x = data.defaultNotePosition.x;
            this.defaultNotePosition.y = data.defaultNotePosition.y;
            this.defaultNoteSize.width = data.defaultNoteSize.width;
            this.defaultNoteSize.height = data.defaultNoteSize.height;

            this.maxZIndex = data.notes ? data.notes.length : 0;

            if(data.notes){
                data.notes.forEach((note: INote) => {
                    if(note.zindex && note.zindex > this.maxZIndex){ this.maxZIndex = note.zindex };

                    this.addNote(note.title ? note.title : "no title found",
                                 note.content ? note.content : "no content found"),
                                 note.noteId,
                                 note.position ? note.position : this.defaultNotePosition,
                                 note.size ? note.size : this.defaultNoteSize,
                                 note.zindex ? note.zindex : 0;
                });
            }
            if(data.allCount){
                this.allCount = data.allCount;
            }
            else{
                this.allCount = this.notes.length;
            }
        });
    }

    /* Private methods */
    /* 1 - increase number of notes; 0 - decrease */
    private updateCounters(increase: boolean){
        this.activeCount = this.notes.length;
        this.allCount += increase ? 1 : 0;
        this.counterAll.innerText = this.allCount.toString();
        this.counterActive.innerText = this.activeCount.toString();
    }
    /* Methods for generating html structures */
    private createNoteElement(id: number, title: string, content: string){
        // Create note HTML element structure
        let noteElement = document.createElement("div");
        noteElement.classList.add("note");
        noteElement.id = "note-" + id;
        
        let noteInnerWrapper = document.createElement("div");
        noteInnerWrapper.classList.add("note-inner-wrapper");
        noteElement.appendChild(noteInnerWrapper);
        
        let noteTitleElement = document.createElement("h3");
        noteTitleElement.classList.add("note-title"); noteTitleElement.classList.add("note-drag-zone");
        noteTitleElement.innerText = title;
        noteInnerWrapper.appendChild(noteTitleElement);
        
        let noteCloseElement = document.createElement("div");
        noteCloseElement.classList.add("note-close");
        noteCloseElement.innerHTML = "&#10006;";
        noteInnerWrapper.appendChild(noteCloseElement);
        
        let noteContentElement = document.createElement("p");
        noteContentElement.classList.add("note-content");
        noteContentElement.innerHTML = content;
        noteInnerWrapper.appendChild(noteContentElement);
    
    
        return noteElement;
    }
}
