export interface IBoard{
    boardId: string;
    defaultNotePosition: {x: number, y: number};
    defaultNoteSize: {width: number, height: number};
    notes?: INote[];
    allCount?: number;
}

export interface INote {
    noteId: number;
    title?: string;
    content?: string;
    position?: {x: number, y: number};
    size?: {width: number, height: number};
    zindex?: number;
}
