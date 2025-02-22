import {Engine, Scene, ShaderMaterial} from "@babylonjs/core";

const vertexShader = `
    attribute vec3 position;
	attribute vec2 uv;

	uniform float u_time;
    uniform mat4 worldViewProjection;
    uniform vec2 mousePos;
    uniform float ZScale;

    varying float name;
    varying vec2 vUV;

    void main() {
        vec2 st = uv;
        // st *= 3.0;
        // st = fract(st);
        
        float dist = distance(st * 10.0, vec2(0.5) * 10.0);
        float z = sin(dist - u_time) * 0.1;
        
//        vec3 pos = vec3(position.xy, z);
//        float dist = distance(uv, 0.5);
//        float z = sin(dist - u_time);

        vec3 newPos = vec3(position.xy, z);
        
        gl_Position = worldViewProjection * vec4(newPos, 1.0);
        vUV = uv;
    }
`

const fragmentShader = `
    uniform float u_time;
    #define PI 3.14159265358979323846

    varying float name;
    varying vec2 vUV;
    
    float square(in vec2 uv, in float borderWidth) {
        vec2 bl = step(vec2(borderWidth), uv);
        vec2 tr = step(vec2(borderWidth), 1.0 - uv);
        float pct = bl.x * bl.y * tr.x * tr.y;
        return pct;
    }
    
    float rectangle(in vec2 uv, in vec2 bottomLeft, in vec2 topRight) {
        vec2 st = uv;
        vec2 bl = step(bottomLeft, uv);
        vec2 tr = step(topRight, 1.0 - uv);
        float pct = bl.x * bl.y * tr.x * tr.y;
        return pct;
    }
    
    vec2 tile(in vec2 uv, in vec2 tiles) {
        vec2 st = uv * tiles;
        st = fract(st);
        return st;
    }
    
    vec2 rotate2D(in vec2 uv, in float angle) {
        vec2 st = uv;
        st -= 0.5;
        st = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * st;
        st += 0.5;
        return st;
    }
    
    float squares(in vec2 uv, in float min, in float max) {
        float sq = rectangle(uv, vec2(min, min), vec2(max, max));
        sq += rectangle(uv, vec2(min, max), vec2(max, min));
        sq += rectangle(uv, vec2(max, max), vec2(min, min));
        sq += rectangle(uv, vec2(max, min), vec2(min, max));
        return sq;
    }
    
    float stripes(in vec2 uv, in float stagger) {
        float stripeWidth = 0.5;
        float stripeAmount = 50.0;
        float slant = -1.0;
        float str = (uv.x + uv.y * slant) / 2.0;
        str = mod(str * stripeAmount + stagger, 1.0);
        str = step(str, stripeWidth);
        return str;
    }

    void main() {
        vec2 st = vUV;
        float stripeWidth = 0.3;
        float stripeAmount = 0.02;
        
        vec3 color = vec3(0.0);
        
        st = tile(st, vec2(8.0));

        vec3 red = vec3(0.67, 0.0, 0.0);
        float red_squares = squares(st, 0.0, 0.8);
        red *= red_squares;
        color += red;
        
        vec3 red2 = vec3(0.67, 0.0, 0.0);
        float red_stripes = stripes(st, 0.0);
        float square = square(st, 0.2);
        red_stripes *= 1.0 - square;
        float black_squares = squares(st, 0.0, 0.8);
        red_stripes *= 1.0 - black_squares;
        red2 *= red_stripes;
        color += red2;
        
        vec3 green = vec3(0.0, 0.47, 0.25);
        float green_stripes = stripes(st, 0.0);
        green_stripes *= square;
        green *= green_stripes;
        color += green;
        
        vec3 green2 = vec3(0.0, 0.27, 0.15);
        float green_stripes2 = stripes(st, 0.5);
        float black_squares2 = squares(st, 0.0, 0.8);
        green2 *= 1.0 - black_squares;
        green2 *= green_stripes2;
        color += green2;
        
        float black_squares3 = squares(st, 0.2, 0.7);
        color *= 1.0 - black_squares3;
        float black_squares4 = squares(st, 0.0, 0.98);
        color *= 1.0 - black_squares4;
        
        float black_stripes = stripes(st, 0.0);
        float border_squares = rectangle(st, vec2(0.0, 0.0), vec2(0.98, 0.0));
        border_squares += rectangle(st, vec2(0.0, 0.98), vec2(0.0, 0.0));
        border_squares += rectangle(st, vec2(0.98, 0.0), vec2(0.0, 0.0));
        border_squares += rectangle(st, vec2(0.0, 0.0), vec2(0.0, 0.98));
        black_stripes *= border_squares;
        color *= 1.0 - black_stripes;
        
        float black_stripes2 = stripes(st, 0.5);
        float border_squares2 = rectangle(st, vec2(0.2, 0.0), vec2(0.7, 0.0));
        border_squares += rectangle(st, vec2(0.0, 0.7), vec2(0.0, 0.2));
        border_squares += rectangle(st, vec2(0.7, 0.0), vec2(0.2, 0.0));
        border_squares2 += rectangle(st, vec2(0.0, 0.2), vec2(0.0, 0.7));
        
        border_squares2 += rectangle(st, vec2(0.32, 0.0), vec2(0.66, 0.0));
//        border_squares2 += rectangle(st, vec2(0.0, 0.7), vec2(0.0, 0.2));
//        border_squares2 += rectangle(st, vec2(0.7, 0.0), vec2(0.2, 0.0));
//        border_squares2 += rectangle(st, vec2(0.0, 0.2), vec2(0.0, 0.7));
        black_stripes2 *= border_squares2;
        color *= 1.0 - black_stripes2;
        
//        float zw_squares = rectangle();
       
        gl_FragColor = vec4(color, 1.0);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'u_time', 'mousePos', 'ZScale'],
}

export function createKiltShaderMaterial(name: string, scene: Scene, engine: Engine): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false

    let time = 0
    engine.runRenderLoop(() => {
        time += engine.getDeltaTime() * 0.001
        material.setFloat('u_time', time)
    })
    
    return material;
}