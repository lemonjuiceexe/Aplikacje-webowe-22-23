export class Note{
    public readonly id: number;
    public title: string;
    public content: string = "";
    public position: {x: number, y: number};
    public size: {width: number, height: number};

    public noteElement: HTMLDivElement;
    private dragzone: HTMLElement;

    constructor(noteElement: HTMLDivElement, id: number, title: string, position: {x: number, y: number}, size: {width: number, height:number}, content: string = ""){
        this.noteElement = noteElement;
        
        this.id = id;
        this.title = title;
        this.content = content;
        this.position = position;
        this.size = size;

        this.dragzone = noteElement.querySelector(".note-drag-zone") as HTMLElement;
        this.dragzone.addEventListener("mousedown", this.dragStart.bind(this));
        // this.dragzone.onmousedown = this.dragStart.bind(this);
    }

    private dragStart(e: MouseEvent){
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
            console.log(this.position);
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", dragEnd);
        }

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);
    }
    // private drag(e: MouseEvent){
    //     let oX = this.position.x - e.clientX;
    //     let oY = this.position.y - e.clientY;
    //     this.position.x = e.clientX;
    //     this.position.y = e.clientY;
    //     this.noteElement.style.left = (this.position.x - oX) + "px";
    //     this.noteElement.style.top = (this.position.y - oY) + "px";
    // }
    // private dragEnd(e: MouseEvent){
    //     console.log("END :( ", this);
    //     document.onmouseup = null;
    //     document.onmousedown = null;
    // }
}