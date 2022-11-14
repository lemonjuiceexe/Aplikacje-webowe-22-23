import { Board } from "./board";

const wrapper = document.querySelector(".wrapper") as HTMLDivElement;
const addNoteButton = wrapper.querySelector(".spawn-button") as HTMLDivElement;
const counterAll = document.querySelector(".counter-all > span") as HTMLSpanElement;
const counterActive = document.querySelector(".counter-current > span") as HTMLSpanElement;

const board = new Board(wrapper, counterAll, counterActive);

addNoteButton.addEventListener("click", board.addNote.bind(board, "Tytuł notatki", "Treść notatki"));
