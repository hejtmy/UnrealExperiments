//Experiment description
//There are total od 48 goals. IN the beginning they are set 
//Goal is positioned relative to the  defined by the markaim and its really close to it - basically CuedTask inBVA
var changeRot = true;
var trialIndex = 0; // aktualni pozice v poli starts a marks 0-n
var currentGoal = 0;
var starts = [	4, 	7, 	2, 	11, 3, 11, 	3, 	7, 	15, 3, 	11, 15, 7, 	11, 1, 	11, 15, 9, 13,	 5, 9, 	1,	 5, 13, 7,	7, 	5, 	3, 	9,	1, 13,	7,	5,	1,	9,	5,	15,	1,	7,	3,	11,	13,	9,	3,	13,	11,	5,	15,	11];// , 15, 12, 1, 16 seznam startu, jak jdou za sebou , 10, 8, 15, 14, 7
var marks =  [	11,	11,	11, 11, 7, 5,	15,	11,	3,	15,	9, 	15,	1,	13,	9,	11,	3,	1,	7,	5,	13,	9,	5,	1];
var egoallo = ["ego","ego","ego","ego","allo","allo","allo","allo","ego","allo","ego","allo","allo","allo","ego","allo","ego","allo","ego","allo","ego","allo","ego","ego","allo","allo","allo","ego","ego","ego","allo","ego","ego","allo","ego","allo","ego","ego","ego","allo","ego","allo","allo","ego","ego","allo","allo","allo"];
var allocentricRelation = 4; // vztah znacky a cil. Pozice cile se pocita mark + markaim
var trialType = "";
var allocentricTrialIndex = -1; //important as the marks have different size then starts - used in GetCurrentGoal(), negative as we increment when the experiment starts
var egocentricRelation = 6;

var trialInitiated = false; // jestli uz bylo zmacknuto c - aby neslo zmacknout g pred c
var trialFinished = false; // jestli uz zmacknuto f, aby druhe vypnulo zvuk
var probetime = 60;
var entered = true;

// NASTAVIT probe 5-8 a markaim 5 az 11
var probe = 99; // nechci probe

var casysum = 0;
var pouzitLPT = 1; // muzu zapis do paralelniho portu vypnout
var LPTadresa = 0x378; //0x2FF8

var pouzitLPT = false;

function init() {
	experiment.setMap("Test-PsuAVCR_04_30mA_cil_AlloEgo_lukas");
}

function run() {
	if (experiment.isStarted()){
		Setup();
		trialIndex = 0;
		TrialSetup();
		sendLPT(0);
	}
	
	//happens everytime person reaches a goal
	if (preference.get("Aim"+currentGoal).entered()){
		GoalEntered();
	}
	if (key.pressed("c") && !trialInitiated){ // zmackne se kdyz subjekt dojde na start 
		TrialStart();
	}
	// zmackne se pri nalezeni cile, aby se objevil
	if (key.pressed("f") && trialInitiated && !trialFinished){
		TrialFinish();
	}
	// zmackne se pro dalsi fazi
	if (key.pressed("g") &&  trialFinished){
		NextTrial();
	}
	// zmackne se pro ukazani/skryti cile
	if (key.pressed("v")) {
		if(preference.get("Aim"+currentGoal).isVisible()){
			preference.get("Aim"+currentGoal).setVisible(false);
		} else {
			preference.get("Aim"+currentGoal).setVisible(true);
		}
	}
	// klavesu o budu pouzivat na ukazani startu
	if (key.pressed("o")){ 
		if(mark.get("Start"+starts[trialIndex]).isVisible()){
			mark.get("Start"+starts[trialIndex]).setVisible(false);
		}  else {
			mark.get("Start"+starts[trialIndex]).setVisible(true);
		}
	} 
	if (key.pressed("p")){
		PlaySound("GoalFound");
	}
	
	//if at any time the time to the goal is larger than 30 s we display it
	if ((new Date().getTime() / 1000 - casC) > 60) {preference.get("Aim"+currentGoal).setVisible(true)};
}
function TrialSetup(){
  trialInitiated = false;
	text.modify(1,"Dojdete ke startu a stisknete C");
	mark.get("Start"+starts[trialIndex]).setVisible(true); // show start start
	experiment.logToTrackLog("visible: Start"+starts[trialIndex]);
	currentGoal = GetCurrentGoal();
}
function TrialStart(){
	// skryje start, ukaze znacku a aktivuje cil
	mark.get("Start"+starts[trialIndex]).setVisible(false); // skryje start
	experiment.logToTrackLog("hidden: Start"+starts[trialIndex]);
	if (GetTrialType() == "allo"){
		mark.get("Mark"+marks[allocentricTrialIndex]).setVisible(true); // ukaze znacku
	}
	experiment.logToTrackLog("visible: Mark"+marks[allocentricTrialIndex]);
	preference.get("Aim"+currentGoal).setActive(true); // aktivuje cil
	
	//timer.set("timelimit"+trialIndex,60);     // zadny casovy limit
	
	text.modify(1,"Najdete co nejrychleji cil");
	text.modify(3,(trialIndex+1) + "/" + starts.length);
	casC = new Date().getTime() / 1000;
	debug.log("cas C: "+casC);
	sendLPT(1);
	entered = false;
	trialInitiated = true;
	trialFinished = false;
}
function TrialFinish(){
	sendLPT(0);
  text.modify(1,"Cil nalezen!");
	preference.get("Aim"+currentGoal).setVisible(true);
	if (GetTrialType() == "ego"){
		mark.get("Start"+marks[trialIndex]).setVisible(true); // ukaze start
	}
	PlaySound("GoalFound");
	//preference.get("Aim"+currentGoal).beepOff(false);      // aby piskal az tam clovek dojde
	trialFinished = true;
  casEnter = Math.ceil(new Date().getTime()/ 1000 - casC);
	debug.log("cast vstupu: "+casEnter);
	casysum += casEnter;
	text.modify(2,casEnter+" s");
	text.modify(3,(trialIndex+1)+"/"+starts.length+", " + "prumerny cas: " + Math.ceil(casysum/(trialIndex+1)) + " s");
}

