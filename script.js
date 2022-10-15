const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const rEl = document.querySelector("#rows");
const cEl = document.querySelector("#cols");
const mEl = document.querySelector("#mines");
const nEl = document.querySelector("#nickname");
const sbm = document.querySelector("button");
const timeLabel = document.querySelector(".time");

const margin = 10;
const boxSize = 20;
const mapSizeLimit = 30;

let firstClick = true;
let startTime, currTime;
let countTime = false;

let x, y;
let mines;
let map = [];
let mineNeighbours = [];
let allTiles = [];
let timer;
let nickname;

let game = {
    //Variables and consts
    colors : { 
        "hidden" : "#fff",
        "border" : "#1a1a1a",
        "revealed" : "#2891fa",
        "mine" : "#fa285c",
        "mine-neighbour" : "#ffa142",
        "flag" : "#10c964",
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
        mines = mEl.value;
        nickname = nEl.value;

        //Validating input
        if (nickname == "") { nickname = "Anonymous"; }
        if (x > mapSizeLimit) { x = mapSizeLimit; }
        if (y > mapSizeLimit) { y = mapSizeLimit; }
        if (mines >= x * y) { mines = x * y - 1; }

        rEl.value = x; cEl.value = y; mEl.value = mines;

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
        ctx.fillStyle = game.colors.hidden;
        ctx.fillRect(0 + margin, 0 + margin, canvas.width - 2 * margin, canvas.height - 2 * margin);
        //Borders and mines
        ctx.strokeStyle = game.colors.border;
        ctx.fillStyle = game.colors.mine;
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

    revealTheMap : () => { 
        allTiles.forEach(tile => {
            let _color;
            if(tile.mine){ 
                _color = game.colors.mine;
            }
            else if(tile.hidden){
                _color = game.colors.hidden;
            }
            else{
                _color = game.colors.revealed;
            }
            tile.color(_color);
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
        }
    },

    displayScores : (bestTimes) => {
        let scores = document.querySelectorAll(".scores > *");

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
                timeLabel.innerHTML = `Time: ${ Utils.formatTime(currTime) } s`;
            }
        }, 300);
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

    //Color the box and reveal the neighbours if no mines are around
    click = () => {
        if(!mineNeighbours.includes(this)){
            this.color(game.colors.revealed);
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
                box.color(game.colors.revealed);
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
        this.color(game.colors["mine-neighbour"]);
        ctx.fillStyle = "#000000";
        ctx.font = "20px Arial";
        ctx.fillText(count, this.boxX * boxSize + margin + 5, this.boxY * boxSize + margin + 17);
    }
    flagToggle = () => {
        if(!this.hidden) { return; }
        if(this.flag){
            this.color(game.colors.hidden);
            this.flag = false;
        }
        else{
            this.color(game.colors.flag);
            this.flag = true;
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
        //Get best times from cookies as string/empty array
        // let temp = Utils.getCookie(`bestTimes-${_x-1}-${_y-1}-${_m}`, {});
        // // let bestTimes = temp != "" ? temp.split(",") : [];

        // // let bestTimes = [];
        // console.log("READ FROM COOKIES ", temp);
        // let bestTimes = JSON.parse(temp);

        // Cast array to int
        // for(let i = 0; i < temp.length; i++){
        //     bestTimes.push(JSON.parse(temp[i]));
        // }
        // for(let i = 0; i < temp.length; i++){
        //     bestTimes[i].time = Number(temp[i].time);
        // }
        let bestTimes = JSON.parse(Utils.getCookie(`bestTimes-${_x-1}-${_y-1}-${_m}`, "[]"));
        return bestTimes;
    }

    static formatTime = (time) => { 
        if(isNaN(Math.floor(time / 1000))) { return 0;}
        return Math.floor(time / 1000);
    }
}