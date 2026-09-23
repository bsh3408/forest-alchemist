/* 이용 시간 제한 + 자동 로그아웃
   ① 평일(월~금) 08:00~17:00(한국 표준시)에만 학생 로그인·플레이 가능. 공휴일은 SCHOOL_HOLIDAYS에 추가한다.
      교사 계정은 시간과 무관하게 들어올 수 있다.
   ② 플레이 중 17:00가 되면 진행을 저장하고 로그인 화면으로 돌아간다.
   ③ 클릭·키 입력이 15분 동안 없거나, 화면이 꺼지거나 다른 탭으로 넘어간 지 5분이 지나면 조용히 로그아웃한다.
      공용 기기에서 다음 학생이 이전 학생 계정을 이어 쓰는 일을 막는다. 진행은 저장되어 다시 로그인하면 이어진다. */
(function(root){
'use strict';
const SCHOOL_HOLIDAYS=[
 '2026-09-24','2026-09-25', // 추석 연휴
 '2026-10-03', // 개천절
 '2026-10-05', // 추석 대체휴일
 '2026-10-09', // 한글날
 '2026-11-19', // 대학수학능력시험일
 '2026-11-20', // 수능 대체휴일
 '2026-12-25', // 크리스마스
 '2027-01-01', // 신정
];
const OPEN_MIN=8*60,CLOSE_MIN=17*60;
const IDLE_LOGOUT_MS=15*60*1000,HIDDEN_LOGOUT_MS=5*60*1000;
const CLOSED_MESSAGE='지금은 이용 시간이 아니에요. 평일 오전 8시 ~ 오후 5시에 접속해 주세요.';
function isOpen(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=t=>parts.find(p=>p.type===t).value;
 const weekday=get('weekday'),minutes=(+get('hour')%24)*60+(+get('minute'));
 if(weekday==='Sat'||weekday==='Sun')return false;
 if(SCHOOL_HOLIDAYS.includes(`${get('year')}-${get('month')}-${get('day')}`))return false;
 return minutes>=OPEN_MIN&&minutes<CLOSE_MIN;
}
root.SessionGuard={isOpen,CLOSED_MESSAGE};
if(typeof document==='undefined'||typeof studentSession==='undefined')return;

function logout(message){
 if(typeof sanctuarySave==='function')sanctuarySave();
 if(message)alert(message);
 location.reload();
}
function showClosedNote(){
 const form=document.getElementById('student-login-form');if(!form)return;
 let note=document.getElementById('service-hours-note');
 if(isOpen()){if(note)note.remove();return;}
 if(!note){note=document.createElement('p');note.id='service-hours-note';note.className='service-hours-note';form.prepend(note);}
 note.textContent='🕐 '+CLOSED_MESSAGE;
}
let lastActivity=Date.now(),hiddenSince=null;
const mark=()=>{lastActivity=Date.now();};
['click','keydown','touchstart','pointerdown'].forEach(ev=>document.addEventListener(ev,mark,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenSince=Date.now();else{const away=hiddenSince?Date.now()-hiddenSince:0;hiddenSince=null;mark();if(studentSession&&away>HIDDEN_LOGOUT_MS)logout();}});
showClosedNote();
setInterval(()=>{
 if(!studentSession){showClosedNote();return;}
 if(studentSession.role!=='teacher'&&!isOpen()){logout('🕐 오후 5시가 되어 공방 문을 닫습니다. 오늘 진행한 내용은 저장됐어요. 다음 이용 시간에 다시 만나요!');return;}
 if(Date.now()-lastActivity>IDLE_LOGOUT_MS||(hiddenSince&&Date.now()-hiddenSince>HIDDEN_LOGOUT_MS))logout();
},20000);
})(typeof window==='undefined'?globalThis:window);
