// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

var MenuState = function(game) {

};

MenuState.prototype.preload = function() {
    this.game.load.image('ermin', 'data/ermin.png');
    this.game.load.bitmapFont('ermin', 'data/ermin/font.png', 'data/ermin/font.fnt');
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
    this.logo.y = 100;

    this.copyright = this.game.add.bitmapText(this.game.width/2, 200, 'ermin', "2015 (c) Heads on Stick, Inc.", 8);
    this.copyright.anchor.x = 0.5;
    this.copyright.anchor.y = 0.5;

    this.start = this.game.add.bitmapText(this.game.width/2, this.game.height - 150, 'ermin', "Start Game", 32);
    this.start.anchor.x = 0.5;
    this.start.anchor.y = 0.5;
    this.start["game"] = this.game;
    this.start.inputEnabled = true;
    this.start.events.onInputDown.add(start_game, this);
    this.start.events.onInputUp.add(start_game, this);
    this.start.events.onInputOver.add(start_in, this);
    this.start.events.onInputOut.add(start_out, this);
};

function start_game(item) {
    item.game.state.start("game");
}

function start_in(item) {
    item.tint = 0x8080ff;
}

function start_out(item) {
    item.tint = 0x808080;
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
};
