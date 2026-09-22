(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Sanctuary=api;})(typeof globalThis==='undefined'?this:globalThis,function(){
'use strict';
const relics=['map','lens','key','seal'];
const names={map:'낡은 지도 조각',lens:'문양 렌즈',key:'성소 열쇠',seal:'은빛 인장'};
const colors=['청록','호박','자수정','은빛'];
function hash(s){let h=2166136261;for(const c of s){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function attach(s,account){if(!account?.username)return null;if(account.role==='teacher'&&account.username==='변석환5'&&s.sanctuary?.teacherResetVersion!==20260922){delete s.sanctuary;}if(s.sanctuary?.owner!==account.username||s.sanctuary.version!==2){const seed=hash(account.username),index=Number.isInteger(account.assignmentIndex)?account.assignmentIndex:seed%100000;s.sanctuary={version:2,owner:account.username,seed,region:'forest'+(2+index%7),lens:colors[Math.floor(index/7)%4]+' · '+String(index+1).padStart(4,'0'),relics:{},attempt:0,lastAttemptDay:0,finalPassed:false,opened:false,history:[]};}if(account.role==='teacher'&&account.username==='변석환5')s.sanctuary.teacherResetVersion=20260922;s.sanctuary.setIndex=assignSet(account);s.sanctuary.problemVersion=6;place(s);return s.sanctuary;}
function place(s){const p=s.sanctuary;if(!p||p.placedDay===s.day)return;const m=s.maps?.[p.region];if(!m)return;const candidates=m.floor.map(k=>{const [x,y]=k.split(',').map(Number);return {x,y};}).filter(v=>v.x>1&&v.x<13&&v.y>1&&v.y<8&&!m.decor.some(d=>d[0]===v.x&&d[1]===v.y)&&![{x:3,y:7},{x:4,y:3},{x:10,y:6},{x:13,y:2}].some(a=>a.x===v.x&&a.y===v.y));candidates.sort((a,b)=>(Math.abs(a.x-7)+Math.abs(a.y-5))-(Math.abs(b.x-7)+Math.abs(b.y-5))||a.y-b.y||a.x-b.x);p.portal=p.portal||candidates[0];if(!p.portal)return;const q=p.portal;m.decor=m.decor.filter(d=>!(Math.abs(d[0]-q.x)+Math.abs(d[1]-q.y)<=1));for(const n of s.nodes||[])if(n.region===p.region&&Math.abs(n.x-q.x)+Math.abs(n.y-q.y)<=1)n.used=true;p.placedDay=s.day;}
function allRelics(p){return !!p&&relics.every(k=>p.relics[k]===true);}
function value(input){const s=String(input??'').trim().replace(/\s/g,'');if(!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d+)?|\.\d+))?$/.test(s))return null;const v=s.split('/').map(Number);const n=v.length===2?v[0]/v[1]:v[0];return Number.isFinite(n)?n:null;}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;}
function frac(a,b=1){const g=gcd(a,b);return b/g===1?String(a/g):(a/g)+'/'+(b/g);}
function assignSet(account){
 const seat=Number(String(account.studentId||'').slice(-2));
 const cl=Number(account.classNumber||0);
 if(account.role==='student'&&account.studentId){if(!Number.isInteger(seat)||seat<1||seat>40)throw new Error('성소 세트 배정 범위는 반별 1~40번입니다.');return ((seat-1)*17+cl*7)%40;}
 return ((Number.isInteger(account.assignmentIndex)?account.assignmentIndex:hash(account.username||'teacher'))%40+40)%40;
}
function question(p){
 const assigned=Number.isInteger(p.setIndex)?p.setIndex:Math.abs(p.seed||0)%40,set=(assigned+(p.resetUsed?1:0))%40,t=set%8,i=Math.floor(set/8),attempt=p.attempt||0;
 const [b,c]=[[1,1],[1,2],[2,1],[1,3],[3,1]][i],a=b+c;
 const scale=(attempt%2)+1,unit=p.resetUsed?4:5,v=(t===7?(p.resetUsed?6:2):t===1?a*unit:unit)*scale;
 const common='HCl, NaOH, KOH 수용액의 농도는 각각 일정하다. ',headers=['실험','HCl(mL)','NaOH(mL)','KOH(mL)','관찰 결과'];
 const ref=['기준',v,v,v,'중성 · Na⁺와 K⁺의 수의 비 = '+b+' : '+c];
 let title,intro,rows,prompt,num,den=1,visual=null,solution,conditions='';
 if(t===0){
 title='양이온 문양의 정체';intro=common+'○, △, □는 Na⁺, K⁺, H⁺를 순서 없이 나타낸다. 같은 기호는 같은 이온이며, 기호 옆의 값은 해당 이온의 수이다. (가)는 중성이다.';
 rows=[['(가)',v,v,v,'○ '+b+'N, △ '+c+'N'],['(나)',3*v,2*v,v,'○ '+2*b+'N, △ '+c+'N, □ '+(b+2*c)+'N'],['(다)',3*v,v,2*v,'□ xN']];
 prompt='(다)에 남아 있는 □의 수가 xN일 때 x를 구하시오.';num=2*b+c;
 visual={kind:'particles',groups:[['(가)','○ '+b+'N　△ '+c+'N'],['(나)','○ '+2*b+'N　△ '+c+'N　□ '+(b+2*c)+'N']]};
 solution='가에서 H⁺ 기호가 없고, 나에서 NaOH만 2배여서 ○는 Na⁺, △는 K⁺, □는 H⁺이다. 기준 부피당 H⁺='+a+'N, Na⁺='+b+'N, K⁺='+c+'N. 다의 남은 H⁺=3×'+a+'−'+b+'−2×'+c+'.';
 }else if(t===1){
 title='원그래프에 남은 염기';intro=common+'(가)의 전체 이온 수에 대한 각 이온의 비율이 그림과 같다. (가)와 (나)에는 세 수용액을 각각 표의 부피만큼 넣었다.';
 rows=[['(가)',v,2*v,2*v,'이온 수의 비율: 그림 참고'],['(나)',v,v,3*v,'미확인']];
 visual={kind:'pie',parts:[['Na⁺',b,2*a],['K⁺',c,2*a],['Cl⁻',1,4],['OH⁻',1,4]]};
 prompt='(나)에 같은 HCl 수용액을 더 넣어 중성으로 만들려고 한다. 추가로 필요한 수용액의 부피(mL)를 구하시오.';num=2*c*v;den=a;
 solution='(가)의 Cl⁻는 처음 넣은 HCl의 양, Na⁺와 K⁺는 넣은 염기의 양이다. 수용액 농도비 HCl:NaOH:KOH='+a+':'+b+':'+c+'. (나)의 남은 OH⁻=2×'+c+'에 비례하므로 추가 HCl은 '+frac(num,den)+'mL.';
 }else if(t===2){
 title='온도계가 가리킬 값';intro=common+'표의 기준 실험에서 혼합 용액은 중성이다. (가)와 (나)는 혼합 전 모든 용액의 온도가 20℃이고, 혼합한 전체 부피가 같다. (가)의 최고 온도는 26℃이다.';
 rows=[ref,['(가)',2*v,2*v,2*v,'최고 온도 26℃'],['(나)',3*v,v,2*v,'최고 온도 T℃']];
 prompt='(나)의 온도 상승량 (T − 20)을 구하시오. (단위: ℃)';num=3*(b+2*c);den=a;
 conditions='온도 비교에서는 외부로의 열손실과 용기의 열용량은 무시한다. 두 혼합 용액의 밀도와 비열은 같고, 용액을 섞을 때 발생하는 희석열은 무시하며 생성된 물 분자 1개당 방출 열량은 같다.';
 solution='기준에서 농도비는 '+a+':'+b+':'+c+'. 가에서 생긴 물은 '+2*a+', 나에서는 염기가 부족해 '+(b+2*c)+'에 비례한다. 같은 총부피이므로 상승량=6×'+(b+2*c)+'/'+2*a+'='+frac(num,den)+'℃.';
 }else if(t===3){
 title='두 혼합 용액을 다시 섞으면';intro=common+'기준 실험 후 (가)와 (나)를 따로 만들었다. 그 다음 (가)와 (나)를 전량 혼합한다. 각 용액을 처음 만들 때 생긴 물은 새로 생성된 물에 포함하지 않는다.';
 rows=[ref,['(가)',3*v,v,v,'미확인'],['(나)',v,2*v,3*v,'미확인']];
 prompt='(가)와 (나)를 합칠 때 새로 생성되는 물 분자 수는 기준 실험에서 생성된 물 분자 수의 x배이다. x를 구하시오.';num=b+2*c;den=a;
 solution='(가)는 H⁺가 '+2*a+', 나는 OH⁻가 '+(b+2*c)+'에 비례해 남는다. 두 용액을 합치면 적게 남은 OH⁻만큼 물이 추가 생성된다. 기준 물 '+a+'와 비교하면 '+frac(num,den)+'배.';
 }else if(t===4){
 title='사라진 OH⁻의 그래프';intro=common+'NaOH 수용액 '+v+' mL와 KOH 수용액 '+v+' mL를 혼합한 후 HCl 수용액을 조금씩 넣었다. Na⁺와 K⁺의 수의 비는 '+b+' : '+c+'이다. 그림은 첨가한 HCl 수용액의 부피에 따른 혼합 용액 전체의 OH⁻ 수를 나타낸 것이다. HCl 수용액을 넣기 전 OH⁻ 수는 3N이다.';
 rows=[['(가)',v,v,v,'OH⁻ 2N'],['(나)',2*v,v,v,'OH⁻ N'],['(다)',3*v,v,v,'OH⁻ 0'],['(라)',4*v,v,v,'OH⁻ 0']];
 visual={kind:'line',points:[[v,2],[2*v,1],[3*v,0],[4*v,0]],x:'넣은 HCl 수용액의 부피(mL)',y:'남은 OH⁻ 수 / N'};
 prompt='(라)에 같은 NaOH 수용액을 더 넣어 중성으로 만들려고 한다. 추가로 필요한 수용액의 부피(mL)를 구하시오.';num=a*v;den=3*b;
 solution='기울기로 HCl '+v+'mL가 H⁺ N을 제공하고 중화점은 '+3*v+'mL이다. 라에는 H⁺ N이 남는다. 원래 NaOH '+v+'mL의 OH⁻는 3N×'+b+'/'+a+'이므로 필요한 NaOH는 '+frac(num,den)+'mL.';
 }else if(t===5){
 title='전체 이온과 이온 농도';intro=common+'기준 실험의 혼합 용액 1 mL에 존재하는 전체 이온 수는 N이고, (가)의 혼합 용액 1 mL에 존재하는 전체 이온 수는 xN이다.';
 rows=[ref,['(가)',v,3*v,v,'1 mL당 전체 이온 수 xN']];
 prompt='x를 구하시오.';num=3*(3*b+c);den=5*a;
 solution='기준 총이온은 2×'+a+', 부피는 '+3*v+' mL. (가)는 염기성이어서 총이온은 2×'+(3*b+c)+', 부피는 '+5*v+' mL. 단위 부피당 전체 이온 수의 비=(2×'+(3*b+c)+'/5)/(2×'+a+'/3)='+frac(num,den)+'.';
 }else if(t===6){
 title='양이온 기록에서 생성된 물까지';intro=common+'표는 혼합 용액에 존재하는 전체 양이온 수를 나타낸 것이다. (가)는 산성이고, (나)와 (다)는 염기성이다.';
 rows=[['(가)',4*v,v,v,'산성 · 양이온 '+4*a+'N'],['(나)',v,2*v,3*v,'염기성 · 양이온 '+(2*b+3*c)+'N'],['(다)',v,3*v,2*v,'염기성 · 양이온 '+(3*b+2*c)+'N'],['(라)',2*v,3*v,v,'미확인']];
 prompt='(라)에서 중화 반응으로 생성된 물 분자 수가 xN일 때 x를 구하시오.';num=Math.min(2*a,3*b+c);
 solution='산성인 (가)의 양이온 총수는 처음 넣은 H⁺의 수이므로 기준 부피 HCl은 '+a+'N이다. 나·다의 양이온 총수는 Na⁺+K⁺이므로 연립하면 기준 NaOH='+b+'N, KOH='+c+'N. 라에서는 H⁺ '+2*a+'N과 OH⁻ '+(3*b+c)+'N 중 작은 수만큼 물이 생긴다.';
 }else{
 const h=(i+1)*v,n=(i+2)*v,k=(i+3)*v;
 title='네 조각의 원그래프';intro=common+'(가)의 용액에 존재하는 모든 이온은 네 종류이며, 종류를 표시하지 않은 원그래프의 네 영역은 모두 1/4이다. (나)는 중성이다.';
 rows=[['(가)',h,n,k,'각 이온 수의 비 1 : 1 : 1 : 1'],['(나)',2*h,n/2,'x','중성']];
 visual={kind:'pie',parts:[['기호 미표시',1,4],['기호 미표시',1,4],['기호 미표시',1,4],['기호 미표시',1,4]]};
 prompt='(나)에 넣어야 하는 KOH 수용액의 부피가 x mL일 때, x를 구하시오.';num=3*k;den=2;
 solution='산성이라면 H⁺+Na⁺+K⁺=Cl⁻이어서 네 종류의 수가 같을 수 없다. 따라서 (가)는 염기성이며 Na⁺=K⁺=Cl⁻=OH⁻. (나)의 H⁺는 (가)의 2배, NaOH의 OH⁻는 1/2배이므로 KOH의 OH⁻는 3/2배가 필요하다. x='+frac(num,den)+'mL.';
 }
 return {id:'sanctuary-v6-'+String(set+1).padStart(2,'0')+'-'+attempt+(p.resetUsed?'-reset':''),setNumber:set+1,version:6,type:'exam-'+t,title,intro,headers,rows,prompt,answer:num/den,exact:frac(num,den),visual,conditions,solution};
}

