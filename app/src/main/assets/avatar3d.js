(() => {
  const host = document.getElementById('portrait');
  if (!host || !window.THREE) return;
  host.innerHTML = '';
  host.style.cssText = 'height:340px;width:100%;max-width:340px;margin:0 auto 10px;background:radial-gradient(ellipse at 50% 35%,#69425f,#211725 72%);border-radius:22px;overflow:hidden;position:relative;box-shadow:0 15px 45px #100b16';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#342338');
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0, 1.25, 7.8);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText='width:100%;height:100%;display:block';
  scene.add(new THREE.HemisphereLight(0xffe5f0,0x39253d,2.0));
  const key = new THREE.DirectionalLight(0xffdfd2,3.2); key.position.set(-3,5,5); key.castShadow=true; scene.add(key);
  const rim = new THREE.PointLight(0xd887b7,2.4,12); rim.position.set(3,2,1); scene.add(rim);
  const mat=(color,rough=.72)=>new THREE.MeshStandardMaterial({color,roughness:rough});
  const skin=mat('#e8b49e'), skinLight=mat('#f0c4ad'), hair=mat('#d9bd9c'), darkHair=mat('#34232c'), eyes=mat('#5a8c9c',.3), white=mat('#fff3ed'), lips=mat('#a94e66',.45);
  const group=new THREE.Group(); scene.add(group);
  function ball(parent,name,pos,scale,material){const m=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),material);m.name=name;m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  // Body silhouette: adult, curvy proportions, dressed in a fitted elegant outfit.
  const torso=ball(group,'torso',[0,1.42,0],[.72,.92,.42],mat('#7b294e'));
  const waist=ball(group,'waist',[0,.92,.02],[.53,.48,.37],mat('#7b294e'));
  const hips=ball(group,'hips',[0,.48,0],[.92,.62,.48],mat('#7b294e'));
  ball(group,'neck',[0,2.25,0],[.19,.32,.19],skin);
  const head=ball(group,'head',[0,2.85,.02],[.48,.62,.43],skinLight);
  // Hair cap, long curls and black headband
  ball(group,'haircap',[0,3.13,-.055],[.52,.48,.48],hair);
  for(let i=0;i<11;i++){const a=(i/10)*Math.PI;ball(group,'curlL'+i,[-.46-Math.sin(a)*.06,2.78+Math.cos(a)*.33,-.03],[.13,.19,.14],hair);ball(group,'curlR'+i,[.46+Math.sin(a)*.06,2.78+Math.cos(a)*.33,-.03],[.13,.19,.14],hair);}
  const band=ball(group,'headband',[0,3.16,.02],[.51,.075,.46],darkHair);
  // Face features
  ball(group,'eyeL',[-.18,2.92,.405],[.075,.09,.035],white);ball(group,'eyeR',[.18,2.92,.405],[.075,.09,.035],white);
  ball(group,'irisL',[-.18,2.91,.438],[.038,.05,.018],eyes);ball(group,'irisR',[.18,2.91,.438],[.038,.05,.018],eyes);
  ball(group,'pupilL',[-.18,2.91,.453],[.018,.028,.01],darkHair);ball(group,'pupilR',[.18,2.91,.453],[.018,.028,.01],darkHair);
  ball(group,'nose',[0,2.77,.43],[.075,.12,.08],skin);
  ball(group,'mouth',[0,2.65,.414],[.12,.035,.025],lips);
  ball(group,'earL',[-.49,2.82,0],[.1,.16,.1],skin);ball(group,'earR',[.49,2.82,0],[.1,.16,.1],skin);
  // Arms with shoulder and forearm segments
  const arms=[];
  for(const side of [-1,1]){const pivot=new THREE.Group();pivot.position.set(side*.67,1.95,0);group.add(pivot);ball(pivot,'upper',[side*.18,-.38,0],[.19,.48,.2],skin);ball(pivot,'forearm',[side*.27,-.88,.05],[.15,.42,.16],skin);ball(pivot,'hand',[side*.29,-1.22,.07],[.16,.18,.14],skin);arms.push({pivot,side});}
  // Legs and shoes
  for(const side of [-1,1]){ball(group,'thigh',[side*.39,-.12,0],[.32,.77,.36],mat('#6e294b'));ball(group,'knee',[side*.39,-.75,.02],[.23,.24,.25],skin);ball(group,'calf',[side*.39,-1.12,0],[.22,.53,.24],skin);ball(group,'shoe',[side*.39,-1.63,.12],[.25,.13,.38],white);}
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.6,48),mat('#4b3048'));floor.rotation.x=-Math.PI/2;floor.position.y=-1.78;floor.receiveShadow=true;scene.add(floor);
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(host);resize();
  let mode='idle',start=performance.now();
  window.ariana3DAction=(next)=>{mode=next||'idle';start=performance.now();};
  window.ariana3DOutfit=(color)=>{const c=new THREE.Color(color||'#7b294e');group.traverse(o=>{if(o.isMesh && ['torso','waist','hips'].includes(o.name))o.material.color.copy(c);});};
  let drag=false,lastX=0;renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;});window.addEventListener('pointerup',()=>drag=false);window.addEventListener('pointermove',e=>{if(drag){group.rotation.y+=(e.clientX-lastX)*.009;lastX=e.clientX;}});
  function tick(now){requestAnimationFrame(tick);const t=(now-start)/1000;group.position.y=Math.sin(now*.0014)*.025;head.rotation.y=Math.sin(now*.0007)*.08;head.rotation.z=Math.sin(now*.0011)*.025;
    if(mode==='dance'){group.rotation.y=Math.sin(t*3)*.25;group.rotation.z=Math.sin(t*6)*.035;arms.forEach(a=>a.pivot.rotation.z=a.side*(.75+Math.sin(t*5)*.25));}
    else {group.rotation.z=Math.sin(now*.0008)*.012;arms.forEach(a=>a.pivot.rotation.z=a.side*(.06+Math.sin(now*.001)*.025));}
    if(mode==='dance'&&t>7){mode='idle';group.rotation.set(0,0,0);}
    renderer.render(scene,camera);
  }requestAnimationFrame(tick);
  window.ariana3DReady=true;
})();