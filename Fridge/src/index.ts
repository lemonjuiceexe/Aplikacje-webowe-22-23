import "./css/indexSite.css";

let wrapper = document.querySelector(".wrapper")!;
let boardNameInput: HTMLElement = wrapper.querySelector("input")!;
boardNameInput.setAttribute("size", boardNameInput.getAttribute("placeholder")!.length.toString());
