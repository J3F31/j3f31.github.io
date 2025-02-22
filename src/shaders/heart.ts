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
    
    float easeInOutCubic(in float x) {
        return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }
    

    void main() {
        vec2 st = vUV;
        st *= 4.0;
      
        st.y -= 2.4;
        st.x -= 2.0;
        st *= easeInOutCubic(abs(cos(time * 0.2))) + 0.5;
//        st.x -= time * 0.3;
        
//        st.x = fract(st.x);
        float a = atan(st.x,st.y)/PI;
        float r = length(st);
        float h = abs(a);
        float d = (13.0*h - 22.0*h*h + 10.0*h*h*h)/(6.0-5.0*h);
        
        vec3 color = vec3(smoothstep(-0.01, 0.01, d - r));
        
        vec3 red = vec3(0.8, 0.1, 0.2);
        
        float alpha = color.r;
      
        gl_FragColor = vec4(color * red, alpha);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'time', 'uResolution'],
}

export function createHeartShaderMaterial(name: string, scene: Scene, engine: Engine): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false

    let time = 0
    engine.runRenderLoop(() => {
        time += engine.getDeltaTime() * 0.005
        material.setFloat('time', time)
    })
    
    material.alpha = 0;
    
    return material;
}