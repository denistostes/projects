'use strict';
(()=>{
 const saved=new Map();
 const toolbar=document.querySelector('.report-toolbar');
 new ResizeObserver(()=>document.documentElement.style.setProperty('--report-toolbar-height',toolbar.offsetHeight+'px')).observe(toolbar);
 const views=JSON.parse(document.getElementById('reportViews').textContent);
 const slug=document.body.dataset.report;
 const place=()=>{
  const app=document.querySelector('#app');
  if(app&&!app.children.length)return;
  let targets;
  if(slug.startsWith('01')){const c=app.querySelectorAll('.card');targets=[c[0],c[0],c[1],c[2]];}
  else if(slug.startsWith('02'))targets=[app.querySelector('.kpi-grid'),app.querySelector('#fluxo'),app.querySelector('#elasticidade'),app.querySelector('#auditoria')];
  else if(slug.startsWith('03'))targets=[...app.querySelectorAll('.report-chart-section')];
  else if(slug.startsWith('04'))targets=[...app.querySelectorAll(':scope > .card')];
  else if(slug.startsWith('06'))targets=[app.querySelector('.kpi-grid'),app.querySelector('#perfis'),app.querySelector('#analistas'),app.querySelectorAll('.card')[3]];
  else targets=[document.querySelector('.intro'),document.querySelector('.workspace'),document.querySelector('#detail'),document.querySelector('.reading')];
  targets.forEach((target,i)=>{
   if(!target||target.dataset.explanationAdded||target.querySelector('[data-explanation="'+i+'"]'))return;
   const box=document.createElement('div');box.className='report-view-explanation';box.dataset.explanation=i;
   views[i].slice(1).forEach(text=>{const p=document.createElement('p');p.textContent=text;box.append(p);});
   if(target.classList.contains('kpi-grid')){target.parentNode.insertBefore(box,target);target.dataset.explanationAdded='true';}
   else target.append(box);
  });
 };
 const observer=new MutationObserver(()=>{observer.disconnect();place();observer.observe(document.getElementById('demoSection'),{childList:true,subtree:true});});
 observer.observe(document.getElementById('demoSection'),{childList:true,subtree:true});place();
 const prepare=()=>{
  document.querySelectorAll('#demoSection details').forEach(d=>{if(!saved.has(d))saved.set(d,d.open);d.open=true;});
  let note=document.querySelector('.report-print-state');if(!note){note=document.createElement('p');note.className='report-print-state';document.querySelector('.report-demo-intro').append(note);}
  const selections=[...document.querySelectorAll('#demoSection select')].map(s=>(s.closest('label')?.firstChild?.textContent?.trim()||s.id)+': '+s.selectedOptions[0]?.textContent);
  for(const id of ['protect','protected','linked']){const input=document.getElementById(id);if(input)selections.push((id==='linked'?'Respostas entre variáveis':'Proteção das médias')+': '+(input.checked?'ativa':'inativa'));}
  note.textContent=selections.length?'Recorte apresentado: '+selections.join(' · '):'';
 };
 const restore=()=>{saved.forEach((open,d)=>d.open=open);saved.clear();};
 addEventListener('beforeprint',prepare);addEventListener('afterprint',restore);
 document.getElementById('savePdf').onclick=async()=>{
  const help=document.getElementById('pdfHelp');
  if(document.querySelectorAll('[data-explanation]').length!==4){help.textContent='Aguarde o carregamento completo das visões antes de salvar o PDF.';return;}
  await document.fonts.ready;
  help.textContent='';
  prepare();try{window.print();}finally{restore();}
 };
})();
