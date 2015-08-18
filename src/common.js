bind = function(callerObj, method) {
    return function() {
        return method.apply(callerObj, arguments);
    };
};

// global constants
var clock, scene, camera, renderer, game_step;

init_gl = function(game_step_fx) {
    game_step = game_step_fx;
    renderer = new THREE.WebGLRenderer({ canvas: $("#game")[0] });
	// this.renderer.setPixelRatio( window.devicePixelRatio );
//	renderer.setSize( window.innerWidth, window.innerHeight );
//	document.body.appendChild( this.renderer.domElement );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 500;
	scene = new THREE.Scene();
    scene.rotation.x = Math.PI; // make Y+ point up

//	window.addEventListener( 'resize', onWindowResize, false );

    clock = new THREE.Clock();
    clock.start();
};

//onWindowResize = function() {
//	camera.aspect = window.innerWidth / window.innerHeight;
//	camera.updateProjectionMatrix();
//	renderer.setSize( window.innerWidth, window.innerHeight );
//};

animate = function() {
    requestAnimationFrame(animate);

    var dt = this.clock.getDelta();
    game_step(dt);
	renderer.render(scene, camera);
};

load_tex = function(src, id, on_complete) {
    var img = new Image();
    img.onload = function() {
        $("#loading").hide(400, null, function() {
            $("#" + id).src = img.src;
            on_complete();
        });
    };
    $("#loading").show(400, null, function() {
        img.src = src;
    });
};
