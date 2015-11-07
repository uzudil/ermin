// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

var BLOCK_SIZE = 16;

var TEXTURES = {}; // will be filled in from tex.json

var PALETTE = {
    black:              [0x000000, 0, 0],
    black_bright:       [0x000000, 0, 4],
    blue:               [0x0088bb, 4, 0],
    blue_bright:        [0x0055dd, 4, 4],
    red:                [0xbb0000, 8, 0],
    red_bright:         [0xff0000, 8, 4],
    purple:             [0xbb00bb, 12, 0],
    purple_bright:      [0xff00ff, 12, 4],
    green:              [0x00bb00, 16, 0],
    green_bright:       [0x00ff00, 16, 4],
    turquoise:          [0x00bbbb, 20, 0],
    turquoise_bright:   [0x00ffff, 20, 4],
    yellow:             [0xbbbb00, 24, 0],
    yellow_bright:      [0xffff00, 24, 4],
    white:              [0xbbbbbb, 28, 0],
    white_bright:       [0xffffff, 28, 4],
    orange:              [0xbb9900, 28, 0],
    orange_bright:       [0xffcc00, 28, 4]
};

var BLOCKS = [
    [],
    ["red", "wall1"],
    ["blue", "wall1"],
    ["green", "wall1"],
    ["red", "brick1"],
    ["red_bright", "brick1"],
    ["red", "floor1"],
    ["blue_bright", "floor1"],
    ["green_bright", "floor1"],
    ["yellow", "ladder1"],
    ["yellow_bright", "cannon1"],
    ["yellow_bright", "cannon2"],
    ["white_bright", "ermin"],
    ["yellow_bright", "baddy1"],
    ["purple", "kettle1"],
    ["red_bright", "roof1"],
    ["red_bright", "roof2"],
    ["orange_bright", "lamp"],
    ["yellow", "vine"],
    ["red", "wall2"],
    ["blue", "wall2"],
    ["green", "wall2"],
    ["red", "brick2"],
    ["blue", "brick2"],
    ["green", "brick2"],
    ["red", "floor2"],
    ["blue", "floor2"],
    ["green", "floor2"],
    ["red", "floor3"],
    ["blue", "floor3"],
    ["green", "floor3"],
    ["white", "door_closed"],
    ["white", "key"],
    ["yellow", "door_closed"],
    ["yellow", "key"],
    ["red", "door_closed"],
    ["red", "key"],
    ["green", "door_closed"],
    ["green", "key"],
    ["blue", "door_closed"],
    ["blue", "key"],
    ["purple", "door_closed"],
    ["purple", "key"],
    ["turquoise", "door_closed"],
    ["turquoise", "key"],
    ["purple_bright", "ameba1"],
    ["blue_bright", "ameba2"],
    ["red", "ledge_right"],
    ["red", "ledge_left"],
    ["yellow_bright", "coin"],
    ["green", "spike1"],
    ["white", "book1"],
    ["white", "book2"],
    ["white", "window"],
    ["white", "wall_decor"],
    ["white", "vase"],
    ["white", "barrel"],
    ["white", "column"],
    ["white", "arch1"],
    ["white", "arch2"],
    ["turquoise", "goblin1"],
    ["white", "web"],
    ["white", "web2"],
    ["turquoise_bright", "danger"],
    ["white", "tree"],
    ["green", "leaf"],
    ["green_bright", "leaf2"],
    ["red_bright", "cannonball"],
    ["turquoise", "butterfly1"],
    ["turquoise", "piston1"],
	["yellow", "pipe_vert_rib"],
	["yellow", "pipe_horiz_rib"],
	["yellow", "pipe_vert"],
	["yellow", "pipe_horiz"],
	["yellow", "pipe_cross"],
	["yellow", "pipe_sw"],
	["yellow", "pipe_se"],
	["yellow", "pipe_nw"],
	["yellow", "pipe_ne"],
	["purple", "wall2"],
	["purple", "brick1"],
	["purple", "wall1"],
	["purple", "brick2"],
	["purple", "floor1"],
	["purple", "floor2"],
	["purple", "floor3"],
	["turquoise", "wall2"],
	["turquoise", "brick1"],
	["turquoise", "wall1"],
	["turquoise", "brick2"],
	["turquoise", "floor1"],
	["turquoise", "floor2"],
	["turquoise", "floor3"],
	["yellow", "vine2"],
	["yellow", "vine3"],
	["turquoise", "ghost1"],
	["white", "skull"],
	["white", "grave1"],
	["white", "grave2"],
	["white", "plane1"],
	["white", "plane2"],
	["turquoise", "disk"],
	["yellow", "alien1"],
	["white", "cloud"]
];

