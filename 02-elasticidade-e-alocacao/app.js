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

function sankey(rows){
 if(!rows.length)return '<p>Nenhuma alocação viável disponível.</p>';
 const flow=new Map(),totals=new Map();
 for(const r of rows){
  const chain=['global:'+r.global_label,'specific:'+r.specific_label,'route:'+r.route];
  for(const id of chain)totals.set(id,(totals.get(id)||0)+1);
  for(let i=0;i<2;i++){const key=chain[i]+'|'+chain[i+1];flow.set(key,(flow.get(key)||0)+1)}
 }
 const stages=['global:','specific:','route:'];
 const columns=stages.map(s=>[...totals.keys()].filter(k=>k.startsWith(s)).sort());
 const height=500,gap=18,top=60,usable=height-top-35;
 const unit=(usable-(Math.max(...columns.map(c=>c.length))-1)*gap)/rows.length;
 const nodes=new Map(),xs=[130,455,800],width=16;
 columns.forEach((list,col)=>{
  const block=rows.length*unit+(list.length-1)*gap;
  let y=top+(usable-block)/2;
  list.forEach(id=>{const n=totals.get(id);nodes.set(id,{id,x:xs[col],y,h:n*unit,in:0,out:0,col});y+=n*unit+gap});
 });
 let paths='';
 for(const [key,count] of [...flow.entries()].sort()){
  const [source,target]=key.split('|'),a=nodes.get(source),b=nodes.get(target),h=count*unit;
  const y0=a.y+a.out,y1=b.y+b.in,mid=(a.x+width+b.x)/2;
  a.out+=h;b.in+=h;
  const color=colors[source.split(':')[1]]||'#7187a3';
  paths+='<path d="M '+(a.x+width)+' '+y0+' C '+mid+' '+y0+' '+mid+' '+y1+' '+b.x+' '+y1+' L '+b.x+' '+(y1+h)+' C '+mid+' '+(y1+h)+' '+mid+' '+(y0+h)+' '+(a.x+width)+' '+(y0+h)+' Z" fill="'+color+'" fill-opacity=".38"><title>'+escapeHTML(source.split(':')[1])+' → '+escapeHTML(target.split(':')[1])+': '+count+' analistas</title></path>';
 }
 const labels=[...nodes.values()].map(n=>{
  const label=n.id.slice(n.id.indexOf(':')+1),color=colors[label]||'#7187a3';
  const tx=n.col===0?n.x-10:n.x+25,anchor=n.col===0?'end':'start';
  return '<rect x="'+n.x+'" y="'+n.y+'" width="'+width+'" height="'+n.h+'" rx="3" fill="'+color+'"/><text x="'+tx+'" y="'+(n.y+n.h/2)+'" dominant-baseline="middle" text-anchor="'+anchor+'" fill="var(--text)" font-size="12">'+escapeHTML(label)+' · '+totals.get(n.id)+'</text>';
 }).join('');
 return '<div class="sankey-scroll" tabindex="0" aria-label="Fluxo da alocação; role horizontalmente em telas estreitas"><svg class="sankey" viewBox="0 0 1090 500" role="img" aria-label="Sankey da performance global à específica e ao destino. Larguras representam analistas.">'+
 '<text x="130" y="28" fill="var(--muted)" font-size="12">01 · PERFORMANCE GLOBAL</text><text x="455" y="28" fill="var(--muted)" font-size="12">02 · PERFORMANCE ESPECÍFICA</text><text x="800" y="28" fill="var(--muted)" font-size="12">03 · ALOCAÇÃO</text>'+paths+labels+'</svg></div>';
}

