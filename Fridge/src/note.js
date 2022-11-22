"use strict";
exports.__esModule = true;
exports.Note = void 0;
var tinymce_1 = require("tinymce");
//TODO: Sync the board on note resize
var Note = /** @class */ (function () {
    function Note(board, noteElement, id, title, position, size, zindex, content) {
        if (zindex === void 0) { zindex = -1; }
        if (content === void 0) { content = ""; }
        var _this = this;
        this.content = "";
        this.board = board;
        this.noteElement = noteElement;
        this.noteId = id;
        this.title = title;
        this.content = content;
        this.position = position;
        this.size = size;
        this.zindex = zindex;
        if (zindex == -1) {
            this.setZIndex(this.board.maxZIndex + 1);
        }
        else {
            this.setZIndex(zindex);
        }
        this.dragzone = noteElement.querySelector(".note-drag-zone");
        this.closeButton = noteElement.querySelector(".note-close");
        this.dragzone.addEventListener("mousedown", this.dragStart.bind(this));
        this.closeButton.addEventListener("mousedown", function () { board.removeNote(_this); board.sendBoardData(); });
        // TinyMCE editor configuration
        this.noteElement.querySelector(".note-content").addEventListener("mousedown", function (e) {
            e.preventDefault();
            // tinymce will be initialised on this textarea element
            var textArea = document.createElement("textarea");
            _this.board.wrapper.appendChild(textArea);
            tinymce_1["default"].init({
                selector: "textarea",
                width: "80vw",
                height: "60vh",
                min_height: 150
            }).then(function () {
                // apply z-index to tinymce editor to make it appear on top of other elements
                var tinymceEditor = document.querySelector(".tox.tox-tinymce");
                tinymceEditor.style.zIndex = (_this.board.maxZIndex + 1).toString();
                // don't allow clicking outside the editor when it's open
                _this.board.wrapper.querySelectorAll("*:not(.tox, .tox *)").forEach(function (el) {
                    var element = el;
                    element.style.pointerEvents = "none";
                });
                // Replace tinymce's bottom bar with a custom one
                var tinymceBottomRightBar = document.querySelector(".tox-statusbar__branding");
                tinymceBottomRightBar.innerHTML = "";
                tinymceBottomRightBar.appendChild(_this.createCustomTinymceBar());
                // Function for closing the editor, used by both save and close buttons
                var closeEditor = function () {
                    _this.board.wrapper.querySelectorAll("*:not(.tox, .tox *)").forEach(function (el) {
                        var element = el;
                        element.style.pointerEvents = "all";
                    });
                    tinymce_1["default"].remove();
                    textArea.remove();
                };
                // Listeners for custom bar buttons
                tinymceBottomRightBar.querySelector(".tinymce-button-exit").addEventListener("click", closeEditor);
                tinymceBottomRightBar.querySelector(".tinymce-button-save").addEventListener("click", function () {
                    content = tinymce_1["default"].activeEditor.getContent();
                    noteElement.querySelector(".note-content").innerHTML = content;
                    _this.content = encodeURIComponent(content);
                    _this.board.sendBoardData();
                    closeEditor();
                });
                tinymce_1["default"].activeEditor.setContent(decodeURIComponent(content));
                tinymce_1["default"].activeEditor.focus();
            });
        });
    }
    Note.prototype.setZIndex = function (zindex) {
        this.zindex = zindex;
        this.noteElement.style.zIndex = zindex.toString();
        if (zindex > this.board.maxZIndex) {
            this.board.maxZIndex = zindex;
        }
    };
    Note.prototype.dragStart = function (e) {
        var _this = this;
        e.preventDefault();
        this.setZIndex(this.board.maxZIndex + 1);
        this.noteElement.classList.add("note-moving");
        this.board.maxZIndex++;
        this.noteElement.style.zIndex = this.board.maxZIndex.toString();
        var previousDragX = e.clientX;
        var previousDragY = e.clientY;
        var drag = function (e) {
            var dragX = e.clientX;
            var dragY = e.clientY;
            var offsetX = previousDragX - dragX;
            var offsetY = previousDragY - dragY;
            previousDragX = e.clientX;
            previousDragY = e.clientY;
            _this.noteElement.style.left = (_this.noteElement.offsetLeft - offsetX) + "px";
            _this.noteElement.style.top = (_this.noteElement.offsetTop - offsetY) + "px";
            _this.position.x = (_this.noteElement.offsetLeft - offsetX);
            _this.position.y = (_this.noteElement.offsetTop - offsetY);
        };
        var dragEnd = function (e) {
            _this.noteElement.classList.remove("note-moving");
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", dragEnd);
            _this.board.sendBoardData();
        };
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);
    };
    Note.prototype.createCustomTinymceBar = function () {
        // Create custom bar html structure
        var customBar = document.createElement("span");
        var exitButton = document.createElement("button");
        exitButton.innerText = "Exit";
        exitButton.classList.add("tinymce-button-exit");
        var saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        saveButton.classList.add("tinymce-button-save");
        customBar.appendChild(exitButton);
        customBar.appendChild(saveButton);
        return customBar;
    };
    return Note;
}());
exports.Note = Note;
