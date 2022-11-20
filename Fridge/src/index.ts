import "./css/indexSite.css";

let wrapper = document.querySelector(".wrapper")!;
let boardNameInput: HTMLInputElement = wrapper.querySelector("input")!;
boardNameInput.setAttribute("size", boardNameInput.getAttribute("placeholder")!.length.toString());

// sessionStorage.setItem("boardName", boardNameInput.value);

document.querySelector("#enterButton")!.addEventListener("click", () => {
    if(boardNameInput.value.length == 0){
        alert("Please enter a board name!");
        return;
    }
    sessionStorage.setItem("boardName", boardNameInput.value);
    window.location.href='boardIndex.html';
});