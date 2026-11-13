import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const host = document.getElementById('portrait');
if (host) {
  host.innerHTML = '';
  host.style.cssText = 'height:340px;width:100%;max-width:340px;margin:0 auto 10px;background:radial-gradient(ellipse at 50% 35%,#69425f,#211725 72%);border-radius:22px;overflow:hidden;position:relative;box-shadow:0 15px 45px #100b16;touch-action:pan-y';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#342338');
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.set(0, 0.15, 8.5);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  scene.add(new THREE.HemisphereLight(0xffe5f0,0x39253d,2.0));
  const key = new THREE.DirectionalLight(0xffdfd2,3.0); key.position.set(-3,5,5); key.castShadow=true; scene.add(key);
  const rim = new THREE.PointLight(0xd887b7,2.2,14); rim.position.set(3,2,1); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3,48),new THREE.MeshStandardMaterial({color:'#4b3048',roughness:.9}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-1.85; scene.add(floor);
  let model=null, mixer=null, clips=[], currentAction=null, mode='idle', started=performance.now();
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(host); resize();
  function playForMode(next){
    mode=next; started=performance.now();
    if(!mixer||!clips.length)return;
    const terms=next==='dance'?['dance','踊','танц']:next==='wave'?['wave','greet','salut','мах']:['idle','stand','breath'];
    let clip=clips.find(c=>terms.some(t=>c.name.toLowerCase().includes(t)));
    if(!clip && next!=='idle') clip=clips.find(c=>/idle|stand/i.test(c.name))||clips[0];
    if(!clip)clip=clips[0];
    const action=mixer.clipAction(clip);
    if(currentAction!==action){action.reset().fadeIn(.25);if(currentAction)currentAction.fadeOut(.25);action.play();currentAction=action;}
  }
  window.ariana3DAction=playForMode;
  window.ariana3DOutfit=(color)=>{
    if(!model)return;
    const tint=new THREE.Color(color||'#7b294e');
    model.traverse(o=>{
      if(!o.isMesh||!o.material)return;
      const n=(o.name+' '+(o.material.name||'')).toLowerCase();
      if(/dress|cloth|shirt|skirt|outfit|top|body suit/i.test(n)){
        const mats=Array.isArray(o.material)?o.material:[o.material];
        mats.forEach(m=>{if(m.color)m.color.copy(tint);});
      }
    });
  };
  window.arianaSpeaking=false;
  let dragging=false,lastX=0;
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;});
  window.addEventListener('pointerup',()=>dragging=false);
  window.addEventListener('pointermove',e=>{if(dragging&&model){model.rotation.y+=(e.clientX-lastX)*.008;lastX=e.clientX;}});
  const loader=new GLTFLoader();
  loader.load('models/Ariana.glb',gltf=>{
    model=gltf.scene;
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.side=THREE.DoubleSide;}}});
    const box=new THREE.Box3().setFromObject(model);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    const scale=3.25/Math.max(size.y,0.001);
    model.scale.setScalar(scale);
    model.position.set(-center.x*scale,-center.y*scale,-center.z*scale);
    scene.add(model);
    model.updateMatrixWorld(true);
    const fittedBox=new THREE.Box3().setFromObject(model);
    const sphere=fittedBox.getBoundingSphere(new THREE.Sphere());
    const verticalFov=THREE.MathUtils.degToRad(camera.fov);
    const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*Math.max(camera.aspect,0.25));
    const limitingFov=Math.min(verticalFov,horizontalFov);
    const distance=(sphere.radius/Math.sin(limitingFov/2))*2.65;
    camera.position.set(0,0,Math.max(distance,8.5));
    camera.near=Math.max(0.01,distance-sphere.radius*3.5);
    camera.far=distance+sphere.radius*5;
    camera.updateProjectionMatrix();
    camera.lookAt(0,0,0);
    mixer=new THREE.AnimationMixer(model);
    clips=gltf.animations||[];
    if(clips.length)playForMode('idle');
    window.ariana3DReady=true;
    document.getElementById('mood').textContent='Я здесь, совсем рядом 💗';
  },undefined,error=>{
    console.error('Ariana GLB load failed',error);
    host.innerHTML='<div style="padding:22px;color:#fff;text-align:center">Не удалось загрузить 3D-модель. Проверь подключение к интернету и перезапусти приложение.</div>';
    window.ariana3DReady=false;
  });
  function tick(now){
    requestAnimationFrame(tick);
    if(mixer)mixer.update(Math.min((now-(tick.last||now))/1000,.05));
    tick.last=now;
    if(model&&!mixer){model.rotation.y=Math.sin(now*.00035)*.08;}
    renderer.render(scene,camera);
  }
  requestAnimationFrame(tick);
}