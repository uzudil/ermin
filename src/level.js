var CHUNK_SIZE = 16;
var BOX_SIZE = 10;
var BOX_GEO = new THREE.BoxGeometry( BOX_SIZE, BOX_SIZE, BOX_SIZE );
var COLORS = {};
var VIEW_WIDTH = 5 * CHUNK_SIZE * BOX_SIZE;
var VIEW_HEIGHT = 4 * CHUNK_SIZE * BOX_SIZE;

function Level(level_index, jumperX) {
    this.level_index = level_index;
    this.jumperX = jumperX;
    this.raw_data = eval("level_" + level_index)();
    this.position = new THREE.Vector3(this.raw_data.start.x * BOX_SIZE, this.raw_data.start.y * BOX_SIZE, 0);
    this.orig_position = this.position.clone();

    // create chunks and shapes
    this.max_x = 0;
    this.max_y = 0;
    this.chunks = {};
    for(var i = 0; i < this.raw_data.floors.length; i++) {
        var floor = this.raw_data.floors[i];
        for(var x = 0; x < floor.w; x++) {
            for(var y = 0; y < floor.h; y++) {
                var fx = floor.x + x;
                var fy = floor.y + y;
                var chunk = this.get_chunk(fx, fy, true);
                if((fx + CHUNK_SIZE) * BOX_SIZE > this.max_x) this.max_x = (fx + CHUNK_SIZE) * BOX_SIZE;
                if((fy + CHUNK_SIZE) * BOX_SIZE > this.max_y) this.max_y = (fy + CHUNK_SIZE) * BOX_SIZE;
                var mesh = new THREE.Mesh( BOX_GEO, this.get_color(floor.color) );
                mesh.position.set(
                        fx * BOX_SIZE - chunk.position.x,
                        fy * BOX_SIZE - chunk.position.y,
                        0);
                chunk.add(mesh);
            }
        }
    }

    this.level_obj = new THREE.Object3D();

    // for debugging
    var background = new THREE.Mesh(
        new THREE.BoxGeometry(VIEW_WIDTH, VIEW_HEIGHT, 0),
        new THREE.MeshBasicMaterial( { color: 0x222222 } )
    );
    background.position.z = BOX_SIZE/2 + 1;
    this.level_obj.add(background);

    this.obj = new THREE.Object3D();
    this.level_obj.add(this.obj);
    this.jumperX.scene.add(this.level_obj);
    this.update = true;
}

Level.prototype.get_color = function(color) {
    var c = color ? color : 0xff0000;
    if(COLORS[c] == null) {
        COLORS[c] = new THREE.MeshBasicMaterial( { color: c, wireframe: false } );
    }
    return COLORS[c];
};

Level.prototype.get_chunk = function(x, y, create_if_missing) {
    var xp = (x/(CHUNK_SIZE))|0;
    var yp = (y/(CHUNK_SIZE))|0;
    var key = xp + "," + yp;
    if(this.chunks[key] == null && create_if_missing) {
        var o = new THREE.Object3D();
        o.position.set(
                (xp * CHUNK_SIZE + CHUNK_SIZE/2) * BOX_SIZE,
                (yp * CHUNK_SIZE + CHUNK_SIZE/2) * BOX_SIZE,
            0);
        o.name = key;

//        // for debugging
//        var background = new THREE.Mesh(
//        new THREE.BoxGeometry(CHUNK_SIZE * BOX_SIZE, CHUNK_SIZE * BOX_SIZE, 10),
//            new THREE.MeshBasicMaterial( { color: 0x888888, wireframe: true } )
//        );
//        o.add(background);

        this.chunks[key] = o;
        console.log("created chunk " + o.name);
    }
    return this.chunks[key];
};

Level.prototype.draw = function() {
    if(this.update) {
        console.log("updating at " + this.position.x + "," + this.position.y);
        var seen_chunks = {};
        for(var x = this.position.x; x <= this.position.x + VIEW_WIDTH; x+= CHUNK_SIZE * BOX_SIZE) {
            for(var y = this.position.y; y <= this.position.y + VIEW_HEIGHT; y+= CHUNK_SIZE * BOX_SIZE) {
                var chunk = this.get_chunk((x/BOX_SIZE)|0, (y/BOX_SIZE)|0);
                if(chunk) {
                    seen_chunks[chunk.name] = true;
                    if(!chunk.parent) {
                        this.obj.add(chunk);
                        console.log("+ chunk " + chunk.name);
                    }
                }
            }
        }
        for(var i = 0; i < this.obj.children.length; i++) {
            var chunk = this.obj.children[i];
            if(seen_chunks[chunk.name] != true) {
                this.obj.remove(chunk);
                console.log("- chunk " + chunk.name);
                i--;
            }
        }
        this.obj.position.set(-this.position.x - VIEW_WIDTH/2, -this.position.y - VIEW_HEIGHT/2, 0);
        this.orig_position.copy(this.position);
        this.update = false;
    }
};

Level.prototype.move = function(dx, dy) {
    var old_x = this.position.x;
    var old_y = this.position.y;
    this.position.set(this.position.x + dx, this.position.y + dy, 0);
    if(this.position.x < -VIEW_WIDTH/2) this.position.x =  -VIEW_WIDTH/2;
    if(this.position.y < -VIEW_HEIGHT/2) this.position.y = -VIEW_HEIGHT/2;
    if(this.position.x > this.max_x-VIEW_HEIGHT/2) this.position.x = this.max_x-VIEW_HEIGHT/2;
    if(this.position.y > this.max_y-VIEW_HEIGHT/2) this.position.y = this.max_y-VIEW_HEIGHT/2;
//    console.log("" + this.position.x + "," + this.position.y);
    if(Math.abs(this.orig_position.x - this.position.x) >= CHUNK_SIZE * BOX_SIZE ||
        Math.abs(this.orig_position.y - this.position.y) >= CHUNK_SIZE * BOX_SIZE) {
        this.update = true;
    } else {
        this.obj.position.set(this.obj.position.x - (this.position.x - old_x), this.obj.position.y - (this.position.y - old_y), 0);
    }
};