EXTRA_INFO = {
    "wall2": {
        jump_thru: false
    },
    "brick1": {
        jump_thru: false
    },
    "brick2": {
        jump_thru: true
    },
    "ladder1": {
        ladder: true
    },
	"vine": {
        ladder: true
    },
	"vine2": {
        ladder: true
    },
	"vine3": {
        ladder: true
    },
    "door_open": {
        door: true
    },
    "door_closed": {
        door: true
    },
    "key": {
        pickup: true
    },
    "coin": {
        pickup:  true
    },
    "ledge_right": {
        jump_thru:  true
    },
    "ledge_left": {
        jump_thru:  true
    },
    "book1": {
        decor: true
    },
    "book2": {
        decor: true
    },
    "window": {
        decor: true
    },
    "wall_decor": {
        decor: true
    },
    "vase": {
        decor: true
    },
    "barrel": {
        decor: true
    },
    "column": {
        decor: true
    },
    "arch1": {
        decor: true
    },
    "arch2": {
        decor: true
    },
    "web": {
        decor: true
    },
    "web2": {
        decor: true
    },
    "tree": {
        decor: true
    },
    "lamp": {
        decor: true
    },
	"pipe_vert_rib": {
        ladder: true
    },
	"pipe_horiz_rib": {
        ladder: true
    },
	"pipe_vert": {
        ladder: true
    },
	"pipe_horiz": {
        ladder: true
    },
	"pipe_cross": {
        ladder: true
    },
	"pipe_sw": {
        ladder: true
    },
	"pipe_se": {
        ladder: true
    },
	"pipe_nw": {
        ladder: true
    },
	"pipe_ne": {
        ladder: true
    },
	"skull": {
        decor: true
    },
	"grave1": {
        decor: true
    },
	"grave2": {
        decor: true
    },
	"plane1": {
        decor: true
    },
	"plane2": {
        decor: true
    },
	"disk": {
		pickup: true
	},
	"cloud": {
        decor: true
    }
};

function Textures() {

}

Textures.prototype.load = function(on_complete) {

    $.ajax({
        url: "../data/tex.json",
        dataType: "json",
        success: bind(this, function(data) {
            for(var i = 0; i < data.frames.length; i++) {
                var f = data.frames[i];
                TEXTURES[f.filename] = {
                    x: (f.frame.x/16)|0,
                    y: (f.frame.y/16)|0,
                    w: (f.frame.w/16)|0,
                    h: (f.frame.h/16)|0
                }
            }

            $("body").append("<canvas id='blender' width='1024' height='1024' style='width: 512px; height: 512px; display: none;'></canvas>");
            var blender = $("#blender")[0];
            var x = blender.getContext("2d");

            var tex_img = new Image();
            tex_img.onload = bind(this, function() {
                this.tex_loaded(x, blender, tex_img);
                on_complete();
            });
            tex_img.src = "data/tex.png?cb=" + Date.now();
        })
    });
};

Textures.prototype.tex_loaded = function(x, blender, tex_img) {
    this.create_colored_tex(x, blender, tex_img);

    for(var block_index = 1; block_index < BLOCKS.length; block_index++) {
        // create css classes
        this.create_tool_icon(block_index);

        // create textures
    }

    $("#ready").show();
};

Textures.prototype.create_tool_icon = function(block_index) {
    $("#tools").append(this.get_div(block_index, "block_" + block_index, "tool_block"));
};

Textures.prototype.create_colored_tex = function(x, blender, tex_img) {
    var width = blender.width;
    var height = blender.height;

    // create colored versions of the texture image
    for (var color in PALETTE) {
        var pal = PALETTE[color];

        // background solid color
        x.globalCompositeOperation = "source-over";
        x.fillStyle = '#' + ("000000" + pal[0].toString(16)).substr(-6);
        x.fillRect(0, 0, width, height);

        x.globalCompositeOperation = "destination-in";
        x.drawImage(tex_img, 0, 0);

        $("body").append("<img id='tex_" + color + "' style='display: none;' class='blended_tex' src='" + blender.toDataURL() + "' data-src='" + blender.toDataURL() + "'>");
    }
};

Textures.prototype.get_div = function(block_index, id, css_class, style) {
    var block = BLOCKS[block_index];
    var color = block[0];
    var tex = TEXTURES[block[1]];
    var w = tex.w * BLOCK_SIZE * ATLAS_SCALE;
    var h = tex.h * BLOCK_SIZE * ATLAS_SCALE;
    var src = $("#tex_" + color).attr("data-src");
	var extra = EXTRA_INFO[block[1]];
	var enemy = ENEMIES[block[1]];
	var block_type;
	if(extra && extra["decor"]) block_type = "decor";
	else if(enemy) block_type = "enemy";
	else block_type = "platform";
    return "<div id='" + id + "' class='" + css_class + " " + block_type + "' " +
        " data-block_index='" + block_index + "' " +
        "style='" +
        " background-image: URL(" + src + "); " +
		" background-size: 512px; " +
        " background-position: " + (-tex.x * BLOCK_SIZE * ATLAS_SCALE) + "px " + (-tex.y * BLOCK_SIZE * ATLAS_SCALE) + "px; " +
        "width: " + w + "px; " +
        "height: " + h + "px; " +
        (style ? style : "") +
        "'>" +
        "</div>"
};
