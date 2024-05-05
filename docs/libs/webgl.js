// Derja Graphics - Jed Fakhfekh - https://github.com/ougi-washi

function createTexture(gl, program, textureImagePath, textureUnit, uniformName) {
    var texture = gl.createTexture();
    var textureImage = new Image();
    textureImage.onload = function() {
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        var uniformLocation = gl.getUniformLocation(program, uniformName);
        gl.uniform1i(uniformLocation, textureUnit);
    };
    textureImage.onerror = function() {
       console.log("Issue loading texture: " + textureImagePath);
    };
    textureImage.src = textureImagePath;
}

export function startWebGL(vertexFile, fragmentFile){
    "use strict";
    var gl,
        program,
        startTime = Date.now(), // Start time for animation
        vertexSource, // Declare as global variables
        fragmentSource,
        shadersLoaded = 0; // Track the number of loaded shaders

    window.addEventListener("load", loadShaderFiles, false);
    window.addEventListener("resize", handleResize, false);

    function loadShaderFiles() {
        console.log('Loading shaders');
        var vertexXHR = new XMLHttpRequest();
        vertexXHR.open('GET', new URL('../' + vertexFile, import.meta.url), true);
        vertexXHR.onreadystatechange = function() {
            if (vertexXHR.readyState === XMLHttpRequest.DONE) {
                if (vertexXHR.status === 200) {
                    vertexSource = vertexXHR.responseText;
                    console.log('Vertex shader loaded successfully');
                    shadersLoaded++;
                    checkShadersLoaded();
                } else {
                    console.error('Failed to load vertex shader: ' + vertexXHR.status);
                }
            }
        };
        vertexXHR.send();

        var fragmentXHR = new XMLHttpRequest();
        fragmentXHR.open('GET', new URL('../' + fragmentFile, import.meta.url), true);
        fragmentXHR.onreadystatechange = function() {
            if (fragmentXHR.readyState === XMLHttpRequest.DONE) {
                if (fragmentXHR.status === 200) {
                    fragmentSource = fragmentXHR.responseText;
                    console.log('Fragment shader loaded successfully');
                    shadersLoaded++;
                    checkShadersLoaded();
                } else {
                    console.error('Failed to load fragment shader: ' + fragmentXHR.status);
                }
            }
        };
        fragmentXHR.send();
    }

    function checkShadersLoaded() {
        if (shadersLoaded === 2) { // Both shaders are loaded
            setupWebGL();
        }
    }

    function setupWebGL() {
        console.log('Setting up WebGL');
        if (!(gl = getRenderingContext()))
            return;

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            var compileErrLog = gl.getShaderInfoLog(vertexShader);
            console.error('Vertex shader compilation error: ' + compileErrLog);
            return;
        }

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            var compileErrLog = gl.getShaderInfoLog(fragmentShader);
            console.error('Fragment shader compilation error: ' + compileErrLog);
            return;
        }

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
        OnDoneSetupWebGL();

        render(); // Start the rendering loop
    }
    
    function OnDoneSetupWebGL()
    {
        document.addEventListener('mousemove', function(event) {
            var mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
            gl.uniform2f(mouseUniformLocation, event.clientX, event.clientY);
        });
        // createTexture(gl, program, new URL('./resources/textures/noises/T_PerlinNoise.PNG', import.meta.url), 0, 'u_perlin_noise');
    }

    function handleResize() {
        console.log('Window resized');
        // Update canvas size to match window size
        var canvas = document.querySelector("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Update viewport
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Re-render the scene
        render();
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
        if (buffer) {
            gl.deleteBuffer(buffer);
        }
        if (program) {
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

    function render() {
        // update uniforms
        var currentTime = (Date.now() - startTime) / 1000.0; // Time in seconds
        var timeUniformLocation = gl.getUniformLocation(program, "u_time");
        var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform1f(timeUniformLocation, currentTime);
        gl.useProgram(program);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
};