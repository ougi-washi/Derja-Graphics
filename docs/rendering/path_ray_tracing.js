// Derja Graphics - Jed Fakhfekh - https://github.com/ougi-washi
 
import * as webgl_lib from '../libs/webgl.js';

(function(){
    webgl_lib.startWebGL('index_vertex.glsl', 'rendering/path_ray_tracing_fragment.glsl');
})();
