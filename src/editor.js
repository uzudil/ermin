// Heads on Stick, Inc (c) 2015
// Licensed under the terms of the MIT License

var WIDTH = 50 * BLOCK_SIZE;
var HEIGHT = 38 * BLOCK_SIZE;

function JumperXEditor() {
    // do not cache any ajax calls EVAR!!1!
    $.ajaxSetup({ cache: false });

    this.textures = new Textures();
    this.textures.load(bind(this, function() {
        $("#save_room").click(bind(this, this.save_room));
        $("#load_room").click(bind(this, this.load_room));
        for(var name in DESCRIPTIONS) $("#room_names").append("<option>" + name + "</option>");
        $("body").keyup(bind(this, this.keyup));
        $("body").keydown(bind(this, this.keydown));

        this.in_tool = true;
        this.tool_index = 0;
        this.selected_block = null;

        this.crsr_x = 0;
        this.crsr_y = 0;
        this.room = [];
        for(var x = 0; x < (WIDTH/BLOCK_SIZE)|0; x++) {
            var row = [];
            this.room.push(row);
            for(var y = 0; y < (HEIGHT/BLOCK_SIZE)|0; y++) {
                row.push(0);
            }
        }

        this.render();

//        animate();
    }));
}

JumperXEditor.prototype.load_room = function() {
    get_room($("#room_names").val(), bind(this, function(room_data) {
        this.load(room_data);
    }));
    return false;
};

JumperXEditor.prototype.save_room = function() {
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.room));

    var e = $("#save_room");
    e.attr("download", $('#room_name').val() + '.json');
    e.attr("href", "data:" + data);
//    $('<a id="download_link" href="data:' + data + '" download="' + $('#room_name').val() + '.json">Download</a>').appendTo('#ready');
};

JumperXEditor.prototype.save = function() {
    window.prompt("Copy to clipboard:", JSON.stringify(this.room));
};

JumperXEditor.prototype.load = function(data) {
    this.room = data;
    $("#room").empty();
    for(var x = 0; x < this.room.length; x++) {
        for(var y = 0; y < this.room[0].length; y++) {
            if(this.room[x][y]) {
                $("#room").append(this.textures.get_div(this.room[x][y], "b" + x + "_" + y, "block",
                        "left: " + (x * BLOCK_SIZE) + "px; top: " + (y * BLOCK_SIZE) + "px;"));
            }
        }
    }
};

JumperXEditor.prototype.game_step = function(dt) {
     this.mesh.rotation.z += 0.5 * dt;
     this.mesh.rotation.x += 0.5 * dt;
};

JumperXEditor.prototype.keydown = function(event) {
    var handled = false;
    if(this.in_tool) {
        if(event.which == 39 || event.which == 40) {
            if(this.tool_index < $("#tools .tool_block").length - 1) this.tool_index++;
        } else if(event.which == 37 || event.which == 38) {
            if(this.tool_index > 0) this.tool_index--;
        }
        handled = true;
    } else {
        var t = TEXTURES[BLOCKS[this.selected_block][1]];
        var step_x = (t.w * ATLAS_SCALE)|0;
        var step_y = (t.h * ATLAS_SCALE)|0;
        if(!!window.event.shiftKey) {
            step_x = step_y = 1;
        }
        var draw = window.event.ctrlKey;
        switch(event.which) {
            case 39: // right
                this.crsr_x += step_x;
                if(this.crsr_x >= ((WIDTH/BLOCK_SIZE)|0)) this.crsr_x -= step_x;
                break;
            case 40: // down
                this.crsr_y += step_y;
                if(this.crsr_y >= ((HEIGHT/BLOCK_SIZE)|0)) this.crsr_y -= step_y;
                break;
            case 37: // left
                this.crsr_x -= step_x;
                if(this.crsr_x < 0) this.crsr_x += step_x;
                break;
            case 38: // up
                this.crsr_y -= step_y;
                if(this.crsr_y < 0) this.crsr_y += step_y;
                break;
            case 32: case 13:
                draw = true;
                break;
            case 27: case 68:
                this.room[this.crsr_x][this.crsr_y] = 0;
                $("#b" + this.crsr_x + "_" + this.crsr_y).remove();
                break;
        }
        if(draw) {
            this.room[this.crsr_x][this.crsr_y] = this.selected_block;
            $("#b" + this.crsr_x + "_" + this.crsr_y).remove();
            $("#room").append(this.textures.get_div(this.selected_block, "b" + this.crsr_x + "_" + this.crsr_y, "block",
                    "left: " + (this.crsr_x * BLOCK_SIZE) + "px; top: " + (this.crsr_y * BLOCK_SIZE) + "px;"));
        }
        handled = true;
    }
    if(handled) this.render();
    return handled;
};

JumperXEditor.prototype.keyup = function(event) {
//    console.log(event.which);
    var handled = false;
    if(event.which == 84) {
        this.in_tool = !this.in_tool;
        this.render();
        handled = true;
    }
    return handled;
};

JumperXEditor.prototype.render = function(event) {
    $("#tools").toggleClass("active", this.in_tool);
    $("#view").toggleClass("active", !this.in_tool);

    if(!this.in_tool) {
        $("#cursor").css({
            left: this.crsr_x * BLOCK_SIZE + "px",
            top: this.crsr_y * BLOCK_SIZE + "px",
            width: BLOCK_SIZE + "px",
            height: BLOCK_SIZE + "px"
        }).show();
    } else {
        $("#cursor").hide();
    }

    $("#tools .tool_block").removeClass("active");
    if(this.in_tool) {
        $("#tools .tool_block").eq(this.tool_index).addClass("active");
        this.selected_block = $("#tools .tool_block.active").data("block_index");
    }
};

