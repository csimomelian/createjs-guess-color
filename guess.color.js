var canvas;
var stage;
var handler;
var pieces;
var piecesContainer;
var colours;
var underpieces;
var copy_pieces;
var copy_white_pieces;
var fpsLabel;
var timeLabel;
var timeInterval;
var debug_mode;
var pieceSize;
var numPieces;
var column;
var row;
var selected_colors;
var navbar;
var colorsPalette = ["#FF0000"/*Red solid*/
					,"#FF7F00"/*Flush Orange*/
					,"#FFFF00"/*Yellow solid*/
					,"#DFFF00"/*Chartreuse Yellow*/
					,"#00FF00"/*Green solid*/
					,"#00FF7F"/*Spring Green solid*/
					,"#00FFFF"/*Cyan / Aqua solid*/
					,"#007FFF"/*Azure Radiance solid*/
					,"#0000FF"/*Bluesolid*/
					,"#8F00FF"/*Electric Violet*/
					,"#FF00FF"/*Magenta / Fuchsia solid*/
					,"#146eb4"/*Denim*/
					,"#88aca1"/*Cascade*/
					,"#788cb6"/*Wild Blue Yonder*/
					,"#cf0072"/*Lipstick*/
					,"#ed6856"/*Burnt Sienna*/
					];


/************************ CONSTANTS *****************************************//*****************************//**/

const INIT_GAME_MESSAGE = "Please find the paired color piece";
const INIT_GAME_SUB_MESSAGE = "Click anywhere to begin";
const END_GAME_MESSAGE  = "Well done!";
const TITLE_FONTSIZE = "2em";
const LINE_HEIGHT = 36;
const SECONDARY_FONTSIZE = "1.5em";





/************************ INITIALIZE *****************************************//*****************************//**/

function init () {

		debug_mode=true;

		//Set canvas meassures 
		canvas = document.getElementById('canvas');
		canvas.width = document.body.clientWidth || 550;
		canvas.height = document.body.clientHeight || 500;
		stage = new createjs.Stage(canvas);
		stage.name = "stage";

		piecesContainer = new createjs.Container();
		piecesContainer.name  ="piecesContainer";


		stage.enableMouseOver(60);
		createjs.Touch.enable(stage);

		numPieces = 18;
		column = 6;
		row = numPieces / column ;

		
		ticker();
		
		setFpsLabel();
		
		buildPieces();
		displayStartMsg();

}



/************************ TICKER INTERVAL TIME *****************************************//*****************************//**/

function ticker () {

	console.log('Ticker');
		//createjs.Ticker.setInterval(25);
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick",stage);

	        createjs.Ticker.addEventListener("tick", function(){

	        		 if (debug_mode){

	        		 	fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
	        		 }
	        		
	        		
	        });


}




/************************ BUILD THE PUZZLE PIECES*****************************************//*****************************//**/

