N = 1;
S = 2;
E = 3;
W = 4;

// same order as above
MOVE_KEYS = [ 0, 38, 40, 39, 37 ];

MOVE_SPEED = 10;

bind = function(callerObj, method) {
    return function() {
        return method.apply(callerObj, arguments);
    };
};

function JumperX() {
    this.move = 0;

    this.init_gl();

    // load level 1
    this.load_level(1);

	this.animate();
}

JumperX.prototype.init_gl = function() {
    this.renderer = new THREE.WebGLRenderer();
	// this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( this.renderer.domElement );

	this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	this.camera.position.z = 500;
	this.scene = new THREE.Scene();
    this.scene.rotation.x = Math.PI; // make Y+ point up

	window.addEventListener( 'resize', bind(this, this.onWindowResize), false );

    window.addEventListener('keydown', bind(this, this.onKeyDown), false);
    window.addEventListener('keyup', bind(this, this.onKeyUp), false);

    this.clock = new THREE.Clock();
    this.clock.start();
};

JumperX.prototype.onKeyDown = function(event) {
//    console.log(event.which);
    var dir = MOVE_KEYS.indexOf(event.which);
    if(dir >= N) {
        this.move |= (1 << dir);
    }
};

JumperX.prototype.onKeyUp = function(event) {
    var dir = MOVE_KEYS.indexOf(event.which);
    if(dir >= N) {
        this.move &= ~(1 << dir);
    }
};

JumperX.prototype.onWindowResize = function() {
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
};

JumperX.prototype.animate = function() {
	requestAnimationFrame( bind(this, this.animate) );

    var dt = this.clock.getDelta();
    if(this.move) {
        var dx = 0;
        var dy = 0;
        if(this.move & (1 << N)) dy -= MOVE_SPEED;
        if(this.move & (1 << S)) dy += MOVE_SPEED;
        if(this.move & (1 << E)) dx += MOVE_SPEED;
        if(this.move & (1 << W)) dx -= MOVE_SPEED;
        this.level.move(dx * dt * 100, dy * dt * 100);
    }

	// this.mesh.rotation.x += 0.005;
	// this.mesh.rotation.y += 0.01;
    this.level.draw();
	this.renderer.render( this.scene, this.camera );
};

JumperX.prototype.load_level = function(level_index) {
    this.level = new Level(level_index, this);
};
