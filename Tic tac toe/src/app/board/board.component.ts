import { Component } from '@angular/core';
import {TileComponent} from "../tile/tile.component";

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.css']
})
export class BoardComponent {
	public boardArray: string[][] = [
		["-", "-", "-"],
		["-", "-", "-"],
		["-", "-", "-"]
	];
	public currentMove: string = Math.floor(Math.random() * 2) == 1 ? "x" : "o";
	public playerSide: string = this.currentMove;
	public tiles: Array<TileComponent> = [];
	public gameInProgress: boolean = true;

	public checkWin(): boolean{
		if(!this.areMovesLeft(this.boardArray) || this.evaluatePosition(this.boardArray) != 0){
			if(!this.areMovesLeft(this.boardArray) && this.evaluatePosition(this.boardArray) == 0){
				alert("Draw!");
				this.gameInProgress = false;
				return true;
			}
			else if(this.evaluatePosition(this.boardArray) == Infinity){
				alert("X wins!");
				this.gameInProgress = false;
				return true;
			}
			else if(this.evaluatePosition(this.boardArray) == -Infinity){
				alert("O wins!");
				this.gameInProgress = false;
				return true;
			}
		}

		return false;
	}
	// AI methods
	public areMovesLeft(position: string[][]): boolean{
		for(let i = 0; i < 3; i++){
			for(let j = 0; j < 3; j++){
				if(position[i][j] == "-"){
					return true;
				}
			}
		}

		return false;
	}

	// X is maximising, O is minimising
	public evaluatePosition(position: string[][]): number{
		// Check rows
		for (let i = 0; i < 3; i++){
			if(position[i][0] == position[i][1] && position[i][1] == position[i][2]){
				if(position[i][0] == "x"){
					return Infinity;
				}
				else if(position[i][0] == "o"){
					return -Infinity;
				}
				else if(position[i][0] == "-"){ }
				else{
					throw new RangeError("All fields in positions should be either 'x', 'o' or '-'. Function encountered " + position[i][0]);
				}
			}
		}
		// Check columns
		for (let i = 0; i < 3; i++){
			if(position[0][i] == position[1][i] && position[1][i] == position[2][i]){
				if(position[0][i] == "x"){
					return Infinity;
				}
				else if(position[0][i] == "o"){
					return -Infinity;
				}
				else if(position[0][i] == "-"){ }
				else{
					throw new RangeError("All fields in positions should be either 'x', 'o' or '-'. Function encountered " + position[0][i]);
				}
			}
		}
		//Check diagonals
		if(position[0][0] == position[1][1] && position[1][1] == position[2][2]){
			if(position[0][0] == "x"){
				return Infinity;
			}
			else if(position[0][0] == "o"){
				return -Infinity;
			}
			else if(position[0][0] == "-"){ }
			else{
				throw new RangeError("All fields in positions should be either 'x', 'o' or '-'. Function encountered " + position[0][0]);
			}
		}
		if(position[2][0] == position[1][1] && position[1][1] == position[0][2]){
			if(position[2][0] == "x"){
				return Infinity;
			}
			else if(position[2][0] == "o"){
				return -Infinity;
			}
			else if(position[2][0] == "-"){ }
			else{
				throw new RangeError("All fields in positions should be either 'x', 'o' or '-'. Function encountered " + position[2][0]);
			}
		}

		// Return a tie if nobody's winning
		return 0;
	}

	public minimax(position: string[][], depth: number, isMaximizingPlayer: boolean): number
	{
		let score = this.evaluatePosition(position);

		// If somebody won
		if (score == Infinity || score == -Infinity) {
			return score;
		}

		// No moves left and no winner, therefore a tie
		if (!this.areMovesLeft(position)) {
			return 0;
		}

		// If this maximizer's move
		if (isMaximizingPlayer)
		{
			let best = -Infinity;
			// All possible moves
			for(let i = 0; i < 3; i++) {
				for(let j = 0; j < 3; j++) {
					// Check if cell is empty
					if (position[i][j]=='-') {
						// Make the move
						position[i][j] = "x";

						// Recursive minimax
						best = Math.max(best, this.minimax(position, depth + 1, !isMaximizingPlayer));
						// Undo the move
						position[i][j] = '-';
					}
				}
			}
			return best;
		}

		// If this minimizer's move
		else {
			let best = Infinity;
			// All possible moves
			for(let i = 0; i < 3; i++) {
				for(let j = 0; j < 3; j++) {
					// Check if cell is empty
					if (position[i][j] == '-') {
						// Make the move
						position[i][j] = "o";

						// Recursive minimax
						best = Math.min(best, this.minimax(position, depth + 1, !isMaximizingPlayer));

						// Undo the move
						position[i][j] = '-';
					}
				}
			}
			return best;
		}
	}

	public findBestMove(position: string[][], isMaximizingPlayer: boolean): { row: number, column: number }{
		let bestValue = isMaximizingPlayer ? -Infinity : Infinity;
		let bestMove = { row: -1, column: -1};

		// Run minimax for every possible tile
		for (let i = 0; i < 3; i++){
			for (let j = 0; j < 3; j++){
				if (position[i][j] == "-"){
					position[i][j] = isMaximizingPlayer ? "x" : "o";
					let evaluationForMove = this.minimax(position, 0, !isMaximizingPlayer);
					// Undo the move
					position[i][j] = "-";
					// If evaluation for this move is better than current best move, update the best move
					if (isMaximizingPlayer ?
						evaluationForMove > bestValue :
						evaluationForMove < bestValue){

						bestValue = evaluationForMove;
						bestMove = {row: i, column: j};
					}
				}
			}
		}

		return bestMove;
	}
	// Utilities
	public calculateRow(counter: number): number{
		if([0, 1, 2].includes(counter)){
			return 0;
		}
		else if([3, 4, 5].includes(counter)){
			return 1;
		}
		else if([6, 7, 8].includes(counter)){
			return 2;
		}
		else{
			throw new RangeError("Counter must be an integer between 0 and 8 inclusive.");
		}
	}

	restart() {
		location.reload();
	}
}