function buildPieces () {


	colours = shuffleColours(colorsPalette).splice(0, numPieces/2 );//Obtenemos dos pares de colores al divir por 2.
	colours = colours.concat(shuffleColours(colours)); //hace shuffle de los colores y unimos, conseguimos 8 pares de piezas
	selected_colors = new Array(); //Store the selected colors

	var shape;
	var white_shape;
	var _col = 0;
	var _row = 0;

	copy_pieces = new Array();
	copy_white_pieces = new Array();
	//Set the size of the piece, also the margin.
	pieceSize = Math.sqrt(Math.pow(stage.canvas.height, 2) + Math.pow(stage.canvas.width, 2))/colorsPalette.length;
	pieceMargin = (canvas.width * 0.010 ) || 5 ; 

	var initX = Math.floor((stage.canvas.width/2)  - ( (pieceSize+pieceMargin) * column)/2 + (pieceSize/2)) + pieceMargin/2;
	var initY = Math.floor((stage.canvas.height/2) - ( (pieceSize+pieceMargin) * row)/2 + (pieceSize/2)) + pieceMargin/2;


			//colour pieces

		for (var i = 0; i < column * row ; i++) {
			

			shape = new createjs.Shape();
			shape.name = colours[i];
			shape.keyindex = i;
			shape.graphics.beginFill(colours[i]).drawRect(0,0,pieceSize,pieceSize);
			shape.homeX = initX + ( _col * ( pieceSize + pieceMargin) ) ;
			shape.homeY = initY + ( _row * (pieceSize + pieceMargin) ) ;
			shape.x = shape.homeX;
			shape.y = shape.homeY;
			shape.regX = pieceSize/2 ;
			shape.regY = pieceSize/2 ;

			//copy obj references
			copy_pieces.push(shape);

			//White pieces
			
			white_shape = new createjs.Shape();
			white_shape.name = colours[i];
			white_shape.keyindex = i;
			white_shape.graphics.beginFill("white").drawRect(0,0,pieceSize,pieceSize);
			white_shape.homeX = initX + ( _col * ( pieceSize + pieceMargin) ) ;
			white_shape.homeY = initY + ( _row * (pieceSize + pieceMargin) ) ;
			white_shape.x = white_shape.homeX;
			white_shape.y = white_shape.homeY;
			white_shape.regX = pieceSize/2 ;
			white_shape.regY = pieceSize/2 ;
			white_shape.alpha = 1;
			white_shape.addEventListener('pressup',handler,false);

			copy_white_pieces.push(white_shape);
			
			piecesContainer.addChild(shape,white_shape);
			
			//add cache region...
			shape.cache(0,0,pieceSize,pieceSize);
			white_shape.cache(0,0,pieceSize,pieceSize);

			_col ++;
			// num columns per row drawn are equal to column size ? 
			if (_col  == column ){
			//reset value.
			_col = 0;
			//incrementamos la fila.
			_row ++;  
			}  

		};

		

		stage.addChild(piecesContainer);
		
		
}


/************************ PressUP Event  *****************************************//*****************************//**/



function handler (event) {

			var target = event.target;
			console.log('click' + target.name);
			//Hide white shape to see the colour shape below it.
			target.alpha = 0;
			selected_colors.push(target);
			//If there are two pieces selected , then the colour of the pieces will be evaluate.
			if ( selected_colors.length == 2) {

				//are there the same colour ? 
				if ( selected_colors[0].name === selected_colors[1].name ){

					//console.log('MISMO COLOR');
					selected_colors.length = 0; // reset the array to empty state.
					checkPieces();
					
				}else{

				
					//Se guarda en un array temporal las dos ultimas piezas selecionadas
					//No usamos el array selected_colors por que lo vaciamos antes de que termine la animacion y el activar el mouse no funcionará al no tener referencia de objeto.
					var temp_selected_colors = [{"First" : selected_colors[0] , "Second" : selected_colors[1]}];
					//disable mouse event temporaly to avoid a click before the animation is finished.
					temp_selected_colors[0].First.mouseEnabled = false;
					createjs.Tween.get(temp_selected_colors[0].First, {loop: false , override :false}).to({alpha: 1}, 500, createjs.Ease.Linear).call( function(){ temp_selected_colors[0].First.mouseEnabled = true;} );
					temp_selected_colors[0].Second.mouseEnabled = false;
					createjs.Tween.get(temp_selected_colors[0].Second, {loop: false , override :false}).to({alpha: 1}, 500, createjs.Ease.Linear).call( function(){ temp_selected_colors[0].Second.mouseEnabled = true;} );
					
					selected_colors.length = 0;//Reset array
					
				}

			}

}





/************************ SHOW CURRENT FPS (PERFOMANCE TRACKING) *****************************************//*****************************//**/

function setFpsLabel () {

		// add a text object to output the current FPS:
		fpsLabel = new createjs.Text("-- fps", "bold 1em Arial", "#FFF");
		stage.addChild(fpsLabel);
		fpsLabel.x = 10;
		fpsLabel.y = 20;
		fpsLabel.name = "fpslabel";

}

