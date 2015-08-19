var BLOCK_SIZE = 16;

TEXTURES = {
    wall1: { x: 4, y: 0, w: 2, h: 2 },
    brick1: { x: 4, y: 2, w: 1, h: 1 },
    roof1: { x: 5, y: 2, w: 1, h: 1 },
    roof2: { x: 6, y: 2, w: 1, h: 1 },
    floor1: { x: 6, y: 0, w: 2, h: 2 },
    ladder1: { x: 8, y: 0, w: 2, h: 2 },
    cannon1: { x: 10, y: 0, w: 3, h: 2 },
    cannon2: { x: 13, y: 0, w: 3, h: 2 },
    baddy1: { x: 24, y: 30, w: 2, h: 2 },
    baddy2: { x: 26, y: 30, w: 2, h: 2 },
    kettle1: { x: 21, y: 29, w: 3, h: 3 },
    kettle2: { x: 18, y: 29, w: 3, h: 3 },
    ermin: { x: 29, y: 25, w: 3, h: 3 },
    lamp: { x: 7, y: 2, w: 3, h: 2 },
};

var PALETTE = {
    black:              [0x000000, 0, 0],
    black_bright:       [0x000000, 0, 4],
    blue:               [0x0000bb, 4, 0],
    blue_bright:        [0x0000ff, 4, 4],
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
    white_bright:       [0xffffff, 28, 4]
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
    ["yellow_bright", "lamp"],
];

function Textures() {

}

Textures.prototype.load = function(on_complete) {

    $("body").append("<canvas id='blender' width='512' height='512' style='width: 512px; height: 512px; display: none;'></canvas>");
    var blender = $("#blender")[0];
    var x = blender.getContext("2d");

    var tex_img = new Image();
    tex_img.onload = bind(this, function() {
        this.tex_loaded(x, blender, tex_img);
        on_complete();
    });
    tex_img.src = "data/tex.png";
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
    var w = tex.w * BLOCK_SIZE;
    var h = tex.h * BLOCK_SIZE;
    var src = $("#tex_" + color).attr("data-src");
    return "<div id='" + id + "' class='" + css_class + "' " +
        " data-block_index='" + block_index + "' " +
        "style='" +
        " background-image: URL(" + src + "); " +
        " background-position: " + (-tex.x * BLOCK_SIZE) + "px " + (-tex.y * BLOCK_SIZE) + "px; " +
        "width: " + w + "px; " +
        "height: " + h + "px; " +
        (style ? style : "") +
        "'>" +
        "</div>"
};
