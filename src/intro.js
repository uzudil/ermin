// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

var IntroState = function(game) {

};

IntroState.prototype.preload = function() {
    this.game.load.image('heads', 'data/heads.png');
    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    window.onresize = bind(this, this.windowResized);
    this.windowResized();
};

IntroState.prototype.windowResized = function() {
    var w, h;
    w = window.innerWidth;
    h = window.innerHeight;
    this.game.scale.setMinMax(w, h, w, h);
};

IntroState.prototype.create = function() {
    this.game.stage.backgroundColor = '#000000';
    this.logo = this.game.add.sprite(this.game.width/2, this.game.height/2, 'heads');
    this.logo.tint = 0x888888;
    this.logo.alpha = 0;
    this.logo.anchor.x = 0.5;
    this.logo.anchor.y = 0.5;
    this.logo.scale.x = 0.5;
    this.logo.scale.y = 0.5;
    this.dir = 1;
};

IntroState.prototype.update = function() {
    this.logo.alpha += this.game.time.elapsed * 0.00035 * this.dir;
    if(this.dir == 1) {
        if(this.logo.alpha >= 1) {
            this.logo.alpha = 1;
            this.dir = -1;
        }
    } else {
        if(this.logo.alpha <= 0) {
            this.logo.alpha = 0;
            this.game.state.start("menu");
        }
    }
    if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
        this.input.keyboard.isDown(Phaser.Keyboard.ESC) ||
        this.input.keyboard.isDown(Phaser.Keyboard.ENTER) ||
        this.game.input.activePointer.isDown) {
        this.game.state.start("menu");
    }
};
