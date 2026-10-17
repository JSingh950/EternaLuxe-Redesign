import * as THREE from './vendor/three.module.js';

const viewer = document.querySelector('[data-bouquet-3d-viewer]');

if (viewer) {
  const canvas = viewer.querySelector('[data-bouquet-3d]');
  const fallback = viewer.querySelector('.hero-product-art');
  const status = viewer.querySelector('[data-viewer-status]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const disposables = [];
  const listeners = [];
  let renderer;
  let frameActive = true;
  let dragging = false;
  let lastX = 0;
  let angle = -0.34;
  let velocity = 0;
  let lastTime = performance.now();

  const remember = resource => { disposables.push(resource); return resource; };
  const listen = (target, type, handler, options) => { target.addEventListener(type, handler, options); listeners.push(() => target.removeEventListener(type, handler, options)); };

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    const bouquet = new THREE.Group();
    bouquet.name = 'Eternaluxe_Large_Luxury_Bouquet';
    scene.add(bouquet);

    const white = remember(new THREE.MeshPhysicalMaterial({ color: 0xfffbf1, roughness: 0.58, clearcoat: 0.18, clearcoatRoughness: 0.6 }));
    const ivory = remember(new THREE.MeshPhysicalMaterial({ color: 0xeadfc7, roughness: 0.7, clearcoat: 0.08 }));
    const champagne = remember(new THREE.MeshPhysicalMaterial({ color: 0xc7a77b, roughness: 0.72, clearcoat: 0.1 }));
    const blush = remember(new THREE.MeshPhysicalMaterial({ color: 0xd9c1a1, roughness: 0.68 }));
    const leafMaterial = remember(new THREE.MeshStandardMaterial({ color: 0x52644d, roughness: 0.86, side: THREE.DoubleSide }));
    const leafLightMaterial = remember(new THREE.MeshStandardMaterial({ color: 0x74806a, roughness: 0.9, side: THREE.DoubleSide }));
    const stemMaterial = remember(new THREE.MeshStandardMaterial({ color: 0x485540, roughness: 0.92 }));
    const goldMaterial = remember(new THREE.MeshStandardMaterial({ color: 0xd5ad54, roughness: 0.62 }));
    const vaseMaterial = remember(new THREE.MeshPhysicalMaterial({ color: 0x171816, roughness: 0.24, metalness: 0.08, clearcoat: 0.58, clearcoatRoughness: 0.22 }));

    const petalGeometry = remember(new THREE.SphereGeometry(0.5, 12, 8));
    const centerGeometry = remember(new THREE.SphereGeometry(0.09, 10, 7));
    const thinStemGeometry = remember(new THREE.CylinderGeometry(0.018, 0.026, 1, 7));
    const stamenGeometry = remember(new THREE.CylinderGeometry(0.035, 0.045, 0.32, 8));

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, -0.42);
    leafShape.bezierCurveTo(0.26, -0.16, 0.25, 0.22, 0, 0.48);
    leafShape.bezierCurveTo(-0.25, 0.22, -0.26, -0.16, 0, -0.42);
    const leafGeometry = remember(new THREE.ShapeGeometry(leafShape, 8));
    leafGeometry.computeVertexNormals();

    const vaseProfile = [
      [0.02, 0], [0.5, 0.03], [0.62, 0.16], [0.58, 0.58], [0.5, 1.35], [0.42, 1.58], [0.48, 1.68]
    ].map(([x,y]) => new THREE.Vector2(x,y));
    const vaseGeometry = remember(new THREE.LatheGeometry(vaseProfile, 48));
    const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
    vase.position.y = -1.25;
    bouquet.add(vase);

    const rim = new THREE.Mesh(remember(new THREE.TorusGeometry(0.475, 0.035, 8, 40)), vaseMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.43;
    bouquet.add(rim);

    function addStem(end, bend = 0, material = stemMaterial, radius = 0.025) {
      const start = new THREE.Vector3(0, 0.34, 0);
      const midpoint = new THREE.Vector3(end.x * 0.42 + bend, (start.y + end.y) * 0.55, end.z * 0.45);
      const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
      const geometry = remember(new THREE.TubeGeometry(curve, 14, radius, 5, false));
      const mesh = new THREE.Mesh(geometry, material);
      bouquet.add(mesh);
      return curve;
    }

    function makeLeaf(position, rotation, scale = 1, light = false) {
      const leaf = new THREE.Mesh(leafGeometry, light ? leafLightMaterial : leafMaterial);
      leaf.position.copy(position);
      leaf.rotation.set(rotation[0], rotation[1], rotation[2]);
      leaf.scale.set(scale * 0.62, scale, scale);
      bouquet.add(leaf);
      return leaf;
    }

    function petal(material, sx, sy, sz, x, y, z, rz = 0) {
      const mesh = new THREE.Mesh(petalGeometry, material);
      mesh.scale.set(sx, sy, sz);
      mesh.position.set(x,y,z);
      mesh.rotation.z = rz;
      return mesh;
    }

    function makeOrchid(position, scale = 1, facing = 0, tilt = 0) {
      const flower = new THREE.Group();
      flower.name = 'Phalaenopsis_Orchid';
      flower.add(petal(white,.42,.23,.085,-.33,.06,0,.22));
      flower.add(petal(white,.42,.23,.085,.33,.06,0,-.22));
      flower.add(petal(white,.3,.36,.075,0,.29,-.01,0));
      flower.add(petal(white,.31,.29,.075,-.05,-.24,.01,.25));
      flower.add(petal(white,.31,.29,.075,.12,-.22,.015,-.28));
      const lip = petal(champagne,.13,.18,.09,0,-.02,.1,0);
      flower.add(lip, new THREE.Mesh(centerGeometry, goldMaterial));
      flower.position.copy(position);
      flower.scale.setScalar(scale);
      flower.rotation.set(tilt, facing, 0);
      bouquet.add(flower);
      addStem(position, position.x * -.08, stemMaterial, .018);
      return flower;
    }

    function makeRose(position, scale = 1, facing = 0, material = ivory) {
      const flower = new THREE.Group();
      flower.name = 'Garden_Rose';
      for (let layer=0; layer<3; layer+=1) {
        const count = 5 + layer * 2;
        const radius = .07 + layer * .095;
        for (let i=0; i<count; i+=1) {
          const a = (i/count) * Math.PI * 2 + layer * .45;
          const mesh = petal(material,.13 + layer*.035,.19 + layer*.02,.055,Math.cos(a)*radius,Math.sin(a)*radius,layer*-.035,a-Math.PI/2);
          mesh.rotation.x = .18 + layer * .1;
          flower.add(mesh);
        }
      }
      flower.add(new THREE.Mesh(centerGeometry, champagne));
      flower.position.copy(position);
      flower.scale.setScalar(scale);
      flower.rotation.set(-.12,facing,0);
      bouquet.add(flower);
      addStem(position, 0, stemMaterial, .021);
      return flower;
    }

    function makeDahlia(position, scale = 1, facing = 0, material = champagne) {
      const flower = new THREE.Group();
      flower.name = 'Champagne_Dahlia';
      for (let layer=0; layer<2; layer+=1) {
        const count = 8 + layer * 2;
        const radius = .08 + layer * .105;
        for (let i=0; i<count; i+=1) {
          const a=(i/count)*Math.PI*2 + layer*.24;
          const mesh=petal(material,.075,.24,.045,Math.cos(a)*radius,Math.sin(a)*radius,-layer*.025,a-Math.PI/2);
          flower.add(mesh);
        }
      }
      flower.add(new THREE.Mesh(centerGeometry, blush));
      flower.position.copy(position);
      flower.scale.setScalar(scale);
      flower.rotation.set(-.08,facing,0);
      bouquet.add(flower);
      addStem(position,0,stemMaterial,.019);
      return flower;
    }

    function makeCalla(position, scale = 1, lean = 0) {
      const flower = new THREE.Group();
      flower.name = 'Calla_Lily';
      const cupGeometry = remember(new THREE.ConeGeometry(.27,.74,20,1,true,0,Math.PI*1.72));
      const cup = new THREE.Mesh(cupGeometry, white);
      cup.position.y = .25;
      cup.rotation.y = .35;
      const stamen = new THREE.Mesh(stamenGeometry,goldMaterial);
      stamen.position.set(.02,.23,.02);
      flower.add(cup,stamen);
      flower.position.copy(position);
      flower.scale.setScalar(scale);
      flower.rotation.z = lean;
      flower.rotation.x = -.08;
      bouquet.add(flower);
      addStem(position,lean*.25,stemMaterial,.021);
      return flower;
    }

    // The arrangement is composed in concentric, staggered rings so every angle
    // remains floral and dimensional during the full revolution—not just the front.
    for(let i=0;i<10;i+=1){
      const a=(i/10)*Math.PI*2;
      const radius=1.48+(i%3)*.14;
      const y=2.22+(i%4)*.16;
      makeOrchid(new THREE.Vector3(Math.sin(a)*radius,y,Math.cos(a)*radius*.72),.88+(i%3)*.07,a,(i%2-.5)*.06);
    }

    for(let i=0;i<8;i+=1){
      const a=(i/8)*Math.PI*2+.16;
      const radius=.73+(i%2)*.2;
      makeRose(new THREE.Vector3(Math.sin(a)*radius,1.48+(i%3)*.18,Math.cos(a)*radius*.8),.94+(i%3)*.07,a,i%2?ivory:white);
    }
    makeRose(new THREE.Vector3(0,1.83,.2),1.08,0,ivory);

    for(let i=0;i<7;i+=1){
      const a=(i/7)*Math.PI*2+.46;
      const radius=1.05+(i%3)*.12;
      makeDahlia(new THREE.Vector3(Math.sin(a)*radius,1.86+(i%3)*.15,Math.cos(a)*radius*.76),.9+(i%2)*.08,a,i%2?blush:champagne);
    }

    for(let i=0;i<4;i+=1){
      const a=(i/4)*Math.PI*2+.28;
      makeCalla(new THREE.Vector3(Math.sin(a)*.48,2.48+(i%3)*.16,Math.cos(a)*.4),.96+(i%2)*.08,Math.sin(a)*.12);
    }

    const foliageArcs = Array.from({length:7},(_,i)=>{
      const a=(i/7)*Math.PI*2+.2;
      const radius=1.8+(i%3)*.18;
      return {end:new THREE.Vector3(Math.sin(a)*radius,2.48+(i%3)*.19,Math.cos(a)*radius*.72),bend:Math.sin(a)*.48,side:i%2?1:-1};
    });
    foliageArcs.forEach((branch,bIndex)=>{
      const curve=addStem(branch.end,branch.bend,stemMaterial,.017);
      for(let i=2;i<8;i+=1){
        const t=i/8, p=curve.getPoint(t), tangent=curve.getTangent(t);
        const side=(i%2?1:-1)*branch.side;
        makeLeaf(new THREE.Vector3(p.x+side*.13,p.y,p.z+(i%3-.7)*.06),[-.18+(bIndex%2)*.12,side*.68,tangent.x*-.75],.34+i*.018,i%3===0);
      }
    });

    const budGeometry = remember(new THREE.SphereGeometry(.075,8,6));
    for(let i=0;i<7;i+=1){
      const a=(i/7)*Math.PI*2+.38, r=1.22+(i%3)*.18;
      const end=new THREE.Vector3(Math.cos(a)*r,1.72+(i%4)*.27,Math.sin(a)*.42);
      addStem(end,Math.sin(a)*.17,stemMaterial,.012);
      const bud=new THREE.Mesh(budGeometry,i%2?ivory:leafLightMaterial);
      bud.position.copy(end); bud.scale.set(.75,1.15,.75); bouquet.add(bud);
    }

    const shadow = new THREE.Mesh(remember(new THREE.CircleGeometry(1.25,48)), remember(new THREE.MeshBasicMaterial({color:0x221f1b,transparent:true,opacity:.2,depthWrite:false})));
    shadow.rotation.x=-Math.PI/2;
    shadow.position.set(0,-1.23,.1);
    shadow.scale.set(1,.38,1);
    scene.add(shadow);

    scene.add(new THREE.HemisphereLight(0xfffaf0,0x404b3c,2.25));
    const key = new THREE.DirectionalLight(0xfff3de,4.4); key.position.set(-4,6,6); scene.add(key);
    const rimLight = new THREE.DirectionalLight(0xdde7df,2.7); rimLight.position.set(5,4,-4); scene.add(rimLight);
    const fill = new THREE.PointLight(0xe8cda8,11,10,2); fill.position.set(0,2.5,3.5); scene.add(fill);

    function resize() {
      const { width, height } = viewer.getBoundingClientRect();
      if (!width || !height) return;
      const mobile = width < 680;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.6));
      renderer.setSize(width,height,false);
      camera.aspect=width/height;
      camera.position.set(0,mobile ? 1.1 : 1.05,mobile ? 9.4 : 9.9);
      camera.lookAt(0,1.0,0);
      camera.updateProjectionMatrix();
      bouquet.scale.setScalar(mobile ? .92 : 1);
      renderer.render(scene,camera);
      viewer.dataset.drawCalls=String(renderer.info.render.calls);
      viewer.dataset.triangles=String(renderer.info.render.triangles);
    }

    function tick(now) {
      if (!frameActive || document.hidden) return;
      const delta=Math.min((now-lastTime)/1000,.05); lastTime=now;
      if (!reducedMotion && !dragging) angle += delta*(Math.PI*2/24) + velocity;
      velocity *= .9;
      bouquet.rotation.y=angle;
      renderer.render(scene,camera);
    }

    const start=e=>{dragging=true;lastX=e.clientX;velocity=0;viewer.setPointerCapture?.(e.pointerId);};
    const move=e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;angle+=dx*.009;velocity=dx*.0007;};
    const end=()=>{dragging=false;};
    const keydown=e=>{if(e.key==='ArrowLeft'){angle-=Math.PI/8;e.preventDefault();}if(e.key==='ArrowRight'){angle+=Math.PI/8;e.preventDefault();}};
    listen(viewer,'pointerdown',start); listen(viewer,'pointermove',move); listen(viewer,'pointerup',end); listen(viewer,'pointercancel',end); listen(viewer,'keydown',keydown);
    const previousButton=viewer.querySelector('[data-prev]');
    const nextButton=viewer.querySelector('[data-next]');
    if(previousButton)listen(previousButton,'click',()=>{angle-=Math.PI/8;});
    if(nextButton)listen(nextButton,'click',()=>{angle+=Math.PI/8;});

    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(viewer);
    const visibilityObserver = new IntersectionObserver(([entry])=>{frameActive=entry.isIntersecting;if(frameActive){lastTime=performance.now();renderer.render(scene,camera);}},{threshold:.03});
    visibilityObserver.observe(viewer);
    listen(document,'visibilitychange',()=>{lastTime=performance.now();});

    resize();
    renderer.setAnimationLoop(tick);
    viewer.classList.add('is-3d-ready');
    fallback?.setAttribute('aria-hidden','true');
    status.textContent = reducedMotion ? '3D view · Use arrows or drag' : '3D view · Drag to rotate';

    const cleanup=()=>{
      renderer.setAnimationLoop(null); resizeObserver.disconnect(); visibilityObserver.disconnect(); listeners.forEach(remove=>remove());
      scene.traverse(object=>{if(object.geometry && !disposables.includes(object.geometry))object.geometry.dispose();});
      disposables.forEach(resource=>resource.dispose?.()); renderer.dispose();
    };
    listen(window,'pagehide',cleanup,{once:true});
  } catch (error) {
    status.textContent='Bouquet preview';
    viewer.classList.add('has-3d-error');
    console.warn('Eternaluxe 3D bouquet could not start; displaying the photographic fallback.',error);
  }
}