/************************ SHOW THE TIME GAME *****************************************//*****************************//**/

function setTimeClock () {


	
	console.log("setTimeClock : ");
	timeLabel = new createjs.Text();
	
	timeLabel.font = "1.5em Audiowide";
	timeLabel.text = "TIME";
	timeLabel.color = "white";
	timeLabel.textAlign = "center";
	timeLabel.x = stage.canvas.width - (timeLabel.getMeasuredWidth() * 3 ) ;
	timeLabel.y = 20 ; 
	timeLabel.name ="timelabel";
	stage.addChild(timeLabel);
	//creamos el reloj secundero y mostramos el resultado 
	var seconds=0;
	var minutes=0;
	timeInterval = setInterval(function(){
		seconds++;
		if (seconds>=60 ){ 
			seconds = 0; 
			minutes++;
		}
		if (seconds<10){
			timeLabel.text = "TIME \n\n" + minutes +":0" + seconds;
		}else{
			timeLabel.text = "TIME \n\n" + minutes +":" + seconds;
		}

	},1000);


	

}



/************************ SHUFFLE ARRAY : AUX FUNCTION *****************************************//*****************************//**/


function shuffleColours(arrayColours){


		//copiamos array de colores para no alterar el original.
		var temp_colours = arrayColours.slice(0);
		var shuffled_colours = new Array();
		var rand;

		for (var i = 0; i < arrayColours.length; i++) {

			r = Math.floor(Math.random() * temp_colours.length);
			shuffled_colours.push(temp_colours[r]);
			temp_colours.splice(r,1);
		}


		return shuffled_colours;

}


/************************ SHOW CURRENT FPS (PERFOMANCE TRACKING) *****************************************//*****************************//**/



function displayStartMsg () {

	
//An a container is created that contains 3 childs objects ( shape, 2 texts )

	var container = new createjs.Container();
	container.name = "displayStartMsgContainer";

	///draw a black square with opacity 
	var fadingRect = new createjs.Shape();
	fadingRect.graphics.beginFill("black").drawRect(0, 0, canvas.width, canvas.height);
	fadingRect.alpha = 0.9;

	//Text 1
	var startTaskText = new createjs.Text(INIT_GAME_MESSAGE, TITLE_FONTSIZE + " Audiowide", "white");
	startTaskText.lineWidth = document.body.clientWidth*(9/10);
	///set position text1
	startTaskText.lineHeight = LINE_HEIGHT;
	startTaskText.textAlign = "center";
	startTaskText.x = canvas.width/2;
	startTaskText.y = canvas.height/2 - startTaskText.getMeasuredHeight();
	//Text 2
	var nextText = new createjs.Text(INIT_GAME_SUB_MESSAGE, SECONDARY_FONTSIZE + " Audiowide", "white");
	nextText.lineWidth = document.body.clientWidth*(9/10);
	nextText.lineHeight = LINE_HEIGHT;
	nextText.textAlign = "center";
	nextText.x = canvas.width/2;
	nextText.y = canvas.height/2 + startTaskText.getMeasuredHeight()/2 + LINE_HEIGHT;
	

	
	container.addChild(fadingRect,startTaskText,nextText);
	stage.addChild(container);


	fadingRect.addEventListener('click', function(evt) { 

		console.log(evt.target.name+" : "+evt.eventPhase+" : "+evt.currentTarget.name)
		piecesContainer.uncache();//clean blur effect at cache canvas region
		stage.removeChild(container); 

		setTimeClock();
		
	 }, null, false, null, false);

		//Set blur effect to the container. Affect all container childs (puzzle pieces, even the the white pieces)
		///Add blur Filter
		applyBlurFilter( piecesContainer , 0, 0, stage.canvas.width, stage.canvas.height);
}



