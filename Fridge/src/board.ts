import { IBoard, INote } from "./objectTemplates";
// Templates for how the data should look like
import { Note } from "./note"; 
import "./css/board.css";

export class Board { /* References to HTML elements in a board */
    public wrapper: HTMLDivElement; 
    private counterAll: HTMLSpanElement; 
    private counterActive: HTMLSpanElement; 
    /* Readonly consts */ 
    public readonly boardId: string;
    private readonly defaultNotePosition: { x: number, y: number } = { x: 200, y: 200 }; 
    private readonly defaultNoteSize: { width: number, height: number } = { width: 200, height: 200 }; 
    
    /* Private vars */ 
    private notes: Note[] = [];
    private allCount: number = 0; 
    private activeCount: number = 0; 
    public maxZIndex: number = 0; 
    
    constructor(boardId: string, wrapper: HTMLDivElement, counterAll: HTMLSpanElement, counterActive: HTMLSpanElement) { 
        this.boardId = boardId; 
        this.wrapper = wrapper; 
        this.counterAll = counterAll; 
        this.counterActive = counterActive; 
        
        this.importBoardData(); 
    }
     
    /*Public methods */ 
    public addNote(title: string, content: string,
        id: number, 
        position: {x: number, y: number}, 
        size: {width: number, height: number}, 
        zindex: number){ 
            /* Setup the note HTML element */ 
            const noteElement = this.createNoteElement(this.allCount, title, content); 
            noteElement.style.left = position.x + "px"; 
            noteElement.style.top = position.y + "px";
            noteElement.style.width = size.width + "px";
            noteElement.style.height = size.height + "px";
            // noteElement.style.zIndex = zindex.toString(); 
            this.wrapper.appendChild(noteElement); 
            
            // Logic 
            let note = new Note(this, noteElement, this.allCount, title, position, size, zindex, content); 
            note.setZIndex(zindex); 
            this.notes.push(note); 
            this.updateCounters(0); 

            const resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    note.size.height = Math.round(entry.contentRect.height);
                    note.size.width = Math.round(entry.contentRect.width); 
                }
                this.sendBoardData();
            });
            resizeObserver.observe(noteElement);

            this.sendBoardData();  
    } 
    public addDefaultNote(){ 
        let id = this.allCount; 
        let title = "Note " + id; 
        let content = encodeURIComponent("Content " + id); 
        let position = {...this.defaultNotePosition}; 
        let size = {...this.defaultNoteSize}; 
        let zindex = this.maxZIndex + 1; 
        
        /* Setup the note HTML element */ 
        const noteElement = this.createNoteElement(this.allCount, title, content); 
        noteElement.style.left = this.defaultNotePosition.x + "px"; 
        noteElement.style.top = this.defaultNotePosition.y + "px"; 
        this.wrapper.appendChild(noteElement); 
        
        // Logic 
        let note = new Note(this, noteElement, this.allCount, title, position, size, zindex, content); 
        note.setZIndex(this.maxZIndex++); 
        this.notes.push(note); 
        this.updateCounters(1); 

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                note.size.height = Math.round(entry.contentRect.height);
                note.size.width = Math.round(entry.contentRect.width); 
            }
            this.sendBoardData();
        });
        resizeObserver.observe(noteElement);

        this.sendBoardData(); 
    } 
    public removeNote(note: Note){ 
        this.notes = this.notes.filter(el => el.noteId != note.noteId); 
        this.updateCounters(-1); 
        const noteToRemove = this.wrapper.querySelector("#note-" + note.noteId); 
        if(noteToRemove) { 
            this.wrapper.removeChild(noteToRemove); 
        } 
        else { 
            console.error("Note with id " + note.noteId + " not found"); 
            return; 
        } 
    } 

    /* Fetching */ 
    public getBoardData(){ 
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
        console.log(data); 
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
        fetch(`./get.php?boardId=${this.boardId}`, 
        { 
            method: "GET" 
        }).then(res => res.text()).then(res => { 
            if(res == "404") { console.log("No board data found. Creating a new board."); return; } 
            let data: IBoard = JSON.parse(res); 
            console.log(data); 

            this.defaultNotePosition.x = data.defaultNotePosition.x ? data.defaultNotePosition.x : 200; 
            this.defaultNotePosition.y = data.defaultNotePosition.y ? data.defaultNotePosition.y : 200; 
            this.defaultNoteSize.width = data.defaultNoteSize.width ? data.defaultNoteSize.width : 200; 
            this.defaultNoteSize.height = data.defaultNoteSize.height ? data.defaultNoteSize.height : 200; 
            this.maxZIndex = data.notes ? data.notes.length : 0; 
			this.allCount = data.allCount!;
            if(data.notes){ 
                let temp = JSON.parse((data.notes as unknown as string)); 
                temp.forEach((note: INote) => { 
                    if(note.zindex && note.zindex > this.maxZIndex){ 
                        this.maxZIndex = note.zindex 
                    }; 
                    
                    this.addNote(note.title ? note.title : "no title found", 
                                 note.content ? note.content : "no content found", 
                                 note.noteId, 
                                 note.position ? note.position : this.defaultNotePosition, 
                                 note.size ? note.size : this.defaultNoteSize, 
                                 note.zindex ? note.zindex : 0); 
                }); 
            }
            else{
				this.notes = [];
            }
            this.updateCounters(2); 
        }); 
    } 
    
    /* Private methods */ 
    /* 1 - adding a new default note - increase counters; 0 - loading a note from database - increase active; -1 - deleting a note - decrease active */ 
    private updateCounters(mode: number){
    	switch(mode){
    		case 1:
    			this.activeCount++;
    			this.allCount++;
    			break;
    		case 0:
    			this.activeCount++;
				break;
    		case -1: 
    			this.activeCount--;
    			break;
    		default:
    			break;
    	}
		//this.activeCount = this.notes.length; 
        //this.allCount += increase ? 1 : 0; 
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
        noteTitleElement.classList.add("note-title"); 
        noteTitleElement.classList.add("note-drag-zone"); 
        noteTitleElement.innerText = title; 
        noteInnerWrapper.appendChild(noteTitleElement); 
        
        let noteCloseElement = document.createElement("div"); 
        noteCloseElement.classList.add("note-close"); 
        noteCloseElement.innerHTML = "✖"; 
        noteInnerWrapper.appendChild(noteCloseElement); 
        
        let noteContentElement = document.createElement("p"); 
        noteContentElement.classList.add("note-content"); 
        noteContentElement.innerHTML = decodeURIComponent(content); 
        noteInnerWrapper.appendChild(noteContentElement); 
        
        
        return noteElement; 
    } 
}
