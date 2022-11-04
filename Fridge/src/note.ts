export class Note{
    public readonly id: number;
    public title: string;
    public content: string = "";
    public position: {x: number, y: number};

    constructor(id: number, title: string, position: {x: number, y: number}, content: string = ""){
        this.id = id;
        this.title = title;
        this.content = content;
        this.position = position;
    }
}