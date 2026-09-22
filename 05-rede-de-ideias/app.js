'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const state={nodes:[],edges:[],query:'',category:'',selected:null,rotationX:-.12,rotationY:.28,zoom:1};
const colors=['#629acb','#83b6dc','#489ec5','#a2cce6','#527fad','#73a9bd'];
let positions=new Map(),drag=null,moved=false;
function filtered(){return state.nodes.filter(n=>(!state.category||n.category===state.category)&&norm([n.title,n.problem,n.hypothesis,n.test,n.metric].join(' ')).includes(norm(state.query)));}
function project(point){const cy=Math.cos(state.rotationY),sy=Math.sin(state.rotationY),cx=Math.cos(state.rotationX),sx=Math.sin(state.rotationX);const x=point.x*cy+point.z*sy,z=-point.x*sy+point.z*cy,y=point.y*cx-z*sx,depth=point.y*sx+z*cx;const r=248*state.zoom*(1+.13*depth);return {x:500+x*r,y:340+y*r,z:depth};}
function graph(){
 $('#network').setAttribute('viewBox',innerWidth<=600?'190 30 620 620':'0 0 1000 700');
 const list=filtered(),ids=new Set(list.map(n=>n.id)),selected=state.selected,related=new Set(selected?[selected]:[]);
 state.edges.filter(e=>e.source===selected||e.target===selected).forEach(e=>{related.add(e.source);related.add(e.target);});
 const points=new Map(list.map(n=>[n.id,project(positions.get(n.id))]));
 const edges=state.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)).map(e=>{const a=points.get(e.source),b=points.get(e.target),hit=e.source===selected||e.target===selected;return '<path class="edge '+(selected?(hit?'active':'dim'):'')+'" d="M'+a.x+' '+a.y+' L'+b.x+' '+b.y+'" style="opacity:'+(.15+.2*(a.z+b.z+2)/4)+'"><title>'+esc(e.reason)+'</title></path>';}).join('');
 const nodes=[...list].sort((a,b)=>points.get(a.id).z-points.get(b.id).z).map(n=>{const p=points.get(n.id),category=[...new Set(state.nodes.map(x=>x.category))].indexOf(n.category),radius=8+8*(p.z+1)/2,words=n.title.split(' '),mid=Math.ceil(words.length/2);return '<g class="node '+(n.id===selected?'selected ':'')+(selected&&!related.has(n.id)?'dim':'')+'" data-node="'+n.id+'" role="button" tabindex="0" aria-label="'+esc(n.title)+'" aria-pressed="'+(n.id===selected)+'" transform="translate('+p.x+' '+p.y+')" style="opacity:'+(.25+.75*(p.z+1)/2)+'"><circle r="'+radius+'" fill="'+colors[category%colors.length]+'"/>'+(true?'<text text-anchor="middle" y="'+(radius+19)+'"><tspan x="0">'+esc(words.slice(0,mid).join(' '))+'</tspan><tspan x="0" dy="1.2em">'+esc(words.slice(mid).join(' '))+'</tspan></text>':'')+'<title>'+esc(n.title)+'</title></g>';}).join('');
 $('#network').innerHTML='<circle class="sphere-outline" cx="500" cy="340" r="'+(265*state.zoom)+'"/>'+edges+nodes;
 $('#empty').hidden=list.length>0;
 $('#status').textContent=list.length+' de '+state.nodes.length+' hipóteses · '+state.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)).length+' conexões';
}
function render(){graph();}
function select(id,scroll=true){
 const n=state.nodes.find(x=>x.id===id);if(!n)return;state.selected=id;
 // A hipótese selecionada permanece acessível mesmo ao navegar para outra categoria pelas conexões.
 if(!filtered().some(x=>x.id===id)){state.query='';state.category='';$('#query').value='';$('#category').value='';}
 const edges=state.edges.filter(e=>e.source===id||e.target===id);
 $('#detail').innerHTML='<div class="detail-top"><div><span class="eyebrow">'+esc(n.category)+'</span><h2>'+esc(n.title)+'</h2></div><div class="score">Score<strong>'+n.score+'</strong></div></div><div class="ratings"><span>Impacto '+n.impact+'/5</span><span>Esforço '+n.effort+'/5</span><span>'+esc(n.status)+'</span></div><div class="detail-grid">'+[['problem','Problema'],['hypothesis','Fundamentação'],['test','Como testar'],['metric','Como medir']].map(([k,t])=>'<article><h3>'+t+'</h3><p>'+esc(n[k])+'</p></article>').join('')+'</div><div class="connections"><h3>Por que estas ideias se conectam?</h3><ul>'+edges.map(e=>{const other=state.nodes.find(x=>x.id===(e.source===id?e.target:e.source));return '<li><button data-open="'+other.id+'">'+esc(other.title)+'</button><span class="connection-type">'+esc(e.type)+'</span><p>'+esc(e.reason)+'</p></li>';}).join('')+'</ul></div>';
 render();if(scroll)$('#detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
fetch('./data/demo.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{
 state.nodes=data.payload.nodes;state.edges=data.payload.edges;
 const phi=Math.PI*(3-Math.sqrt(5));state.nodes.forEach((n,i)=>{const y=1-2*(i+.5)/state.nodes.length,r=Math.sqrt(1-y*y),angle=i*phi;positions.set(n.id,{x:r*Math.cos(angle),y,z:r*Math.sin(angle)});});
 $('#category').innerHTML='<option value="">Todas</option>'+[...new Set(state.nodes.map(n=>n.category))].map(c=>'<option>'+esc(c)+'</option>').join('');
 $('#query').oninput=e=>{state.query=e.target.value;render();};$('#category').onchange=e=>{state.category=e.target.value;render();};
 const zoom=delta=>{state.zoom=Math.max(.65,Math.min(1.4,state.zoom+delta));graph();};
 $('#zoomIn').onclick=()=>zoom(.1);$('#zoomOut').onclick=()=>zoom(-.1);$('#resetView').onclick=()=>{state.rotationX=-.12;state.rotationY=.28;state.zoom=1;graph();};
 document.addEventListener('click',e=>{const open=e.target.closest('[data-open]');if(open)select(open.dataset.open);});
 const svg=$('#network');
 svg.addEventListener('click',e=>{const node=e.target.closest('[data-node]');if(node&&!moved)select(node.dataset.node);});
 svg.addEventListener('keydown',e=>{const node=e.target.closest('[data-node]');if(node&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(node.dataset.node);}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();state.rotationY+=e.key==='ArrowLeft'?-.12:.12;graph();if(node)svg.querySelector('[data-node="'+node.dataset.node+'"]')?.focus();}});
 svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};moved=false;});
 svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)<3)return;moved=true;svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');state.rotationY+=dx*.008;state.rotationX-=dy*.006;drag.x=e.clientX;drag.y=e.clientY;graph();});
 const stop=()=>{drag=null;svg.classList.remove('dragging');};svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.05:-.05);},{passive:false});
 select(state.nodes[0].id,false);
}).catch(error=>{$('#status').textContent='Não foi possível carregar as ideias.';console.error(error);});
