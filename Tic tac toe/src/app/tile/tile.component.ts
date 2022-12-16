import {Component, Input, OnInit} from '@angular/core';
import {BoardComponent} from "../board/board.component";

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit{
	// Consts
	@Input() board?: BoardComponent;

	// Vars
	@Input() row?: number;
	@Input() column?: number;
	value: string = "-";

	constructor() {
	}
	ngOnInit(){
		this.board!.tiles.push(this);
	}

	// Methods
	public playMove(value: string): void{
		// Check if tile hasn't been filled already
		if(this.value != "-"){
			console.log("Tile already filled");
			return;
		}
		if(!this.board!.gameInProgress){
			return;
		}
		// Check if the argument is proper
		if(value.toLowerCase() != "x" && value.toLowerCase() != "o" && value != "-"){
			throw new RangeError("Argument 'value' must be either 'x', 'o' or '-' (blank)");
			return;
		}
		// Set value of clicked tile
		this.value = value;
		this.board!.boardArray[this.row!][this.column!] = value;
		// Change the moving player
		this.board!.currentMove = this.board!.currentMove == "x" ? "o" : "x";

		// Check if somebody won
		// Play AI's move
		if(!this.board!.checkWin()){
			// Calculate the best move
			let bestMove: { row: number, column: number} = this.board!.findBestMove(this.board!.boardArray, this.board!.currentMove == "x");
			// Do the move - set the values
			this.board!.tiles[bestMove.row * 3 + bestMove.column].value = value == "x" ? "o" : "x";
			this.board!.boardArray[bestMove.row][bestMove.column] = value == "x" ? "o" : "x";
			// Change the moving player
			this.board!.currentMove = this.board!.currentMove == "x" ? "o" : "x";

			// Check if somebody won
			this.board!.checkWin();
		}
	}
}
