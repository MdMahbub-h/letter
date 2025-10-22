var sound, music, corrSound, loseSound;
var states = [easy, normal, hard];
var g;

$(function(){
	sound = new Audio("assets/sounds/click.wav");
	music = new Audio("assets/sounds/bg_music_3.ogg");
	corrSound = new Audio("assets/sounds/correct.wav");
	loseSound = new Audio("assets/sounds/wrong.wav");
	music.loop = true;
	music.autoplay = true;
	$(".game-btn").on("click", function(){sound.play()});
});

function startGame(mode){

	setTimeout(function(){
		$(".mode-screen").slideUp();
		$("#loading").val(0).hide();
	},1000);

	var val = 0;
	$("#loading").show();
	var t = setInterval(()=>{
		val+=10;
		$("#loading").val(val);
		if(val>=100){
			clearInterval(t);
		}
	},10);

	g = new Game([...states[mode]], gTime);
	g.newGame();
}


class Game{
	constructor(states, time) {
		this.states = states;
		this.currState = [];
		this.candrop = true;
		this.dropbox;
		this.dragbox;
		this.score = 0;
		this.timer;
		this.sTime = time;
		this.time = time;
		this.preload();
	}

	preload(){
		this.dropbox = $(".drop-boxes")[0];
		this.dragbox = $(".drag-boxes")[0];
		$("#score").html("Score: "+this.score);
		var mnt = this.time/60>=0?Math.floor(time/60):null; 
		var sec = this.time%60;
		$("#time").html("Time: "+mnt+":"+sec);
	}

	newGame(){
		this.candrop = true;
		clearInterval(this.timer);
		this.setTimer(this.sTime);

		this.currState = this.states[Math.floor(Math.random()*this.states.length)];
		var stateIndex = this.states.indexOf(this.currState);
		this.states.splice(stateIndex, 1);
		this.start(this.currState);
	}

	start(state){
		var letters = state[0].split("");
		letters = this.shuffle(letters, state[0]);

		$("#display-image").attr("src", state[1]);

		var dropboxes = "";
		var dragboxes = "";

		for (var i = 0; i<letters.length; i++) {
			dropboxes += `<div class="drop-box" id="drop_${i}" ondrop="g.drop(event)" ondragover="g.allowDrop(event)"></div>`;
			dragboxes += `<div id="letter_${i}" class="drag-box letters" draggable="true" ondragstart="g.drag(event)">${letters[i]}</div>`;
		}
		$(this.dropbox).html(dropboxes);
		$(this.dragbox).html(dragboxes);
	}

	shuffle(arr, str){
    let ctr = arr.length;
    let temp;
    let index;
    
	  while (ctr > 0) {
	    index = Math.floor(Math.random() * ctr);
	    ctr--;

	    temp = arr[ctr];
	    arr[ctr] = arr[index];
	    arr[index] = temp;
    }

    if(arr.join("")==str){
    	this.shuffle(arr,str);
    }

    return arr;
	}

	setTimer(time) {
		this.time = time;
		this.timer = setInterval(()=>{
			if(this.time>0){
				this.time -= 1;
				var mnt = this.time/60>=0?Math.floor(time/60):null; 
				var sec = this.time%60;
				$("#time").html("Time: "+mnt+":"+sec);
			}else{
				clearInterval(this.timer);
				this.fail();
			}
		},1000);
	}

	correct(){
		corrSound.play();
		this.score += 10;	
		$("#score").html("Score: "+this.score);
		this.candrop = false;
		clearInterval(this.timer);
		$(this.dragbox).html('<div class="result"><img src="assets/ui/correct.png" alt="correct"> Correct!</div>');
		if(this.states.length>0){
			$("#retryBtn").hide();
			$("#nextBtn").show();
			$(".btm-menu").fadeIn();
		}else{
			setTimeout(()=>this.openLevelUpMenu(),200);
		}
	}

	openLevelUpMenu(){
		$("#gScore").html(`Your Score: ${this.score}`);
		$("#levelupModal").fadeIn();
	}

	wrong() {
		loseSound.play();
		this.score -= 10;
		this.candrop = false;
		$("#score").html("Score: "+this.score);
		clearInterval(this.timer);
		$("#nextBtn").hide();
		$("#retryBtn").show();
		$(".btm-menu").fadeIn(); 
		$(this.dragbox).html('<div class="result"><img src="assets/ui/wrong.png" alt="correct"> Wrong!</div>');
	}

	fail(){
		loseSound.play();
		this.score -= 10;	
		this.candrop = false;
		$("#score").html("Score: "+this.score);
		clearInterval(this.timer);
		$("#nextBtn").hide();
		$("#retryBtn").show();
		$(".btm-menu").fadeIn();
		$(this.dragbox).html('<div class="result"><img src="assets/ui/wrong.png" alt="fail"> Time over!</div>');
	}

	next(){
		$(".btm-menu").fadeOut();
		this.newGame();
	}

	retry(){
		$(".btm-menu").fadeOut();
		this.candrop = true;
		clearInterval(this.timer);
		this.setTimer(this.sTime);	
		this.start(this.currState);
	}

	allowDrop(event) {
  	event.preventDefault();
	}

	drag(event) {
	  event.dataTransfer.setData("text", event.target.id);
	}

	drop(event) {
	  event.preventDefault();
	  var output = "";
	  if (this.candrop) {
		  if(!event.currentTarget.querySelector("div")){
		  	var data = event.dataTransfer.getData("text");
		  	$(event.target).append($("#"+data));
		  	var child = $(event.currentTarget).parent().children();
		  	for (var i = 0; i< child.length; i++) {
		  		var val = $(child[i]).children(".letters").html();
		  		if(!val){
		  			return;
		  		}else{
		  			output += val;
		  		}
		  	}
		  	if(output == this.currState[0]){
		  		this.correct();
		  	}else{
		  		this.wrong();
		  	}
	  	}
	  }
	}

	pauseGame(){
		clearInterval(this.timer);
		$("#pauseModal").fadeIn();
	}

	resumeGame(){
		this.setTimer(this.time);
		$("#pauseModal").fadeOut();
	}

	openMenu(){
		clearInterval(this.timer);
		$("#menuModal").fadeIn();
	}

	closeMenu(){
		this.setTimer(this.time);
		$("#menuModal").fadeOut();
	}
}

function backToHome(){
	$(".home-screen").fadeIn();
}

function menuScreen(){
	$(".btm-menu").fadeOut();
	$("#menuModal").fadeOut();
	$("#levelupModal").fadeOut();
	$(".mode-screen").fadeIn();
	$(".home-screen").fadeIn();
}

function modeScreen(){
	$("#infoBox").hide();
	$("#setBox").hide();
	$(".home-screen").slideUp();
}

function showInfo(){
	$("#setBox").hide();
	$("#infoBox").fadeToggle();
}

function showSettings(){
	$("#infoBox").hide();
	$("#setBox").fadeToggle();
}

function soundToggle(){
	if(sound.muted){
		sound.muted=false;
		corrSound.muted=false;
		loseSound.muted=false;
		$(".sound-btn img").attr("src", "assets/ui/sound_on.png");
	}else{
		sound.muted=true;
		corrSound.muted=true;
		loseSound.muted=true;
		$(".sound-btn img").attr("src", "assets/ui/sound_off.png");
	}
}

function musicToggle(){
	if(music.paused){
		music.play();
		$(".music-btn img").attr("src", "assets/ui/music_on.png");
	}else{
		music.pause();
		$(".music-btn img").attr("src", "assets/ui/music_off.png");
	}
}