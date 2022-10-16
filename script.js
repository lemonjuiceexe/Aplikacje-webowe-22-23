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
const boxSize = 20;
const mapSizeLimit = 30;

let firstClick = true;
let startTime, currTime;
let countTime = false;
let minesLeft = 0;

let x, y;
let mines = 0;
let map = [];
let mineNeighbours = [];
let allTiles = [];
let timer;
let nickname;

//TODO: make the whole thing pretty as hell
let game = {
    //Variables and consts
    imgPaths : { 
        "hidden" : "img/hidden.png",
        "revealed" : "img/revealed.png",
        "mine" : "img/mine.png",
        "flag" : "img/flag.png",
        "mine-neighbour" : {
            1 : "img/1.png",
            2 : "img/2.png",
            3 : "img/3.png",
            4 : "img/4.png",
            5 : "img/5.png",
            6 : "img/6.png",
            7 : "img/7.png",
            8 : "img/8.png"
        },
    },
    colors : {
        "border" : "#1a1a1a",
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
        if (nickname == "") { nickname = "Anonymous"; }
        if (x > mapSizeLimit) { x = mapSizeLimit; }
        if (y > mapSizeLimit) { y = mapSizeLimit; }
        if (mines + 1 >= x * y) { mines = x * y - 2; }

        rEl.value = y; cEl.value = x; mEl.value = mines;
        game.updateMinesLeft(mines);

        x++; y++;
        for(let i = 0; i < y - 1; i++){
            map[i] = [];
            for(let j = 0; j < x - 1; j++){
                map[i][j] = new Box(j, i);
            }
        }
        //Resize canvas
        canvas.width = x * boxSize; 
        canvas.height = y * boxSize;
    },
    generateMap : () => {
        allTiles = [].concat(...map);
        //Generate mines
        let mineCount = 0;
        while(mineCount < mines){
            let a = Math.floor(Math.random() * (y - 1));
            let b = Math.floor(Math.random() * (x - 1));
            if(/*map[a][b] && */map[a][b].mine){
                continue;
            }
            // map[a][b] = new Box();
            map[a][b].mine = true;
            mineCount++;
            map[a][b].neighbours().forEach(el => mineNeighbours.push(el));
        }
        //Draw the map
        //Background
        // ctx.fillStyle = game.colors.hidden;
        // ctx.fillRect(0 + margin, 0 + margin, canvas.width - 2 * margin, canvas.height - 2 * margin);
        //Instead of fillRect, insert images of hidden tiles
        for(let i = 0; i < y - 1; i++){
            for(let j = 0; j < x - 1; j++){
                map[i][j].coverImage(game.imgPaths.hidden);
            }
        }
        //Borders and mines
        ctx.strokeStyle = game.colors.border;
        // ctx.fillStyle = game.colors.mine;
        let i = 0, j = 0;
        for(let drawI = margin; drawI < canvas.getAttribute("height") - (2 * margin) + 1; drawI += boxSize){
            for(let drawJ = margin; drawJ < canvas.getAttribute("width") - (2 * margin) + 1; drawJ += boxSize){
                ctx.strokeRect(drawJ, drawI, boxSize, boxSize);
                // Color the mines
                // if(/*map[i][j] != undefined && */map[i][j].mine){
                //     ctx.fillRect(drawJ, drawI, boxSize, boxSize);
                // }
                j++;
            }
            j = 0;
            i++;
        }
    },

    //TODO: probably need a proper reveal
    revealTheMap : () => { 
        allTiles.forEach(tile => {
            let path;
            if(tile.mine){ 
                path = game.imgPaths.mine;
            }
            else if(tile.hidden){
                path = game.imgPaths.hidden;
            }
            else{
                path = game.imgPaths.revealed;
            }
            // tile.color(_color);
            tile.coverImage(path);
        });
    },

    checkWin : () => {
        let revealed = allTiles.filter(el => !el.hidden);
        if(revealed.length == allTiles.length - mines){
            countTime = false;
            game.revealTheMap();
            alert(`You won in ${ Utils.formatTime(currTime) } seconds!`);
            
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
            console.log(bestTimes);
            bestTimes = bestTimes.sort((a, b) => a.time - b.time);
            bestTimesString = JSON.stringify(bestTimes);
            // console.log("PUSHING " + bestTimesString);
            Utils.setCookie(`bestTimes-${x-1}-${y-1}-${mines}`, bestTimesString, 365);

            game.displayScores(bestTimes);
            game.updateMinesLeft(0);
        }
    },

    displayScores : (bestTimes) => {
        let scores = document.querySelectorAll(".scores > *");

        //TODO: dunno if there's need to display times in MM:SS.ms format
        scores.forEach((el, i) => { 
            if(bestTimes[i] != undefined){
                el.innerHTML = `<strong>${bestTimes[i].name} ${bestTimes[i].time} ms</strong>`;
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
                timeLabel.innerText = `Time: ${ Utils.formatTime(currTime) } s`;
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

        console.log(minesLeftLabel.innerText);
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

    map[y][x].click();
    // When mine clicked (Lose the game)
    if(map[y][x].mine && !firstClick){
        //Reveal the map
        game.revealTheMap();
        countTime = false;
        alert(`Game Over. You lost in ${ Utils.formatTime(currTime) } seconds.`);
        return;
    }
    // Regenerate if first click is a mine
    else if(firstClick){
        while(map[y][x].mine){
            game.clearVars();
            game.readInput();
            game.generateMap();
        }
        firstClick = false;
        map[y][x].click();
    }

    game.checkWin();
});
//Right click
canvas.addEventListener("contextmenu", (e) => { 
    e.preventDefault();
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
        console.log(img);
        img.src = path;
        img.addEventListener("load", () => { 
            console.log("load!"); 
            ctx.drawImage(img, this.boxX * boxSize + margin + 1, this.boxY * boxSize + margin + 1, boxSize - 2, boxSize - 2); 
        });
    }

    //Color the box and reveal the neighbours if no mines are around
    click = () => {
        if(!mineNeighbours.includes(this)){
            // this.color(game.colors.revealed);
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
            //Color both normal and numbered squares
            if(!mineNeighbours.includes(box)){
                // box.color(game.colors.revealed);
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
    neighbours = () => {
        return allTiles.filter((box) => {
                    //Not yet revealed and not the same box
            return box.hidden && !(box.boxX == this.boxX && box.boxY == this.boxY)
                //Tiles neighbouring by x
                && ((box.boxX == this.boxX - 1 || box.boxX == this.boxX || box.boxX == this.boxX + 1)
                    //Tiles neighbouring by y
                    && (box.boxY == this.boxY - 1 || box.boxY == this.boxY || box.boxY == this.boxY + 1));
        });
    }
    //Color the numbered box (count it's mine neighbours)
    colorNumbered = () => {
        let neighbouring = this.neighbours();
        let count = neighbouring.filter((box) => box.mine).length;
        let path = `./img/${count}.png`;
        this.coverImage(path);
        // this.color(game.colors["mine-neighbour"]);
        // ctx.fillStyle = "#000000";
        // ctx.font = "20px Arial";
        // ctx.fillText(count, this.boxX * boxSize + margin + 5, this.boxY * boxSize + margin + 17);
    }
    flagToggle = () => {
        if(!this.hidden) { return; }
        if(this.flag){
            // this.color(game.colors.hidden);
            this.coverImage(game.imgPaths.hidden);
            this.flag = false;
            game.updateMinesLeft(minesLeft + 1);
        }
        else{
            // this.color(game.colors.flag);
            this.coverImage(game.imgPaths.flag);
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

    static formatTime = (time) => { 
        if(isNaN(Math.floor(time / 1000))) { return 0;}
        return Math.floor(time / 1000);
    }
}