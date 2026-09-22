(function(root){
'use strict';
async function verify(username,password,roster=root.STUDENT_ROSTER){
 const id=String(username||'').normalize('NFC').trim();
 const number=String(password||'').trim();
 if(!/^.+[1-9]\d*$/.test(id)||!/^\d{4,5}$/.test(number))return null;
 if(!roster||!root.crypto?.subtle)throw new Error('로그인 정보를 불러오지 못했습니다. 최신 브라우저에서 다시 열어 주세요.');
 const encoder=new TextEncoder();
 const key=await root.crypto.subtle.importKey('raw',encoder.encode(id+'\0'+number),'PBKDF2',false,['deriveBits']);
 const bytes=await root.crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(roster.salt),iterations:roster.iterations,hash:'SHA-256'},key,256);
 const proof=Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
 if(roster.teacherProofs?.includes(proof))return {username:id,role:'teacher',studentId:null,grade:null,classNumber:null};
 if(!/^1\d{4}$/.test(number)||!roster.proofs.includes(proof))return null;
 return {username:id,role:'student',assignmentIndex:roster.proofs.indexOf(proof),studentId:number,grade:1,classNumber:Number(number.slice(1,3))};
}
root.StudentGate={verify};
})(typeof window==='undefined'?globalThis:window);
