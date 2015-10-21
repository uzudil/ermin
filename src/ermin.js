// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

var settings = JSON.parse(localStorage["ermin_settings"] || '{ "volume": 1 }');
var VOLUME = settings.volume; // 0-1

function get_saved_game() {
    return JSON.parse(localStorage["ermin"] || "{}");
}

function save_game(data) {
    localStorage["ermin"] = JSON.stringify(data);
}

function delete_saved_game() {
    delete localStorage["ermin"];
}

function get_query_param(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function toggle_volume() {
	if(VOLUME == 1) VOLUME = 0;
	else VOLUME = 1;
	this.game.sound.volume = VOLUME;
	settings["volume"] = VOLUME;
	localStorage["ermin_settings"] = JSON.stringify(settings);
	console.log("VOLUME=" + VOLUME);
}

// you can force canvas rendering via ?renderer=canvas
var renderer = get_query_param("renderer") == "canvas" ? Phaser.CANVAS : Phaser.AUTO;
var game = new Phaser.Game(800, 600, renderer, 'menu');
game.state.add('game', GameState, false);
game.state.add('menu', MenuState, false);
game.state.add('intro', IntroState, true);
