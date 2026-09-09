const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=readFileSync(__dirname+'/index.html','utf8');
function run(values){
  let click;
  const nodes={};
  for(const id of ['balance','income','expenses','bigdate','bigsum']) nodes['cgc-'+id]={value:values[id]??''};
  nodes['cgc-result']={style:{},innerHTML:''};
  nodes['cgc-calc-btn']={addEventListener:(_,fn)=>click=fn};
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{document:{getElementById:id=>nodes[id]},Date,Math,Number,parseFloat});
  click();
  return nodes['cgc-result'].innerHTML;
}
const future='2099-10-10';
// Exact amounts received before the payment: 100 + 200 - 50 - 180 = 70
assert.match(run({balance:'100',income:'200',expenses:'50',bigdate:future,bigsum:'180'}),/останется 70<\/p>/);
// A payment tomorrow must not prorate the confirmed receipts available before it
const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
const date=[tomorrow.getFullYear(),String(tomorrow.getMonth()+1).padStart(2,'0'),String(tomorrow.getDate()).padStart(2,'0')].join('-');
assert.match(run({balance:'100',income:'200',expenses:'50',bigdate:date,bigsum:'180'}),/останется 70<\/p>/);
assert.match(run({balance:'100',income:'0',expenses:'50',bigdate:future,bigsum:'180'}),/не хватает 130<\/p>/);
assert.match(run({balance:'0',income:'180',expenses:'0',bigdate:future,bigsum:'180'}),/останется 0<\/p>/);
assert.match(run({balance:'',income:'0',expenses:'0',bigdate:future,bigsum:'180'}),/Заполните/);
assert.match(run({balance:'-1',income:'0',expenses:'0',bigdate:future,bigsum:'180'}),/неотрицательные/);
assert.match(run({balance:'100',income:'0',expenses:'0',bigdate:'2020-01-01',bigsum:'180'}),/сегодняшнюю/);
assert.match(run({balance:'100',income:'0',expenses:'0',bigdate:future,bigsum:'0'}),/больше нуля/);
assert.doesNotMatch(html,/href="#"|Соберём за 7|income \* fraction/);
console.log('PASS: 8 calculation/validation scenarios and CTA checks');
