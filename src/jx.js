// This example uses the Phaser 2.2.2 framework

// Copyright © 2014 John Watson
// Licensed under the terms of the MIT License

function horizontal_move(game, sprite, enemy) {
    if(sprite.body.velocity.x == 0) sprite.body.velocity.x = enemy.speed;
    var to_left = sprite.body.velocity.x < 0;
    var flip = !sprite.body.touching.down ||
        (sprite.body.touching.left && to_left) ||
        (sprite.body.touching.right && !to_left) ||
        (sprite.x <= 0 && to_left) ||
        (sprite.x >= game.width - sprite.width && !to_left);
    if (flip) {
        sprite.body.velocity.x *= -1;
    }
}

function vertical_move(game, sprite, enemy) {
    if(sprite.body.velocity.y == 0) sprite.body.velocity.y = enemy.speed;
    var to_up = sprite.body.velocity.y < 0;
    var flip = (sprite.body.touching.up && to_up) ||
        (sprite.body.touching.down && !to_up) ||
        (sprite.y <= 0 && to_up) ||
        (sprite.y >= game.height - sprite.height && !to_up);
    if (flip) {
        sprite.body.velocity.y *= -1;
    }
}

var GameState = function(game) {
    // Define movement constants
    this.MAX_SPEED = 300; // pixels/second
    this.ACCELERATION = 1000; // pixels/second/second
    this.DRAG = 800; // pixels/second
    this.GRAVITY = 2600; // pixels/second/second
    this.JUMP_SPEED = -1000; // pixels/second (negative y is up)
    this.room = "start";
    this.CONTROLLER_SIZE = 100;
    this.ENEMIES =  {
        "baddy1": {
            seq: [ "baddy1", "baddy2" ],
            move: horizontal_move,
            speed: 250,
            gravity: true
        },
        "kettle1": {
            seq: [ "kettle1", "kettle2" ],
            move: vertical_move,
            speed: 200,
            gravity: false
        }
    }
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.atlas('sprites', 'data/tex.png', 'data/tex.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
};

GameState.prototype.create_player = function() {
    this.player = this.game.add.sprite(this.game.width/4, 100, 'sprites', "ermin");
    this.player.tint = 0xffffff;
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 2); // x, y
    this.player.body.drag.setTo(this.DRAG, 0); // x, y

    this.player.animations.add("walk", ["ermin1", "ermin", "ermin2"], 10, true, false);
    this.player.animations.play("walk");
    this.player.anchor.setTo(.5, .5);
};

GameState.prototype.create_block = function(x, y, name, group, color) {
    var block = this.game.add.sprite(x, y, 'sprites', name);
    block.tint = color;
    block.start_key = name;
    this.game.physics.enable(block, Phaser.Physics.ARCADE);
    if(group == this.enemies) {
        block.animations.add("walk", this.ENEMIES[name].seq, 10, true, false);
        block.animations.play("walk");
        block.body.allowGravity = this.ENEMIES[name].gravity;
    } else {
        block.body.immovable = true;
        block.body.allowGravity = false;
    }
    group.add(block);
};

GameState.prototype.create_room = function(name) {
    this.ground.removeAll();
    this.platforms.removeAll();
    this.ladders.removeAll();
    this.enemies.removeAll();

    var room = ROOMS[name];
    for(var x = 0; x < room.length; x++) {
        for(var y = 0; y < room[x].length; y++) {
            if(room[x][y]) {
                var block = BLOCKS[room[x][y]];
                var color = PALETTE[block[0]][0];
                var group;
                if(y >= 538) {
                    group = this.ground;
                } else if(block[1] == "ladder1") {
                    group = this.ladders;
                } else if(block[1] in this.ENEMIES) {
                    group = this.enemies;
                } else {
                    group = this.platforms;
                }
                this.create_block(x * 16, y * 16, block[1], group, color);
            }
        }
    }
};

