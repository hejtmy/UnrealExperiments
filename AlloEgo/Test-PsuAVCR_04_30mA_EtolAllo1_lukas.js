//Experiment description
//There are 8 start positions, 8 marks to designate goals.
//Goal is positioned relative to the mark defined by the markaim 

var changeRot = true;
var misto = 0; // aktualni pozice v poli starts a marks 0-n

var starts = [9, 7,  8,  9, 7,  3, 12, 2 , 11, 7, 16, 14, 8, 6, 10, 4, 14];
var marks =  [11, 11, 11, 11, 9,  3, 6, 15 , 10, 4, 2, 12, 10, 1, 10, 4, 12];

var cpressed = false; // jestli uz bylo zmacknuto c - aby neslo zmacknout g pred c
var fpressed = 0; // jestli uz zmacknuto f, aby druhe vypnulo zvuk
var probetime = 60;
var entered = true;

// NASTAVIT probe 5-8 a markaim 5 az 11
var probe = 20; // nechci probe
var markaim = 11; // vztah znacky a cil. Pozice cile se pocita mark + markaim
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
		//text.create(2, 800, 10, 255, 255,255, 3, ""); // cas do cile
		text.create(3, 10, 70, 255, 255,0, 2, "1/"+starts.length); // cislo trialu
		
		sendLPT(0);   // strobe off
	}
	
	/*  nechci nic delat kdyz clovek dojde do cile
	if(preference.get("Aim"+getaim()).entered()){
		preference.get("Aim"+getaim()).setActive(false); // deaktivuje cil
		preference.get("Aim"+getaim()).beepOff(false); 
		preference.get("Aim"+getaim()).beep(1);
		text.modify(1,"rozhlednete se a zmacknete g");
		if(entered==false){
			casEnter = Math.ceil(new Date().getTime()/ 1000 - casC);
			debug.log("cast vstupu: "+casEnter);
			casysum += casEnter;
			text.modify(2,casEnter+" s");
			text.modify(3,(misto+1)+"/"+starts.length+", " + "prumerny cas: " + Math.ceil(casysum/(misto+1)) + " s");
			entered = true;
		}
	}
  */
  
	if(key.pressed("c") && !cpressed){ 
	  // zmackne se kdyz subjekt dojde na start 
	  // skryje start, ukaze znacku a aktivuje cil
		mark.get("Start"+starts[misto]).setVisible(false); // skryje start
		experiment.logToTrackLog("hidden: Start"+starts[misto]);
		mark.get("Mark"+marks[misto]).setVisible(true); // ukaze znacku
		experiment.logToTrackLog("visible: Mark"+marks[misto]);
		if(misto != probe){
			preference.get("Aim"+getaim()).setActive(true); // aktivuje cil
		} else {
			timer.set("probe",probetime);
		}
		//timer.set("timelimit"+misto,60);     // zadny casovy limit
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
		//text.modify(2,""); //text 2 nepouzivam
		text.modify(1,"dojdete ke startu a zmacknete C");
	}
	
	if(key.pressed("v")) {
		if(preference.get("Aim"+getaim()).isVisible()){
			preference.get("Aim"+getaim()).setVisible(false);
		} else {
			preference.get("Aim"+getaim()).setVisible(true);
		}
	}
	if(key.pressed("o")){ // klavesu o budu pouzivat na ukazani startu
		
		if(mark.get("Start"+starts[misto]).isVisible()){
		  mark.get("Start"+starts[misto]).setVisible(false);
		}  else {
		  mark.get("Start"+starts[misto]).setVisible(true);
		}
  }
  
}

// vrati cislo aktualniho aim - podle globalnich promennych misto a markaim
function getaim() {
	var aim = marks[misto]+markaim;
	if (aim > 16) {aim -= 16; }
	if (aim < 0) {aim += 16; }
	return aim;
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
function timerTask(name) {	
	if (name == "probe"){ // zacatek zvuku
	  mark.get("Mark1").beep(5);
	  timer.set("probe2",5);
	}
	if(name == "probe2"){ // konec zvuku, dalsi faze
		nextphase();
	}
	if(name == "timelimit"+misto && entered == false){ // konec zvuku, dalsi faze
		preference.get("Aim"+getaim()).setVisible(true);
		text.modify(1,"cil viditelny");
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
