/* 이용 시간 제한 + 자동 로그아웃
   ① 한국 표준시 기준 월·화·금 08:30~16:00, 수·목 08:30~17:00에만 학생 로그인·플레이 가능.
      주말과 SCHOOL_HOLIDAYS에 적힌 날은 열리지 않는다.
      교사 계정은 시간과 무관하게 들어올 수 있다.
   ② 플레이 중 이용 시간이 끝나면 진행을 저장하고 로그인 화면으로 돌아간다.
   ③ 클릭·키 입력이 15분 동안 없거나, 화면이 꺼지거나 다른 탭으로 넘어간 지 5분이 지나면 조용히 로그아웃한다.
      공용 기기에서 다음 학생이 이전 학생 계정을 이어 쓰는 일을 막는다. 진행은 저장되어 다시 로그인하면 이어진다. */
(function(root){
'use strict';
const SCHOOL_HOLIDAYS=[
 '2026-09-24','2026-09-25','2026-09-26','2026-09-27', // 추석 연휴
 '2026-10-03','2026-10-04','2026-10-05', // 개천절·대체휴일
 '2026-10-09','2026-10-10','2026-10-11', // 한글날 연휴
 '2026-11-19', // 대학수학능력시험일
 '2026-11-20', // 수능 대체휴일
 '2026-12-25', // 크리스마스
 '2027-01-01', // 신정
];
// 요일별 이용 시간(분 단위). 없는 요일(토·일)은 열리지 않는다.
const HOURS={Mon:[510,960],Tue:[510,960],Wed:[510,1020],Thu:[510,1020],Fri:[510,960]};
// 선생님이 게임을 닫아 둘 때 true. 닫혀 있으면 교사 계정도 들어갈 수 없다.
// 배포 폴더의 status.json({"closed":true/false})을 30초마다 다시 읽으므로, 이미 켜 둔 화면에도 곧바로 반영된다.
const MANUAL_CLOSED=true;
let closedNow=MANUAL_CLOSED;
const LEAVE_LOGOUT_EVERY=5; // 창 이탈 5회마다 강제 로그아웃
const IDLE_LOGOUT_MS=15*60*1000,HIDDEN_LOGOUT_MS=5*60*1000;
const MANUAL_MESSAGE='지금은 공방이 닫혀 있어요. 선생님이 다시 열 때까지 기다려 주세요.';
const CLOSED_MESSAGE='지금은 이용 시간이 아니에요. 월·화·금 8:30~16:00, 수·목 8:30~17:00에 접속해 주세요(주말·공휴일 제외).';
function isClosed(){return closedNow;}
function closedMessage(){return closedNow?MANUAL_MESSAGE:CLOSED_MESSAGE;}
function isOpen(now=new Date()){return !closedNow&&scheduleOpen(now);}
function scheduleOpen(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=t=>parts.find(p=>p.type===t).value;
 const hours=HOURS[get('weekday')],minutes=(+get('hour')%24)*60+(+get('minute'));
 if(!hours)return false;
 if(SCHOOL_HOLIDAYS.includes(`${get('year')}-${get('month')}-${get('day')}`))return false;
 return minutes>=hours[0]&&minutes<hours[1];
}
root.SessionGuard={isOpen,scheduleOpen,isClosed,closedMessage,get CLOSED_MESSAGE(){return closedMessage();}};
if(typeof document==='undefined'||typeof studentSession==='undefined')return;

let leavingForLogout=false;
function logout(message){
 leavingForLogout=true;
 if(typeof sanctuarySave==='function')sanctuarySave();
 if(message)alert(message);
 location.reload();
}
function showClosedNote(){
 const form=document.getElementById('student-login-form');if(!form)return;
 let note=document.getElementById('service-hours-note');
 if(isOpen()){if(note)note.remove();return;}
 if(!note){note=document.createElement('p');note.id='service-hours-note';note.className='service-hours-note';form.prepend(note);}
 note.textContent='🕐 '+closedMessage();
}
let lastActivity=Date.now(),hiddenSince=null;
const mark=()=>{lastActivity=Date.now();};
['click','keydown','touchstart','pointerdown'].forEach(ev=>document.addEventListener(ev,mark,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenSince=Date.now();else{const away=hiddenSince?Date.now()-hiddenSince:0;hiddenSince=null;mark();if(studentSession&&away>HIDDEN_LOGOUT_MS)logout();}});

/* 창 이탈 감지(AI 등 다른 창 사용 방지)
   - 로그인한 뒤 게임 창을 벗어날 때마다(다른 탭·다른 프로그램·창 최소화) 횟수와 누적 시간을 state.integrity에 저장한다.
   - 특별의뢰 문제를 푸는 중에 벗어나면 그 의뢰는 오답 처리되고 손님이 떠난다.
   - 최종 시련을 푸는 중에 벗어나면 오늘의 도전이 오답으로 기록된다(다음 날 새 문제로 재도전).
   - 답안 칸에는 붙여넣기를 막는다. 기록은 클리어 화면에 함께 표시된다. */
let leftAt=null,lastLeave=0,pendingNotice='';
const byId=id=>document.getElementById(id);
function integrity(){if(!state.integrity)state.integrity={leaves:0,awayMs:0,log:[]};return state.integrity;}
function updateBadge(){const b=byId('leave-badge');if(!b)return;const n=studentSession?integrity().leaves:0;b.hidden=!studentSession;b.textContent='창 이탈 '+n+'회';b.classList.toggle('warn',n>0);}
function activeProblem(){
 if(!byId('utility-dialog')?.open)return null;
 const trial=byId('trial-answer');if(trial&&!trial.disabled)return 'final';
 const quest=byId('quest-submit');if(quest&&!quest.disabled&&window.activeQuestKey)return 'quest';
 return null;
}
function penalize(kind){
 if(kind==='final'){
  const p=state.sanctuary;if(!p||p.finalPassed||p.lastAttemptDay>=state.day)return;
  const q=Sanctuary.question(p);p.lastAttemptDay=state.day;p.history.push({day:state.day,questionId:q.id,passed:false,leftWindow:true});p.attempt++;
  if(typeof closeUtility==='function')closeUtility();
  pendingNotice='최종 시련 풀이 중 창을 벗어나서 오늘의 도전은 오답으로 처리됐어요. 다음 날 새 문제로 다시 도전하세요.';
 }else if(kind==='quest'){
  const key=window.activeQuestKey,q=Sanctuary.quest(state.sanctuary,key);if(!q)return;
  const r=Sanctuary.submitQuest(state,key,typeof q.answer==='number'?'-999999':'__left_window__');
  window.activeQuestKey=null;if(typeof closeUtility==='function')closeUtility();
  if(r.attempted&&r.departingGuest&&typeof showAngryDeparture==='function')showAngryDeparture(r);
  pendingNotice='특별의뢰 풀이 중 창을 벗어나서 이번 의뢰는 오답으로 처리됐어요.';
 }
}
function registerLeave(){
 if(!studentSession||leavingForLogout||leftAt)return;
 const now=Date.now();if(now-lastLeave<400)return;lastLeave=now;leftAt=now;
 const rec=integrity(),kind=activeProblem();rec.leaves++;rec.log.push({day:state.day,at:new Date(now).toISOString(),during:kind||'play'});if(rec.log.length>200)rec.log.shift();
 if(kind)penalize(kind);
 if(typeof render==='function')render();
 updateBadge();if(typeof sanctuarySave==='function')sanctuarySave();
 if(rec.leaves%LEAVE_LOGOUT_EVERY===0){
  try{sessionStorage.setItem('alchemy.leaveLogout','창 이탈이 '+rec.leaves+'회가 되어 로그아웃됐어요. 다시 로그인해 주세요. (5회마다 로그아웃)');}catch(e){}
  logout();
 }
}
function registerReturn(){
 if(!leftAt)return;
 if(studentSession){integrity().awayMs+=Date.now()-leftAt;if(typeof sanctuarySave==='function')sanctuarySave();}
 leftAt=null;
 if(pendingNotice){const m=pendingNotice;pendingNotice='';setTimeout(()=>{leavingForLogout=true;alert('⚠ '+m);leavingForLogout=false;},50);}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)registerLeave();else registerReturn();});
