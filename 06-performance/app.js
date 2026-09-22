'use strict';
const el=s=>document.querySelector(s);
const fmt=(v,d=2)=>v===null||v===undefined?'n/d':Number(v).toLocaleString('pt-BR',{maximumFractionDigits:d});
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const table=(heads,rows)=>'<div class="scroll" tabindex="0" aria-label="Tabela com rolagem horizontal"><table><thead><tr>'+heads.map(x=>'<th scope="col">'+escapeHTML(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+escapeHTML(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const card=(title,content,id='')=>'<section class="card" '+(id?'id="'+id+'"':'')+'><h2>'+title+'</h2>'+content+'</section>';
const colors={Q1:'#2b9ed5',Q2:'#568df4',Q3:'#9fc7e4',Q4:'#6c8299','Sem histórico':'#8492a6'};
const metric=(label,value,note)=>'<section class="kpi"><span>'+label+'</span><strong>'+value+'</strong><small>'+note+'</small></section>';
fetch('./data/demo.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(d=>{
 if(d.synthetic!==true)throw Error('Contrato de demonstração inválido');
 el('#status').textContent='';
 render(d.payload);
}).catch(e=>{el('#app').innerHTML='<section class="card error">Não foi possível carregar a demonstração. Inicie o servidor local conforme o README.</section>';console.error(e)});

function scatter(profiles,scope,model){
 const rows=profiles.filter(p=>p.eligible&&p.scopes[scope].c2o!==null);
 const maxX=Math.max(1,...rows.map(p=>p.scopes[scope].opps_day))*1.12,maxY=Math.max(1,...rows.map(p=>p.scopes[scope].c2o))*1.12;
 const x=v=>65+v/maxX*800,y=v=>325-v/maxY*260;
 let marks='';
 for(let t=0;t<=4;t++){
  const vx=maxX*t/4,vy=maxY*t/4;
  marks+='<path d="M 65 '+y(vy)+' H 865" stroke="var(--line)"/><text x="53" y="'+(y(vy)+4)+'" text-anchor="end" fill="var(--muted)" font-size="11">'+fmt(vy,1)+'</text><text x="'+x(vx)+'" y="348" text-anchor="middle" fill="var(--muted)" font-size="11">'+fmt(vx,1)+'</text>';
 }
 for(const p of rows){const r=p.scopes[scope];marks+='<circle cx="'+x(r.opps_day)+'" cy="'+y(r.c2o)+'" r="6" fill="'+(colors[r.label]||'#8492a6')+'" fill-opacity=".85"><title>'+p.id+' · '+r.label+' · '+fmt(r.opps_day)+' Opps/dia · '+fmt(r.c2o)+'% C2O</title></circle>'}
 if(model)for(const c of model.centers)marks+='<path d="M '+(x(c.production)-7)+' '+y(c.efficiency)+' h 14 m -7 -7 v 14" stroke="var(--text)" stroke-width="2"><title>Centróide '+c.label+'</title></path>';
 return '<svg viewBox="0 0 930 390" role="img" aria-label="Dispersão de Opps por dia versus C2O; cores representam grupos K-Means"><text x="65" y="25" fill="var(--muted)" font-size="12">C2O (%) · EFICIÊNCIA</text>'+marks+'<text x="465" y="380" text-anchor="middle" fill="var(--muted)" font-size="12">OPPS/DIA · TRAÇÃO</text></svg>';
}
function render(d){
 el('#app').innerHTML='<div class="section-heading"><div><span class="eyebrow">SEGMENTAÇÃO MULTIVARIADA</span><h2>Tração e eficiência, na mesma leitura.</h2></div></div>'
 +'<div class="kpi-grid">'+metric('Pool elegível',d.profiles.filter(p=>p.eligible).length,'Escala fictícia define participação')
 +metric('Janela',d.parameters.window_days+' dias',''+d.calendar.start+' a '+d.calendar.end)
 +metric('Dimensões',2,'Opps/dia e C2O (%)')
 +metric('Agrupamentos',4,'Rótulos Q1–Q4; não quartis')+'</div>'
 +card('Por que duas dimensões?','<p>A taxa de conversão descreve eficiência, mas não a produção diária. Opps/dia descreve tração, mas também depende de exposição. O K-Means agrupa as duas dimensões após padronização; a interpretação do perfil exige as duas leituras.</p><p class="method-note">Cada campanha possui seu próprio ajuste; o perfil global inclui também a frente complementar. Não há um único cluster universal por analista.</p>')
 +card('Mapa dos perfis','<div class="section-heading"><p>● Analistas fictícios · + Centróides. Passe o cursor para inspecionar.</p></div><div id="scatter"></div><div id="centers"></div>','perfis')
 +card('Performance por analista','<p>Escopo global, todos os turnos. Analistas ordenados por Opps/dia.</p><div id="people"></div>','analistas')
 +card('Comparação entre campanhas',table(['Campanha','Conectadas','Opps','C2O ponderado'],d.groups.map(g=>[g.campaign,g.contacts,g.opportunities,fmt(g.c2o)+'%']))+'<p class="method-note">Taxa agregada = soma das oportunidades / soma das conectadas. Não é a média simples das taxas individuais.</p>')
 +'<section class="expanded-content"><h3>Como interpretar Q1–Q4</h3><p>K-Means não gera quartis nem quadrantes geométricos. Os rótulos ordenam os centróides pela soma das coordenadas padronizadas, atribuindo peso igual às duas dimensões. Os grupos podem ter tamanhos diferentes.</p><p>Sem exposição em uma campanha, o analista recebe “Sem histórico” nesse escopo. Ausência de histórico não é baixa performance. O calendário de presença é global: a produtividade específica não identifica habilidade independente da distribuição de trabalho.</p></section>';
 const update=()=>{
  const scope='Global',model=d.models[scope];
  el('#scatter').innerHTML=scatter(d.profiles,scope,model);
  el('#centers').innerHTML=model?table(['Grupo','Analistas','Centróide Opps/dia','Centróide C2O'],model.centers.map(c=>[c.label,c.size,fmt(c.production),fmt(c.efficiency)+'%'])):'<p>Amostra insuficiente para quatro grupos distintos.</p>';
  const rows=[...d.profiles].sort((a,b)=>(b.scopes[scope]['opps_day']??-1)-(a.scopes[scope]['opps_day']??-1));
  el('#people').innerHTML=table(['Analista','Turno','Dias de presença','Conectadas','Opps','Opps/dia','C2O','Perfil'],rows.map(p=>{const r=p.scopes[scope];return[p.id,p.shift,r.days,r.contacts,r.opportunities,fmt(r.opps_day),r.c2o===null?'n/d':fmt(r.c2o)+'%',r.label]}));
 };
 update();
}
