// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

// values in WORLD are: left,right,up,down
var WORLD = {
    start: [null, "entryway", null, null],
    entryway: ["start", "drawing_room", null, null],
    drawing_room: ["entryway", "kitchen", null, "cellar"],
 	kitchen: ["drawing_room", null, null, null],
 	cellar: [null, "tunnel", "drawing_room", null],
 	tunnel: ["cellar", "tunnel2", null, null],
 	tunnel2: ["tunnel", null, null, null],
};

var DESCRIPTIONS = {
    start: "The adventure begins...",
    entryway: "The Entryway",
    drawing_room: "The Drawing Room",
    kitchen: "The Cook's Palace",
    cellar: "Down in the Cellar",
    tunnel: "An unused tunnel",
    tunnel2: "An unused tunnel",
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