GameState.prototype.create = function() {
    // Set stage background to something sky colored
    this.game.stage.backgroundColor = 0x000000;

    this.CONTROLS = [ this.game.input.activePointer, this.game.input.pointer1, this.game.input.pointer2 ];

    this.world = this.game.add.group();
    this.world.scale.setTo((this.game.width - this.CONTROLLER_SIZE * 2)/800, this.game.height / 600.0);
    this.world.x = this.CONTROLLER_SIZE;

    this.create_player();
    this.world.add(this.player);

     // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    // Capture certain keys to prevent their default actions in the browser.
    // This is only necessary because this is an HTML5 game. Games on other
    // platforms may not need code like this.
    this.game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN
    ]);

    this.ground = this.game.add.group();
    this.platforms = this.game.add.group();
    this.ladders = this.game.add.group();
    this.enemies = this.game.add.group();
    this.world.add(this.ground);
    this.world.add(this.platforms);
    this.world.add(this.ladders);
    this.world.add(this.enemies);

    this.create_room(this.room);

    this.text = this.game.add.text(16 + this.world.x, 16, "", { fontSize: '16px', fill: '#888' });


    // add the controllers
    var graphics = this.game.add.graphics(0, 0);
    graphics.beginFill(0x444444);
    graphics.drawRect(0, 0, this.CONTROLLER_SIZE, this.game.height);
    graphics.endFill();

    graphics.beginFill(0x4444aa);
    graphics.drawRect(5,
            this.game.height - this.CONTROLLER_SIZE * 2,
            this.CONTROLLER_SIZE - 10,
            this.CONTROLLER_SIZE - 10);
    graphics.endFill();

    graphics.beginFill(0x4444aa);
    graphics.drawRect(5,
            this.game.height - this.CONTROLLER_SIZE,
            this.CONTROLLER_SIZE - 10,
            this.CONTROLLER_SIZE - 10);
    graphics.endFill();

    graphics = this.game.add.graphics(this.game.width - this.CONTROLLER_SIZE, 0);
    graphics.beginFill(0x444444);
    graphics.drawRect(0, 0, this.CONTROLLER_SIZE, this.game.height);
    graphics.endFill();

    graphics.beginFill(0x4444aa);
    graphics.drawRect(5,
            this.game.height - this.CONTROLLER_SIZE * 2,
            this.CONTROLLER_SIZE - 10,
            this.CONTROLLER_SIZE - 10);
    graphics.endFill();

    graphics.beginFill(0x4444aa);
    graphics.drawRect(5,
            this.game.height - this.CONTROLLER_SIZE,
            this.CONTROLLER_SIZE - 10,
            this.CONTROLLER_SIZE - 10);
    graphics.endFill();


    // debug
    window.world = this.world;
    window.game = this.game;
    window.player = this.player;

};

// The update() method is called every frame
GameState.prototype.update = function() {
    var onLadder = this.game.physics.arcade.overlap(this.player, this.ladders);
    this.player.body.allowGravity = !onLadder;

    this.text.text = DESCRIPTIONS[this.room];
    this.player.rotation = onLadder ? 0 :
        (this.player.body.velocity.x < 0 ? 1 : -1) *
        this.player.body.velocity.y * 0.001;

    // Collide the player with the ground
    if (!onLadder) {
        this.game.physics.arcade.collide(this.player, this.platforms);
    }
    this.game.physics.arcade.collide(this.player, this.ground);
    this.game.physics.arcade.collide(this.enemies, this.ground);
    this.game.physics.arcade.collide(this.enemies, this.platforms);

//    this.game.debug.pointer(this.game.input.activePointer);
//    this.game.debug.pointer(this.game.input.pointer1);
//    this.game.debug.pointer(this.game.input.pointer2);

    if (this.leftInputIsActive()) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION;
    } else if (this.rightInputIsActive()) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION;
    } else {
        // Stop the player from moving horizontally
        this.player.body.acceleration.x = 0;
    }

    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.player.body.touching.down;
    if(onTheGround && this.upInputIsActive()) {
        // Jump when the player is touching the ground and the up arrow is pressed
        this.player.body.velocity.y = this.JUMP_SPEED;
    }

    if (onLadder) {
        if(this.upInputIsActive()) {
            this.player.body.acceleration.y = -this.ACCELERATION;
        } else if(this.downInputIsActive()) {
            this.player.body.acceleration.y = this.ACCELERATION;
        } else {
            this.player.body.acceleration.y = this.player.body.velocity.y = 0;
        }
    }

    if(this.player.body.velocity.x == 0 && !this.player.animations.paused) {
        this.player.animations.paused = true;
        this.player.animations.frameName = "ermin";
    } else if(this.player.body.velocity.x != 0 && this.player.animations.paused) {
        this.player.animations.paused = false;
    }

    if(this.player.body.velocity.x != 0) {
        this.player.scale.x = this.player.body.velocity.x < 0 ? -1 : 1;
    }


    // move enemies
    this.enemies.forEach(this.move_enemy, this, true);

    // enemies collision check

    // screen boundary checking
    var pw = Math.abs(this.player.width * 1.5);
    var load_room = null;
    if(this.player.x < 0 && this.player.body.velocity.x < 0) {
        load_room = WORLD[this.room][0];
        if(load_room) {
            this.player.x = this.world.width + pw;
        } else {
            this.player.x = 0;
        }
    } else if(this.player.x >= this.world.width + pw && this.player.body.velocity.x > 0) {
        load_room = WORLD[this.room][1];
        if(load_room) {
            this.player.x = 0;
        } else {
            this.player.x = this.world.width + pw;
        }
    }
    if(load_room) {
        this.room = load_room;
        this.create_room(this.room);
    }
};

