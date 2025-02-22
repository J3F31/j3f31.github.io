import {ArcRotateCamera, Engine, MeshBuilder, Scene, Vector3} from "@babylonjs/core"
import {Inspector} from '@babylonjs/inspector'
import {createKiltShaderMaterial} from "./shaders/kilt.js";
import {createWavesShaderMaterial} from "./shaders/waves.js";
import {createWavesInputShaderMaterial} from "./shaders/waves-input.js";
import {createTranslationShaderMaterial} from "./shaders/translation.js";
import {createPongShaderMaterial} from "./shaders/pong.js";
import {createHeartShaderMaterial} from "./shaders/heart.js";
import {createTruchetTilesShaderMaterial} from "./shaders/truchet-tiles.js";
import {createNoiseShaderMaterial} from "./shaders/noise.js";
import {createRandomShaderMaterial} from "./shaders/random.js";

const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement
const engine = new Engine(canvas)
const scene = new Scene(engine)

const camera = new ArcRotateCamera('camera', Math.PI/2, Math.PI/2, 5, Vector3.Zero(), scene)
camera.attachControl()
camera.wheelPrecision = 100
camera.minZ = 0.1

const mesh = MeshBuilder.CreatePlane('plane', {size: 2}, scene)
// const mesh =  MeshBuilder.CreateSphere('sphere', {}, scene)
// mesh.rotation.x = Math.PI;
// mesh.rotation.y = Math.PI / 2;
mesh.increaseVertices(500)
mesh.isPickable = true

const materials = [
    createKiltShaderMaterial('kilt', scene, engine),
    createWavesShaderMaterial('waves', scene, engine),
    createWavesInputShaderMaterial('waves-input', scene, engine, mesh),
    createTranslationShaderMaterial('translation', scene, engine),
    createPongShaderMaterial('pong', scene, engine),
    createHeartShaderMaterial('heart', scene, engine),
    createTruchetTilesShaderMaterial('truchet-tiles', scene, engine),
    createRandomShaderMaterial('random', scene, engine),
]
const query = window.location.search.substring(1)
const params = query.split('&')
let shaderParam = ''
for (const param of params) {
    if (param.includes('shader=')) shaderParam = param.replace('shader=', '')
}
mesh.material = shaderParam ? materials.filter(x => x.name === shaderParam)[0] : materials[0]

const debugButton = document.getElementById('debug-button')
const speechBubble = document.getElementById('speech-bubble')
if (debugButton) {
    debugButton.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        if (Inspector.IsVisible) Inspector.Hide()
        else Inspector.Show(scene, {embedMode: true})
    })
    debugButton.addEventListener('click',() => {
        if (speechBubble) speechBubble.classList.toggle('hide')
    })
}

if (speechBubble) {
    for (const material of materials) {
        const debugOption = document.createElement('div')
        debugOption.classList.add('debug-option')
        if (params.includes('shader=' + material.name)) debugOption.classList.add('select')
        debugOption.innerText = material.name
        speechBubble.appendChild(debugOption)
        debugOption.addEventListener('click', (e) => {
            e.preventDefault()
            window.location.search = 'shader=' + material.name
        })
    }
}
window.addEventListener('resize', () => {
    engine.resize()
})

engine.runRenderLoop(() => {
    scene.render()
})