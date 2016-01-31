//Experiment description
//	Basica allocentric task
//	There are 8 start positions, 8 marks to designate goals.
//	Goal is positioned relative to the mark defined by the markaim 

var changeRot = true;
var misto = 0; // aktualni pozice v poli starts a marks 0-n

var starts = [	7, 	7, 	7, 	7,	1, 13,	7,	5,	1,	9,	5,	15,	1,	7,	3,	11,	13,	9,	3,	13,	11,	5,	15,	11];
var marks =  [	11,	11,	11, 11, 7, 5,	15,	11,	3,	15,	9, 15,	1,	13,	9,	11,	3,	1,	7,	5,	13,	9,	5,	1];

var cpressed = false; // jestli uz bylo zmacknuto c - aby neslo zmacknout g pred c
var fpressed = 0; // jestli uz zmacknuto f, aby druhe vypnulo zvuk
var probetime = 60;
var entered = true;

// NASTAVIT probe 5-8 a markaim 5 az 11
var probe = 99; // nechci probe
var markaim = 4; // vztah znacky a cil. Pozice cile se pocita mark + markaim
var casysum = 0;
var pouzitLPT = 1; // muzu zapis do paralelniho portu vypnout
var LPTadresa = 0x378; //0x2FF8

function init() {
	experiment.setMap("Test-PsuAVCR_04_30mA_cil AlloEgo");
}

function run() {
	if (experiment.isStarted()){
		experiment.setCollisionCylinder(20,200);
		experiment.setWalk(true);
		experiment.setTrackRate(0.05);
		experiment.setPlayerSpeed(3000);
		platform.get("plosina").doRotateTime(0,0,1);
		
		skryjvse();
		misto = 0;
		mark.get("Start"+starts[misto]).setVisible(true);
		preference.get("Aim"+getaim()).setVisible(false); // poprve cil nebude videt zobrazim ho pomoci v 
		mark.get("hvezdazluta").setVisible(false); 
		mark.get("hvezdamodra").setVisible(false);
		text.create(1, 10, 10, 255, 255,0, 3, "dojdete ke startu a zmacknete C"); // nazev aktivniho mista - zluta
		text.create(3, 10, 70, 255, 255,0, 2, "1/"+starts.length); // cislo trialu
		
		sendLPT(0);   // strobe off
	}
	// zmackne se kdyz subjekt dojde na start 
	if(key.pressed("c") && !cpressed){ 
	 
		// skryje start, ukaze znacku a aktivuje cil
		mark.get("Start"+starts[misto]).setVisible(false); // skryje start
		experiment.logToTrackLog("hidden: Start"+starts[misto]);
		mark.get("Mark"+marks[misto]).setVisible(true); // ukaze znacku
		experiment.logToTrackLog("visible: Mark"+marks[misto]);
		
		preference.get("Aim"+getaim()).setActive(true); // aktivuje cil
		preference.get("Aim"+getaim()).setVisible(false); // skryje cil
		preference.get("Aim"+getaim()).beepOff(true);    // cil nebude pipat
		cpressed = true;
		fpressed = 0;
		text.modify(1,"najdete cil");
		text.modify(3,(misto+1)+"/"+starts.length);
		casC = new Date().getTime() / 1000;
		debug.log("cas C: "+casC);
		entered = false;
		sendLPT(1); // strobe on
	}
	if(key.pressed("f") && cpressed){
		// zmackne se pri nalezeni cile, aby se objevil
		preference.get("Aim"+getaim()).setActive(true);     // aby piskal az tam clovek dojde
		preference.get("Aim"+getaim()).setVisible(true);
		preference.get("Aim"+getaim()).beepOff(fpressed>0);      // aby piskal az tam clovek dojde
		fpressed++;
		sendLPT(0); // strobe off
	}
	if(key.pressed("g") && cpressed && fpressed > 0){
		nextphase();
		text.modify(1,"dojdete ke startu a zmacknete C");
	}
	
	if(key.pressed("v")) {
		if(preference.get("Aim"+getaim()).isVisible()){
			preference.get("Aim"+getaim()).setVisible(false);
		} else {
			preference.get("Aim"+getaim()).setVisible(true);
		}
	}
	// klavesu o budu pouzivat na ukazani startu
	if(key.pressed("o")){ 
		
		if(mark.get("Start"+starts[misto]).isVisible()){
		  mark.get("Start"+starts[misto]).setVisible(false);
		}  else {
		  mark.get("Start"+starts[misto]).setVisible(true);
		}
  }
  
}

function nextphase(){
    mark.get("Mark"+marks[misto]).setVisible(false); // skryje znacku
	preference.get("Aim"+getaim()).setVisible(false); // skryje cil (pokud byl videt)
	preference.get("Aim"+getaim()).setActive(false); // deaktivuje cil 
	preference.get("Aim"+getaim()).beepOff(true);
	dalsimisto();
	cpressed = false;
	mark.get("Start"+starts[misto]).setVisible(true); // ukaze start
	experiment.logToTrackLog("visible: Start"+starts[misto]);
}

function dalsimisto() {
	misto ++;
	if (misto >= starts.length) {
		text.modify(1,"KONEC"); 
		experiment.setStop();
	} else {
		debug.log("misto "+misto+", starts.lenght "+starts.length);
	}
}

// vrati cislo aktualniho aim - podle globalnich promennych misto a markaim
function getaim() {
	var aim = marks[misto]+markaim;
	if (aim > 16) {aim -= 16; }
	if (aim < 0) {aim += 16; }
	return aim;
}

// skryje vsechny znacky a cile
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
