import {Engine, Scene, ShaderMaterial, Vector2} from "@babylonjs/core";

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
    uniform float time;
    uniform float scale;
    uniform vec2 resolution;
    uniform float brickDir1;
    uniform float brickDir2;

    varying float name;
    varying vec2 vUV;
    
    ivec2 PADDLE_L = ivec2(0,0);
    ivec2 PADDLE_R = ivec2(1,0);
    vec2  PADDLE_SIZE = vec2(.005, .1);
    float PADDLE_SPEED = 1.1;
    float PADDLE_OFFSET = .02;
    ivec2 BALL = ivec2(2,0);
    float BALL_SPEED = 1.;
    float BALL_R = .025;
    ivec2 SCORE = ivec2(3,0);
    
    #define S(a,b,x) smoothstep(a,b,x)
    
    float circle(in vec2 st, in float radius) {
        vec2 dist = st - vec2(0.5);
        return 1.0 - smoothstep(radius - (radius * 0.01), radius + (radius*0.01), dot(dist, dist) * 4.0);
    }
    
    float rectangle(in vec2 uv, in vec2 p1, in vec2 p2) {
        vec2 st = uv;
        vec2 bl = step(p1, 1.0 - uv);
        vec2 tr = step(p2, uv);
        float pct = bl.x * bl.y * tr.x * tr.y;
        return pct;
    }
    
    float sd_circ(vec2 uv, float r){
        return length(uv)-r;
    }
    float sd_rect(vec2 uv, vec2 r){
        return length(max(abs(uv)-r,0.));
    }
    vec2 mirror(vec2 p, vec2 n){
        float d = dot(p, n);
        return p - min(d, 0.)*n*2.;
    }
    
    vec2 paddle_pos(vec4 paddle, ivec2 key){
        float vy = brickDir1;
//        if(texelFetch(iChannel1, ivec2(key.x, 0), 0).x == 1.) vy = 1.;
//        if(texelFetch(iChannel1, ivec2(key.y, 0), 0).x == 1.) vy = -1.;
        vec2 new_pos = vec2(paddle.x, clamp(paddle.y+vy*PADDLE_SPEED*time,
                                            PADDLE_SIZE.y+PADDLE_OFFSET,
                                            1.-PADDLE_SIZE.y-PADDLE_OFFSET));
        return new_pos;
    }
    vec4 collide(vec4 ball, vec4 paddle){
        if(sd_rect(ball.xy-paddle.xy,PADDLE_SIZE)-BALL_R < 0.){
            ball.zw = normalize((ball.xy-paddle.xy)*vec2(1., .2));
        }
        return ball;
    }
    vec4 collide(vec4 ball, vec2 p, vec2 n){
        if(dot(ball.xy-p, n)-BALL_R < 0.){
            ball.zw = mirror(ball.zw, n);   
        }
        return ball;
    }

    void main() {
        

        ivec2 id = ivec2(vUV);
        vec2 res = vec2(1., 1.);
        if(id == PADDLE_L){
            vec4 paddle = texelFetch(iChannel0, PADDLE_L, 0);
            if(iFrame == 0) paddle.xy = vec2(PADDLE_SIZE.x + PADDLE_OFFSET, .5);
            fragColor = vec4(paddle_pos(paddle, ivec2(KEY_W, KEY_S)),0.,0.);
            return;
        }
        if(id == PADDLE_R){
            vec4 paddle = texelFetch(iChannel0, PADDLE_R, 0);
            if(iFrame == 0) paddle.xy = vec2(res.x-PADDLE_SIZE.x-PADDLE_OFFSET, .5);
            fragColor = vec4(paddle_pos(paddle, ivec2(KEY_UP, KEY_DOWN)),0.,0.);
            return;
        }
        if(id == BALL || id == SCORE){
            vec4 ball = texelFetch(iChannel0, BALL, 0);
            ball.xy += ball.zw * iTimeDelta * BALL_SPEED;
            vec4 score = texelFetch(iChannel0, SCORE, 0);
            if(iFrame == 0) ball = vec4(.5 * res, 1., 0.);
            if(ball.x < 0. || ball.x > res.x){
                if(ball.x < 0.) {score.y++; ball.zw=vec2(1., 0.);}
                else {score.x++; ball.zw=vec2(-1., 0.);}
                ball.xy = vec2(.5 * res);
            }
            vec4 paddle_l = texelFetch(iChannel0, PADDLE_L, 0);
            vec4 paddle_r = texelFetch(iChannel0, PADDLE_R, 0);
            ball = collide(ball, paddle_l);
            ball = collide(ball, paddle_r);
            ball = collide(ball, vec2(0.), vec2(0., 1.));
            ball = collide(ball, vec2(0., 1.), vec2(0., -1.));
            if(id == BALL) fragColor = vec4(ball);
            if(id == SCORE) fragColor = vec4(score);
            return;
        }
   
        gl_FragColor = vec4(0.0);
    }
`

const options = {
    attributes: ['position', 'uv'],
    uniforms: ['worldViewProjection', 'time', 'resolution', 'brickDir1', 'brickDir2'],
}

export function createPongShaderMaterial(name: string, scene: Scene, engine: Engine): ShaderMaterial {
    const material = new ShaderMaterial(name, scene, {vertexSource: vertexShader, fragmentSource: fragmentShader}, options);
    material.backFaceCulling = false
    
    
    material.setFloat('brickDir1', 0)
    material.setFloat('brickDir2', 0)
    document.addEventListener('keypress', (e) => {
        if (e.key === 'w') material.setFloat('brickDir1', 1)
        if (e.key === 's') material.setFloat('brickDir1', -1)
    })
    document.addEventListener('keyup', (e) => {
        if (e.key === 'w') material.setFloat('brickDir1', 0)
        if (e.key === 's') material.setFloat('brickDir1', 0)
    })
    const resolution = new Vector2(window.innerWidth, window.innerHeight);
    material.setVector2('resolution', resolution)
    engine.onResizeObservable.add(() => {
        const resolution = new Vector2(window.innerWidth, window.innerHeight);
        material.setVector2('resolution', resolution)
    })

    let time = 0
    engine.runRenderLoop(() => {
        time += engine.getDeltaTime() * 0.005
        material.setFloat('time', time)
    })

    return material;
}