function quest(p,key){
 const k=1+p.seed%3,v=((p.questVariants?.[key]??((p.seed>>>3)%4))%4+4)%4;
 const banks={
 map:[
 ['약병의 균형','HCl 수용액 2 mL와 NaOH 수용액 3 mL를 혼합하였더니 중성이 되었다.',`같은 HCl 수용액 ${4*k} mL에 같은 NaOH 수용액 ${3*k} mL를 넣었다. 이 혼합 용액을 중성으로 만드는 데 추가로 필요한 NaOH 수용액의 부피(mL)를 구하시오.`,3*k],
 ['두 염기의 주문','HCl 수용액 2 mL를 중화하는 데 NaOH 수용액은 2 mL, KOH 수용액은 4 mL가 각각 필요하다.',`HCl 수용액 ${6*k} mL와 NaOH 수용액 ${2*k} mL를 혼합하였다. 이 혼합 용액을 중성으로 만드는 데 추가로 필요한 KOH 수용액의 부피(mL)를 구하시오.`,8*k],
 ['중화점을 지난 용액','HCl 수용액과 NaOH 수용액을 같은 부피로 혼합하면 중성이 된다.',`HCl 수용액 ${3*k} mL와 NaOH 수용액 ${5*k} mL를 혼합하였다. 이 혼합 용액을 중성으로 만드는 데 추가로 필요한 HCl 수용액의 부피(mL)를 구하시오.`,2*k],
 ['작은 시료의 기록','HCl 수용액 3 mL와 KOH 수용액 2 mL를 혼합하였더니 중성이 되었다.',`같은 HCl 수용액 ${9*k} mL를 중화하는 데 필요한 KOH 수용액의 부피(mL)를 구하시오.`,6*k]],
 lens:[
 ['혼합 후 양이온 수','HCl 수용액에 들어 있는 H⁺와 Cl⁻의 수는 각각 4N이고, NaOH 수용액에 들어 있는 Na⁺와 OH⁻의 수는 각각 2N이다. 두 수용액을 모두 혼합하였다.','혼합 용액에 존재하는 전체 양이온 수가 xN일 때, x를 구하시오.',4],
 ['반응에 참여하지 않는 이온','HCl 수용액에 들어 있는 H⁺와 Cl⁻의 수는 각각 3N이고, KOH 수용액에 들어 있는 K⁺와 OH⁻의 수는 각각 5N이다. 두 수용액을 모두 혼합하였다.','혼합 용액에 존재하는 Cl⁻와 K⁺의 수의 합이 xN일 때, x를 구하시오.',8],
 ['남아 있는 OH⁻','HCl, NaOH, KOH 수용액을 모두 혼합하였다. 혼합 전 HCl 수용액의 H⁺ 수는 2N이고, NaOH와 KOH 수용액의 OH⁻ 수는 각각 3N, 2N이다.','혼합 용액에 존재하는 OH⁻의 수가 xN일 때, x를 구하시오.',3],
 ['생성된 물 분자 수','HCl, NaOH, KOH 수용액을 모두 혼합하였다. 혼합 전 HCl 수용액의 H⁺ 수는 5N이고, NaOH와 KOH 수용액의 OH⁻ 수는 각각 2N, 2N이다.','중화 반응으로 생성된 물 분자 수가 xN일 때, x를 구하시오.',4]],
 key:[
 ['구리의 산화','구리 원자 N이 모두 Cu²⁺로 산화되었다.','이때 이동한 전자 수가 xN일 때, x를 구하시오.',2],
 ['은 이온의 환원','Ag⁺ 3N이 모두 Ag로 환원되었다.','이때 이동한 전자 수가 xN일 때, x를 구하시오.',3],
 ['금의 환원','용액 속 금의 산화수는 +3이다. 금 원자 수가 2N인 양의 금 화합물이 모두 금속 Au로 환원되었다.','이때 이동한 전자 수가 xN일 때, x를 구하시오.',6],
 ['철의 산화','철 원자 2N이 모두 Fe³⁺로 산화되었다.','이때 이동한 전자 수가 xN일 때, x를 구하시오.',6]],
 seal:[
 ['은의 회수',`Ag⁺의 수가 ${6*k}N인 질산은 수용액에 Cu를 넣어 Ag⁺를 모두 Ag로 환원시킨다. Cu는 Cu²⁺로 산화된다.`,`반응에 필요한 Cu 원자 수의 최솟값이 xN일 때, x를 구하시오.`,3*k],
 ['반응 후 남은 철',`Fe 원자 ${4*k}N을 Ag⁺의 수가 ${6*k}N인 질산은 수용액에 넣었다. Fe는 Fe³⁺로 산화되고 Ag⁺는 모두 Ag로 환원되었다.`,`반응 후 남아 있는 Fe 원자 수가 xN일 때, x를 구하시오.`,2*k],
 ['금의 회수',`금의 산화수가 +3인 용액에 Cu를 넣어 금을 모두 회수한다. 석출된 Au 원자 수는 ${2*k}N이며, Cu는 Cu²⁺로 산화된다.`,`반응한 Cu 원자 수가 xN일 때, x를 구하시오.`,3*k],
 ['은빛 인장의 재료',`Fe 원자 ${2*k}N을 Ag⁺가 충분히 들어 있는 질산은 수용액에 넣어 모두 반응시켰다. Fe는 Fe³⁺로 산화되고 Ag⁺는 Ag로 환원된다.`,`석출된 Ag 원자 수가 xN일 때, x를 구하시오.`,6*k]]};
 if(!banks[key])return null;const row=banks[key][v];
 const conditions=['map','lens'].includes(key)?'각 수용액의 농도는 실험 중 일정하다. 물의 자동 이온화는 무시하며, H⁺와 OH⁻는 1 : 1로 반응한다.':'Fe는 Fe³⁺로, Cu는 Cu²⁺로 산화되는 학습 모형이다. 제시된 반응 이외의 반응은 일어나지 않는다.';
 const dialogue={
  map:{greeting:'숲에서 가져온 용액을 살펴봐 주실래요? 도와주시면 낡은 지도 조각을 드릴게요.',thanks:'덕분에 한시름 놓았어요. 약초를 찾다가 주운 지도예요. 당신의 길잡이가 되면 좋겠네요.',retry:'아직 용액의 균형이 맞지 않는 것 같아요. 기록을 한 번 더 살펴봐 주실래요?'},
  lens:{greeting:'렌즈를 다듬다가 흥미로운 기록을 찾았다네. 이온의 수를 알아내면 문양 렌즈를 주겠네.',thanks:'그래, 잘 짚었구나. 내가 다듬은 문양 렌즈라네. 숨어 있던 길이 보일지도 모르지.',retry:'흠, 기록과 맞지 않는구나. 반응 뒤에 남는 이온부터 차근차근 세어 보게.'},
  key:{greeting:'재련 기록을 확인해 주게. 전자가 어떻게 오갔는지 알아내면 이 성소 열쇠를 주겠네.',thanks:'좋군. 꼼꼼하게 확인했어. 약속한 성소 열쇠일세. 단단히 벼렸으니 믿고 쓰게.',retry:'잠깐, 기록과 맞지 않네. 전자를 잃고 얻은 양을 다시 확인해 주게.'},
  seal:{greeting:'금속이 얼마나 나오는지 함께 살펴봐 주세요. 해결해 주시면 제가 만든 은빛 인장을 드릴게요.',thanks:'정확하게 맞춰 주셨네요! 약속한 은빛 인장이에요. 당신의 여정에도 반짝이는 일이 가득하길요.',retry:'이런, 필요한 양과 조금 달라요. 반응하는 금속의 양을 다시 살펴봐 주세요.'}
 };
 return {id:key+'-'+v,guest:{map:'약초사 엘로웬',lens:'유리 장인 이실',key:'대장장이 토린',seal:'장신구 장인 에이라'}[key],...dialogue[key],reward:{map:45,lens:40,key:50,seal:55}[key],title:row[0],intro:row[1],prompt:row[2],answer:row[3],conditions:conditions+(key!=='map'?' N은 입자 수를 나타내는 기준값이다.':'')};
}
function visitChance(day){return day<6?0:Math.min(1,(60+(day-6)*10)/100);}
function scheduleVisit(s,rng=Math.random){
 const p=s.sanctuary;if(!p||s.phase!=='shop'||s.questPreview||p.visitDay===s.day)return;
 p.visitDay=s.day;const keys=relics.filter(k=>!p.relics[k]);
 if(!keys.length||visitChance(s.day)===0||rng()>=visitChance(s.day))return;
 const slots=s.orders.filter(o=>!o.served&&!o.skipped);if(!slots.length)return;
 const key=keys[Math.floor(rng()*keys.length)],o=slots[Math.floor(rng()*slots.length)];
 p.questVariants??={};p.questVariants[key]=Math.floor(rng()*4);const q=quest(p,key);
 Object.assign(o,{type:'special',relicKey:key,name:q.guest,quote:q.greeting,title:q.title,needs:{},reward:q.reward,portraitId:{map:0,lens:6,key:10,seal:12}[key]});
}
function canQuest(s,key){return !!s.questPreview||(s.phase==='shop'&&s.orders?.find(o=>!o.served&&!o.skipped)?.relicKey===key);}
function submitQuest(s,key,input){
 const p=s.sanctuary;if(!p||s.phase!=='shop'||!relics.includes(key)||!canQuest(s,key))return {ok:false,message:'방문 중인 손님의 의뢰만 제출할 수 있습니다.'};if(p.relics[key])return {ok:false,message:'이미 보상을 받았습니다.'};
 const q=quest(p,key),numeric=typeof q.answer==='number',answer=numeric?value(input):input;
 if(numeric?answer===null:!String(answer||'').trim())return {ok:false,message:numeric?'숫자 또는 분수로 답을 입력해 주세요.':'답을 선택해 주세요.'};
 const correct=numeric?Math.abs(answer-q.answer)<1e-8:answer===q.answer,guest=s.orders?.find(o=>!o.served&&!o.skipped&&o.relicKey===key);
 if(guest){if(correct)guest.served=true;else{guest.skipped=true;guest.rejected=true;}if(s.orders.every(o=>o.served||o.skipped))s.phase='end';}
 if(!correct){s.mistakes=(s.mistakes||0)+1;const line={map:'기대했던 결과와 다르네요. 지도는 다음 기회에 드릴게요. 오늘은 돌아가겠어요.',lens:'흠, 기록과 맞지 않는구나. 렌즈는 아직 맡길 수 없겠어. 다음에 다시 보세.',key:'이 결과로는 맡길 수 없네. 열쇠는 다음 기회로 하지. 이만 가겠네.',seal:'부탁드린 결과와 달라요. 인장은 다음에 드릴게요. 오늘은 이만 갈게요.'}[key];return {ok:false,attempted:true,rejected:true,departingGuest:guest?{...guest,angryQuote:line,departureQuote:null}:null,message:line};}
 p.relics[key]=true;s.coins+=q.reward;return {ok:true,attempted:true,message:q.reward+'C와 '+names[key]+(['lens','key'].includes(key)?'를':'을')+' 받았습니다.'};
}
function enter(s,lens){const p=s.sanctuary;if(!allRelics(p))return {ok:false,message:'지도 조각·문양 렌즈·성소 열쇠·은빛 인장이 모두 필요합니다.'};if(s.phase!=='morning'||s.region!==p.region||!p.portal||Math.abs(s.player.x-p.portal.x)+Math.abs(s.player.y-p.portal.y)>1)return {ok:false,message:'지도가 가리키는 성소 앞에서 렌즈를 사용하세요.'};if(lens!==p.lens)return {ok:false,message:'문의 문양과 렌즈가 일치하지 않습니다.'};p.opened=true;return {ok:true};}
function submit(s,input){const p=s.sanctuary;if(!p||!p.opened||!allRelics(p))return {ok:false,message:'먼저 성소를 개방하세요.'};if(s.phase!=='morning'||s.region!==p.region||Math.abs(s.player.x-p.portal.x)+Math.abs(s.player.y-p.portal.y)>1)return {ok:false,message:'성소 앞에서 도전하세요.'};if(p.finalPassed)return {ok:false,message:'이미 최종 시련을 통과했습니다.'};if(p.lastAttemptDay>=s.day)return {ok:false,locked:true,message:'오늘의 도전은 끝났습니다. 다음 날 다시 오세요.'};const n=value(input);if(n===null)return {ok:false,message:'숫자 또는 분수로 입력해 주세요. 예: 0.5, 1/2'};const q=question(p);p.lastAttemptDay=s.day;const correct=Math.abs(n-q.answer)<=1e-8*Math.max(1,Math.abs(q.answer));p.history.push({day:s.day,questionId:q.id,passed:correct});if(correct){p.finalPassed=true;return {ok:true,cleared:true,message:'성소의 문양이 빛납니다. 최종 시련을 통과했습니다.'};}p.attempt++;return {ok:false,locked:true,message:'문양이 빛을 잃었습니다. 오늘은 다시 도전할 수 없습니다. 다음 날 새로운 문제가 기다립니다.'};}

function resetQuestion(s){
 const p=s.sanctuary;
 if(!p||!p.opened||!allRelics(p)||s.phase!=='morning'||s.region!==p.region||!p.portal||Math.abs(s.player.x-p.portal.x)+Math.abs(s.player.y-p.portal.y)>1)return {ok:false,message:'성소 앞에서 문제를 확인해 주세요.'};
 if(p.finalPassed)return {ok:false,message:'이미 최종 시련을 통과했습니다.'};
 if(p.lastAttemptDay>=s.day)return {ok:false,message:'오늘 답을 제출했습니다. 다음 날 다시 도전하세요.'};
 if(p.resetUsed)return {ok:false,message:'문제 변경 기회를 이미 사용했습니다.'};
 p.resetUsed=true;
 return {ok:true,message:'다른 유형의 문제로 바뀌었습니다. 오늘 바로 답을 제출할 수 있습니다.'};
}
return {visitChance,scheduleVisit,canQuest,resetQuestion,assignSet,attach,place,allRelics,question,quest,submitQuest,enter,submit,value,relics,names,colors};});
