'use strict';
const $=s=>document.querySelector(s),E=ScenarioEngine;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=2)=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const state={scopes:[],scope:null,values:{},tab:'simulator',linked:true,selected:[],target:110,result:null,goalSort:'label',goalDirection:1};
function cards(base,current,prefix='sim'){
 return '<div class="kpis">'+[['L2O de referência',base.l2o,'%',prefix+'BaseL2o'],['L2O do cenário',current.l2o,'%',prefix+'L2o'],['Opps/dia de referência',base.opps,'',prefix+'BaseOpps'],['Opps/dia do cenário',current.opps,'',prefix+'Opps']].map(([label,value,unit,id],i)=>'<div class="kpi '+(i%2?'highlight':'')+'"><span>'+label+'</span><strong id="'+id+'" data-value="'+value+'">'+fmt(value)+unit+'</strong><small>'+(i%2?'Estimativa no cenário fictício':'Mesmo escopo de comparação')+'</small></div>').join('')+'</div>';
}
function chart(title,base,value,unit,id,max){
 const ceiling=max||Math.max(base,value,.01)*1.25;
 return '<section class="card chart-card"><h3>'+title+'</h3><svg id="'+id+'" viewBox="0 0 480 250" role="img" aria-label="'+title+': referência '+fmt(base)+unit+', cenário '+fmt(value)+unit+'"><line x1="45" y1="208" x2="460" y2="208" stroke="#dfe7f0"/>'+[0,.25,.5,.75,1].map(t=>'<g><line x1="45" y1="'+(208-t*174)+'" x2="460" y2="'+(208-t*174)+'" stroke="#eaf0f7"/><text x="38" y="'+(212-t*174)+'" text-anchor="end">'+fmt(t*ceiling,1)+'</text></g>').join('')+'<rect class="base-bar" x="115" y="'+(208-base/ceiling*174)+'" width="85" height="'+base/ceiling*174+'" rx="5"/><rect class="scenario-bar" data-value="'+value+'" x="290" y="'+(208-value/ceiling*174)+'" width="85" height="'+value/ceiling*174+'" rx="5"/><text x="157" y="'+(198-base/ceiling*174)+'" text-anchor="middle">'+fmt(base)+unit+'</text><text class="scenario-label" x="332" y="'+(198-value/ceiling*174)+'" text-anchor="middle">'+fmt(value)+unit+'</text><text x="157" y="235" text-anchor="middle">Referência</text><text x="332" y="235" text-anchor="middle">Cenário</text></svg></section>';
}
function updateChart(id,value,base,unit,max){
 const svg=$('#'+id);if(!svg)return;
 const ceiling=max||Math.max(base,value,.01)*1.25,rect=svg.querySelector('.scenario-bar'),label=svg.querySelector('.scenario-label');
 rect.setAttribute('height',value/ceiling*174);rect.setAttribute('y',208-value/ceiling*174);rect.dataset.value=value;
 label.setAttribute('y',198-value/ceiling*174);label.textContent=fmt(value)+unit;
 svg.setAttribute('aria-label','Referência '+fmt(base)+unit+', cenário '+fmt(value)+unit);
}
function controls(){
 const groups=[...new Set(state.scope.variables.map(v=>v.group))];
 return groups.map((group,i)=>'<section class="expanded-content"><h3>'+esc(group)+'</h3>'+state.scope.variables.filter(v=>v.group===group).map(v=>'<div class="variable"><div class="variable-label"><label for="number-'+v.key+'">'+esc(v.label)+'</label><span>'+esc(v.unit)+'</span></div><div class="input-row"><input type="range" data-key="'+v.key+'" min="'+v.min+'" max="'+v.max+'" step="'+v.step+'" value="'+state.values[v.key]+'" aria-label="'+esc(v.label)+'" '+(!v.controllable?'disabled':'')+'><input id="number-'+v.key+'" data-number="'+v.key+'" type="number" min="'+v.min+'" max="'+v.max+'" step="'+v.step+'" value="'+state.values[v.key]+'" '+(!v.controllable?'disabled':'')+'></div><small>'+(v.key==='leads_por_hc'?'Derivado: leads ÷ HCs':!v.controllable?'Referência histórica fixa':'Faixa demonstrativa: '+fmt(v.min,v.step===1?0:1)+' a '+fmt(v.max,v.step===1?0:1))+'</small></div>').join('')+'</section>').join('');
}
function simulator(){
 const base=E.metrics(state.scope,state.scope.baseline),current=E.metrics(state.scope,state.values);
 const maxL=8,maxO=480;
 return '<div class="section-title"><div><h2>Simulador preditivo</h2><p>Altere condições operacionais e acompanhe a resposta conjunta em conversão e produção diária.</p></div><button id="reset" class="secondary">Restaurar base</button></div><div class="sim-layout"><aside class="card inputs"><div class="linked"><label><input type="checkbox" id="linked" '+(state.linked?'checked':'')+'> Respostas entre variáveis</label><small>Ao mover uma entrada, as respostas parametrizadas ajustam as variáveis relacionadas. Leads e HCs permanecem raízes independentes.</small></div>'+controls()+'</aside><div class="results">'+cards(base,current)+'<div class="charts">'+chart('Conversão · L2O',base.l2o,current.l2o,'%', 'l2oChart',maxL)+chart('Produção · Opps/dia',base.opps,current.opps,'','oppsChart',maxO)+'</div><section class="card"><h3>Leitura do cenário</h3><p id="scenarioSummary" aria-live="polite"></p><div class="formula">Opps/dia = leads/dia × L2O ÷ 100</div><p class="small">As respostas são associações ilustrativas, não efeitos causais. Performance permanece fixa; leads por HC é recalculado a cada alteração de capacidade.</p></section><section class="card"><h3>Entradas alteradas</h3><div id="changes"></div></section></div></div>';
}
function changedRows(values){
 const changed=state.scope.variables.filter(v=>Math.abs(values[v.key]-state.scope.baseline[v.key])>.00001);
 return changed.length?'<div class="table-scroll"><table><thead><tr><th>Variável</th><th>Referência</th><th>Cenário</th><th>Δ absoluto</th></tr></thead><tbody>'+changed.map(v=>'<tr><td>'+esc(v.label)+'</td><td>'+fmt(state.scope.baseline[v.key])+'</td><td>'+fmt(values[v.key])+'</td><td>'+fmt(values[v.key]-state.scope.baseline[v.key])+'</td></tr>').join('')+'</tbody></table></div>':'<p class="small">Todas as entradas estão na referência.</p>';
}
function sync(){
 const s=state.scope,b=E.metrics(s,s.baseline),m=E.metrics(s,state.values);
 for(const v of s.variables){
  const range=$('[data-key="'+v.key+'"]'),number=$('[data-number="'+v.key+'"]');
  if(range)range.value=state.values[v.key];
  if(number&&number!==document.activeElement)number.value=Number(state.values[v.key].toFixed(v.step===1&&v.key!=='leads_por_hc'?0:4));
 }
 [['#simL2o',m.l2o,'%'],['#simOpps',m.opps,'']].forEach(([id,n,unit])=>{const node=$(id);if(node){node.dataset.value=n;node.textContent=fmt(n)+unit;}});
 updateChart('l2oChart',m.l2o,b.l2o,'%',8);updateChart('oppsChart',m.opps,b.opps,'',480);
 if($('#scenarioSummary'))$('#scenarioSummary').textContent='Com '+fmt(state.values.volume_leads,0)+' leads/dia e '+fmt(state.values.hcs_ativos,0)+' HCs, o cenário estima '+fmt(m.opps)+' Opps/dia ('+(m.opps>=b.opps?'+':'')+fmt(m.opps-b.opps)+' frente à referência) e '+fmt(m.l2o)+'% de L2O.';
 if($('#changes'))$('#changes').innerHTML=changedRows(state.values);
}
function matrix(){
 const s=state.scope,labels=[...s.variables.map(v=>v.label),'L2O'],short=[...s.variables.map((v,i)=>String(i+1)),'L2O'];
 return '<div class="section-title"><div><h2>Matriz de correlação</h2><p>Relações de Pearson entre as observações diárias fictícias do escopo. A matriz descreve a amostra; não muda ao mover um único cenário.</p></div></div><section class="card"><div class="legend"><span>−1 · negativa</span><i></i><span>+1 · positiva</span></div><div class="table-scroll"><table class="matrix"><thead><tr><th>Variável</th>'+short.map((t,i)=>'<th title="'+esc(labels[i])+'">'+t+'</th>').join('')+'</tr></thead><tbody>'+s.correlations.map((row,i)=>'<tr><th>'+short[i]+'. '+esc(labels[i])+'</th>'+row.map((r,j)=>'<td style="background:'+(r>=0?'rgba(0,167,220,'+(.05+Math.abs(r)*.65):'rgba(145,163,183,'+(.05+Math.abs(r)*.65))+')" title="'+esc(labels[i]+' × '+labels[j])+': '+fmt(r)+'">'+fmt(r)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p class="small">'+s.n_records+' observações fictícias. Correlação não identifica causa; variáveis derivadas podem produzir relações mecânicas.</p></section>';
}
function levers(){
 const s=state.scope,max=Math.max(...s.importance.map(v=>v.sensitivity),.01);
 return '<div class="section-title"><div><h2>Principais alavancas</h2><p>Compare a amplitude de resposta do modelo ao variar uma entrada, mantendo as demais na referência. Selecione uma variável para explorá-la no simulador.</p></div></div><div class="quality"><span>MAE no cenário fictício: <strong>'+fmt(s.mae_pp,3)+' p.p.</strong></span><span>Erro relativo médio: <strong>'+fmt(s.relative_mae)+'%</strong></span><small>Desvio entre a função demonstrativa e observações fictícias com ruído. Não é validação de modelo treinado nem intervalo de confiança.</small></div><section class="card"><h3>Sensibilidade do modelo demonstrativo</h3><p class="small">Amplitude em pontos percentuais de L2O na faixa ilustrativa. Não é a importância por ganho de um XGBoost treinado.</p><div class="lever-list">'+s.importance.map(v=>'<button class="lever" data-lever="'+v.key+'"><span>'+esc(v.label)+'</span><i><b style="width:'+100*v.sensitivity/max+'%"></b></i><strong>'+fmt(v.sensitivity)+' p.p.</strong></button>').join('')+'</div></section>';
}
function goal(){
 const s=state.scope;
 return '<div class="section-title"><div><h2>Goal Seeking · da meta ao cenário</h2><p>Qual configuração do histórico fictício tem a previsão de L2O mais próxima da meta? Selecione um patamar e compare as condições desse dia com a referência.</p></div></div><section class="card"><label>Meta em % do L2O de referência</label><div class="presets">'+Array.from({length:11},(_,i)=>100+i*5).map(n=>'<button data-target="'+n+'" aria-pressed="'+(state.target===n)+'">'+n+'%</button>').join('')+'</div><p class="small">A busca seleciona um dia existente da amostra, sem criar uma combinação ótima de entradas. A meta e a previsão mais próxima são apresentadas separadamente.</p></section><div id="goalHeadline"></div><div class="goal-layout"><section class="card"><h3>Variáveis na comparação</h3><p class="small">O gráfico e a tabela apresentam todas as variáveis. A performance permanece fixa e a seleção da meta determina o cenário histórico comparado.</p><p>Todas as variáveis estão apresentadas na comparação abaixo.</p></section><div id="goalResult" class="goal-result" aria-live="polite"></div></div>';
}
function showResult(){
 const result=state.result;if(!result)return;
 const s=state.scope,c=result.candidate,base={l2o:s.observed_l2o,opps:s.observed_opps_day};
 $('#goalHeadline').innerHTML='<div class="kpis">'+[['L2O de referência',fmt(base.l2o)+'%'],['L2O alvo',fmt(result.targetL2o)+'%'],['L2O do cenário',fmt(c.l2o)+'%'],['Distância à meta',fmt(result.distance)+' p.p.']].map(([label,value])=>'<div class="kpi"><span>'+label+'</span><strong>'+value+'</strong></div>').join('')+'</div><section class="card '+(result.inRange?'success':'warning')+'"><h3>Dia fictício '+c.day+' · cenário histórico mais próximo</h3><p>'+(result.inRange?'A meta está dentro da faixa de previsões da amostra. Isso não garante correspondência exata.':'A meta está fora da faixa de previsões da amostra. O cenário mostrado é o mais próximo, não uma meta atingida.')+'</p><p class="small">Opps/dia de referência: '+fmt(base.opps)+' · Meta proporcional: '+fmt(result.targetOpps)+' · Estimativa com o volume do cenário: <strong id="goalOpps" data-value="'+c.opps+'">'+fmt(c.opps)+'</strong>. Meta de produção não é resultado previsto.</p><button id="applyGoal">Explorar este cenário no simulador</button></section>';
 const rows=s.variables.filter(v=>state.selected.includes(v.key)).map(v=>({...v,reference:s.baseline[v.key],scenario:c.values[v.key],delta:c.values[v.key]-s.baseline[v.key],relative:s.baseline[v.key]?100*(c.values[v.key]-s.baseline[v.key])/Math.abs(s.baseline[v.key]):null}));
 rows.sort((x,y)=>state.goalDirection*(state.goalSort==='label'?x.label.localeCompare(y.label,'pt-BR'):x[state.goalSort]-y[state.goalSort]));
 const max=Math.max(1,...rows.map(r=>Math.abs(r.relative||0)));
 $('#goalResult').innerHTML='<section class="card"><h3>O que muda em relação à referência?</h3><p class="small">Variação relativa por entrada; a performance permanece fixa. Uma barra negativa representa redução, não necessariamente piora.</p><div class="goal-deltas">'+(rows.map(r=>'<div class="delta-row"><span>'+esc(r.label)+'</span><div class="delta-track"><i class="'+(r.delta<0?'negative':'positive')+'" style="width:'+Math.abs(r.relative||0)/max*48+'%;'+(r.delta<0?'right:50%':'left:50%')+'"></i></div><strong>'+ (r.relative===null?'n/a':fmt(r.relative)+'%')+'</strong></div>').join('')||'<p>Selecione uma variável para exibir a comparação.</p>')+'</div></section><section class="card"><div class="table-actions"><h3>Referência × cenário</h3></div><div class="table-scroll"><table><thead><tr>'+[['label','Variável'],['reference','Referência'],['scenario','Cenário'],['delta','Δ absoluto']].map(([key,label])=>'<th><button data-goal-sort="'+key+'">'+label+'</button></th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(r.label)+'</td><td>'+fmt(r.reference)+'</td><td>'+fmt(r.scenario)+'</td><td>'+fmt(r.delta)+'</td></tr>').join('')+'</tbody></table></div></section>';
 $('#applyGoal').onclick=()=>{state.values={...c.values};sync();$('#l2oChart').scrollIntoView({block:'center'});};
 document.querySelectorAll('[data-goal-sort]').forEach(button=>button.onclick=()=>{const key=button.dataset.goalSort;state.goalDirection=key===state.goalSort?-state.goalDirection:1;state.goalSort=key;showResult();});
}
function render(){
 $('#app').innerHTML=[matrix(),levers(),simulator(),goal()].map(html=>'<section class="report-chart-section">'+html+'</section>').join('');
 sync();
 document.querySelectorAll('[data-key],[data-number]').forEach(input=>input.addEventListener('input',()=>{
  if(input.value===''||!Number.isFinite(Number(input.value)))return;
  state.values=E.change(state.scope,state.values,input.dataset.key||input.dataset.number,Number(input.value),state.linked);sync();
 }));
 document.querySelectorAll('[data-number]').forEach(input=>input.onchange=()=>{input.value=state.values[input.dataset.number];});
 $('#linked').onchange=e=>{state.linked=e.target.checked;};
 $('#reset').onclick=()=>{state.values={...state.scope.baseline};sync();};
 document.querySelectorAll('[data-lever]').forEach(button=>button.onclick=()=>{const input=$('[data-key="'+button.dataset.lever+'"]');input.scrollIntoView({block:'center'});if(!input.disabled)input.focus();});
 const goalUpdate=()=>{state.result=E.seek(state.scope,state.target);document.querySelectorAll('[data-target]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.target)===state.target));showResult();};
 document.querySelectorAll('[data-target]').forEach(button=>button.onclick=()=>{state.target=Number(button.dataset.target);goalUpdate();});
 goalUpdate();
}
fetch('./data/demo.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{
 state.scopes=data.payload.scopes;
 
 const changeScope=id=>{state.scope=state.scopes.find(s=>s.id===id);state.values={...state.scope.baseline};state.selected=state.scope.variables.map(v=>v.key);state.result=null;$('#status').textContent=state.scope.n_records+' dias fictícios · '+state.scope.label+' · modelo demonstrativo';render();};
 
 document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{state.tab=button.dataset.tab;render();});
 changeScope(state.scopes[0].id);
}).catch(error=>{$('#status').textContent='Falha ao carregar o cenário.';console.error(error);});
