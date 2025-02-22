import {Engine, Scene, ShaderMaterial} from "@babylonjs/core";

const vertexShader = `
    attribute vec3 position;
	attribute vec2 uv;
	
    uniform mat4 worldViewProjection;

    varying float name;
    varying vec2 vUV;

    void main() {
        gl_Position = worldViewProjection * vec4(position, 1.0);
        vUV = uv;
    }
`

const fragmentShader = `
    #define PI 3.14159265358979323846

    uniform float time;

    varying float name;
    varying vec2 vUV;
    
    float random(in float x) {
        return fract(sin(x) * 10000.0);
    }
    
    float random(in vec2 st) {
        return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
    }
    
    float randomSerie(float x, float freq, float t) {
        return step(.8,random( floor(x*freq)-floor(t) ));
    }

    void main() {
        vec2 st = vUV;
        
        float r = random(floor(time)) + abs(atan(time) * 0.1);
        float t = 60.0 + time * (1.0 - r) * 30.0;
        
        if (fract(st.y * 2.0 * 0.5) < 0.5) {
            t *= -1.0;
        }
        
        r += random(floor(st.y));
        
        float offset = 0.25;
        
        vec3 color = vec3(
            randomSerie(st.x, r * 100.0, t + offset),
            randomSerie(st.x, r * 100.0, t),
            randomSerie(st.x, r * 100.0, t - offset)
        );

        gl_FragColor = vec4(1.0 - color, 1.0);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'time'],
}

export function createRandomShaderMaterial(name: string, scene: Scene, engine: Engine): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false

    let time = 0
    engine.runRenderLoop(() => {
        time += engine.getDeltaTime() * 0.005
        material.setFloat('time', time)
    })

    return material;
}