//Experiment description
//	Basic egocentric text
//	Goals are positioned relative to the starting poistion based on startaim variable

var changeRot = true;
var misto = 0; // aktualni pozice v poli starts a marks 0-n

var starts = [7, 7, 7, 7, 3, 11, 3, 7, 15, 3, 11, 15, 7, 11, 1, 11, 15, 9, 13, 5, 9, 1, 5, 13, 7];

var cpressed = false; // jestli uz bylo zmacknuto c - aby neslo zmacknout g pred c
var fpressed = 0; // jestli uz zmacknuto f, aby druhe vypnulo zvuk
var probetime = 60;
var entered = true;

// NASTAVIT probe 5-8 a startaim 5 az 11
var probe = 99; // nechci probe
var startaim = 6; // vztah znacky a cil. Pozice cile se pocita mark + markaim
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
		
		//hides all orientation points
		mark.get("hvezdazluta").setVisible(false); 
		mark.get("hvezdamodra").setVisible(false);
		
		mark.get("Start"+starts[misto]).setVisible(true);
		preference.get("Aim"+getaim()).setVisible(false); // poprve cil nebude videt zobrazim ho pomoci v 
		text.create(1, 10, 10, 255, 255,0, 3, "Dojdete ke startu a zmacknete C"); // nazev aktivniho mista - zluta
		text.create(3, 10, 50, 255, 255,0, 2, "1/"+starts.length); // cislo trialu
		
		sendLPT(0);   // strobe off
	}
	
	// zmackne se kdyz subjekt dojde na start 
	if(key.pressed("c") && !cpressed){ 
		// skryje start, ukaze znacku a aktivuje cil
		mark.get("Start"+starts[misto]).setVisible(false); // skryje start - nemuzu ho skryvat, nebylo by poznat, jak jsem tam sel
		experiment.logToTrackLog("hidden: Start"+starts[misto]);
		preference.get("Aim"+getaim()).setActive(true); // aktivuje cil
		preference.get("Aim"+getaim()).setVisible(false); // skryje cil
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
		preference.get("Aim"+getaim()).setActive(true);
		preference.get("Aim"+getaim()).setVisible(true);
		preference.get("Aim"+getaim()).beepOff(fpressed>0);
		fpressed++;
		sendLPT(0); // strobe off
	}
	// zmackne se pro dalsi fazi
	if(key.pressed("g") && cpressed && fpressed > 0){
		nextphase();
		text.modify(1,"dojdete ke startu a zmacknete C");
	}
	// zmackne se pro ukazani/skryti cile
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
		preference.get("Aim"+getaim()).setVisible(false); // skryje cil (pokud byl videt)
		preference.get("Aim"+getaim()).setActive(false); // deaktivuje cil 
		preference.get("Aim"+getaim()).beepOff(true);
		mark.get("Start"+starts[misto]).setVisible(false); // deaktivuje puvodni start
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
	var aim = starts[misto]+startaim;
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
		preference.get("Aim"+i).beepOff(true);
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
