import "./css/indexSite.css";

let wrapper = document.querySelector(".wrapper")!;
let boardNameInput: HTMLInputElement = wrapper.querySelector("input")!;
boardNameInput.setAttribute("size", boardNameInput.getAttribute("placeholder")!.length.toString());

// sessionStorage.setItem("boardName", boardNameInput.value);

const boardEnter = () => {
    sessionStorage.setItem("boardName", boardNameInput.value);
    window.location.href='boardIndex.html';
};