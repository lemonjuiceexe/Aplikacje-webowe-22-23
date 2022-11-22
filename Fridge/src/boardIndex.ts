import { Board } from "./board";

const wrapper = document.querySelector(".wrapper") as HTMLDivElement;
const addNoteButton = wrapper.querySelector(".spawn-button") as HTMLDivElement;
const backButton = wrapper.querySelector("button.back") as HTMLButtonElement;
const nameLabel = wrapper.querySelector(".board-name") as HTMLSpanElement;
const counterAll = document.querySelector(".counter-all > span") as HTMLSpanElement;
const counterActive = document.querySelector(".counter-current > span") as HTMLSpanElement;

const board = new Board(sessionStorage.getItem("boardName")!, wrapper, counterAll, counterActive, nameLabel);


addNoteButton.addEventListener("click", board.addDefaultNote.bind(board)/*board.addNote.bind(board, "Tytuł notatki", 
'<pre style="pointer-events: all;">super<br style="pointer-events: all;"><br style="pointer-events: all;">&nbsp; [refpra,<br style="pointer-events: all;"><br style="pointer-events: all;">&nbsp;preformated<br style="pointer-events: all;"><br style="pointer-events: all;">hihi</pre><p style="text-align: right; pointer-events: all;">pozdrawiam</p><h2 style="pointer-events: all;">hahah</h2><p style="pointer-events: all;">E =&nbsp;<strong style="pointer-events: all;">mc<sup style="pointer-events: all;">2<sub style="pointer-events: all;">1</sub></sup></strong></p><blockquote style="pointer-events: all;"><pre style="pointer-events: all;"><code style="pointer-events: all;">sdasd<br style="pointer-events: all;"><br style="pointer-events: all;"><s style="pointer-events: all;">sssssss<br style="pointer-events: all;"><br style="pointer-events: all;"><br style="pointer-events: all;"></s></code></pre></blockquote>'
)*/);
backButton.addEventListener("click", () => window.location.href = "../index.html");
