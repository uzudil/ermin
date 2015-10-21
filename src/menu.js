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

    this.ermin = this.game.add.sprite(0, 0, "ermin");
    this.ermin.anchor.x = 0.5;
    this.ermin.anchor.y = 0.5;
    this.ermin["dir"] = [1, 1];

    this.logo = this.game.add.sprite(0, 0, "ermin");
    this.logo.anchor.x = 0.5;
    this.logo.anchor.y = 0.5;
    this.logo.scale.x = 0.5;
    this.logo.scale.y = 0.5;
    this.logo.x = this.game.width / 2;
    this.logo.y = 124;

    var my = ((this.game.height/32)|0) * 32;
    this.copyright = this.game.add.bitmapText(this.game.width/2, my - 8, 'ermin', "2015 (c) Heads on Stick, Inc.", 8);
    this.copyright.anchor.x = 0.5;
    this.copyright.anchor.y = 0.5;

    this.volume_message = this.game.add.bitmapText(this.game.width/2, this.game.height - 120, 'ermin', "Q - toggle music", 8);
    this.volume_message.anchor.x = 0.5;
    this.volume_message.anchor.y = 0.5;

    this.start_shadow = this.game.add.bitmapText(this.game.width/2 + 3, this.game.height - 150 + 3, 'ermin', "Start Game", 32);
    this.start_shadow.anchor.x = 0.5;
    this.start_shadow.anchor.y = 0.5;
    this.start_shadow.tint = 0x000000;

    this.start = this.game.add.bitmapText(this.game.width/2, this.game.height - 150, 'ermin', "Start Game", 32);
    this.start.anchor.x = 0.5;
    this.start.anchor.y = 0.5;
    this.start["game"] = this.game;
    this.start.inputEnabled = true;
    this.start.events.onInputDown.add(start_game, this);
    this.start.events.onInputUp.add(start_game, this);
    this.start.events.onInputOver.add(start_in, this);
    this.start.events.onInputOut.add(start_out, this);


    for(var x = 0; x < this.game.width; x+= 32) {
        this.game.add.sprite(x, 0, 'sprites', "wall1");
        this.game.add.sprite(x, my, 'sprites', "wall1");
    }
    for(var y = 32; y < this.game.height - 32; y+= 32) {
        this.game.add.sprite(0, y, 'sprites', "wall1");
        this.game.add.sprite(this.game.width - 32, y, 'sprites', "wall1");
    }

    for(var x = this.game.width/2 - 200; x < this.game.width/2 + 200; x+= 16) {
        this.game.add.sprite(x, this.game.height / 2, 'sprites', "brick2");
    }
    this.player = this.game.add.sprite(this.game.width/2 - 200 + 16, this.game.height / 2 - 48, 'sprites', "ermin");
    this.player.anchor.x = 0.5;
    this.player.anchor.y = 0;
    this.player.animations.add("walk", ["ermin1", "ermin", "ermin2"], 10, true, false);
    this.player.animations.play("walk");
    this.player["dir"] = 1;


    this.enemies = [];
    for(var i = 0; i < 3; i++) {
        var enemy = this.game.add.sprite(Math.random() * this.game.width - 64 + 32, Math.random() * this.game.height - 64 + 32, 'sprites', "butterfly1");
        this.game.physics.enable(enemy, Phaser.Physics.ARCADE);
        enemy.body.allowGravity = ENEMIES["butterfly1"].gravity;
        enemy.start_key = "butterfly1";
        enemy.animations.add("walk", ENEMIES["butterfly1"].seq, 10, true, false);
        enemy.animations.play("walk");
        this.enemies.push(enemy);
    }

	this.game.input.keyboard.addKey(Phaser.Keyboard.Q).onUp.add(toggle_volume);

    // music
    this.music = this.game.add.audio('music');
	this.game.sound.volume = VOLUME;
    this.music.loop = true;
    this.music.play();
};

function start_game(item) {
    this.music.loop = false;
    this.music.stop();
    item.game.state.start("game");
}

function start_in(item, pointer) {
    item.x += 2;
    item.y += 2;
    if(pointer != item.game.input.mousePointer) {
        start_game(item);
    }
}

function start_out(item) {
    item.x -= 2;
    item.y -= 2;
}

MenuState.prototype.update = function() {
    var gw = this.game.width;
    var ew = this.ermin.width;
    var gh = this.game.height;
    var eh = this.ermin.height;

    var speed = this.game.time.elapsed * 0.1;
    if(this.ermin.dir[0] == 1) {
        this.ermin.position.x += speed;
        if(this.ermin.position.x >= gw) {
            this.ermin.dir[0] = -1;
        }
    } else {
        this.ermin.position.x -= speed;
        if(this.ermin.position.x < 0) {
            this.ermin.dir[0] = 1;
        }
    }
    if(this.ermin.dir[1] == 1) {
        this.ermin.position.y += speed;
        if(this.ermin.position.y >= gh) {
            this.ermin.dir[1] = -1;
        }
    } else {
        this.ermin.position.y -= speed;
        if(this.ermin.position.y < 0) {
            this.ermin.dir[1] = 1;
        }
    }

    this.ermin.rotation += this.ermin.dir[0] * this.ermin.dir[1] * 0.005;
    this.ermin.scale.x += this.ermin.dir[0] * 0.005;
    this.ermin.scale.y += this.ermin.dir[1] * 0.005;
    this.ermin.alpha = this.ermin.x / gw * this.ermin.y / gh * 0.05 + 0.05;
//    var s = Math.sin(this.ermin.position.x / 100)/0.5 + 0.5;
//    this.ermin.scale.x = 1.2;
//    this.ermin.scale.y = 1.2;

    var angle = this.game.time.now * 0.001;
    var r = (((Math.sin(angle) * 128) + 128)|0);
    var g = (((Math.sin(angle * 0.5) * 128) + 128)|0);
    var b = (((Math.sin(angle * 2) * 128) + 128)|0);
    var color = (r << 16) + (g << 8) + b;
    this.logo.tint = color;
    this.start.tint = color;

    this.player.x += this.player.dir * this.game.time.elapsed * 0.1;
    if((this.player.dir == 1 && this.player.x >= this.game.width/2 + 200 - 16) ||
        (this.player.dir == -1 && this.player.x <= this.game.width/2 - 200 + 16)) {
        this.player.dir *= -1;
        this.player.scale.x = this.player.dir;
    }

    for(var i = 0; i < this.enemies.length; i++) {
        var en = ENEMIES[this.enemies[i].start_key];
        en.move(this, this.enemies[i], en);
    }
};
