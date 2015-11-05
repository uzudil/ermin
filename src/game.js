// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

// Uses example code from:
// Copyright © 2014 John Watson
// Licensed under the terms of the MIT License

var GameState = function(game) {
    // do not cache ajax calls
    $.ajaxSetup({ cache: false });
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.MAX_SPEED = 300; // pixels/second
    this.ACCELERATION = 1000; // pixels/second/second
    this.DRAG = 800; // pixels/second
    this.GRAVITY = 2600; // pixels/second/second
    this.JUMP_SPEED = -1000; // pixels/second (negative y is up)
    var sg = get_saved_game();
    this.mobile_controller_pos = { dx: 0, dy: 0, jump_active: false };
    this.PLAYER_SCALE = 0.9; // downscale the player so it fits into same-size places
    this.player_keys = sg["player_keys"] || {};
	this.has_disk = sg["has_disk"] || false;
    this.score = sg["score"] || 0;
    this.lives = sg["lives"] || 5;
    this.room_entry_pos = sg["room_entry_pos"] || { x: this.game.width/4, y: 300 };
    this.jumping = false;
    this.jump_over = false;
    this.player_death = 0;
    this.room = sg["room"] || "start";
    this.god_mode = false;
    this.tap_direction = 1;
    this.tap_timer = 0;
    this.TAP_INTERVAL_MILLIS = 160; // pulse to music beat
    this.TAP_DELTA = 0.1;

    this.game.load.bitmapFont('ermin', 'data/ermin/font.png', 'data/ermin/font.fnt');
    this.game.load.atlas('sprites', 'data/tex.png?cb=' + Date.now(), 'data/tex.json?cb=' + Date.now(), Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    this.game.load.audio('music', 'data/ermin.mp3?cb=' + Date.now());

    this.accelerated = this.game.renderType == Phaser.WEBGL;
    this.CONTROLLER_SIZE = this.game.device.desktop ? 0 : 160;
    this.TOP_GUTTER = 30;
    this.BOTTOM_GUTTER = 40;
    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    window.onresize = bind(this, this.windowResized);
    this.windowResized();
};

GameState.prototype.windowResized = function() {
    var w, h;
//    var real_width = this.game.width + 2 * this.CONTROLLER_SIZE;
//    if(window.innerWidth < window.innerHeight) {
//        w = window.innerWidth;
//        h = Math.min((w / real_width) * game.height, window.innerHeight);
//    } else {
//        h = window.innerHeight;
//        w = Math.min((h / this.game.height) * real_width, window.innerWidth);
//    }
    w = window.innerWidth;
    h = window.innerHeight;
    this.game.scale.setMinMax(w, h, w, h);
};

GameState.prototype.create_player = function() {
    this.player = this.game.add.sprite(this.room_entry_pos.x, this.room_entry_pos.y, 'sprites', "ermin");
    this.room_entry_pos = { x: this.player.x, y: this.player.y };
    this.player.tint = 0xffffff;
    this.player.scale.x = ATLAS_SCALE * this.PLAYER_SCALE;
    this.player.scale.y = ATLAS_SCALE * this.PLAYER_SCALE;
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 2); // x, y
    this.player.body.drag.setTo(this.DRAG, 0); // x, y

    // reduce hitbox size a bit
    this.player.body.setSize(60,60,4,4);

    this.player.animations.add("walk", ["ermin1", "ermin", "ermin2"], 10, true, false);
    this.player.animations.add("climb", ["ermin_climb1", "ermin_climb2"], 10, true, false);
    this.player.animations.play("walk");
    this.player.anchor.setTo(.5, .5);
};

GameState.prototype.create_block = function(x, y, name, group, color) {
    var block = this.game.add.sprite(x, y, 'sprites', name);
    block.tint = color;
    block.start_key = name;
	block.scale.set(ATLAS_SCALE);
    this.game.physics.enable(block, Phaser.Physics.ARCADE);
    if(group == this.enemies) {
        if(ENEMIES[name].seq.length > 0) {
            block.animations.add("walk", ENEMIES[name].seq, 10, true, false);
            block.animations.play("walk");
        }
        block.body.allowGravity = ENEMIES[name].gravity;
        if(ENEMIES[name].move == horizontal_move) {
            block.anchor.x = 0.5;
            block.anchor.y = 0.5;
        }
    } else {
        block.body.immovable = true;
        block.body.allowGravity = false;
    }
    group.add(block);
    return block;
};

