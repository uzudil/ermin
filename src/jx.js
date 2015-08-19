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

    this.create_player();

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
    this.create_room(this.room);

    this.text = this.game.add.text(16, 16, "", { fontSize: '16px', fill: '#888' });

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

    this.game.debug.pointer(this.game.input.pointer1);
    this.game.debug.pointer(this.game.input.pointer2);

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
    if(onTheGround && this.jumpInputIsActive()) {
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
    var load_room = null;
    if(this.player.x < 0 && this.player.body.velocity.x < 0) {
        load_room = WORLD[this.room][0];
        if(load_room) {
            this.player.x += this.game.width;
        } else {
            this.player.x = 0;
        }
    } else if(this.player.x >= this.game.width - this.player.width && this.player.body.velocity.x > 0) {
        load_room = WORLD[this.room][1];
        if(load_room) {
            this.player.x -= this.game.width - this.player.width;
        } else {
            this.player.x = this.game.width - this.player.width;
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
    isActive |= (this.game.input.pointer1.isDown &&
        this.game.input.pointer1.x < this.game.width/4);
    isActive |= (this.game.input.pointer2.isDown &&
        this.game.input.pointer2.x < this.game.width/4);

    return isActive;
};

// This function should return true when the player activates the "go right" control
// In this case, either holding the right arrow or tapping or clicking on the right
// side of the screen.
GameState.prototype.rightInputIsActive = function() {
    var isActive = false;

    isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
    isActive |= (this.game.input.pointer1.isDown &&
        this.game.input.pointer1.x > this.game.width/2 + this.game.width/4);
    isActive |= (this.game.input.pointer2.isDown &&
        this.game.input.pointer2.x > this.game.width/2 + this.game.width/4);

    return isActive;
};

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
GameState.prototype.jumpInputIsActive = function(duration) {
    var isActive = false;

    isActive = this.input.keyboard.downDuration(Phaser.Keyboard.UP, duration);
    isActive |= (this.game.input.pointer1.justPressed(duration + 1000/60) &&
        this.game.input.pointer1.x > this.game.width/4 &&
        this.game.input.pointer1.x < this.game.width/2 + this.game.width/4);
    isActive |= (this.game.input.pointer2.justPressed(duration + 1000/60) &&
        this.game.input.pointer2.x > this.game.width/4 &&
        this.game.input.pointer2.x < this.game.width/2 + this.game.width/4);

    return isActive;
};

GameState.prototype.downInputIsActive = function(duration) {
    var isActive = false;

    isActive = this.input.keyboard.isDown(Phaser.Keyboard.DOWN);
//    isActive |= (this.game.input.activePointer.isDown &&
//        this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

    return isActive;
};

GameState.prototype.upInputIsActive = function(duration) {
    var isActive = false;

    isActive = this.input.keyboard.isDown(Phaser.Keyboard.UP);
//    isActive |= (this.game.input.activePointer.isDown &&
//        this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

    return isActive;
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
