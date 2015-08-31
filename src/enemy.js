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
    "spike1": {
        seq: [],
        move: spike_move
    }
};
