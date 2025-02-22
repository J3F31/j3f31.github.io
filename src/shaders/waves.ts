import {Engine, Scene, ShaderMaterial} from "@babylonjs/core";

const vertexShader = `
    attribute vec3 position;
	attribute vec2 uv;

	uniform float time;
    uniform mat4 worldViewProjection;
    uniform vec2 mousePos;
    uniform float ZScale;
    
    // uniform float frequency;
    // uniform float scale;
    // uniform float speed;

    varying float name;
    varying vec2 vUV;
    
    float getDistanceFromPoint(in vec2 point) {
        float uvScale = 100.0;
        float distance = distance(point * uvScale, uv * uvScale);
        return distance;
    }
    
    float calculateNewHeigh(in float distance) {
        float speed = 1.0;
        float scale = 0.3;
        float newHeight = sin(0.5 * distance / speed - time) * scale;
        return newHeight;
    }

    void main() {
        float speed = 3.0;
        float frequency = 1.0;
        float scale = 0.3;
        float maxDist = 100.0;
        vec2 bottomRight = vec2(0.0, 0.0);
        vec2 bottomLeft = vec2(1.0, 0.0);
        vec2 topRight = vec2(0.0, 1.0);
        vec2 topLeft = vec2(1.0, 1.0);
        float newZ = sin(position.x * time * speed) * cos(position.y * time * speed) * 2.0;
        float tl_dist = getDistanceFromPoint(topLeft);
        float tr_dist = getDistanceFromPoint(topRight);
        float bl_dist = getDistanceFromPoint(bottomLeft);
        float br_dist = getDistanceFromPoint(bottomRight);
        // dist = min(dist, time * 50.0);
        // newZ = sin(pow(1.3, dist) * frequency / scale - time * speed) * 0.1;
//        newZ = sin(dist / speed - time) * scale * ((dist/maxDist));
        float tlZ = calculateNewHeigh(tl_dist) + tl_dist/maxDist;
        float trZ = calculateNewHeigh(tr_dist) + tr_dist/maxDist;
        float blZ = calculateNewHeigh(bl_dist) + bl_dist/maxDist;
        float brZ = calculateNewHeigh(br_dist) + br_dist/maxDist;
        float hp = max(tlZ, trZ);
        hp = max(hp, blZ);
        hp = max(hp, brZ);
        newZ = hp;
//        newZ *= ZScale;
        float c = min(tlZ, trZ);
        c = min(hp, blZ);
        c = min(hp, brZ);
        name = hp * 0.5;
        vec3 newPosition = vec3(position.x, position.y, newZ);
        gl_Position = worldViewProjection * vec4(newPosition, 1.0);
        vUV = uv;
    }
`

const fragmentShader = `
    varying float name;
    varying vec2 vUV;

    void main() {

        float dist = distance(vec2(0.0, 0.0), vUV * 10.0);
        float f = fract(dist);

        gl_FragColor = vec4(name, name, 1.0, 1.0);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'time', 'mousePos', 'ZScale',
        // 'frequency', 'scale', 'speed'
    ],
}

export function createWavesShaderMaterial(name: string, scene: Scene, engine: Engine): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false

    let time = 0
    engine.runRenderLoop(() => {
        time += engine.getDeltaTime() * 0.005
        material.setFloat('time', time)
    })
    
    return material;
}