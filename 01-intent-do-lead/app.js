'use strict';
const el=s=>document.querySelector(s);
const fmt=(n,d=1)=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:d});
const pct=n=>fmt(n)+'%';
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const table=(heads,rows)=>'<div class="scroll"><table><thead><tr>'+heads.map(x=>'<th scope="col">'+escapeHTML(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+escapeHTML(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const card=(title,content)=>'<section class="card"><h2>'+escapeHTML(title)+'</h2>'+content+'</section>';
const bars=(rows,key,value)=>{
 const max=Math.max(1,...rows.map(r=>r[value]))*1.15,step=640/rows.length,ranked=[...rows].sort((a,b)=>b[value]-a[value]);
 return '<svg viewBox="0 0 720 330" role="img" aria-label="Ranking em colunas de L2C suavizado">'+[0,.25,.5,.75,1].map(t=>'<path d="M50 '+(240-t*195)+'H690" stroke="#33485e"/><text x="40" y="'+(244-t*195)+'" text-anchor="end" fill="#bdd0df" font-size="12">'+fmt(t*max)+'%</text>').join('')+rows.map((r,i)=>'<rect x="'+(50+step*(i+.15))+'" y="'+(240-r[value]/max*195)+'" width="'+step*.7+'" height="'+r[value]/max*195+'" rx="3" fill="'+(r===ranked[0]?'#00bfff':r===ranked[1]?'#5795c1':'#8997a9')+'"/><text x="'+(50+step*(i+.5))+'" y="'+(230-r[value]/max*195)+'" text-anchor="middle" fill="#e2edf5" font-size="12">'+pct(r[value])+'</text><text transform="translate('+(50+step*(i+.5))+',260) rotate(30)" fill="#bdd0df" font-size="11">'+escapeHTML(r[key])+'</text>').join('')+'</svg>';
};
const lineChart=(series,{label='Série',excluded=[]}={})=>{
 if(!series.length)return '<p>Sem dados para esta seleção.</p>';
 const w=820,h=250,p=35,max=Math.max(1,...series.map(x=>x.value));
 const x=i=>p+i*(w-2*p)/Math.max(1,series.length-1),y=v=>h-p-v*(h-2*p)/max;
 return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+escapeHTML(label)+'"><path d="M '+p+' '+p+' V '+(h-p)+' H '+(w-p)+'" fill="none" stroke="#70859f"/><text x="5" y="'+p+'" fill="#b8c7db" font-size="12">'+fmt(max)+'</text><text x="10" y="'+(h-p)+'" fill="#b8c7db" font-size="12">0</text><polyline fill="none" stroke="#00bdf2" stroke-width="2" points="'+series.map((v,i)=>x(i)+','+y(v.value)).join(' ')+'"/>'+series.map((v,i)=>'<g><title>'+escapeHTML(v.label)+': '+fmt(v.value)+(excluded.includes(i)?' · excluído da média':'')+'</title>'+(excluded.includes(i)?'<path d="M '+(x(i)-5)+' '+(y(v.value)-5)+' l 10 10 m -10 0 l 10 -10" stroke="#e1e8ef" stroke-width="3"/>':'<circle cx="'+x(i)+'" cy="'+y(v.value)+'" r="3" fill="#00bdf2"/>')+'</g>').join('')+'<text x="'+p+'" y="'+(h-5)+'" fill="#b8c7db" font-size="12">'+escapeHTML(series[0].label)+'</text><text x="'+(w-p)+'" y="'+(h-5)+'" text-anchor="end" fill="#b8c7db" font-size="12">'+escapeHTML(series.at(-1).label)+'</text></svg>';
};
fetch('./data/demo.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 if(data.synthetic!==true)throw Error('A demonstração aceita somente o contrato fictício.');
 el('#status').textContent='';
 render(data.payload);
}).catch(error=>{el('#app').innerHTML='<p class="error">Não foi possível carregar a demonstração. Execute python -m http.server 8000 na pasta deste projeto.</p>';console.error(error)});

function render(d){
 el('#app').innerHTML=card('Sweet Spot · rendimento e saturação','<p>Uma mesma coorte fictícia é acompanhada até o primeiro contato, com teto de 16 tentativas. As barras mostram eficiência relativa; a linha mostra contatos acumulados na coorte.</p><div id="attemptChart"></div><p id="protectionNote" class="method-note"></p><section class="expanded-content"><h3>Cálculo por tentativa</h3><div id="attemptTable"></div></section>')
 + '<div class="rank-report">'+card('Melhores janelas','<p>A visão responde quando priorizar as ligações: cruza dia da semana e hora e compara os períodos do dia. O mapa e os rankings mostram L2C Score; a taxa observada permanece disponível nas tabelas.</p><div id="windows"></div>')+card('Melhores cadências','<p>A visão identifica o intervalo operacional com melhor resultado histórico em cada Planning Cluster, isto é, cada agrupamento de leads. Não existe uma cadência universal: a primeira e a segunda colocadas são calculadas separadamente para cada grupo.</p><div id="cadences"></div>')+'</div>';
 const update=()=>{
  const protectedView=true;
  const colors={'Sweet Spot':'#00bfff','Baixa Eficiência':'#5795c1','Zona de Desperdício':'#8997a9'};
  const x=i=>60+i*44;
  el('#attemptChart').innerHTML='<svg viewBox="0 0 800 320" role="img" aria-label="Eficiência relativa e contatos acumulados por tentativa">'+[0,25,50,75,100].map(v=>'<line x1="42" y1="'+(268-v*2.1)+'" x2="780" y2="'+(268-v*2.1)+'" stroke="#2b3d54"/><text x="32" y="'+(272-v*2.1)+'" text-anchor="end" fill="#a9b9cf" font-size="11">'+v+'%</text>').join('')+d.attempts.map((r,i)=>'<rect x="'+x(i)+'" y="'+(268-r.relative*2.1)+'" width="27" height="'+r.relative*2.1+'" rx="4" fill="'+colors[protectedView?r.protected_stage:r.stage]+'"><title>Tentativa '+r.attempt+' · '+pct(r.relative)+' · '+(protectedView?r.protected_stage:r.stage)+'</title></rect><text x="'+(x(i)+13)+'" y="290" text-anchor="middle" fill="#a9b9cf" font-size="12">'+r.attempt+'</text>').join('')+'<polyline fill="none" stroke="#f2f6fa" stroke-width="3" points="'+d.attempts.map((r,i)=>(x(i)+13)+','+(268-r.cumulative*2.1)).join(' ')+'"/></svg><div class="controls"><span style="color:#00bfff">● Sweet Spot</span><span style="color:#5795c1">● Baixa Eficiência</span><span style="color:#8997a9">● Zona de Desperdício</span><span style="color:#f2f6fa">━ L2C acumulado</span></div>';
  el('#protectionNote').textContent=protectedView?(d.protection_applied?'Neste exemplo, a faixa final curta foi ajustada para tentativas 14–16, preservando o Sweet Spot.':'As faixas já satisfazem o mínimo demonstrativo; nenhuma alteração foi necessária.'):'Exibindo as faixas brutas, sem proteção.';
  el('#attemptTable').innerHTML=table(['Tentativa','Expostos','Conectados','Taxa','Eficiência relativa','Ganho (p.p.)','Acumulado','Faixa'],d.attempts.map(r=>[r.attempt,r.exposed,r.connected,pct(r.rate),pct(r.relative),fmt(r.gain,2),pct(r.cumulative),protectedView?r.protected_stage:r.stage]));
  const mode='adjusted';
  renderWindows(d.windows);renderCadences(d.cadences);

 };
 update();
}

function scoreTable(rows){
 return table(['Faixa','Tentativas','Conectadas','L2C observado','L2C Score'],rows.map(r=>[r.label,r.n,r.success,pct(r.raw),pct(r.adjusted)]));
}
function renderWindows(w){
 const days=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],rows=w.cells.rows;
 const lo=Math.min(...rows.map(r=>r.adjusted)),hi=Math.max(...rows.map(r=>r.adjusted));
 const heat='<div class="scroll"><table class="window-map"><thead><tr><th>Dia / hora</th>'+Array.from({length:12},(_,i)=>'<th>'+(9+i)+'h</th>').join('')+'</tr></thead><tbody>'+days.map((day,i)=>'<tr><th>'+day+'</th>'+Array.from({length:12},(_,j)=>{const r=rows.find(r=>r.day===i&&r.hour===j+9);if(!r)return '<td>Fora da grade</td>';const t=(r.adjusted-lo)/Math.max(hi-lo,.001);return '<td style="background:rgb('+Math.round(35+40*t)+','+Math.round(66+98*t)+','+Math.round(95+120*t)+');color:white">'+pct(r.adjusted)+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div>';
 const periods=[...w.periods.rows].sort((a,b)=>a.rank-b.rank),week=[...w.days.rows].sort((a,b)=>a.rank-b.rank);
 el('#windows').innerHTML='<h3>Mapa de oportunidade por dia e hora</h3><p>Cada célula contém o Score daquele dia da semana e horário. Azul mais claro indica maior Score. A grade considera segunda a sexta de 09h a 21h e sábado de 10h a 16h; domingo fica fora. Os intervalos terminam antes da hora final: por exemplo, 20h representa 20h–21h.</p>'+heat
 +'<h3>Primeira e segunda opções do recorte</h3><p>Períodos: <strong>'+periods[0].label+'</strong> e <strong>'+periods[1].label+'</strong>. Dias: <strong>'+week[0].label+'</strong> e <strong>'+week[1].label+'</strong>. Os rankings de dia e período são calculados separadamente; não basta combinar seus vencedores para deduzir a melhor célula do mapa.</p>'
 +'<h3>Performance por período do dia</h3><p>Manhã: 09h–11h; Almoço: 11h–15h; Tarde: 15h–18h; Noite: 18h–21h. No sábado, só entram as horas pertencentes à grade operacional.</p>'+bars(periods,'label','adjusted')+scoreTable(periods)
 +'<h3>Performance por dia da semana</h3>'+bars(week,'label','adjusted')+scoreTable(week)
 +'<h3>O que L2C e L2C Score significam aqui?</h3><p><strong>L2C observado</strong> é a quantidade de tentativas conectadas dividida pela quantidade de tentativas. Neste diagnóstico, o denominador é tentativas, não leads únicos. <strong>L2C Score</strong> é o indicador usado para ordenar as opções: aplica o ajuste de amostra previsto no método. Ele não substitui a taxa efetivamente observada.</p><p>Assim, uma faixa não vira a primeira opção apenas por ter uma taxa alta obtida com poucas ligações. O cálculo é refeito na granularidade de cada visão: dia e hora no mapa, períodos no ranking de períodos, dias no ranking semanal. A fórmula e seus componentes estão detalhados na metodologia deste relatório.</p>';
}
function renderCadences(c){
 const groups=c.ranges.map(label=>({label,first:c.clusters.filter(p=>p.rows.some(r=>r.label===label&&r.rank===1)),second:c.clusters.filter(p=>p.rows.some(r=>r.label===label&&r.rank===2))}));
 const max=Math.max(1,...groups.flatMap(g=>[g.first.length,g.second.length])),step=120;
 const marks=groups.map((g,i)=>{const x=60+i*step;return '<rect x="'+x+'" y="'+(220-g.first.length/max*160)+'" width="34" height="'+g.first.length/max*160+'" fill="#00bfff"/><rect x="'+(x+38)+'" y="'+(220-g.second.length/max*160)+'" width="34" height="'+g.second.length/max*160+'" fill="#8997a9"/><text x="'+(x+17)+'" y="'+(210-g.first.length/max*160)+'" text-anchor="middle" fill="#e9f2f8">'+g.first.length+'</text><text x="'+(x+55)+'" y="'+(210-g.second.length/max*160)+'" text-anchor="middle" fill="#e9f2f8">'+g.second.length+'</text><text x="'+(x+36)+'" y="249" text-anchor="middle" fill="#c4d4e3">'+g.label+'</text>';}).join('');
 const chart='<svg viewBox="0 0 800 280" role="img" aria-label="Quantidade de Planning Clusters por primeira e segunda melhor cadência"><path d="M45 40V220H790" stroke="#8997a9" fill="none"/>'+marks+'</svg><p>■ Azul: primeira melhor cadência · ■ Cinza: segunda melhor cadência. Valores em quantidade de Planning Clusters.</p>';
 const ranked=c.clusters.map(p=>{const a=[...p.rows].sort((x,y)=>x.rank-y.rank);return [p.name,a[0].label,pct(a[0].adjusted),pct(a[0].raw),a[1].label,pct(a[1].adjusted),pct(a[1].raw)];});
 const example=c.clusters[0],best=[...example.rows].sort((a,b)=>a.rank-b.rank);
 el('#cadences').innerHTML='<h3>O relógio considera apenas horas operacionais</h3><p>O intervalo é medido entre ligações consecutivas do <strong>mesmo lead, no mesmo Planning Cluster e na mesma campanha</strong>. Horas fora da grade não contam. A primeira ligação da sequência não possui intervalo anterior e fica fora do ranking; trocar de campanha inicia outra sequência.</p><p><strong>Exemplo:</strong> uma ligação na segunda às 20h e outra na terça às 10h estão separadas por 14 horas corridas, mas por apenas 2 horas operacionais: 20h–21h na segunda e 09h–10h na terça. Portanto, entram na faixa de 1–3h, e não na de 12–24h.</p>'
 +'<h3>Primeira e segunda melhor cadência por Planning Cluster</h3><p>As seis faixas são 0–1h, 1–3h, 3–6h, 6–12h, 12–24h e 24h ou mais, sempre em horas operacionais. A borda inferior está incluída e a superior não: exatamente 3h pertence a 3–6h. Dentro de cada Planning Cluster, as faixas são ordenadas por L2C Score.</p>'+chart
 +table(['Planning Cluster','1ª cadência','Score da 1ª','L2C da 1ª','2ª cadência','Score da 2ª','L2C da 2ª'],ranked)
 +'<p><strong>Leitura do exemplo:</strong> para '+example.name+', a primeira opção é '+best[0].label+' (Score '+pct(best[0].adjusted)+') e a segunda é '+best[1].label+' (Score '+pct(best[1].adjusted)+'). O gráfico conta quantos grupos escolheram cada faixa em primeiro ou segundo lugar; ele não mostra uma taxa de conversão.</p>'
 +'<h3>L2C Score consolidado por faixa</h3><p>Este segundo gráfico responde outra pergunta: como cada faixa se comporta no conjunto dos Planning Clusters? O Score consolidado é a média dos Scores dos grupos, ponderada pelas tentativas de cada um naquela faixa. Não é uma nova aplicação da fórmula sobre o total agregado. As faixas permanecem na ordem de duração, como na visão original.</p>'+bars(c.consolidated,'label','adjusted')+scoreTable(c.consolidated)
 +'<p>Esses resultados orientam a priorização de intervalos com melhor histórico. Não demonstram que esperar exatamente esse tempo cause mais contatos. Mudanças de política precisam ser avaliadas considerando composição da carteira e resultado ao longo da jornada.</p>';
}