function displayEndGameMsg () {

		console.log("displayEndGameMsg")


		var container = new createjs.Container();
		//container.mouseChildren = false;
		container.name = "displayEndGameMsgContainer";
		
		var fadingRect = new createjs.Shape();
		fadingRect.name ="faddingrect";
		fadingRect.graphics.beginFill("black").drawRect(0, 0, canvas.width, canvas.height);
		fadingRect.alpha = 0.9;

		var completedText = new createjs.Text(END_GAME_MESSAGE, TITLE_FONTSIZE + " Audiowide", "white");
		completedText.name ="completedText";
		completedText.lineWidth = document.body.clientWidth*(9/10);
		completedText.textAlign = "center";
		completedText.lineHeight = LINE_HEIGHT;
		completedText.x = canvas.width/2;
		completedText.y = canvas.height/2 -completedText.getMeasuredHeight();

		var advanceText = new createjs.Text("RETRY", SECONDARY_FONTSIZE + " Audiowide", "white");
		advanceText.name ="advanceText";
		advanceText.lineWidth = document.body.clientWidth*(9/10);
		advanceText.textAlign = "center";
		advanceText.lineHeight = advanceText.getMeasuredHeight()*2;
		advanceText.x = canvas.width/2 ;
		advanceText.y = canvas.height/2 - advanceText.getMeasuredHeight()/2 + LINE_HEIGHT  ;
		
		//console.log("Width" + advanceText.getMeasuredHeight())

		var nextRect = new createjs.Shape();
		nextRect.name ="nextRect";
		nextRect.graphics.beginStroke("white").beginFill("black").drawRect(advanceText.x - advanceText.getMeasuredWidth() * 2     , advanceText.y - advanceText.regY , advanceText.getMeasuredWidth() *4  , advanceText.getMeasuredHeight());
		nextRect.alpha = 0.9;

		//retry button click
		container.addEventListener('click' , function(evt){ 
			console.log('click container')
			//console.log(evt.target.name+" : "+evt.eventPhase+" : "+evt.currentTarget.name);
		},false);

		nextRect.addEventListener('click', function(evt) { 
			evt.stopPropagation();
			//console.log(evt.target.name+" : "+evt.eventPhase+" : "+evt.currentTarget.name);

			console.log("click");
			//ticker();
			//piecesContainer.uncache();
			stage.removeChild(container);

			cleanStage();
			setFpsLabel();
			buildPieces();
			setTimeClock();

			
		 },false);
		
		container.addChild(fadingRect,completedText,nextRect,advanceText);
		stage.addChild(container);

		///Add blur Filter
		applyBlurFilter( piecesContainer, 0,0,stage.canvas.width,stage.canvas.height );

		//stage.update();
}



function checkPieces () {


		//Check if all white_pieces are hidden to know if the puzzle is finished.
		var count_alpha=0;

		for (var i = piecesContainer.getNumChildren() - 1; i >= 0; i--) {
			if ( piecesContainer.getChildAt(i).alpha === 0 ) {
				count_alpha++;
				}
		};

		if (count_alpha === colours.length) {
				setTimeout(function(){
					//createjs.Ticker.removeAllEventListeners();
					clearInterval( timeInterval ); //Stop Counter
					displayEndGameMsg();
				},1500)
			}

}



function applyBlurFilter ( displayObj , x, y, width, height) {

		displayObj.filters = [new createjs.BlurFilter(25, 25, 5),new createjs.ColorMatrixFilter(new createjs.ColorMatrix(60))];
		displayObj.cache( x, y, width, height );
	
}




function cleanStage ( ) {


		
		piecesContainer.uncache(); //Clean Blur on cache

		//Remove container childs
		for (var i =  piecesContainer.getNumChildren() - 1; i >= 0; i--) {
			 piecesContainer.getChildAt(i).removeAllEventListeners();
			 piecesContainer.removeChildAt(i);
		};
		//Remove container
		for (var i = stage.getNumChildren() - 1; i >= 0; i--) {
				stage.removeChildAt(i);
			
		};
}



window.onresize = function(){
		//reset canvas , radius circles meassures 
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
		console.log('resize');
		cleanStage();

		setFpsLabel();
		buildPieces();
		displayStartMsg();
}
