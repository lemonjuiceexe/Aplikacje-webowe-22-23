import { Board } from "./board";
import tinymce from "tinymce";

export class Note{
    public readonly board: Board;
    public readonly noteId: number;
    public title: string;
    public content: string = "";
    public position: {x: number, y: number};
    public size: {width: number, height: number};
    private zindex: number;

    public noteElement: HTMLDivElement;
    private dragzone: HTMLElement;
    private closeButton: HTMLElement;

    constructor(board: Board, noteElement: HTMLDivElement, id: number, title: string, position: {x: number, y: number}, size: {width: number, height:number}, content: string = ""){
        this.board = board;
        this.noteElement = noteElement;
        
        this.noteId = id;
        this.title = title;
        this.content = content;
        this.position = position;
        this.size = size;
        this.zindex = 0; // initialised so compiler knows it's initialised in constructor, actually set the line below
        this.setZIndex(this.board.maxZIndex + 1);

        this.dragzone = noteElement.querySelector(".note-drag-zone") as HTMLElement;
        this.closeButton = noteElement.querySelector(".note-close") as HTMLElement;
        this.dragzone.addEventListener("mousedown", this.dragStart.bind(this));
        this.closeButton.addEventListener("mousedown", () => board.removeNote(this));

        // TinyMCE editor configuration
        this.noteElement.querySelector(".note-content")!.addEventListener("mousedown", (e) => {
            e.preventDefault();
            // tinymce will be initialised on this textarea element
            let textArea = document.createElement("textarea");
            this.board.wrapper.appendChild(textArea);

            tinymce.init({
                selector: "textarea",
                width: "80vw",
                height: "60vh",
                min_height: 150
            }).then(() => {
                // apply z-index to tinymce editor to make it appear on top of other elements
                let tinymceEditor: HTMLElement = document.querySelector(".tox.tox-tinymce")!;
                tinymceEditor.style.zIndex = (this.board.maxZIndex + 1).toString();
                // don't allow clicking outside the editor when it's open
                this.board.wrapper.querySelectorAll("*:not(.tox, .tox *)").forEach(el => {
                    let element = el as HTMLElement;
                    element.style.pointerEvents = "none";
                });
                // Replace tinymce's bottom bar with a custom one
                let tinymceBottomRightBar = document.querySelector(".tox-statusbar__branding") as HTMLSpanElement;
                tinymceBottomRightBar.innerHTML = "";
                tinymceBottomRightBar.appendChild(this.createCustomTinymceBar());
                
                // Function for closing the editor, used by both save and close buttons
                let closeEditor = () => {
                    this.board.wrapper.querySelectorAll("*:not(.tox, .tox *)").forEach(el => {
                        let element = el as HTMLElement;
                        element.style.pointerEvents = "all";
                    });
                    tinymce.remove();
                    textArea.remove();
                }

                // Listeners for custom bar buttons
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
    }

    public setZIndex(value: number){
        this.zindex = value;
        this.noteElement.style.zIndex = this.zindex.toString();
    }

    private dragStart(e: MouseEvent){
        this.noteElement.classList.add("note-moving");
        this.board.maxZIndex++;
        this.noteElement.style.zIndex = this.board.maxZIndex.toString();
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