function elasticityChart(rows){
 const max=Math.max(1,...rows.map(r=>Math.abs(r.delta_baseline_pp)))*1.2,step=800/rows.length,y=v=>180-v/max*135;
 return '<svg viewBox="0 0 900 400" role="img" aria-label="Colunas de elasticidade relativa à baseline global e linha de referência zero">'+[-1,-.5,0,.5,1].map(k=>'<path d="M55 '+y(max*k)+'H870" stroke="#33485e"/><text x="45" y="'+(y(max*k)+4)+'" text-anchor="end" fill="#bdd0df" font-size="12">'+fmt(max*k,1)+'</text>').join('')+rows.map((r,i)=>'<rect x="'+(55+step*(i+.2))+'" y="'+Math.min(y(r.delta_baseline_pp),y(0))+'" width="'+step*.6+'" height="'+Math.abs(y(r.delta_baseline_pp)-y(0))+'" fill="'+(r.delta_baseline_pp>=0?'#00bfff':'#9bafc3')+'"/><text x="'+(55+step*(i+.5))+'" y="350" text-anchor="middle" fill="#c4d4e3" font-size="12">'+escapeHTML(r.scope)+'</text>').join('')+'<path d="M55 180H870" stroke="#d7e4ef" stroke-dasharray="6 4" stroke-width="2"/><text x="450" y="390" text-anchor="middle" fill="#c4d4e3" font-size="12">Diferença em relação à baseline global (p.p.)</text></svg>';
}
function render(d){
 const eligible=d.profiles.filter(p=>p.eligible).length;
 const status=d.status==='Ótima'?'Ótima no modelo':'Inviável';
 const delta=d.objective-d.reference_objective;
 el('#app').innerHTML='<section class="report-story"><h2>Da elasticidade à alocação</h2><p>O estudo de elasticidade veio primeiro: comparar a conversão entre perfis mostrou por que o contexto de atuação precisava entrar na decisão. A pergunta seguinte foi como distribuir a equipe entre contextos, considerando afinidade, capacidade e restrições. Dessa pergunta nasceu o Golden Set.</p><p>O relatório segue essa sequência: primeiro o contraste de conversão; depois os perfis de K-Means, o Score de afinidade e a alocação conjunta. O Sankey permite acompanhar o resultado. O contraste observado motiva o problema, mas não comprova efeito causal nem determina sozinho os pesos da otimização.</p></section>'
 +card('Elasticidade observada por contexto','<p>Diferença de C2O entre Top Half (Q1/Q2 global) e Bottom Half (Q3/Q4 global), em pontos percentuais. “Half” nomeia os grupos de rótulos, não garante metade das pessoas.</p>'+elasticityChart(d.sensitivity)+table(['Escopo','Conectadas Top','C2O Top','Conectadas Bottom','C2O Bottom','Diferença (p.p.)','Δ vs. global (p.p.)'],d.sensitivity.map(r=>[r.scope,r.top.contacts,fmt(r.top.c2o)+'%',r.bottom.contacts,fmt(r.bottom.c2o)+'%',fmt(r.gap_pp),fmt(r.delta_baseline_pp)]))+'<p class="method-note">Associação descritiva na mesma janela usada para classificar os perfis. Não identifica efeito causal nem valida um ganho futuro. O multiplicador de prioridade do cenário é configurado separadamente.</p>','elasticidade')
 +'<div class="section-heading"><div><span class="eyebrow">DECISÃO SOB RESTRIÇÕES</span><h2>Uma alocação conjunta. Cada escolha explicável.</h2></div><span class="status-pill">'+status+'</span></div>'
 +'<div class="kpi-grid">'+metric('Analistas elegíveis',fmt(eligible,0),d.profiles.length-eligible+' fora do pool')
 +metric('Alocações',fmt(d.assignments.length,0),'Uma pessoa por destino')
 +metric('Score total',fmt(d.objective),'Unidade da função objetivo')
 +metric('Δ vs. referência viável','+'+fmt(delta),'Não representa ganho em oportunidades')+'</div>'
 +card('Como a decisão é construída','<ol class="journey"><li><b>Histórico elegível</b><span>Mesma janela e calendário nos numeradores e denominadores.</span></li><li><b>Perfis 2D</b><span>Opps/dia e C2O por campanha e no global.</span></li><li><b>Score híbrido</b><span>Afinidade específica, global e produção histórica.</span></li><li><b>Alocação ótima</b><span>Capacidade, turno, dedicação e cota multicanal.</span></li></ol><p class="method-note">Parâmetros fictícios: '+fmt(d.parameters.specific_weight*100,0)+'% específico + '+fmt(d.parameters.global_weight*100,0)+'% global; produção × '+d.parameters.production_weight+'; prioridade × '+d.parameters.priority_multiplier+'.</p>','metodo')
 +card('Fluxo do Golden Set','<div class="section-heading"><p>Cada faixa representa analistas. A largura conserva o total entre as três etapas.</p></div><div id="sankey"></div><p class="method-note">Q1–Q4 são grupos ordenados de K-Means, não quartis populacionais. O fluxo intermediário agrega perfis; a tabela abaixo preserva o caminho de cada analista.</p>','fluxo')
 +'<div class="grid">'+card('Função objetivo','<p>Maximizar a soma dos Scores das atribuições permitidas.</p><div class="formula">max Σ Score(i, j) × x(i, j)<br>x(i, j) ∈ {0, 1}</div><p>O problema é de programação inteira binária. A implementação pública usa programação dinâmica exata para o cenário pequeno, sem afirmar que executa PuLP.</p><p class="method-note">'+escapeHTML(d.precision)+'</p>')
 +card('Restrições que a solução respeita','<ul class="check-list"><li>Uma alocação por analista elegível.</li><li>Vagas preenchidas dentro do próprio turno.</li><li>Rotas dedicadas exclusivas e preservadas.</li><li>Capacidade redimensionada com mínimos explícitos.</li><li>Cota multicanal entre as campanhas permitidas.</li></ul><p class="method-note">Se o conjunto for inviável, não há alocação operacional a recomendar.</p>')+'</div>'
 +card('Capacidade planejada e utilizada',table(['Destino','Planejada','Ajustada','Ocupada'],d.routes.map(r=>[r.id,r.planned,r.capacity,d.assignments.filter(a=>a.route===r.id).length])),'capacidade')
 +card('Rastreabilidade por analista','<p>A decomposição do Score de todos os analistas aparece abaixo. Histórico e meta são apresentados separadamente.</p><div id="detail" aria-live="polite"></div><div id="assignment-table"></div>','auditoria')
 +card('O que a otimização comprova',table(['Turno','Status','Score ótimo','Score referência','Estados visitados'],d.solutions.map(s=>[s.shift,s.optimal.status,fmt(s.optimal.objective),fmt(s.reference.objective),s.optimal.states]))+
 '<p class="method-note">A referência é a primeira solução viável encontrada sem maximização, sob as mesmas restrições. Não é uma escala real. O ótimo vale para o Score, as restrições e a precisão numérica deste cenário; não prova máximo de receita, conversão ou produtividade futura.</p>')
 +'<section class="expanded-content"><h3>Premissas e leitura crítica</h3><p>O Score representa preferência definida no modelo. A meta por faixas é uma regra de gestão fictícia, não previsão estatística. O histórico por campanha divide a produção pelos dias de presença global: ele incorpora exposição e não mede habilidade isoladamente. A comparação entre perfis não identifica causalidade.</p><p>Não copiamos calendários, campanhas, pessoas, pesos ou metas da operação. As fórmulas e adaptações estão descritas neste relatório.</p></section>';
 const draw=()=>{
  const selected=d.assignments;
  el('#sankey').innerHTML=sankey(selected);
  el('#assignment-table').innerHTML=table(['Analista','Turno','Global','Específica','Destino','Histórico Opps/dia','Meta de referência','Score'],selected.map(a=>[a.person,a.shift,a.global_label,a.specific_label,a.route,fmt(a.historical),fmt(a.target),fmt(a.components.total)]));
 };
 const detail=()=>{
  el('#detail').innerHTML=table(['Analista','Específico','Global','Produção','Multiplicador','Score total'],d.assignments.map(a=>[a.person,fmt(a.components.specific),fmt(a.components.global_component),fmt(a.components.production),fmt(a.components.multiplier),fmt(a.components.total)]))+'<p>Score = (componente específico + componente global + produção ponderada) × multiplicador da rota. Os valores completos são usados no cálculo; a tabela arredonda apenas a apresentação.</p>';
 };
 draw();detail();
}
