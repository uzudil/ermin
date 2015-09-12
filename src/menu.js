// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

var MenuState = function(game) {

};

MenuState.prototype.preload = function() {
    this.game.load.image('ermin', 'data/ermin.png');
    this.game.load.bitmapFont('ermin', 'data/ermin/font.png', 'data/ermin/font.fnt');
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignVertically = true;
};

MenuState.prototype.create = function() {
    this.title_text = this.game.add.bitmapText(this.game.width/2, 60, 'ermin', "Ermin's Quest", 48);
    this.title_text.tint = 0xff8800;
    this.title_text.anchor.x = 0.5;
    this.title_text.anchor.y = 0.5;
    this.title_text2 = this.game.add.bitmapText(this.game.width/2, 16, 'ermin', "Heads on Stick, Inc (c) 2015", 16);
    this.title_text2.tint = 0x888888;
    this.title_text2.anchor.x = 0.5;
    this.title_text2.anchor.y = 0.5;
    this.start_text = this.game.add.bitmapText(this.game.width/2, this.game.height - 70, 'ermin', "Press space or click to start", 16);
    this.start_text.tint = 0x0088ff;
    this.start_text.anchor.x = 0.5;
    this.start_text.anchor.y = 0.5;

    this.ermin = this.game.add.sprite(this.game.width/2, this.game.height/2, "ermin")
    this.ermin.anchor.x = 0.5;
    this.ermin.anchor.y = 0.5;
};

MenuState.prototype.update = function() {
    if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
        ((this.game.input.activePointer.active || this.game.input.activePointer.isDown) &&
            this.game.input.activePointer.y > this.game.height - 100)) {
        this.game.state.start("game");
    }
};
