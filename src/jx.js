// This example uses the Phaser 2.2.2 framework

// Copyright © 2014 John Watson
// Licensed under the terms of the MIT License

bind = function(callerObj, method) {
    var f = function() {
        return method.apply(callerObj, arguments);
    };
    return f;
};

var GameState = function(game) {
    // Define movement constants
    this.MAX_SPEED = 300; // pixels/second
    this.ACCELERATION = 1000; // pixels/second/second
    this.DRAG = 800; // pixels/second
    this.GRAVITY = 2600; // pixels/second/second
    this.JUMP_SPEED = -1000; // pixels/second (negative y is up)
    this.room = "start";
    this.mobile_controller_pos = { dx: 0, dy: 0, jump_active: false };
    this.PLAYER_SCALE = 0.8; // downscale the player so it fits into same-size places
    this.player_keys = {};
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.atlas('sprites', 'data/tex.png?cb=' + Date.now(), 'data/tex.json?cb=' + Date.now(), Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    this.game.load.audio('music', 'data/ermin.mp3');

    this.CONTROLLER_SIZE = this.game.device.desktop ? 0 : 100;
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignVertically = true;
};

GameState.prototype.create_player = function() {
    this.player = this.game.add.sprite(this.game.width/4, 300, 'sprites', "ermin");
    this.player.tint = 0xffffff;
    this.player.scale.x = this.PLAYER_SCALE;
    this.player.scale.y = this.PLAYER_SCALE;
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
        if(ENEMIES[name].seq.length > 0) {
            block.animations.add("walk", ENEMIES[name].seq, 10, true, false);
            block.animations.play("walk");
        }
        block.body.allowGravity = ENEMIES[name].gravity;
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
    this.decor.removeAll();
    this.enemies.removeAll();
    this.doors.removeAll();
    this.pickups.removeAll();

    var stored_room = this.getStoredRoom();
    var room = ROOMS[name];
    for(var x = 0; x < room.length; x++) {
        for(var y = 0; y < room[x].length; y++) {
            if(room[x][y]) {
                var block = BLOCKS[room[x][y]];
                var color = PALETTE[block[0]][0];
                var group;
                var ex = EXTRA_INFO[block[1]];
                if(block[1] in ENEMIES) {
                    group = this.enemies;
                } else if(ex && ex.ladder) {
                    group = this.ladders;
                } else if(ex && ex.decor) {
                    group = this.decor;
                } else if(ex && ex.pickup) {
                    group = this.pickups;
                    var f = false;
                    for(var i = 0; i < stored_room["pickups"].length; i++) {
                        var pos = stored_room["pickups"][i];
                        if(pos[0] == x * 16 && pos[1] == y * 16) {
                            f = true;
                            break;
                        }
                    }
                    if(f) continue;
                } else if(ex && ex.door) {
                    group = this.doors;
                    // open previously opened doors
                    if(block[1] == "door_closed") {
                        for(var i = 0; i < stored_room["open_doors"].length; i++) {
                            var pos = stored_room["open_doors"][i];
                            if(pos[0] == x * 16 && pos[1] == y * 16) {
                                block[1] = "door_open";
                                break;
                            }
                        }
                    }
                } else {
                    group = !ex || ex.jump_thru ? this.platforms : this.ground;
                }
                this.create_block(x * 16, y * 16, block[1], group, color);
            }
        }
    }
};

GameState.prototype.create_mobile_controller = function() {
    if(this.CONTROLLER_SIZE > 0) {
        // add the controllers
        var xx = [0, this.game.width - this.CONTROLLER_SIZE];
        for (var i = 0; i < xx.length; i++) {
            var graphics = this.game.add.graphics(xx[i], 0);
            graphics.beginFill(0x444444);
            graphics.drawRect(0, 0, this.CONTROLLER_SIZE, this.game.height);
            graphics.endFill();

            graphics.beginFill(0x4444aa);
            graphics.drawCircle(this.CONTROLLER_SIZE / 2, this.game.height - this.CONTROLLER_SIZE / 2, this.CONTROLLER_SIZE - 10);
            graphics.endFill();
        }

        // controller sprite
        var gx = this.game.add.graphics(0, 0);
        gx.beginFill(0xffffff, 0.5);
        gx.drawCircle(this.CONTROLLER_SIZE / 2, this.CONTROLLER_SIZE / 2, this.CONTROLLER_SIZE - 30);
        gx.endFill();
        this.controller_sprite = this.game.add.sprite(0, 0, gx.generateTexture());
        this.controller_sprite.anchor.set(0.5);
        this.controller_sprite2 = this.game.add.sprite(0, 0, gx.generateTexture());
        this.controller_sprite2.anchor.set(0.5);
        gx.destroy();
    }
};

GameState.prototype.create = function() {
    // Set stage background to something sky colored
    this.game.stage.backgroundColor = 0x000000;

    this.CONTROLS = [ this.game.input.activePointer, this.game.input.pointer1, this.game.input.pointer2 ];

    this.world = this.game.add.group();
    this.world.scale.x = (this.game.width - 2 * this.CONTROLLER_SIZE) / this.game.width;
    this.world.position.x = this.CONTROLLER_SIZE;

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
    this.ladders = this.game.add.group();
    this.decor = this.game.add.group();
    this.enemies = this.game.add.group();
    this.doors = this.game.add.group();
    this.pickups = this.game.add.group();
    this.world.add(this.ground);
    this.world.add(this.platforms);
    this.world.add(this.ladders);
    this.world.add(this.decor);
    this.world.add(this.enemies);
    this.world.add(this.doors);
    this.world.add(this.pickups);

    this.create_room(this.room);

    this.text = this.game.add.text(16 + this.world.x, 16, "", { fontSize: '16px', fill: '#888' });

    this.create_mobile_controller();

    // debug
    window.world = this.world;
    window.game = this.game;
    window.player = this.player;

    // music
    this.music = this.game.add.audio('music');
    this.game.sound.play("music", 1, true);

    // music
//    MIDI.loadPlugin({
//		soundfontUrl: "../lib/soundfont/",
//		instrument: "vibraphone",
//		onprogress: function(state, progress) {
//			console.log(state, progress);
//		},
//		onsuccess: function() {
//            var player = MIDI.Player;
//            player.loadFile("../data/ermin2.mid", player.start);
//            player.addListener(function(data) { // set it to your own function!
////                console.log("now=" + data.now + " end="+ data.end + " playing=" + MIDI.Player.playing);
//
//                if (data.now >= data.end) {
//                    setTimeout(function() {
//                        player.stop();
//                        player.start();
//                    }, 2500);
//                }
//            });
//		}
//	});
};


GameState.prototype.get_mobile_controller_position = function(onLadder) {
//    this.game.debug.pointer(this.game.input.activePointer);
//    this.game.debug.pointer(this.game.input.pointer1);
//    this.game.debug.pointer(this.game.input.pointer2);

    var dx = 0;
    var dy = 0;
    var jump_active = false;
    if(this.CONTROLLER_SIZE > 0) {
        for (var i = 0; i < this.CONTROLS.length; i++) {
            var c = this.CONTROLS[i];
            if ((c.active || c.isDown)) {
                if (c.x < this.CONTROLLER_SIZE && c.y > this.game.height - this.CONTROLLER_SIZE) {
                    dx = c.x - this.CONTROLLER_SIZE / 2;
                    dy = c.y - (this.game.height - this.CONTROLLER_SIZE / 2);
                }
                if (c.x > this.game.width - this.CONTROLLER_SIZE && c.y > this.game.height - this.CONTROLLER_SIZE) {
                    jump_active = true;
                }
            }
        }
        if (dx != 0 || dy != 0) {
            if (!this.controller_sprite.alive) this.controller_sprite.revive();
            this.controller_sprite.x = this.CONTROLLER_SIZE / 2 + dx;
            this.controller_sprite.y = this.game.height - this.CONTROLLER_SIZE / 2 + dy;

            var angle = Math.atan2(dx, dy) * 180 / Math.PI;
//        this.text.text = "" + angle.toFixed(2);
            // lock to up/down only
            if (onLadder && (Math.abs(angle) < 60 || Math.abs(angle) >= 130)) {
                dx = 0;
            }
        } else if (this.controller_sprite.alive) {
            this.controller_sprite.kill();
        }
        if (jump_active) {
            if (!this.controller_sprite2.alive) this.controller_sprite2.revive();
            this.controller_sprite2.x = this.game.width - this.CONTROLLER_SIZE / 2;
            this.controller_sprite2.y = this.game.height - this.CONTROLLER_SIZE / 2;
        } else if (this.controller_sprite2.alive) {
            this.controller_sprite2.kill();
        }
    }
    this.mobile_controller_pos.dx = dx;
    this.mobile_controller_pos.dy = dy;
    this.mobile_controller_pos.jump_active = jump_active;
};

// The update() method is called every frame
GameState.prototype.pickupOverlap = function(player, pickup) {
    if(pickup.frameName == "key") {
        this.pickups.remove(pickup);
        if(pickup.tint in this.player_keys) {
            this.player_keys[pickup.tint] = this.player_keys[pickup.tint] + 1;
        } else {
            this.player_keys[pickup.tint] = 1;
        }
        var stored_room = this.getStoredRoom();
        stored_room.pickups.push([pickup.x, pickup.y]);
        localStorage[this.room] = JSON.stringify(stored_room);
    }
};

GameState.prototype.doorOverlap = function(player, door) {
//    console.log("overlap between " + player.frameName + " and " + door.frameName);
    if(door.frameName == "door_closed") {

        var key_count = this.player_keys[door.tint] || 0;
        if(key_count > 0) {
            this.player_keys[door.tint] = this.player_keys[door.tint] - 1;

            this.doors.remove(door);
            this.create_block(door.x, door.y, "door_open", this.doors, door.tint);

            // store this opened door
            var stored_room = this.getStoredRoom();
            stored_room.open_doors.push([door.x, door.y]);
            localStorage[this.room] = JSON.stringify(stored_room);
        } else {
            this.game.physics.arcade.collide(player, door);
        }
    }
};

GameState.prototype.getStoredRoom = function() {
    var stored_room;
    if(this.room in localStorage) {
        stored_room = JSON.parse(localStorage[this.room]);
    } else {
        stored_room = {
            "open_doors": [],
            "pickups": []
        };
    }
    return stored_room;
};

GameState.prototype.move_enemy = function(child) {
    var en = ENEMIES[child.start_key];
    en.move(this, child, en);
};

GameState.prototype.check_screen_edges = function() {
    var pw = Math.abs(this.player.width);
    var ph = Math.abs(this.player.height);
    var load_room = null;
    if(this.player.x < 0 && this.player.body.velocity.x < 0) {
        load_room = WORLD[this.room][0];
        if(load_room) {
            this.player.x = this.game.width - pw;
        } else {
            this.player.x = 0;
        }
    } else if(this.player.x >= this.game.width - pw * .6 && this.player.body.velocity.x > 0) {
        load_room = WORLD[this.room][1];
        if(load_room) {
            this.player.x = 0;
        } else {
            this.player.x = this.game.width - pw;
        }
    }
    if(this.player.y < 0 && this.player.body.velocity.y < 0) {
        load_room = WORLD[this.room][2];
        if(load_room) {
            this.player.y = this.game.height - ph;
        } else {
            this.player.y = 0;
        }
    } else if(this.player.y >= this.game.height - ph * .6 && this.player.body.velocity.y > 0) {
        load_room = WORLD[this.room][3];
        if(load_room) {
            this.player.y = 0;
        } else {
            this.player.y = this.game.height - ph;
        }
    }
    return load_room;
};

GameState.prototype.update = function() {
    var onLadder = this.game.physics.arcade.overlap(this.player, this.ladders);
    this.player.body.allowGravity = !onLadder;
    this.player.body.drag.setTo(this.DRAG * (onLadder ? 10 : 1), 0);

    this.text.text = DESCRIPTIONS[this.room];
    this.player.rotation = onLadder ? 0 :
        (this.player.body.velocity.x < 0 ? 1 : -1) *
        this.player.body.velocity.y * 0.001;

    // Collide the player with the ground
    if (!onLadder && player.body.velocity.y > 0) {
        this.game.physics.arcade.collide(this.player, this.platforms);
    }
    this.game.physics.arcade.collide(this.player, this.ground);
    this.game.physics.arcade.collide(this.enemies, this.ground);
    this.game.physics.arcade.collide(this.enemies, this.platforms);
    this.game.physics.arcade.collide(this.enemies, this.doors);

    this.game.physics.arcade.overlap(this.player, this.doors.children, this.doorOverlap, null, this);
    this.game.physics.arcade.overlap(this.player, this.pickups.children, this.pickupOverlap, null, this);

    this.get_mobile_controller_position(onLadder);

    if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT) || this.mobile_controller_pos.dx < 0) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION;
    } else if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || this.mobile_controller_pos.dx > 0) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION;
    } else {
        // Stop the player from moving horizontally
        this.player.body.acceleration.x = 0;
    }

    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.player.body.touching.down;
    if((onTheGround || onLadder) && (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.mobile_controller_pos.jump_active)) {
        // Jump when the player is touching the ground and the up arrow is pressed
        this.player.body.velocity.y = this.JUMP_SPEED;
    } else if (onLadder) {
        if(this.input.keyboard.isDown(Phaser.Keyboard.UP) || this.mobile_controller_pos.dy < 0) {
            this.player.body.acceleration.y = -this.ACCELERATION;
        } else if(this.input.keyboard.isDown(Phaser.Keyboard.DOWN) || this.mobile_controller_pos.dy > 0) {
            this.player.body.acceleration.y = this.ACCELERATION;
        } else {
            this.player.body.acceleration.y = this.player.body.velocity.y = 0;
        }
    }

    // animation
    if(this.player.body.velocity.x == 0 && !this.player.animations.paused) {
        this.player.animations.paused = true;
        this.player.animations.frameName = "ermin";
    } else if(this.player.body.velocity.x != 0 && this.player.animations.paused) {
        this.player.animations.paused = false;
    }

    // directional sprite
    if(this.player.body.velocity.x != 0) {
        this.player.scale.x = this.player.body.velocity.x < 0 ? -this.PLAYER_SCALE : this.PLAYER_SCALE;
    }


    // move enemies
    this.enemies.forEach(this.move_enemy, this, true);

    // enemies collision check

    // screen boundary checking
    var load_room = this.check_screen_edges();
    if(load_room) {
        this.room = load_room;
        this.create_room(this.room);
    }
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
