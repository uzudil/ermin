// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

// main menu
var MenuState = function(game) {

};

MenuState.prototype.preload = function() {
    this.game.load.image('ermin', 'data/ermin.png');
    this.game.load.bitmapFont('ermin', 'data/ermin/font.png', 'data/ermin/font.fnt');
    this.game.load.atlas('sprites', 'data/tex.png?cb=' + Date.now(), 'data/tex.json?cb=' + Date.now(), Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    this.game.load.audio('music', 'data/ermin-intro.mp3?cb=' + Date.now());
    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    window.onresize = bind(this, this.windowResized);
    this.windowResized();
};

MenuState.prototype.windowResized = function() {
    var w, h;
    w = window.innerWidth;
    h = window.innerHeight;
    this.game.scale.setMinMax(w, h, w, h);
};


MenuState.prototype.create = function() {
    this.game.stage.backgroundColor = '#111111';

    this.logo = this.game.add.sprite(0, 0, "ermin");
    this.logo.anchor.x = 0.5;
    this.logo.anchor.y = 0.5;
    this.logo.scale.x = 0.25;
    this.logo.scale.y = 0.25;
    this.logo.x = this.game.width / 2;
    this.logo.y = 80;

    var t = this.game.add.bitmapText(this.game.width/2, 160, 'ermin',
			"Ermin's house is haunted by a strange energy.\n" +
			"Find the source of the problem and restore his\n" +
			"peaceful house.\n\n" +
			"Along the way, avoid the monsters and nasty\n" +
			"traps brought to life by this mysterious force.\n\n" +
			"2015 (c) HoS Inc", 16);
    t.anchor.x = 0.5;
    t.anchor.y = 0;

    this.volume_message = this.game.add.bitmapText(this.game.width/2, this.game.height - 120, 'ermin', "Q - toggle music", 16);
    this.volume_message.anchor.x = 0.5;
    this.volume_message.anchor.y = 0.5;

    this.start_shadow = this.game.add.bitmapText(this.game.width/2 + 3, this.game.height/2 + 60 + 3, 'ermin', "Press SPACE to start", 16);
    this.start_shadow.anchor.x = 0.5;
    this.start_shadow.anchor.y = 0.5;
    this.start_shadow.tint = 0x000000;

    this.start = this.game.add.bitmapText(this.game.width/2, this.game.height/2 + 60, 'ermin', "Press SPACE to start", 16);
    this.start.anchor.x = 0.5;
    this.start.anchor.y = 0.5;
    this.start["game"] = this.game;
    this.start.inputEnabled = true;
    this.start.events.onInputDown.add(this.start_game, this);
    this.start.events.onInputUp.add(this.start_game, this);
    this.start.events.onInputOver.add(this.start_in, this);
    this.start.events.onInputOut.add(this.start_out, this);

	this.game.input.keyboard.addKey(Phaser.Keyboard.Q).onUp.add(toggle_volume);
	this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onUp.add(function() {
		this.start_game();
	}, this);

    // music
    this.music = this.game.add.audio('music');
	this.game.sound.volume = VOLUME;
    this.music.loop = true;
    this.music.play();
};

MenuState.prototype.start_game = function() {
    this.music.loop = false;
    this.music.stop();
    this.game.state.start("game");
};

MenuState.prototype.start_in = function(item, pointer) {
    item.x += 2;
    item.y += 2;
	console.log("input=", pointer, " vs mouse=", item.game.input.mousePointer);
    if(pointer != this.game.input.mousePointer) {
        this.start_game();
    }
};

MenuState.prototype.start_out = function(item) {
    item.x -= 2;
    item.y -= 2;
};

MenuState.prototype.update = function() {
    var angle = this.game.time.now * 0.001;
    var r = (((Math.sin(angle) * 128) + 128)|0);
    var g = (((Math.sin(angle * 0.5) * 128) + 128)|0);
    var b = (((Math.sin(angle * 2) * 128) + 128)|0);
    var color = (r << 16) + (g << 8) + b;
    this.logo.tint = color;
    this.start.tint = color;
};
