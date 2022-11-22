"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Board = void 0;
// Templates for how the data should look like
var note_1 = require("./note");
require("./css/board.css");
var Board = /** @class */ (function () {
    function Board(boardId, wrapper, counterAll, counterActive) {
        this.defaultNotePosition = { x: 200, y: 200 };
        this.defaultNoteSize = { width: 200, height: 200 };
        /* Private vars */
        this.notes = [];
        this.allCount = 0;
        this.activeCount = 0;
        this.maxZIndex = 0;
        alert("board constructor");
        this.boardId = boardId;
        this.wrapper = wrapper;
        this.counterAll = counterAll;
        this.counterActive = counterActive;
        this.importBoardData();
    }
    /*Public methods */
    Board.prototype.addNote = function (title, content, id, position, size, zindex) {
        var _this = this;
        if (id === void 0) { id = this.allCount; }
        /* Setup the note HTML element */
        var noteElement = this.createNoteElement(this.allCount, title, content);
        noteElement.style.left = position.x + "px";
        noteElement.style.top = position.y + "px";
        noteElement.style.width = size.width + "px";
        noteElement.style.height = size.height + "px";
        // noteElement.style.zIndex = zindex.toString(); 
        this.wrapper.appendChild(noteElement);
        // Logic 
        var note = new note_1.Note(this, noteElement, this.allCount, title, position, size, zindex, content);
        note.setZIndex(zindex);
        this.notes.push(note);
        this.updateCounters(Boolean(1));
        var resizeObserver = new ResizeObserver(function (entries) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                note.size.height = Math.round(entry.contentRect.height);
                note.size.width = Math.round(entry.contentRect.width);
            }
            _this.sendBoardData();
        });
        resizeObserver.observe(noteElement);
        this.sendBoardData();
    };
    Board.prototype.addDefaultNote = function () {
        var _this = this;
        alert("add default note");
        var id = this.allCount;
        var title = "Note " + id;
        var content = encodeURIComponent("Content " + id);
        var position = __assign({}, this.defaultNotePosition);
        var size = __assign({}, this.defaultNoteSize);
        var zindex = this.maxZIndex + 1;
        /* Setup the note HTML element */
        var noteElement = this.createNoteElement(this.allCount, title, content);
        noteElement.style.left = this.defaultNotePosition.x + "px";
        noteElement.style.top = this.defaultNotePosition.y + "px";
        this.wrapper.appendChild(noteElement);
        // Logic 
        var note = new note_1.Note(this, noteElement, this.allCount, title, position, size, zindex, content);
        note.setZIndex(this.maxZIndex++);
        this.notes.push(note);
        this.updateCounters(Boolean(1));
        var resizeObserver = new ResizeObserver(function (entries) {
            for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                var entry = entries_2[_i];
                note.size.height = Math.round(entry.contentRect.height);
                note.size.width = Math.round(entry.contentRect.width);
            }
            _this.sendBoardData();
        });
        resizeObserver.observe(noteElement);
        this.sendBoardData();
    };
    Board.prototype.removeNote = function (note) {
        this.notes = this.notes.filter(function (el) { return el.noteId != note.noteId; });
        this.updateCounters(Boolean(0));
        var noteToRemove = this.wrapper.querySelector("#note-" + note.noteId);
        if (noteToRemove) {
            this.wrapper.removeChild(noteToRemove);
        }
        else {
            console.error("Note with id " + note.noteId + " not found");
            return;
        }
    };
    /* Fetching */
    Board.prototype.getBoardData = function () {
        var data = {
            boardId: this.boardId,
            defaultNotePosition: this.defaultNotePosition,
            defaultNoteSize: this.defaultNoteSize,
            // notes: this.notes, 
            notes: this.notes.map(function (note) {
                return {
                    noteId: note.noteId,
                    title: note.title,
                    content: note.content,
                    position: note.position,
                    size: note.size,
                    zindex: note.zindex
                };
            }),
            allCount: this.allCount
        };
        console.log(data);
        return JSON.stringify(data);
    };
    Board.prototype.sendBoardData = function () {
        fetch("./send.php", {
            method: "POST",
            body: this.getBoardData()
        }).then(function (res) { return res.text(); }).then(function (res) {
            return console.log(res);
        });
    };
    Board.prototype.importBoardData = function () {
        var _this = this;
        fetch("./get.php?boardId=".concat(this.boardId), {
            method: "GET"
        }).then(function (res) { return res.text(); }).then(function (res) {
            if (res == "404") {
                console.log("No board data found. Creating a new board.");
                return;
            }
            var data = JSON.parse(res);
            console.log(data);
            _this.defaultNotePosition.x = data.defaultNotePosition.x;
            _this.defaultNotePosition.y = data.defaultNotePosition.y;
            _this.defaultNoteSize.width = data.defaultNoteSize.width;
            _this.defaultNoteSize.height = data.defaultNoteSize.height;
            _this.maxZIndex = data.notes ? data.notes.length : 0;
            if (data.notes) {
                var temp = JSON.parse(data.notes);
                temp.forEach(function (note) {
                    if (note.zindex && note.zindex > _this.maxZIndex) {
                        _this.maxZIndex = note.zindex;
                    }
                    ;
                    _this.addNote(note.title ? note.title : "no title found", note.content ? note.content : "no content found", note.noteId, note.position ? note.position : _this.defaultNotePosition, note.size ? note.size : _this.defaultNoteSize, note.zindex ? note.zindex : 0);
                });
            }
            if (data.allCount) {
                _this.allCount = data.allCount;
            }
            else {
                _this.allCount = _this.notes.length;
            }
        });
    };
    /* Private methods */
    /* 1 - increase number of notes; 0 - decrease */
    Board.prototype.updateCounters = function (increase) {
        this.activeCount = this.notes.length;
        this.allCount += increase ? 1 : 0;
        this.counterAll.innerText = this.allCount.toString();
        this.counterActive.innerText = this.activeCount.toString();
    };
    /* Methods for generating html structures */
    Board.prototype.createNoteElement = function (id, title, content) {
        // Create note HTML element structure
        var noteElement = document.createElement("div");
        noteElement.classList.add("note");
        noteElement.id = "note-" + id;
        var noteInnerWrapper = document.createElement("div");
        noteInnerWrapper.classList.add("note-inner-wrapper");
        noteElement.appendChild(noteInnerWrapper);
        var noteTitleElement = document.createElement("h3");
        noteTitleElement.classList.add("note-title");
        noteTitleElement.classList.add("note-drag-zone");
        noteTitleElement.innerText = title;
        noteInnerWrapper.appendChild(noteTitleElement);
        var noteCloseElement = document.createElement("div");
        noteCloseElement.classList.add("note-close");
        noteCloseElement.innerHTML = "✖";
        noteInnerWrapper.appendChild(noteCloseElement);
        var noteContentElement = document.createElement("p");
        noteContentElement.classList.add("note-content");
        noteContentElement.innerHTML = decodeURIComponent(content);
        noteInnerWrapper.appendChild(noteContentElement);
        return noteElement;
    };
    return Board;
}());
exports.Board = Board;
