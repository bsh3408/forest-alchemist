(function(root){
'use strict';
const STORE='alchemy.free.accounts';
const load=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){return {};}};
const save=a=>{localStorage.setItem(STORE,JSON.stringify(a));};
const hex=b=>Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
async function derive(id,pw,salt){const enc=new TextEncoder();const key=await root.crypto.subtle.importKey('raw',enc.encode(id+'\0'+pw),'PBKDF2',false,['deriveBits']);return hex(await root.crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
const gate={mode:'login',lastError:''};
gate.verify=async function(username,password){
 const mode=gate.mode;gate.mode='login';gate.lastError='';
 const id=String(username||'').normalize('NFC').trim(),pw=String(password||'');
 if(id.length<2||id.length>20){gate.lastError='아이디는 2~20자로 정해 주세요.';return null;}
 if(pw.length<4){gate.lastError='비밀번호는 4자 이상으로 정해 주세요.';return null;}
 if(!root.crypto?.subtle)throw new Error('이 브라우저에서는 로그인을 확인할 수 없습니다.');
 const accounts=load();let acc=accounts[id];
 if(mode==='create'){
  if(acc){gate.lastError='이미 이 기기에 있는 아이디예요. 비밀번호를 넣고 ‘이어하기’를 누르세요.';return null;}
  const salt=hex(root.crypto.getRandomValues(new Uint8Array(16)));
  acc={salt,hash:await derive(id,pw,salt),index:Math.floor(Math.random()*40),created:new Date().toISOString()};
  accounts[id]=acc;try{save(accounts);}catch(e){gate.lastError='브라우저 저장 공간을 쓸 수 없어요. 시크릿 창이 아닌지 확인해 주세요.';return null;}
 }else{
  if(!acc){gate.lastError='이 기기에 없는 아이디예요. 처음이라면 ‘새 아이디 만들기’를 누르세요.';return null;}
  if(await derive(id,pw,acc.salt)!==acc.hash){gate.lastError='비밀번호가 맞지 않아요.';return null;}
 }
 return {username:id,role:'student',assignmentIndex:acc.index,studentId:null,grade:null,classNumber:null};
};
root.StudentGate=gate;
})(typeof window==='undefined'?globalThis:window);
