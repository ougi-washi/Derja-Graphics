#version 100
#define STEPS 20

precision mediump float;

varying vec2 v_uv;
uniform float u_time; 

void main() {
	float red = sin(u_time) * 0.5 + 0.5;
	gl_FragColor = vec4(red, v_uv.y, 0.34, 1.0);
}