GameState.prototype.move_enemy = function(child) {
    var en = this.ENEMIES[child.start_key];
    en.move(this.game, child, en);
};

// This function should return true when the player activates the "go left" control
// In this case, either holding the right arrow or tapping or clicking on the left
// side of the screen.
GameState.prototype.leftInputIsActive = function() {
    var isActive = false;

    isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
    for(var i = 0; i < this.CONTROLS.length; i++) {
        isActive |= ((this.CONTROLS[i].active || this.CONTROLS[i].isDown) &&
            this.CONTROLS[i].x < this.CONTROLLER_SIZE &&
            this.CONTROLS[i].y >= this.game.height - this.CONTROLLER_SIZE * 2 &&
            this.CONTROLS[i].y < this.game.height - this.CONTROLLER_SIZE);
    }

    return isActive;
};

// This function should return true when the player activates the "go right" control
// In this case, either holding the right arrow or tapping or clicking on the right
// side of the screen.
GameState.prototype.rightInputIsActive = function() {
    var isActive = false;

    isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
    for(var i = 0; i < this.CONTROLS.length; i++) {
        isActive |= ((this.CONTROLS[i].active || this.CONTROLS[i].isDown) &&
            this.CONTROLS[i].x < this.CONTROLLER_SIZE &&
            this.CONTROLS[i].y >= this.game.height - this.CONTROLLER_SIZE);
    }

    return isActive;
};

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
GameState.prototype.upInputIsActive = function(duration) {
    var isActive = false;

    isActive = this.input.keyboard.isDown(Phaser.Keyboard.UP);
    for(var i = 0; i < this.CONTROLS.length; i++) {
        isActive |= ((this.CONTROLS[i].active || this.CONTROLS[i].isDown) &&
            this.CONTROLS[i].x >= this.game.width - this.CONTROLLER_SIZE &&
            this.CONTROLS[i].y >= this.game.height - this.CONTROLLER_SIZE * 2 &&
            this.CONTROLS[i].y < this.game.height - this.CONTROLLER_SIZE);
    }

    return isActive;
};

GameState.prototype.downInputIsActive = function(duration) {
    var isActive = false;

    isActive = this.input.keyboard.isDown(Phaser.Keyboard.DOWN);
    for(var i = 0; i < this.CONTROLS.length; i++) {
        isActive |= ((this.CONTROLS[i].active || this.CONTROLS[i].isDown) &&
            this.CONTROLS[i].x >= this.game.width - this.CONTROLLER_SIZE &&
            this.CONTROLS[i].y >= this.game.height - this.CONTROLLER_SIZE);
    }

    return isActive;
};

var game = new Phaser.Game(900, 530, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
