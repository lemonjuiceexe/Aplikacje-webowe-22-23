const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const rEl = document.querySelector("#rows");
const cEl = document.querySelector("#cols");
const mEl = document.querySelector("#mines");
const nEl = document.querySelector("#nickname");
const sbm = document.querySelector("button");
const timeLabel = document.querySelector(".time");
const minesLeftLabel = document.querySelector(".mines-left");

const margin = 10;
const boxSize = 40;
const mapSizeLimit = 30;

let firstClick = true;
let startTime, currTime;
let countTime = false;

let x, y;
let mines = 0;
let minesLeft = 0;
let map = [];
let mineNeighbours = [];
let allTiles = [];
let notMines = [];
let mineThatExploded = null;
let timer;
let nickname;

let game = {
    //Variables and consts
    imgPaths : { 
        "hidden" : "img/hidden-c.png",
        "revealed" : "img/revealed-c.png",
        "mine" : "img/mine-c.png",
        "mine-exploded" : "img/mine-exploded-c.png",
        "flag" : "img/flag-c.png",
        "mine-neighbour" : {
            1 : "img/1-c.png",
            2 : "img/2-c.png",
            3 : "img/3-c.png",
            4 : "img/4-c.png",
            5 : "img/5-c.png",
            6 : "img/6-c.png",
            7 : "img/7-c.png",
            8 : "img/8-c.png"
        },
    },
    colors : {
        border: "#FFCACA",
    },
    //Functions
    clearVars : () => { 
        map.length = 0;
        mineNeighbours.length = 0;
        allTiles.length = 0;
        firstClick = true;
        startTime = new Date();
    },

    readInput : () => {
        y = rEl.value; x = cEl.value;
        mines = Number(mEl.value);
        nickname = nEl.value;

        //Validating input
        if (nickname == "" || !nickname.match(/^[a-zA-Z0-9]+$/)) { nickname = "Anonymous"; }
        if (x > mapSizeLimit) { x = mapSizeLimit; }
        if (y > mapSizeLimit) { y = mapSizeLimit; }
        if (x < 1) { x = 1; }
        if (y < 1) { y = 1; }
        
        if (mines + 1 >= x * y) { mines = x * y - 2; }
        if (mines < 2) { mines = 2; }

        //Round the input values
        x = Math.round(x); y = Math.round(y); mines = Math.round(mines);

        rEl.value = y; cEl.value = x; mEl.value = mines; nEl.value = nickname;
        game.updateMinesLeft(mines);

        x++; y++;
        for(let i = 0; i < y - 1; i++){
            map[i] = [];
            for(let j = 0; j < x - 1; j++){
                map[i][j] = new Box(j, i);
            }
        }
        //Resize canvas
        canvas.width = (x - 1) * boxSize + margin * 2;; 
        canvas.height = (y - 1) * boxSize + margin * 2;
    },
    generateMap : () => {
        allTiles = [].concat(...map);
        //Generate mines
        let mineCount = 0;
        while(mineCount < mines){
            let a = Math.floor(Math.random() * (y - 1));
            let b = Math.floor(Math.random() * (x - 1));
            if(map[a][b].mine){
                continue;
            }
            // map[a][b] = new Box();
            map[a][b].mine = true;
            mineCount++;
            map[a][b].neighbours().forEach(el => mineNeighbours.push(el));
        }

        notMines = allTiles.filter(el => !el.mine);

        //Draw the map
        //Background
        for(let i = 0; i < y - 1; i++){
            for(let j = 0; j < x - 1; j++){
                map[i][j].coverImage(game.imgPaths.hidden);
            }
        }
        //Borders and mines
        ctx.strokeStyle = game.colors.border;
        // let i = 0, j = 0;
        for(let drawI = margin; drawI < canvas.getAttribute("height") - (2 * margin) + 1; drawI += boxSize){
            for(let drawJ = margin; drawJ < canvas.getAttribute("width") - (2 * margin) + 1; drawJ += boxSize){
                ctx.strokeRect(drawJ, drawI, boxSize, boxSize);
                // j++;
            }
            // j = 0;
            // i++;
        }
    },

    revealTheMap : () => { 
        allTiles.forEach(tile => {
            let path = game.imgPaths.hidden;
            if (tile.mine && tile == mineThatExploded) {
                tile.hidden = true;
                path = game.imgPaths["mine-exploded"];
            }
            else if(tile.mine){ 
                path = game.imgPaths.mine;
            }
            else if(!tile.hidden){
                path = "";
            }
            tile.coverImage(path);
        });
    },

    checkWin : () => {
        let revealed = allTiles.filter(el => !el.hidden);
        if(revealed.length == allTiles.length - mines){
            countTime = false;
            game.revealTheMap();
            alert(`You won in ${ Utils.milisecondsToFormatted(currTime) } seconds!`);
            
            bestTimes = Utils.getBestTimes(x, y, mines);
            let currScore = new Score(Number(currTime), nickname);
            // currTime = Number(currTime);
            if(bestTimes == "[]"){ 
                bestTimes = [];
                bestTimes.push(currScore);
            }
            else if(bestTimes.length < 10){
                bestTimes.push(currScore);
            }
            else{
                if(bestTimes[9].time > currScore.time){
                    bestTimes[9] = currScore;
                }
            }
            bestTimes = bestTimes.sort((a, b) => a.time - b.time);
            bestTimesString = JSON.stringify(bestTimes);
            Utils.setCookie(`bestTimes-${x-1}-${y-1}-${mines}`, bestTimesString, 365);

            game.displayScores(bestTimes);
            game.updateMinesLeft(0);
        }
    },

    displayScores : (bestTimes) => {
        let scores = document.querySelectorAll(".scores > *");

        scores.forEach((el, i) => { 
            if(bestTimes[i] != undefined){
                el.innerHTML = `<strong>${bestTimes[i].name} ${Utils.milisecondsToFormatted(bestTimes[i].time)} ms</strong>`;
            }
            else{
                el.innerHTML = "-- -- ms";
            }
        });
    },

    restart : () => { 
        game.clearVars();
        game.readInput();
        game.generateMap();
        game.displayScores(Utils.getBestTimes(x, y, mines));
        countTime = true;
        timer = setInterval(() => {
            if(countTime){
                currTime = new Date() - startTime;
                timeLabel.innerText = `Time: ${ Utils.milisecondsToSeconds(currTime) } s`;
            }
        }, 300);
    },

    updateMinesLeft : (amount) => {
        minesLeft = Number(amount);
        if(minesLeft < 0 && countTime){
            minesLeftLabel.innerText = `Mines left: ?`;
            return;
        }
        minesLeftLabel.innerText = `Mines left: ${minesLeft}`;
    }
}

