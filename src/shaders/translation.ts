import {Engine, Scene, ShaderMaterial} from "@babylonjs/core";

const vertexShader = `
    attribute vec3 position;
	attribute vec2 uv;

	uniform float time;
    uniform mat4 worldViewProjection;
    uniform vec2 mousePos;
    uniform float ZScale;

    varying float name;
    varying vec2 vUV;

    void main() {
        gl_Position = worldViewProjection * vec4(position, 1.0);
        vUV = uv;
    }
`

const fragmentShader = `
    uniform float time;
    uniform float dir;

    varying float name;
    varying vec2 vUV;
    
    float circle(in vec2 st, in float radius) {
        vec2 dist = st - vec2(0.5);
        return 1.0 - smoothstep(radius - (radius * 0.01), radius + (radius*0.01), dot(dist, dist) * 4.0);
    }

    void main() {
        float speed = time * 0.3;
        vec2 st = vUV;
        
        st *= 2.0;
        float offsetY = step(1.0, mod(st.y, 2.0));
        float offsetX = step(1.0, mod(st.x, 2.0));
        float velocityX = speed * (offsetY - 1.0) + speed * offsetY;
        float velocityY = speed * (offsetX - 1.0) + speed * offsetX;
        st.x += velocityX;
//        st.y += velocityY * offsetY;
        st = fract(st);
        
        vec3 color = vec3(circle(st, 0.5));

        gl_FragColor = vec4(color, 1.0);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'time', 'mousePos', 'ZScale',
        // 'frequency', 'scale', 'speed'
    ],
}

export function createTranslationShaderMaterial(name: string, scene: Scene, engine: Engine): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false

    let time = 0
    engine.runRenderLoop(() => {
        time += engine.getDeltaTime() * 0.005
        material.setFloat('time', time)
    })

    return material;
}