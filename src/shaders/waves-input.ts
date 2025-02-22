import {Engine, Mesh, Scene, ShaderMaterial, Vector2} from "@babylonjs/core";

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
        float speed = 10.0;
        float frequency = 10.0;
        float scale = 10.0;
        float newZ = sin(position.x * u_time * speed) * cos(position.y * u_time * speed) * 2.0;
        float dist = distance(mousePos * 10.0, uv * 10.0);
        dist = min(dist, u_time * 10.0);
        newZ = ZScale * sin(pow(1.3, dist) * frequency / scale - u_time * speed) * 0.1 / (pow(0.5, dist) + 1.0);
        name = ZScale * sin(pow(1.3, dist) * frequency / scale - u_time * speed) * 0.5;
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

        gl_FragColor = vec4(0.0, name, 1.0, 1.0);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'u_time', 'mousePos', 'ZScale'],
}

export function createWavesInputShaderMaterial(name: string, scene: Scene, engine: Engine, mesh: Mesh): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false

    let ZScale = 0
    let time = 0
    scene.onPointerDown = (evt, pickInfo, type) => {
        if (pickInfo.pickedMesh === mesh) {
            setTimeout(() => {
                material.setVector2('mousePos', new Vector2(pickInfo.getTextureCoordinates()?.x, pickInfo.getTextureCoordinates()?.y))
                ZScale = 1
                time = 0
            }, 200)
        }
    }
    engine.runRenderLoop(() => {
        if (ZScale > 0) ZScale -= 0.01
        else ZScale = 0
        material.setFloat('ZScale', ZScale)
        time += engine.getDeltaTime() * 0.001
        material.setFloat('u_time', time)
    })
    
    return material
}