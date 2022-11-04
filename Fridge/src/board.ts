import "./css/board.css";
import { Note } from "./note";

const wrapper = document.querySelector(".wrapper") as HTMLDivElement;
const addNoteButton = document.querySelector(".add-note") as HTMLDivElement;
const counterAll = document.querySelector(".counter-all") as HTMLSpanElement;
const counterActive = document.querySelector(".counter-active") as HTMLSpanElement;

/*TODO: reorganise the files, so board.ts is a file for board class and some other files is to be included in board.html (probably change htmls name as well) */

class Board{
    /* Readonly consts */
    private readonly defaultPosition: {x: number, y: number} = {x: 200, y: 200};

    /* Private vars */
    private notes: Note[] = [];
    private allCount: number = 0;
    private activeCount: number = 0;
    
    /*Public methods */
    public addNote(title: string, content: string){
        let note = new Note(this.allCount, title, this.defaultPosition, content);
        this.notes.push(note);
        this.updateCounters(Boolean(1));

        /*TODO: add DOM element to wrapper */
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
    }
}