/*
*
* https://open.spotify.com/album/1XkGORuUX2QGOEIL4EbJKm?si=59MXfkcaTm2ddnxy692jzg
*
* */



// public minimax(position: string[][], depth: number, isMaximizingPlayer: boolean): number{
// 	let score = this.evaluatePosition(position);
// 	// console.log("minimax checking position");
// 	// console.table(position);
// 	// console.log("it's rated ", score);
//
// 	// Winning position
// 	if(/*[Infinity, -Infinity].includes(score)*/ score == Infinity || score == -Infinity){
// 		return score;
// 	}
// 	// No winners with no moves left on the board means tie
// 	if(!this.areMovesLeft(position)){
// 		return 0;
// 	}
// 	if(isMaximizingPlayer){
// 		let bestPossibleScore = -Infinity0;
// 		// Check all tiles
// 		for(let i = 0; i < 3; i++){
// 			for(let j = 0; j < 3; j++){
// 				// console.log(i, j);
// 				// Make all possible moves
// 				if(position[i][j] == "-"){
// 					console.table(position);
// 					console.log("fill a gap");
// 					position[i][j] = "x";
// 					console.table(position);
//
// 					// Recursive
// 					// bestPossibleScore = isMaximizingPlayer ?
// 					// 	Math.max(bestPossibleScore, this.minimax(position, depth + 1, !isMaximizingPlayer)) :
// 					// 	Math.min(bestPossibleScore, this.minimax(position, depth + 1, !isMaximizingPlayer));
// 					let minimaxValue = this.minimax(position, depth + 1, !isMaximizingPlayer);
// 					bestPossibleScore = Math.max(bestPossibleScore, minimaxValue);
//
// 					// Undo the move
// 					position[i][j] = "-";
// 				}
// 			}
// 		}
//
// 		return bestPossibleScore;
// 	}
// 	else{
// 		let bestPossibleScore = Infinity0;
// 		// Check all tiles
// 		for(let i = 0; i < 3; i++){
// 			for(let j = 0; j < 3; j++){
// 				// console.log(i, j);
// 				// Make all possible moves
// 				if(position[i][j] == "-"){
// 					console.table(position);
// 					console.log("fill a gap");
// 					position[i][j] = "o";
// 					console.table(position);
//
// 					// Recursive
// 					// bestPossibleScore = isMaximizingPlayer ?
// 					// 	Math.max(bestPossibleScore, this.minimax(position, depth + 1, !isMaximizingPlayer)) :
// 					// 	Math.min(bestPossibleScore, this.minimax(position, depth + 1, !isMaximizingPlayer));
// 						let minimaxValue = this.minimax(position, depth + 1, !isMaximizingPlayer);
// 						bestPossibleScore = Math.min(bestPossibleScore, minimaxValue);
//
// 					// Undo the move
// 					position[i][j] = "-";
// 				}
// 			}
// 		}
//
// 		return bestPossibleScore;
// 	}
// 	// let bestPossibleScore = isMaximizingPlayer ? -Infinity0 : Infinity0;
// 	// // Check all tiles
// 	// for(let i = 0; i < 3; i++){
// 	// 	for(let j = 0; j < 3; j++){
// 	// 		// console.log(i, j);
// 	// 		// Make all possible moves
// 	// 		if(position[i][j] == "-"){
// 	// 			console.table(position);
// 	// 			console.log("fill a gap");
// 	// 			position[i][j] = isMaximizingPlayer ? "x" : "o";
// 	// 			console.table(position);
// 	//
// 	// 			// Recursive
// 	// 			// bestPossibleScore = isMaximizingPlayer ?
// 	// 			// 	Math.max(bestPossibleScore, this.minimax(position, depth + 1, !isMaximizingPlayer)) :
// 	// 			// 	Math.min(bestPossibleScore, this.minimax(position, depth + 1, !isMaximizingPlayer));
// 	// 			if(isMaximizingPlayer){
// 	// 				let minimaxValue = this.minimax(position, depth + 1, !isMaximizingPlayer);
// 	// 				bestPossibleScore = Math.max(bestPossibleScore, minimaxValue);
// 	// 			}
// 	// 			else{
// 	// 				let minimaxValue = this.minimax(position, depth + 1, !isMaximizingPlayer);
// 	// 				bestPossibleScore = Math.min(bestPossibleScore, minimaxValue);
// 	// 			}
// 	//
// 	// 			// Undo the move
// 	// 			position[i][j] = "-";
// 	// 		}
// 	// 	}
// 	// }
//
// 	// return bestPossibleScore;
// }
// // public findBestXMove(position: string[][]): { row: number, column: number }{
// // 	let bestValue = -Infinity;
// // 	let bestMove = { row: -1, column: -1};
// //
// // 	for(let i = 0; i < 3; i++) {
// // 		for (let j = 0; j < 3; j++) {
// // 			if(position[i][j] == "-"){
// // 				position[i][j] = "x";
// // 				let moveValue = this.minimax(position, 0, false);
// // 				position[i][j] = "-";
// //
// // 				if(moveValue > bestValue){
// // 					bestValue = moveValue;
// // 					bestMove = {row: i, column: j};
// // 				}
// // 			}
// // 		}
// // 	}
// //
// // 	return bestMove;
// }