root.addEventListener('blur',registerLeave);
root.addEventListener('focus',registerReturn);
document.addEventListener('paste',e=>{if(studentSession&&e.target?.closest?.('#utility-dialog, #bench-dialog')){e.preventDefault();const b=byId('leave-badge');if(b){b.textContent='붙여넣기 차단됨';setTimeout(updateBadge,1200);}}},true);
root.LeaveGuard={registerLeave,registerReturn,updateBadge};
setInterval(updateBadge,1000);

async function checkStatus(){
 try{const r=await fetch('status.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json();closedNow=j.closed===true;}catch(e){}
 showClosedNote();enforce();
}
function enforce(){
 if(!studentSession)return;
 if(closedNow){logout('🕐 '+MANUAL_MESSAGE+' 오늘 진행한 내용은 저장됐어요.');return true;}
 if(studentSession.role!=='teacher'&&!isOpen()){logout('🕐 이용 시간이 끝나 공방 문을 닫습니다. 오늘 진행한 내용은 저장됐어요. 다음 이용 시간에 다시 만나요!');return true;}
}
checkStatus();setInterval(checkStatus,30000);
showClosedNote();
try{const m=sessionStorage.getItem('alchemy.leaveLogout');if(m){sessionStorage.removeItem('alchemy.leaveLogout');const el=byId('login-error');if(el)el.textContent='⚠ '+m;}}catch(e){}
setInterval(()=>{
 updateBadge();
 if(!studentSession){showClosedNote();return;}
 if(enforce())return;
 if(Date.now()-lastActivity>IDLE_LOGOUT_MS||(hiddenSince&&Date.now()-hiddenSince>HIDDEN_LOGOUT_MS))logout();
},20000);
})(typeof window==='undefined'?globalThis:window);
