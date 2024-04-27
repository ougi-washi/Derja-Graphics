
export function createTexture(gl, program, textureImagePath, textureUnit, uniformName) {
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