//Submit button
sbm.addEventListener("click", () => {
    game.restart();
});
//Clicking on canvas
canvas.addEventListener("click", (e) => {
    if(!countTime) { return; } //Don't allow clicking before and after the game
    let x = Math.floor((e.offsetX - margin) / boxSize);
    let y = Math.floor((e.offsetY - margin) / boxSize);

    if(map[y][x].flag) { return; }

    // When mine clicked (Lose the game)
    if(map[y][x].mine && !firstClick){
        mineThatExploded = map[y][x];
        //Reveal the map
        game.revealTheMap();
        countTime = false;
        // alert(`Game Over. You lost in ${ Utils.milisecondsToSeconds(currTime) } seconds.`);
        alert(`Game Over. You lost in ${ Utils.milisecondsToFormatted(currTime) }.`);
        return;
    }
    // Regenerate if first click is a mine
    else if(firstClick){
        while(map[y][x].mine){
            // game.clearVars();
            // game.readInput();
            // game.generateMap();

            map[y][x].mine = false;
            notMines[0].mine = true;
            notMines.shift();

            //Regenerate the mine neighbours array
            console.log("Updating the thing");
            mineNeighbours = [];
            allTiles.filter(el => el.mine).forEach(el => mineNeighbours.push(...el.neighbours(false)));
        }
        firstClick = false;
        map[y][x].click();
    }

    map[y][x].click();
    game.checkWin();
});
//Right click
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if(!countTime) { return; } //Don't allow clicking before and after the game
    let x = Math.floor((e.offsetX - margin) / boxSize);
    let y = Math.floor((e.offsetY - margin) / boxSize);
    console.log(x, y);
    map[y][x].flagToggle();
});

class Score{
    constructor(time, name){
        this.time = time;
        this.name = name;
    }
}

class Box{
    constructor(x, y){
        this.boxX = x;
        this.boxY = y;
        this.hidden = true;
        this.flag = false;
    }
    mine = false;
    
    colorHex = "#ffffff";

