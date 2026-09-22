'use strict';
const $=s=>document.querySelector(s),fmt=(n,d=1)=>n===null?'Não disponível':Number(n).toLocaleString('pt-BR',{maximumFractionDigits:d});
const metrics={hc:'HCs ativos/dia',leads:'Leads-segmento',attempts:'Tentativas de ligação',hsm:'HSMs enviados',connected:'Conectadas',alos:'ALOs',opps:'Opps',oppsDay:'Opps/dia',l2c:'L2C',l2alo:'L2ALO',c2alo:'C2ALO',c2o:'C2O',alo2o:'ALO2O',l2o:'L2O'};
const sum=(rows,k)=>rows.reduce((a,r)=>a+(r[k]||0),0),ratio=(a,b)=>b?100*a/b:null;
const table=(heads,rows)=>'<div class="scroll"><table><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const card=(title,body)=>'<section class="card"><h2>'+title+'</h2>'+body+'</section>';
function stats(rows,protect=false){
 const daily=[...new Set(rows.map(r=>r.day))].sort().map(day=>{const rs=rows.filter(r=>r.day===day);return {day,hc:new Set(rs.flatMap(r=>r.active)).size,opps:sum(rs,'opps')};});
 const mean=k=>{const days=daily.filter(r=>!protect||r[k]>0);return days.length?sum(days,k)/days.length:null;};
 const v=Object.fromEntries(['leads','attempts','hsm','connected','alos','opps'].map(k=>[k,sum(rows,k)])),call=rows.filter(r=>r.segment!=='Chat');
 return {...v,hc:mean('hc'),oppsDay:mean('opps'),l2c:ratio(v.connected,sum(call,'leads')),l2alo:ratio(v.alos,v.leads),c2alo:ratio(sum(call,'alos'),v.connected),c2o:ratio(sum(call,'opps'),v.connected),alo2o:ratio(v.opps,v.alos),l2o:ratio(v.opps,v.leads),daily};
}
function chart(series,labels){
 const max=Math.max(1,...series.flatMap(s=>s.values)),x=i=>40+i*780/Math.max(1,labels.length-1),y=n=>210-n/max*170,colors=['#5fb5e2','#a7b8ce','#9fc7e4'];
 return '<svg viewBox="0 0 860 250" role="img" aria-label="Comparação diária"><path d="M40 30V210H820" fill="none" stroke="#7890a9"/>'+[0,max/2,max].map(n=>'<text x="3" y="'+y(n)+'" fill="#bbcddd" font-size="12">'+fmt(n)+'</text>').join('')+series.map((s,j)=>'<path fill="none" stroke="'+colors[j]+'" stroke-width="3" stroke-dasharray="'+(j===1?'6 4':'none')+'" d="'+s.values.map((v,i)=>v===null?'':((i===0||s.values[i-1]===null)?'M':'L')+x(i)+' '+y(v)).join(' ')+'"/>'+s.values.map((v,i)=>'<g><title>'+s.name+', '+labels[i]+': '+fmt(v)+'</title>'+(s.excluded?.includes(i)?'<path d="M'+(x(i)-5)+' '+(y(v)-5)+'l10 10m-10 0l10 -10" stroke="'+colors[j]+'" stroke-width="3"/>':'')+'</g>').join('')).join('')+'</svg><p>'+series.map((s,i)=>'<span style="color:'+colors[i]+'">● '+s.name+'</span>').join(' · ')+'</p>';
}
function combo(stacks,line,labels,unit=' Opps'){
 const count=labels.length,w=900,h=310,left=55,bottom=250,usable=815,step=usable/count;
 const max=unit==='%'?100:Math.max(1,...labels.map((_,i)=>stacks.reduce((n,s)=>n+s.values[i],0)),...(line?.values||[]))*1.1;
 const y=n=>bottom-n/max*205;
 let marks=[0,.25,.5,.75,1].map(t=>'<path d="M55 '+y(max*t)+'H870" stroke="#33485e"/><text x="45" y="'+(y(max*t)+4)+'" text-anchor="end" fill="#c6d5e3" font-size="12">'+fmt(max*t,0)+(unit==='%'?'%':'')+'</text>').join('');
 labels.forEach((label,i)=>{let acc=0;stacks.forEach(s=>{const v=s.values[i],top=y(acc+v);marks+='<rect x="'+(left+i*step+step*.15)+'" y="'+top+'" width="'+step*.7+'" height="'+(y(acc)-top)+'" fill="'+s.color+'"><title>'+label+' · '+s.name+': '+fmt(v)+unit+'</title></rect>';acc+=v;});if(count<=12||i%4===0||i===count-1)marks+='<text x="'+(left+(i+.5)*step)+'" y="274" text-anchor="middle" fill="#c6d5e3" font-size="11">'+(label.includes('-')?label.slice(8)+'/'+label.slice(5,7):label)+'</text>';});
 if(line)marks+='<polyline fill="none" stroke="#d2e0ee" stroke-width="2.5" points="'+line.values.map((v,i)=>(left+(i+.5)*step)+','+y(v)).join(' ')+'"/>';
 return '<svg data-chart-kind="'+(line?'stacked-bar-line':'stacked-bar')+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+(line?'Barras empilhadas e linha de '+line.name:'Participação por horário em barras empilhadas')+'">'+marks+'</svg><p class="chart-legend">'+stacks.map(s=>'<span style="color:'+s.color+'">■ '+s.name+'</span>').concat(line?['<span style="color:#d2e0ee">━ '+line.name+'</span>']:[]).join(' · ')+'</p>';
}
fetch('data/demo.json').then(r=>r.json()).then(data=>{
 if(!data.synthetic)throw Error('Contrato fictício obrigatório');const d=data.payload;
 const options=d.segments.map(s=>'<option>'+s+'</option>').join('');
 $('#app').innerHTML=card('1. Projeto vs. Baseline','<p>Recorte global fictício. Projeto: 03/02 a 01/03/2025; baseline: 06/01 a 01/02/2025. Cada período contém 24 dias operacionais, com a mesma composição semanal. As médias incluem todos esses dias.</p><div id="comparison"></div>')
 +card('2. Incremento dos Segmentos','<p>Exemplo: contribuição de Entrada A. Barras empilhadas separam os demais segmentos, em cinza, e a contribuição selecionada, em azul. A linha acompanha o total de Opps. É decomposição observada, não ganho causal.</p><div id="increment"></div>')
 +card('3. Impacto dos Segmentos','<p>Cenário ilustrado: retirada de Continuidade. As barras separam resultado preservado, incremento e prejuízo; a linha mostra o resultado simulado. A transferência usa as taxas da etapa receptora, sem comprovar efeito real.</p><div id="impact"></div>')
 +card('4. Aderência ao Roteiro','<p>Execução em 04/02/2025. Barras verticais empilhadas mostram a participação de cada segmento nas tentativas por horário. Não há nota de conformidade com uma escala. A tabela preserva os valores e volumes.</p><div id="adherence"></div>');
 function comparison(){
  const protect=false,key='opps',rows=(period,segment)=>d.rows.filter(r=>r.period===period&&(!segment||r.segment===segment));
  const pr=rows('project',''),br=rows('baseline',''),p=stats(pr,protect),b=stats(br,protect);
  const daily=(rs,s)=>s.daily.map(day=>stats(rs.filter(r=>r.day===day.day))[key]);
  const exclusions=s=>s.daily.map((r,i)=>protect&&((key==='hc'&&r.hc===0)||(key==='oppsDay'&&r.opps===0))?i:-1).filter(i=>i>=0);
  $('#comparison').innerHTML=table(['Indicador','Projeto','Baseline','Diferença exibida'],Object.entries(metrics).map(([k,v])=>[v,fmt(p[k]),fmt(b[k]),p[k]===null||b[k]===null?'Não disponível':fmt(Number(p[k].toFixed(1))-Number(b[k].toFixed(1))) ]))+'<h3>Evolução por dia comparável</h3>'+chart([{name:'Projeto',values:daily(pr,p),excluded:exclusions(p)},{name:'Baseline',values:daily(br,b),excluded:exclusions(b)}],p.daily.map((r,i)=>r.day+' / '+b.daily[i]?.day))+'<p>Gráfico: Opps por dia operacional comparável. A baseline usa linha tracejada. HCs/dia e Opps/dia são médias sobre os 24 dias; as taxas são razões dos totais, com diferenças em pontos percentuais.</p>';
 }
 const project=d.rows.filter(r=>r.period==='project');
 function increment(){const selected='Entrada A',a=project.filter(r=>r.segment===selected),b=project.filter(r=>r.segment!==selected),den=sum(project,'leads');
  $('#increment').innerHTML=table(['Indicador','Demais segmentos',selected,'Total'],['leads','attempts','hsm','connected','alos','opps'].map(k=>[metrics[k],fmt(sum(b,k)),fmt(sum(a,k)),fmt(sum(project,k))]).concat([['Contribuição para L2O (p.p.)',fmt(ratio(sum(b,'opps'),den)),fmt(ratio(sum(a,'opps'),den)),fmt(ratio(sum(project,'opps'),den))]]))+combo([{name:'Demais segmentos',values:stats(b).daily.map(r=>r.opps),color:'#899bb1'},{name:selected,values:stats(a).daily.map(r=>r.opps),color:'#529fd4'}],{name:'Total de Opps',values:stats(project).daily.map(r=>r.opps)},stats(project).daily.map(r=>r.day));
 }
 function impact(){const omitted='Continuidade';let sim=[];
  for(const day of [...new Set(project.map(r=>r.day))]){
   const rs=project.filter(r=>r.day===day),entry=rs.slice(0,2),retained=sum(entry.filter(r=>r.segment!==omitted),'leads')/sum(entry,'leads');let carry=0;
   for(let i=0;i<rs.length;i++){const row=rs[i],scale=i<2?1:retained,copy={...row};for(const k of ['leads','attempts','hsm','connected','alos','opps'])copy[k]*=scale;
    if(row.segment===omitted){if(i>=2)carry+=copy.leads;for(const k of ['leads','attempts','hsm','connected','alos','opps'])copy[k]=0;}
    else if(i>=2&&carry){for(const k of ['leads','attempts','hsm','connected','alos','opps'])copy[k]+=carry*row[k]/row.leads;carry*=Math.min(1,(rs[i+1]?.leads||0)/row.leads);}
    sim.push(copy);
   }
  }
  const before=stats(project),after=stats(sim);
  $('#impact').innerHTML=table(['Indicador','Observado','Cenário','Variação'],['leads','attempts','hsm','connected','alos','opps','l2o'].map(k=>[metrics[k],fmt(before[k]),fmt(after[k]),fmt(after[k]-before[k])]))+combo([{name:'Preservado',color:'#899bb1',values:before.daily.map((r,i)=>Math.min(r.opps,after.daily[i].opps))},{name:'Incremento',color:'#529fd4',values:before.daily.map((r,i)=>Math.max(0,after.daily[i].opps-r.opps))},{name:'Prejuízo',color:'#a4b7cb',values:before.daily.map((r,i)=>Math.max(0,r.opps-after.daily[i].opps))}],{name:'Resultado simulado',values:after.daily.map(r=>r.opps)},before.daily.map(r=>r.day))+'<p>Frações são expectativas, não eventos contados. Sem retirada, cenário e observado coincidem. Não há restrições adicionais de capacidade ou previsão de reação do cliente. O fluxo sem receptora posterior sai da cadeia.</p>';
 }
 function adherence(){
  const segments=['Sweet Spot','Baixa Eficiência','Zona de Desperdício'],colors=['#00bfff','#5795c1','#8997a9'];
  const rows=d.hourly.filter(r=>r.day==='2025-02-04'&&segments.includes(r.efficiency_segment));
  const hours=[...new Set(rows.map(r=>r.hour))].sort((a,b)=>a-b);
  const slots=hours.map(hour=>{
   const rs=rows.filter(r=>r.hour===hour),total=sum(rs,'attempts');
   return {hour,total,counts:segments.map(segment=>sum(rs.filter(r=>r.efficiency_segment===segment),'attempts'))};
  });
  const series=segments.map((name,i)=>({name,color:colors[i],values:slots.map(s=>s.total?100*s.counts[i]/s.total:0)}));
  $('#adherence').innerHTML='<p><strong>Como ler:</strong> cada coluna representa um horário. As três cores mostram como as tentativas de ligação se distribuíram entre Sweet Spot, Baixa Eficiência e Zona de Desperdício. Uma participação de 40% significa que 40 de cada 100 tentativas daquele horário foram feitas no segmento, não que houve 40% de conversão.</p>'
   +combo(series,null,hours.map(h=>h+':00'),'%')
   +'<h3>Quantidades usadas no gráfico</h3><p>A tabela mostra o número de tentativas em cada segmento e o total do horário. As parcelas da coluna somam 100% quando há tentativas; horário sem tentativas não tem distribuição percentual.</p>'
   +table(['Hora',...segments,'Total de tentativas'],slots.map(s=>[s.hour+':00',...s.counts.map(n=>fmt(n,0)),fmt(s.total,0)]));
 }

 comparison();increment();impact();adherence();
}).catch(e=>{$('#status').textContent='Falha ao carregar a demonstração.';console.error(e);});
