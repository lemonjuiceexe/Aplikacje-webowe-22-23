import { Board } from "./board";

export class Note{
    public readonly board: Board;
    public readonly noteId: number;
    public title: string;
    public content: string = "";
    public position: {x: number, y: number};
    public size: {width: number, height: number};
    public zindex: number;

    public noteElement: HTMLDivElement;
    private dragzone: HTMLElement;
    private closeButton: HTMLElement;

    constructor(board: Board, noteElement: HTMLDivElement, id: number, title: string, position: {x: number, y: number}, size: {width: number, height:number}, zindex = -1, content: string = ""){
        this.board = board;
        this.noteElement = noteElement;
        
        this.noteId = id;
        this.title = title;
        this.content = content;
        this.position = position;
        this.size = size;
        this.zindex = zindex;
        if(zindex == -1){
            this.setZIndex(this.board.maxZIndex + 1);
        }
        else{
            this.setZIndex(zindex);
        }

        this.dragzone = noteElement.querySelector(".note-drag-zone") as HTMLElement;
        this.closeButton = noteElement.querySelector(".note-close") as HTMLElement;
        this.dragzone.addEventListener("mousedown", this.dragStart.bind(this));
        this.closeButton.addEventListener("mousedown", () => board.removeNote(this));
    }

    public setZIndex(zindex: number){
        this.zindex = zindex;
        this.noteElement.style.zIndex = zindex.toString();
        if(zindex > this.board.maxZIndex){
            this.board.maxZIndex = zindex;
        }
    }

    private dragStart(e: MouseEvent){
        e.preventDefault();
        this.setZIndex(this.board.maxZIndex + 1);
        this.noteElement.classList.add("note-moving");
        let previousDragX = e.clientX;
        let previousDragY = e.clientY;

        const drag = (e: MouseEvent) => {
            let dragX = e.clientX;
            let dragY = e.clientY;

            let offsetX = previousDragX - dragX;
            let offsetY = previousDragY - dragY;

            previousDragX = e.clientX;
            previousDragY = e.clientY;
            
            this.noteElement.style.left = (this.noteElement.offsetLeft - offsetX) + "px";
            this.noteElement.style.top = (this.noteElement.offsetTop - offsetY) + "px";
            
            this.position.x = (this.noteElement.offsetLeft - offsetX);
            this.position.y = (this.noteElement.offsetTop - offsetY);
        }

        const dragEnd = (e: MouseEvent) => {
            this.noteElement.classList.remove("note-moving");
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", dragEnd);
        }

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);
    }
}