    color = (c) => {
        this.colorHex = c;
        ctx.fillStyle = c;
        // +1 and -2 are to compensate for the border
        ctx.fillRect(this.boxX * boxSize + margin + 1, this.boxY * boxSize + margin + 1, boxSize - 2, boxSize - 2);
    }
    coverImage = (path) => {
        let img = new Image();
        img.src = path;
        img.addEventListener("load", () => { 
            ctx.drawImage(img, this.boxX * boxSize + margin + 1, this.boxY * boxSize + margin + 1, boxSize - 2, boxSize - 2); 
        });
    }

    //Color the box and reveal the neighbours if no mines are around
    click = () => {
        if(!mineNeighbours.includes(this)){
            this.coverImage(game.imgPaths.revealed);
        }
        else{ 
            this.colorNumbered();
        }
        //Stop if the box is numbered
        if(mineNeighbours.includes(this)){ 
            this.hidden = false;
            return;
        }
        this.revealNeighbours();
    }

    revealNeighbours = () => {
        //Mark the box as revealed
        if(!this.hidden) { return; }
        else { this.hidden = false; }

        //Recursively check all the neighbours
        let neighbouring = this.neighbours();
        if(neighbouring.count == 0){
            return;
        }        
        neighbouring.forEach((box) => {
            //Don't check the same box more than once
            if(!box.hidden){ return; }
            //Don't reveal a mine
            if(box.mine){ return; }
            //Unflag the box if it's flagged
            if(box.flag){ box.flagToggle(false); console.log("unflag m8"); }
            //Color both normal and numbered squares
            if(!mineNeighbours.includes(box)){
                box.coverImage(game.imgPaths.revealed);
            }
            else{
                box.hidden = false;
                box.colorNumbered();
            }
            //The reveal always ends on a numbered square
            if(mineNeighbours.includes(box)){ return; }
            //Reveal normal squares
            box.revealNeighbours();
        });
    }

    //Return the eight neighbouring boxes
    neighbours = (onlyNotRevealed = true) => {
        return allTiles.filter((box) => {
            if(onlyNotRevealed){
                        //Not yet revealed and not the same box
                return box.hidden && !(box.boxX == this.boxX && box.boxY == this.boxY)
                    //Tiles neighbouring by x
                    && ((box.boxX == this.boxX - 1 || box.boxX == this.boxX || box.boxX == this.boxX + 1)
                    //Tiles neighbouring by y
                    && (box.boxY == this.boxY - 1 || box.boxY == this.boxY || box.boxY == this.boxY + 1));
            }
            else{
                return !(box.boxX == this.boxX && box.boxY == this.boxY)
                    //Tiles neighbouring by x
                    && ((box.boxX == this.boxX - 1 || box.boxX == this.boxX || box.boxX == this.boxX + 1)
                    //Tiles neighbouring by y
                    && (box.boxY == this.boxY - 1 || box.boxY == this.boxY || box.boxY == this.boxY + 1));
            }
        });
    }
    //Color the numbered box (count it's mine neighbours)
    colorNumbered = () => {
        let neighbouring = this.neighbours();
        let count = neighbouring.filter((box) => box.mine).length;
        let path = game.imgPaths["mine-neighbour"][count];
        this.coverImage(path);
    }
    flagToggle = (updateImage = true) => {
        if(!this.hidden) { return; }
        if(this.flag){
            if(updateImage){
                this.coverImage(game.imgPaths.hidden);
            }
            this.flag = false;
            game.updateMinesLeft(minesLeft + 1);
        }
        else{
            if(updateImage){
                this.coverImage(game.imgPaths.flag);
            }
            this.flag = true;
            game.updateMinesLeft(minesLeft - 1);
        }
    }
}

class Utils{
    static getCookie = (cname, defaultValue="") => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }

        return defaultValue;
    }
    static setCookie = (cname, cvalue, expire) => {
        let d = new Date();
        d.setTime(d.getTime() + (expire*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;Secure";
    }
    static deleteAllCookies = () => {
        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }

    static getBestTimes(_x, _y, _m){ // Return best times for the given map (_x x _y with _m mines)
        return JSON.parse(Utils.getCookie(`bestTimes-${_x-1}-${_y-1}-${_m}`, "[]"));
    }

    static milisecondsToSeconds = (time) => { 
        if(isNaN(Math.floor(time / 1000))) { return 0;}
        return Math.floor(time / 1000);
    }
    //Return the time in the format mm:ss:ms
    static milisecondsToFormatted = (time) => {
        let miliseconds = time % 1000;
        let seconds = Utils.milisecondsToSeconds(time);
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");

        return `${minutes}:${seconds}:${miliseconds}`;
    }
}