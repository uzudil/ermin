// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

var spike_move = function(game_state, sprite, enemy) {
    var n = Date.now();
    if(!sprite["timer"] || n > sprite["timer"]) {
        if(sprite["on"]) {
            sprite.position.y += 16;
            sprite["on"] = false;
        } else  {
            sprite.position.y -= 16;
            sprite["on"] = true;
        }
        var t = ((((Math.random() * 5) + 1)|0) * 500);
        sprite["timer"] = n + t;
    }

};

var horizontal_move = function(game_state, sprite, enemy) {
    if(sprite.body.velocity.x == 0) sprite.body.velocity.x = enemy.speed;
    var to_left = sprite.body.velocity.x < 0;
    var flip = !sprite.body.touching.down ||
        (sprite.body.touching.left && to_left) ||
        (sprite.body.touching.right && !to_left) ||
        (sprite.x <= 0 && to_left) ||
        (sprite.x >= game_state.game.width - sprite.width && !to_left);
    if (flip) {
        sprite.body.velocity.x *= -1;
    }
    // directional sprites
    if (sprite.body.velocity.x != 0) {
        sprite.scale.x = sprite.body.velocity.x < 0 ? -1 : 1;
    }
};

var vertical_move = function(game_state, sprite, enemy) {
    if(sprite.body.velocity.y == 0) sprite.body.velocity.y = enemy.speed;
    var to_up = sprite.body.velocity.y < 0;
    var flip = (sprite.body.touching.up && to_up) ||
        (sprite.body.touching.down && !to_up) ||
        (sprite.y <= 0 && to_up) ||
        (sprite.y >= game_state.game.height - sprite.height && !to_up);
    if (flip) {
        sprite.body.velocity.y *= -1;
    }
};

var oscillate_move = function(game_state, sprite, enemy) {
    if(!sprite["delta_offset"]) sprite["delta_offset"] = 0.05;
    sprite.anchor.y += sprite.delta_offset;
    var to_up = sprite.delta_offset < 0;
    var flip = (to_up && sprite.anchor.y <= -0.5) || (!to_up && sprite.anchor.y >= 0);
    if (flip) {
        sprite.delta_offset *= -1;
    }
};

var cannonball_move = function(game_state, sprite, enemy) {
    if(!sprite["cannon_dir"]) sprite["cannon_dir"] = 1;
    if(sprite.body.velocity.x == 0) sprite.body.velocity.x = sprite.cannon_dir * enemy.speed;
    var to_left = sprite.body.velocity.x < 0;
    var hit = (sprite.body.touching.left && to_left) ||
        (sprite.body.touching.right && !to_left) ||
        (sprite.x <= 0 && to_left) ||
        (sprite.x >= game_state.game.width - sprite.width && !to_left);
    if(hit) sprite.kill();
    else sprite.rotation += sprite.cannon_dir * 0.025 * game_state.game.time.elapsed;
};

var cannon1_move = function(game_state, sprite, enemy) {
    create_cannonball(1, game_state, sprite, enemy);
};

var cannon2_move = function(game_state, sprite, enemy) {
    create_cannonball(-1, game_state, sprite, enemy);
};

function create_cannonball(dir, game_state, sprite, enemy) {
    var now = Date.now();
    if(!sprite["cannon_timer"] || now - sprite.cannon_timer > 3000) {
        sprite["cannon_timer"] = now;
        var cannonball = game_state.create_block(sprite.x + (dir == 1 ? 60 : -10), sprite.y + 16, "cannonball", game_state.enemies, 0xffff00);
        cannonball["cannon_dir"] = dir;
        cannonball.anchor.x = 0.5;
        cannonball.anchor.y = 0.5;
        sprite.y -= 10; // the backfire
    }
}

var ENEMIES =  {
    // key is the name of the shape in the room definition
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
    },
    "ameba1": {
        seq: [ "ameba1", "ameba2" ],
        move: vertical_move,
        speed: 100,
        gravity: false
    },
    "ameba2": {
        seq: [ "ameba1", "ameba2" ],
        move: horizontal_move,
        speed: 100,
        gravity: true
    },
    "goblin1": {
        seq: [ "goblin1", "goblin2", "goblin3" ],
        move: horizontal_move,
        speed: 150,
        gravity: true
    },
    "spike1": {
        seq: [],
        move: spike_move
    },
    "danger": {
        seq: [],
        move: oscillate_move
    },
    "cannon1": {
        seq: [],
        move: cannon1_move,
        gravity: true
    },
    "cannon2": {
        seq: [],
        move: cannon2_move,
        gravity: true
    },
    "cannonball": {
        seq: [],
        speed: 250,
        move: cannonball_move,
        gravity: false
    }
};
