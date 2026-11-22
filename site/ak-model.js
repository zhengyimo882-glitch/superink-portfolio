import * as THREE from './vendor/three/three.module.js';
import { OBJLoader } from './vendor/three/OBJLoader.js';
import { createInspection, frameModel, notes } from './ak-inspection.js';

// Lamoot's CC0 High-poly AK-47. Original source and provenance ship with the site.
const pin=document.querySelector('#ink-studio .studio-pin');
function smoothMetalNormals(geometry){
  // OBJ has no normals: soften curved metal without rounding hard machined corners.
  const p=geometry.attributes.position,n=geometry.attributes.normal,buckets=new Map(),keys=[];
  for(let i=0;i<p.count;i++){
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*10000)).join(',');keys.push(key);
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);
  }
  const result=new Float32Array(n.count*3);
  for(let i=0;i<n.count;i++){
    const normal=new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i)),sum=new THREE.Vector3();
    for(const j of buckets.get(keys[i])){const other=new THREE.Vector3(n.getX(j),n.getY(j),n.getZ(j));if(normal.dot(other)>.65)sum.add(other);}
    sum.normalize().toArray(result,i*3);
  }
  geometry.setAttribute('normal',new THREE.BufferAttribute(result,3));
}
function addGreenContours(group,segments){
  // Select long structural edges; three thin tube shells provide a crisp green
  // core and soft halo without exposing every triangle of the wireframe.
  const major=segments.filter(([a,b])=>Math.hypot(...a.map((v,i)=>v-b[i]))>2.8)
    .sort((a,b)=>Math.hypot(...b[0].map((v,i)=>v-b[1][i]))-Math.hypot(...a[0].map((v,i)=>v-a[1][i]))).slice(0,520);
  const positions=[],radials=[],indices=[];
  for(const [a,b] of major){
    const direction=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize();
    const u=new THREE.Vector3().crossVectors(direction,Math.abs(direction.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)).normalize();
    const v=new THREE.Vector3().crossVectors(direction,u),start=positions.length/3;
    for(const point of [a,b])for(let i=0;i<6;i++){
      const radial=u.clone().multiplyScalar(Math.cos(i*Math.PI/3)).addScaledVector(v,Math.sin(i*Math.PI/3));
      positions.push(...point);radials.push(radial.x,radial.y,radial.z);
    }
    for(let i=0;i<6;i++){const j=(i+1)%6;indices.push(start+i,start+j,start+6+i,start+j,start+6+j,start+6+i);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('radial',new THREE.Float32BufferAttribute(radials,3));geometry.setIndex(indices);
  for(const [radius,alpha] of [[.10,.95],[.33,.20],[.72,.065]]){
    const material=new THREE.ShaderMaterial({
      uniforms:{radius:{value:radius},alpha:{value:alpha},color:{value:new THREE.Color('#54ff90')}},
      vertexShader:'attribute vec3 radial;uniform float radius;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+radial*radius,1.0);}',
      fragmentShader:'uniform vec3 color;uniform float alpha;void main(){gl_FragColor=vec4(color,alpha);}',
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false
    });
    group.add(new THREE.Mesh(geometry,material));
  }
}
async function mount(){
  let renderer,inspection;
  try {
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
    renderer.setClearColor(0,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.02;
    const canvas=renderer.domElement;canvas.className='studio-ak-surface';canvas.setAttribute('aria-hidden','true');
    Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'1',opacity:'0'});
    pin.append(canvas);
    const response=await fetch('./assets/models/ak47-source.obj');
    if(!response.ok)throw new Error('AK model HTTP '+response.status);
    const object=new OBJLoader().parse(await response.text());
    const bounds=new THREE.Box3().setFromObject(object),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    const factor=192/Math.max(size.x,size.y,size.z);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),group=new THREE.Group();scene.add(group);
    scene.add(new THREE.HemisphereLight(0xdaf5f1,0x192331,1.5));
    for(const [color,intensity,pos] of [[0xe8fff6,2.4,[100,160,250]],[0x75a9df,2,[-100,30,-100]],[0xe4c78f,1.4,[30,-80,150]]]){
      const light=new THREE.DirectionalLight(color,intensity);light.position.set(...pos);scene.add(light);
    }
    // Object-space machining grain remains attached to the surface while orbiting.
    // Procedural texturing avoids stretching the source OBJ's missing UV unwrap.
    const material=new THREE.MeshStandardMaterial({color:0x82999c,metalness:.65,roughness:.53,side:THREE.DoubleSide});
    material.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 vMetalPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMetalPosition=position;');
      shader.fragmentShader=`varying vec3 vMetalPosition;
        float metalHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
        float metalNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
          return mix(mix(mix(metalHash(i),metalHash(i+vec3(1,0,0)),f.x),mix(metalHash(i+vec3(0,1,0)),metalHash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(metalHash(i+vec3(0,0,1)),metalHash(i+vec3(1,0,1)),f.x),mix(metalHash(i+vec3(0,1,1)),metalHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
        `+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 grainPosition=vMetalPosition*vec3(.35,12.0,12.0);
        float grain=mix(metalNoise(grainPosition),.5,smoothstep(.45,1.6,length(fwidth(grainPosition))));
        float patina=metalNoise(vMetalPosition*.45);
        float scratches=smoothstep(.76,.92,metalNoise(vMetalPosition*vec3(.18,9.0,12.0)));
        float stock=1.0-smoothstep(-53.0,-48.0,vMetalPosition.x);
        float grip=(1.0-smoothstep(-8.0,-5.0,vMetalPosition.y))*(1.0-smoothstep(-19.0,-16.0,vMetalPosition.x));
        vec3 finish=mix(vec3(.54,.65,.69),vec3(.28,.25,.21),stock);
        finish=mix(finish,vec3(.19,.24,.25),grip);
        diffuseColor.rgb*=finish*(.86+grain*.18+patina*.16)+vec3(scratches*.08);
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(roughnessFactor+(grain-.5)*.20+stock*.22+grip*.20-scratches*.15,.24,.88);
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        vec3 surfaceDx=dFdx(-vViewPosition),surfaceDy=dFdy(-vViewPosition);
        vec3 grainPerturbation=cross(surfaceDy,normal)*dFdx(grain)+cross(normal,surfaceDx)*dFdy(grain);
        normal=normalize(normal+grainPerturbation*.045);
      `);
    };
    const glowMaterial=new THREE.ShaderMaterial({
      uniforms:{glowColor:{value:new THREE.Color('#93ead6')}},
      vertexShader:`varying vec3 vN; varying vec3 vV; void main(){vec4 p=modelViewMatrix*vec4(position+normal*.10,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
      fragmentShader:`uniform vec3 glowColor;varying vec3 vN;varying vec3 vV;void main(){float rim=pow(1.0-abs(dot(normalize(vN),normalize(vV))),2.6);gl_FragColor=vec4(glowColor,rim*.30);}`,
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.BackSide
    });
    const edgeMaterial=new THREE.LineBasicMaterial({color:0xb0f9df,transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const edges=[],modelBounds=new THREE.Box3(),anchors=notes.map(()=>null),anchorDistance=notes.map(()=>Infinity);let triangles=0;
    object.traverse(child=>{
      if(!child.isMesh)return;
      const geometry=child.geometry.clone();geometry.translate(-center.x,-center.y,-center.z);geometry.rotateY(-Math.PI/2);geometry.scale(factor,factor,factor);
      geometry.computeVertexNormals();smoothMetalNormals(geometry);triangles+=(geometry.index?.count||geometry.attributes.position.count)/3;
      geometry.computeBoundingBox();modelBounds.union(geometry.boundingBox);
      group.add(new THREE.Mesh(geometry,material));
      group.add(new THREE.Mesh(geometry,glowMaterial));
      const positions=geometry.attributes.position;
      for(let i=0;i<positions.count;i++){
        const point=[positions.getX(i),positions.getY(i),positions.getZ(i)];
        notes.forEach((note,j)=>{const distance=point.reduce((sum,v,k)=>sum+(v-note.anchor[k])**2,0);if(distance<anchorDistance[j]){anchorDistance[j]=distance;anchors[j]=point;}});
      }
      const feature=new THREE.EdgesGeometry(geometry,24),p=feature.attributes.position;
      for(let i=0;i<p.count;i+=2)edges.push([[p.getX(i),-p.getY(i)+5,-p.getZ(i)],[p.getX(i+1),-p.getY(i+1)+5,-p.getZ(i+1)]]);
      feature.dispose();
      const outlines=new THREE.EdgesGeometry(geometry,38),op=outlines.attributes.position,contours=[],structuralEdges=[];
      for(let i=0;i<op.count;i+=2){
        const a=[op.getX(i),op.getY(i),op.getZ(i)],b=[op.getX(i+1),op.getY(i+1),op.getZ(i+1)];
        if(Math.hypot(...a.map((v,k)=>v-b[k]))>.65)contours.push(...a,...b);
        structuralEdges.push([a,b]);
      }
      const lines=new THREE.BufferGeometry();lines.setAttribute('position',new THREE.Float32BufferAttribute(contours,3));
      group.add(new THREE.LineSegments(lines,edgeMaterial));outlines.dispose();
      addGreenContours(group,structuralEdges);
    });
    if(!edges.length)throw new Error('Empty model');
    const corners=[];
    for(const x of [modelBounds.min.x,modelBounds.max.x])for(const y of [modelBounds.min.y,modelBounds.max.y])for(const z of [modelBounds.min.z,modelBounds.max.z])corners.push([x,y,z]);
    inspection=createInspection(pin,anchors);
    let previousWidth=0,previousHeight=0;
    const api={edges,triangles,ready:true,layout:(width,height)=>frameModel(corners,width,height),render({width,height,origin,scale,yaw,pitch,progress}){
      if(width!==previousWidth||height!==previousHeight){renderer.setSize(width,height,false);previousWidth=width;previousHeight=height;}
      const opacity=Math.max(0,Math.min(1,(progress-.68)/.25));canvas.style.opacity=String(opacity);
      inspection.update({width,height,origin,scale,yaw,pitch,progress});
      if(opacity===0)return;
      const distance=460*scale;
      camera.position.z=distance;camera.near=.1;camera.far=distance+1000;
      camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(height/(2*distance)));camera.aspect=width/height;
      camera.setViewOffset(width,height,width/2-origin[0],height/2-origin[1],width,height);camera.updateProjectionMatrix();
      group.scale.setScalar(scale);group.rotation.set(pitch,-yaw,0,'XYZ');
      renderer.render(scene,camera);
    }};
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();api.ready=false;canvas.style.opacity='0';inspection.update({width:previousWidth,height:previousHeight,origin:[0,0],scale:1,yaw:0,pitch:0,progress:0});});
    canvas.addEventListener('webglcontextrestored',()=>{api.ready=true;});
    window.superinkModel=api;window.dispatchEvent(new Event('superink-model-ready'));
  }catch(error){inspection?.remove();renderer?.domElement.remove();renderer?.dispose();console.warn('Detailed AK unavailable; retaining drawing preview.',error);}
}
if(pin)mount();
