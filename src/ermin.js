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

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'menu');
game.state.add('game', GameState, false);
game.state.add('menu', MenuState, false);
game.state.add('intro', IntroState, true);