GameState.prototype.create_room = function(name) {
    this.game.physics.arcade.isPaused = true;
    get_room(name, bind(this, function(room) {
        this.room = name;
        this.stored_room = this.getStoredRoom();
        this.text.text = DESCRIPTIONS[this.room];

        this.ground.removeAll();
        this.platforms.removeAll();
        this.ladders.removeAll();
        this.decor.removeAll();
        this.enemies.removeAll();
        this.doors.removeAll();
        this.pickups.removeAll();

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
                        if(!this.accelerated) continue;
                        group = this.decor;
                    } else if(ex && ex.pickup) {
                        group = this.pickups;
                        var f = false;
                        for(var i = 0; i < this.stored_room["pickups"].length; i++) {
                            var pos = this.stored_room["pickups"][i];
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
                            for(var i = 0; i < this.stored_room["open_doors"].length; i++) {
                                var pos = this.stored_room["open_doors"][i];
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
        this.game.physics.arcade.isPaused = false;
    }));
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
    this.world.scale.y = (this.game.height - this.TOP_GUTTER - this.BOTTOM_GUTTER) / this.game.height;
    this.world.position.x = this.CONTROLLER_SIZE;
    this.world.position.y = this.TOP_GUTTER;

    // gray bars at top/bottom of screen
    var gx = this.game.add.graphics(0, 0);
    gx.beginFill(0x222222, 1);
    gx.drawRect(0, 0, this.game.width, this.TOP_GUTTER);
    gx.endFill();
    var gx2 = this.game.add.graphics(0, this.game.height - this.BOTTOM_GUTTER);
    gx2.beginFill(0x222222, 1);
    gx2.drawRect(0, 0, this.game.width, this.BOTTOM_GUTTER);
    gx2.endFill();
//    gx.destroy();

     // Since we're jumping we need gravity
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    // Capture certain keys to prevent their default actions in the browser.
    // This is only necessary because this is an HTML5 game. Games on other
    // platforms may not need code like this.
    this.game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR
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

    this.text = this.game.add.bitmapText(this.CONTROLLER_SIZE + 16, 16, 'ermin', "", 16);
//    this.text.tint = 0xff8800;
    this.text.anchor.x = 0;
    this.text.anchor.y = 0.5;

    this.score_text = this.game.add.bitmapText(this.game.width - 200 - this.CONTROLLER_SIZE, 16, 'ermin', "Score: " + this.score, 16);
//    this.text.tint = 0xff8800;
    this.score_text.anchor.x = 1;
    this.score_text.anchor.y = 0.5;

    this.lives_text = this.game.add.bitmapText(this.game.width - 10 - this.CONTROLLER_SIZE, 16, 'ermin', "Lives: " + this.lives, 16);
//    this.text.tint = 0xff8800;
    this.lives_text.anchor.x = 1;
    this.lives_text.anchor.y = 0.5;

    this.create_room(this.room);

    // create the player last
    this.create_player();
    this.world.add(this.player);

    this.create_mobile_controller();

    this.inventory = this.game.add.group();
    this.update_inventory();

    // debug
    window.world = this.world;
    window.game = this.game;
    window.player = this.player;

	this.game.input.keyboard.addKey(Phaser.Keyboard.Q).onUp.add(toggle_volume);
	this.game.input.keyboard.addKey(Phaser.Keyboard.G).onUp.add(function() {
		this.god_mode = !this.god_mode;
        console.log("god mode=" + this.god_mode);
	}, this);
	this.game.input.keyboard.addKey(Phaser.Keyboard.ESC).onUp.add(function() {
		this.return_to_menu();
	}, this);

    // music
    this.music = this.game.add.audio('music');
	this.game.sound.volume = VOLUME;
    this.music.loop = true;
    this.music.play();
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

GameState.prototype.enemyOverlap = function(player, enemy) {
    this.player_death = Date.now() + 3000;
    this.game.physics.arcade.isPaused = true;
    this.lives--;
    this.lives_text.text = "Lives: " + this.lives;
    this.save_game_state();
};

GameState.prototype.pickupOverlap = function(player, pickup) {
	this.pickups.remove(pickup);
	this.stored_room.pickups.push([pickup.x, pickup.y]);
    if(pickup.frameName == "key") {
        if(pickup.tint in this.player_keys) {
            this.player_keys[pickup.tint] = this.player_keys[pickup.tint] + 1;
        } else {
            this.player_keys[pickup.tint] = 1;
        }
        this.update_inventory();
    } else if(pickup.frameName == "coin") {
        this.score += 5;
        this.score_text.text = "Score: " + this.score;
    } else if(pickup.frameName == "disk") {
		this.has_disk = true;
		this.update_inventory();
    }
};

GameState.prototype.update_inventory = function() {
    this.inventory.removeAll();
    var x = this.CONTROLLER_SIZE;
    var y = this.game.height - this.BOTTOM_GUTTER + 10;
	if(this.has_disk) {
		this.create_block(x + 5, y - 5, "disk", this.inventory, PALETTE.turquoise[0]);
		x += 40;
	}
    for(var tint in this.player_keys) {
        var count = this.player_keys[tint];
        if(count > 0) {
            this.create_block(x, y, "key", this.inventory, tint);
            var text = this.game.add.bitmapText(x + 35, y + 3, 'ermin', "" + count, 16);
            this.inventory.add(text);
            x += 60;
        }
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
            this.stored_room.open_doors.push([door.x, door.y]);
            this.update_inventory();
        } else {
            this.game.physics.arcade.collide(player, door);
        }
    }
};

GameState.prototype.getStoredRoom = function() {
    var sg = get_saved_game();
    return sg[this.room] || {
        "open_doors": [],
        "pickups": []
    };
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

GameState.prototype.return_to_menu = function() {
	this.music.loop = false;
	this.music.stop();
	this.game.state.start("menu");
};

GameState.prototype.update_player_death = function() {
    if(Date.now() < this.player_death) {
        this.player.rotation += 0.02 * this.game.time.elapsed;
        this.player.y -= 0.05 * this.game.time.elapsed;
    } else {
        if(this.player.y < this.game.height) {
            this.player.rotation = Math.PI;
            this.player.y += 0.5 * this.game.time.elapsed;
        } else {
            this.player.x = this.room_entry_pos.x;
            this.player.y = this.room_entry_pos.y;
            this.player.rotation = 0;
            this.player_death = 0;
            this.game.physics.arcade.isPaused = false;
            if(this.lives <= 0) {
                delete_saved_game();
				this.return_to_menu();
			}
        }
    }
};

// "pulse" the player for some added animation
GameState.prototype.tap_player = function() {
    this.tap_timer += this.game.time.elapsed;
    if(this.tap_timer >= this.TAP_INTERVAL_MILLIS) {
        this.tap_direction *= -1;
        this.tap_timer = 0;
    }
    var d = this.TAP_DELTA * (this.tap_timer / this.TAP_INTERVAL_MILLIS);
    this.player.scale.y = ATLAS_SCALE * Math.min(this.PLAYER_SCALE, this.tap_direction == 1 ? (this.PLAYER_SCALE - this.TAP_DELTA) + d : this.PLAYER_SCALE - d);
};

GameState.prototype.player_collision_detection = function(onLadder) {
	if ((!this.jumping || this.jump_over)) {
        // don't collide with jump-thru platforms when still jumping (see comment above)
        this.game.physics.arcade.collide(this.player, this.platforms);
    }
    this.game.physics.arcade.collide(this.player, this.ground);
};

GameState.prototype.try_step_up = function(dy) {
	this.player.body.position.y -= dy;
	this.player.position.y -= dy;
	if(this.game.physics.arcade.overlap(this.player, this.ground)) {
		this.player.body.position.y += dy;
		this.player.position.y += dy;
		return false;
	} else {
		return true;
	}
};

GameState.prototype.update_game = function() {
    var onLadder = this.game.physics.arcade.overlap(this.player, this.ladders);

    if(this.accelerated) this.tap_player();

    this.player.body.allowGravity = !onLadder;

    // Jumping is "over" (ie. will start colliding with jump-thru platforms),
    // when we're heading down and pass an area of no platforms (free space).
    //
    // This is we can jump in a smooth arc when there are jump-thru platforms
    // overhead.
    if(this.jumping && !this.jump_over && this.player.body.velocity.y > 0) {
        if(!this.game.physics.arcade.overlap(this.player, this.platforms)) this.jump_over = true;
    }

    // collision detection
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

	// try to not get stuck in floor when moving sideways
	if(onLadder && this.player.body.acceleration.x != 0 && (this.game.physics.arcade.overlap(this.player, this.ground) || this.game.physics.arcade.overlap(this.player, this.platforms))) {
		this.try_step_up(2);
	}

	// player collision detection
	if ((!this.jumping || this.jump_over)) {
        // don't collide with jump-thru platforms when still jumping (see comment above)
        this.game.physics.arcade.collide(this.player, this.platforms);
    }
    this.game.physics.arcade.collide(this.player, this.ground);

    // Set a variable that is true when the player is touching the ground
    var onTheGround = this.player.body.touching.down;
    if (this.jumping) {
        if (onTheGround || onLadder) {
            this.player.rotation = 0;
            this.jumping = false;
            this.jump_over = false;
        } else {
            this.player.rotation += (this.player.scale.x < 0 ? -1 : 1) * 0.01 * this.game.time.elapsed;
        }
    }

    if ((onTheGround || onLadder) && (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.mobile_controller_pos.jump_active)) {
        this.player.body.acceleration.y = 0;
        this.player.body.velocity.y = this.JUMP_SPEED;
        this.jumping = true;
    } else if (onLadder) {
        if (this.input.keyboard.isDown(Phaser.Keyboard.UP) || this.mobile_controller_pos.dy < 0) {
            this.player.body.acceleration.y = -this.ACCELERATION;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.DOWN) || this.mobile_controller_pos.dy > 0) {
            this.player.body.acceleration.y = this.ACCELERATION;
        } else {
            this.player.body.acceleration.y = this.player.body.velocity.y = 0;
        }
    }

    // animation
    var moving = false;
    if(onLadder) {
        this.player.animations.play("climb");
        moving = !(this.player.body.velocity.x == 0 && this.player.body.velocity.y == 0);
    } else {
        this.player.animations.play("walk");
        moving = this.player.body.velocity.x != 0;
        if (moving) {
            // directional sprite
            this.player.scale.x = ATLAS_SCALE * (this.player.body.velocity.x < 0 ? -this.PLAYER_SCALE : this.PLAYER_SCALE);
        }
    }

    if (!moving && !this.player.animations.paused) {
        this.player.animations.paused = true;
        this.player.animations.frameName = onLadder ? "ermin_climb1" : "ermin";
    } else if (moving && this.player.animations.paused) {
        this.player.animations.paused = false;
    }

    // move enemies
    this.enemies.forEach(this.move_enemy, this, true);

    // enemies collision check
    if(!this.god_mode) {
        this.game.physics.arcade.overlap(this.player, this.enemies.children, this.enemyOverlap, null, this);
    }

    // screen boundary checking
    var load_room = this.check_screen_edges();
    if (load_room) {
        this.room_entry_pos.x = this.player.x;
        this.room_entry_pos.y = this.player.y;

        // save the game
        this.save_game_state(load_room);

        // switch rooms
        this.create_room(load_room);
    }
};

GameState.prototype.save_game_state = function(next_room) {
    var sg = get_saved_game();
    sg["lives"] = this.lives;
    sg["score"] = this.score;
    sg["player_keys"] = this.player_keys;
    sg["has_disk"] = this.has_disk;
    sg[this.room] = this.stored_room;
    sg["room"] = next_room || this.room;
    sg["room_entry_pos"] = this.room_entry_pos;
    save_game(sg);
};

GameState.prototype.update = function() {
    if(this.player_death != 0) {
        this.update_player_death()
    } else {
        this.update_game();
    }
};
