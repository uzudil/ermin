// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

// values in WORLD are: left,right,up,down
var WORLD = {
    "start": [null, "entryway", null, null],
    "entryway": ["start", "drawing_room", null, null],
    "drawing_room": ["entryway", "kitchen", null, "cellar"],
 	"kitchen": ["drawing_room", "garden", null, null],
 	"cellar": [null, "cellar2", "drawing_room", null],
 	"cellar2": ["cellar", "tunnel", null, "pipeline"],
 	"tunnel": ["cellar2", "tunnel2", null, null],
 	"tunnel2": ["tunnel", "earth", "garden2", null],
 	"garden": ["kitchen", "garden2", null, null],
 	"garden2": ["garden", "guesthouse", null, "tunnel2"],
 	"guesthouse": ["garden2", null, null, "earth"],
 	"earth": ["tunnel2", "earth2", "guesthouse", "chapel"],
 	"earth2": ["earth", null, null, "down"],
    "down": ["chapel", null, "earth2", "down2"],
    "down2": ["down3", null, "down", null],
	"down3": ["crypt3", "down2", "chapel", null],
	"pipeline": ["chasm", "pipeline2", "cellar2", "crypt"],
	"pipeline2": ["pipeline", "stairs", null, "crypt2"],
	"chasm": [null, "pipeline", null, "chasm2"],
	"chasm2": [null, "crypt", "chasm", null],
	"stairs": ["pipeline2", "chapel", null, "crypt3"],
	"chapel": ["stairs", "down", "earth", "down3"],
	"crypt": ["chasm2", "crypt2", "pipeline", null],
	"crypt2": ["crypt", "crypt3", "pipeline2", null],
	"crypt3": ["crypt2", "down3", "stairs", null]

};

var DESCRIPTIONS = {
    start: "The adventure begins...",
    entryway: "The Entryway",
    drawing_room: "The Drawing Room",
    kitchen: "The Cook's Palace",
    cellar: "Down in the Cellar",
    cellar2: "Down in the Cellar",
    tunnel: "An unused tunnel",
    tunnel2: "An unused tunnel",
    garden: "A sunny garden",
    garden2: "A sunny garden",
    guesthouse: "In the guest house",
    earth: "Earthworks",
    earth2: "Earthworks",
    down: "The Old Well",
    down2: "The Old Well",
    down3: "Beneath the Well",
    pipeline: "The leaky pipes",
    pipeline2: "The leaky pipes",
    chasm: "The great chasm",
    chasm2: "The great chasm",
    stairs: "Dusty service tunnels",
    chapel: "The Chapel",
	crypt: "Forgotten crypts",
	crypt2: "Forgotten crypts",
	crypt3: "Forgotten crypts"
};

// rooms cache
var ROOMS = {};

function get_room(name, after_fx) {
    if(ROOMS[name]) {
        after_fx(ROOMS[name]);
    } else {
        $.ajax({
            url: "data/rooms/" + name + ".json",
            dataType: "json",
            success: function(data) {
                ROOMS[name] = data;
                after_fx(data);
            }
        });
    }
}