function NextTrial(){
	TrialClose();
	trialIndex ++;
	CheckForExperimentEnd();
	debug.log("trialIndex "+trialIndex+", starts.lenght "+starts.length);
	TrialSetup();
}

function TrialClose(){
	//inactivates previous goals
	preference.get("Aim"+currentGoal).setActive(false); 
	preference.get("Aim"+currentGoal).setVisible(false);
	preference.get("Aim"+currentGoal).beepOff(true);
	if (GetTrialType() == "allo"){
		mark.get("Mark"+marks[allocentricTrialIndex]).setVisible(false); // skryje znacku 
	}
	preference.get("Aim"+currentGoal).setVisible(false);
	preference.get("Aim"+currentGoal).beepOff(true);
}

function GoalEntered(){
	if(entered==false){
	 TrialFinish();
	 preference.get("Aim"+currentGoal).beep(1);
	 entered = true;
	}
}
function GetCurrentGoal() {
	if (GetTrialType() == "ego"){
		var goal = starts[trialIndex] + egocentricRelation;
	} else {
	  allocentricTrialIndex++;
		var goal = marks[allocentricTrialIndex] + allocentricRelation;
		
	}
	if (goal > 16) {goal -= 16; }
	if (goal < 0) {goal += 16; }
	return goal;
}
function GetTrialType(){
	return egoallo[trialIndex];
}
function CheckForExperimentEnd() {
	if (trialIndex >= starts.length) {
		text.modify(1,"KONEC"); 
		experiment.setStop();
	}
}
function Setup(){
	experiment.setCollisionCylinder(20,200);
	experiment.setWalk(true);
	experiment.setTrackRate(0.05);
	experiment.setPlayerSpeed(3000);
	platform.get("plosina").doRotateTime(0,0,1);
	skryjvse();
	text.create(1, 10, 10, 255, 255,0, 3, ""); //Messages for the participant
	text.create(2, 800, 10, 255, 255,255, 3, ""); // cas do cile
	text.create(3, 10, 70, 255, 255,0, 2, ""); // cislo trialu
}
function skryjvse(){
	for(i = 1; i <= 16; i++){
		mark.get("Mark"+i).setVisible(false);	
		mark.get("Mark"+i).setActive(false);
		mark.get("Mark"+i).setAttached(false);
		  
		mark.get("Start"+i).setVisible(false);	
		mark.get("Start"+i).setActive(false);
		mark.get("Start"+i).setAttached(false);
		
		preference.get("Aim"+i).setVisible(false);
		preference.get("Aim"+i).setActive(false);
		preference.get("Aim"+i).setAttached(false);
	}
	mark.get("hvezdazluta").setVisible(false); 
	mark.get("hvezdamodra").setVisible(false);
}

function sendLPT(on){  //17.4.2015 - kvuli EEG synchronizaci
	if(pouzitLPT){
		if(on) {
			experiment.sendDataToLpt(LPTadresa,255);
			experiment.sendDataToLpt(LPTadresa+2,1);   // strobe on
			debug.log("LPT strobe on");
		} else {
			experiment.sendDataToLpt(LPTadresa,4);
			experiment.sendDataToLpt(LPTadresa+2,0); // strobe off
			debug.log("LPT strobe off");
		} 
	}
}

function PlaySound(what){
  if (what == "GoalFound"){
    mark.get("SoundGoalFound").beepOff(true);
    mark.get("SoundGoalFound").beep(1);
  }
}