import {Engine, Scene, ShaderMaterial} from "@babylonjs/core";

const vertexShader = `
    attribute vec3 position;
	attribute vec2 uv;

    uniform mat4 worldViewProjection;

    varying vec2 vUV;

    void main() {
        gl_Position = worldViewProjection * vec4(position, 1.0);
        vUV = uv;
    }
`

const fragmentShader = `
    #define PI 3.14159265358979323846

    varying vec2 vUV;
    
    uniform vec2 uResolution;
    uniform float time;
    
    vec2 rotate2D(in vec2 st, in float angle) {
        st -= 0.5;
        st = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * st;
        st += 0.5;
        return st;
    }
    
    vec2 rotateTilePattern(in vec2 st) {
        st *= 2.0;
        float index = 0.0;
        index += step(1.0, mod(st.x, 2.0));
        index += step(1.0, mod(st.y, 2.0)) * 2.0;
        
        st = fract(st);
        
        if (index == 1.0) {
            st = rotate2D(st, PI * 0.5);
            st *= 2.0;
            st = fract(st);
        } else if (index == 2.0) {
            st = rotate2D(st, PI * -0.5);
            st *= 3.0;
            st = fract(st);
        } else if (index == 3.0) {
            st = rotate2D(st, PI);
            st *= 4.0;
            st = fract(st);
        } else {
            st *= 5.0;
            st = fract(st);
        }
        
        return st;
    }

    void main() {
        vec2 st = vUV;
        st *= 3.0;
        st = fract(st);
        st = rotateTilePattern(st);
//        st = rotate2D(st, PI * 0.1 * time);
//        st.x += cos(time* 0.3);
        
        vec3 color = vec3(step(st.x, st.y));
    
        gl_FragColor = vec4(color, 1.0);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'time', 'uResolution'],
}

export function createTruchetTilesShaderMaterial(name: string, scene: Scene, engine: Engine): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false

    let time = 0
    engine.runRenderLoop(() => {
        time += engine.getDeltaTime() * 0.005
        material.setFloat('time', time)
    })

    return material;
}