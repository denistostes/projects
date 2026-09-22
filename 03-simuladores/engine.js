'use strict';
/* Motor compartilhado pelo simulador, Goal Seeking e testes locais. */
(function(root){
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function normalize(scope,values){
  const out={...values};
  for(const v of scope.variables){
   if(v.key==='leads_por_hc')continue;
   const raw=Number(out[v.key]);
   const bounded=clamp(Number.isFinite(raw)?raw:v.base,v.min,v.max);
   out[v.key]=v.step===1?Math.round(bounded):bounded;
  }
  out.performance_analista_media=scope.baseline.performance_analista_media;
  out.leads_por_hc=out.volume_leads/out.hcs_ativos;
  return out;
 }
 function predict(scope,values){
  const model=scope.model;let result=model.base_score;
  for(const tree of model.trees){
   let node=0;
   while(tree.left_children[node]>=0){
    const key=model.features[tree.split_indices[node]];
    node=values[key]<tree.split_conditions[node]?tree.left_children[node]:tree.right_children[node];
   }
   result+=tree.split_conditions[node];
  }
  return clamp(result,0,100);
 }
 function metrics(scope,values){const l2o=predict(scope,values);return {l2o,opps:values.volume_leads*l2o/100};}
 function change(scope,values,key,value,linked=true){
  const v=scope.variables.find(item=>item.key===key);
  if(!v?.controllable)return normalize(scope,values);
  const next=normalize(scope,{...values,[key]:value});
  const delta=next[key]-values[key];
  if(linked)for(const [target,slope] of Object.entries(scope.respostas_variaveis[key]||{})){
   next[target]=values[target]+slope*delta;
  }
  return normalize(scope,next);
 }
 function seek(scope,percentage){
  if(!Number.isFinite(percentage)||percentage<100||percentage>150)throw Error('Meta fora da faixa');
  const targetL2o=scope.observed_l2o*percentage/100;
  const history=scope.observations.map(row=>{
   const values=normalize(scope,row.values);
   return {day:row.day,values,...metrics(scope,values)};
  });
  const candidate=history.reduce((best,row)=>Math.abs(row.l2o-targetL2o)<Math.abs(best.l2o-targetL2o)?row:best);
  const low=Math.min(...history.map(row=>row.l2o)),high=Math.max(...history.map(row=>row.l2o));
  return {percentage,targetL2o,targetOpps:scope.observed_opps_day*percentage/100,
   candidate,inRange:targetL2o>=low&&targetL2o<=high,low,high,distance:Math.abs(candidate.l2o-targetL2o)};
 }
 const engine={normalize,predict,metrics,change,seek};
 if(typeof module==='object'&&module.exports)module.exports=engine;else root.ScenarioEngine=engine;
})(globalThis);
