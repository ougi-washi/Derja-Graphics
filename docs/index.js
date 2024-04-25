;(function(){
"use strict"
window.addEventListener("load", setupWebGL, false);
var gl,
	program;
function setupWebGL(evt) {
	window.removeEventListener(evt.type, setupWebGL, false);
        if (!(gl = getRenderingContext()))
        	return;

	var source = document.querySelector("#vertex-shader").innerHTML;
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, source);
        gl.compileShader(vertexShader);
        source = document.querySelector("#fragment-shader").innerHTML;
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, source);
        gl.compileShader(fragmentShader);
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        	var linkErrLog = gl.getProgramInfoLog(program);
        	cleanup();
        	document.querySelector("canvas").innerHTML =
                "Shader program did not link successfully. "
                + "Error log: " + linkErrLog;
                return;
        }

        initializeAttributes();

        gl.useProgram(program);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Draw a rectangle

        cleanup();
}

var buffer;

function initializeAttributes() {
        var vertices = new Float32Array([
        -1.0, -1.0,  // bottom-left corner
        1.0, -1.0,   // bottom-right corner
        -1.0, 1.0,   // top-left corner
        1.0, 1.0     // top-right corner
        ]);

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
}

function cleanup() {
	gl.useProgram(null);
	if (buffer){
		gl.deleteBuffer(buffer);
	}
	if (program){ 
  		gl.deleteProgram(program);

	}
}

function getRenderingContext() {
	var canvas = document.querySelector("canvas");
	canvas.width = canvas.clientWidth;
  	canvas.height = canvas.clientHeight;
  	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  	if (!gl) {
    		var paragraph = document.querySelector("p");
    		paragraph.innerHTML = "Failed to get WebGL context."
      		+ "Your browser or device may not support WebGL.";
    		return null;
	}
  	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  	gl.clearColor(0.0, 0.0, 0.0, 1.0);
  	gl.clear(gl.COLOR_BUFFER_BIT);
  	return gl;
}
})();
