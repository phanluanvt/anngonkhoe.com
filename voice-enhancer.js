const http=require('http');
const original=http.createServer;

function sendJson(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
async function assistant(req,res){
 if(!process.env.GEMINI_API_KEY)return sendJson(res,503,{error:'Trợ lý AI chưa được cấu hình.'});
 let raw='';req.on('data',c=>{raw+=c;if(raw.length>120000)req.destroy()});
 req.on('end',async()=>{try{
  const b=JSON.parse(raw||'{}');
  const q=String(b.question||'').slice(0,600),dish=String(b.dish||'').slice(0,120),step=String(b.step||'').slice(0,1800),ingredients=String(b.ingredients||'').slice(0,3500);
  if(!q)return sendJson(res,400,{error:'Chưa nghe rõ câu hỏi.'});
  const prompt=`Bạn là trợ lý nấu ăn bằng giọng nói của Ăn Ngon Khỏe. Người dùng đang nấu món: ${dish}. Bước hiện tại: ${step}. Nguyên liệu/định lượng đang hiển thị: ${ingredients}. Câu hỏi: ${q}\nTrả lời bằng tiếng Việt tự nhiên, ngắn gọn để đọc thành tiếng, tối đa 3 câu. Ưu tiên an toàn thực phẩm. Nếu câu hỏi cần thông tin không có trong công thức, nói rõ đó là gợi ý. Không dùng markdown.`;
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',{method:'POST',headers:{'x-goog-api-key':process.env.GEMINI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:.25,maxOutputTokens:220}})});
  const data=await r.json();if(!r.ok)throw new Error(data?.error?.message||'Gemini API lỗi');
  const answer=data?.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('').trim();if(!answer)throw new Error('AI không trả lời.');
  sendJson(res,200,{answer});
 }catch(e){console.error('[Cooking voice]',e.message);sendJson(res,400,{error:e.message||'Không xử lý được câu hỏi.'})}})
}

const addon=`<style>
.voice-launch{margin:18px 0;background:linear-gradient(135deg,#ff6428,#f04e18);color:#fff;border:0;border-radius:16px;padding:15px 20px;font:800 16px system-ui;cursor:pointer;box-shadow:0 10px 25px #ff642833}.voice-panel{display:none;position:fixed;inset:0;z-index:9999;background:#fffaf4;color:#2d241e;overflow:auto}.voice-panel.on{display:block}.voice-inner{max-width:760px;margin:auto;padding:22px 18px 50px}.voice-top{display:flex;align-items:center;gap:12px}.voice-top h2{margin-right:auto}.voice-close{border:1px solid #e5d6ca;background:#fff;border-radius:12px;padding:10px 14px;font-weight:800}.voice-dish{text-align:center;margin:24px 0 10px;color:#75675d}.voice-step{background:#fff;border:1px solid #eadfd4;border-radius:24px;padding:28px;box-shadow:0 15px 40px #4a2b1712}.voice-step small{color:#ff6428;font-weight:900}.voice-step h1{font-size:clamp(25px,6vw,38px);line-height:1.3;margin:10px 0}.voice-controls{display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:10px;margin:18px 0}.voice-controls button,.voice-quick button{border:1px solid #e4d4c8;background:#fff;border-radius:14px;padding:13px;font-weight:800}.voice-mic{background:#ff6428!important;color:#fff!important;border-color:#ff6428!important;font-size:17px}.voice-mic.listening{animation:pulse 1s infinite}.voice-quick{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.voice-chat{margin-top:18px;background:#fff;border:1px solid #eadfd4;border-radius:18px;padding:16px;min-height:70px}.voice-heard{font-size:13px;color:#75675d;margin-bottom:6px}.voice-answer{font-weight:650}.voice-help{text-align:center;color:#75675d;font-size:13px;margin-top:12px}@keyframes pulse{50%{transform:scale(1.04);box-shadow:0 0 0 8px #ff642822}}@media(max-width:520px){.voice-controls{grid-template-columns:1fr 1fr}.voice-mic{grid-column:1/-1;grid-row:1}.voice-step{padding:22px}}
</style>
<button id="voiceLaunch" class="voice-launch" type="button">🎙️ Bắt đầu nấu bằng giọng nói</button>
<div id="voicePanel" class="voice-panel"><div class="voice-inner"><div class="voice-top"><div>🎙️</div><h2>Trợ lý nấu ăn</h2><button id="voiceClose" class="voice-close">✕ Thoát</button></div><div id="voiceDish" class="voice-dish"></div><div class="voice-step"><small id="voiceStepNo"></small><h1 id="voiceStepText"></h1></div><div class="voice-controls"><button id="voicePrev">← Bước trước</button><button id="voiceMic" class="voice-mic">🎤 Nói với trợ lý</button><button id="voiceNext">Bước tiếp →</button></div><div class="voice-quick"><button data-cmd="repeat">🔊 Đọc lại</button><button data-cmd="ingredients">🥕 Định lượng</button><button data-cmd="timer">⏱ Hẹn 5 phút</button></div><div class="voice-chat"><div id="voiceHeard" class="voice-heard">Có thể nói: “tiếp theo”, “đọc lại”, “tôi không có hành thì thay bằng gì?”</div><div id="voiceAnswer" class="voice-answer">Bấm micro để bắt đầu.</div></div><div class="voice-help">Nhận giọng nói phụ thuộc trình duyệt. Chrome/Android thường hỗ trợ tốt hơn; nếu không có SpeechRecognition, vẫn dùng được các nút điều khiển và phần đọc thành tiếng.</div></div></div>
<script>(function(){
const launch=document.getElementById('voiceLaunch');if(!launch)return;
const panel=document.getElementById('voicePanel'),dishEl=document.getElementById('voiceDish'),noEl=document.getElementById('voiceStepNo'),textEl=document.getElementById('voiceStepText'),heard=document.getElementById('voiceHeard'),answer=document.getElementById('voiceAnswer'),mic=document.getElementById('voiceMic');
const dish=(document.querySelector('.hero h1')||{}).textContent||document.title.split('—')[0].trim();
const stepNodes=[...document.querySelectorAll('.step')];const steps=stepNodes.map(x=>{const d=x.querySelector('div:last-child');return d?d.innerText.replace(/^Bước\\s+\\d+/i,'').trim():x.innerText.trim()}).filter(Boolean);
let idx=0,timer=null;dishEl.textContent=dish;
function speak(t){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='vi-VN';u.rate=.95;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>/^vi/i.test(v.lang))||null;speechSynthesis.speak(u)}
function render(read){if(!steps.length){noEl.textContent='HƯỚNG DẪN';textEl.textContent='Không tìm thấy bước nấu.';return}noEl.textContent='BƯỚC '+(idx+1)+' / '+steps.length;textEl.textContent=steps[idx];if(read)speak('Bước '+(idx+1)+'. '+steps[idx])}
function ingredients(){return [...document.querySelectorAll('.ings li')].map(x=>x.innerText.replace(/\\s+/g,' ').trim()).join('; ')}
function next(){if(idx<steps.length-1){idx++;render(true)}else speak('Bạn đã hoàn thành bước cuối cùng. Chúc ngon miệng!')}
function prev(){if(idx>0){idx--;render(true)}else speak('Đây đã là bước đầu tiên.')}
launch.onclick=()=>{panel.classList.add('on');document.body.style.overflow='hidden';render(true)};
document.getElementById('voiceClose').onclick=()=>{panel.classList.remove('on');document.body.style.overflow='';if('speechSynthesis'in window)speechSynthesis.cancel()};document.getElementById('voiceNext').onclick=next;document.getElementById('voicePrev').onclick=prev;
document.querySelectorAll('.voice-quick button').forEach(b=>b.onclick=()=>{if(b.dataset.cmd==='repeat')render(true);if(b.dataset.cmd==='ingredients'){const t='Định lượng hiện tại: '+ingredients();answer.textContent=t;speak(t)}if(b.dataset.cmd==='timer'){clearTimeout(timer);timer=setTimeout(()=>{answer.textContent='⏰ Hết 5 phút rồi.';speak('Hết 5 phút rồi.')},300000);answer.textContent='⏱ Đã hẹn giờ 5 phút.';speak('Đã hẹn giờ 5 phút.')}});
async function ask(q){heard.textContent='Bạn nói: “'+q+'”';const s=q.toLowerCase();if(/tiếp|bước sau|kế tiếp/.test(s)){next();return}if(/quay lại|bước trước|lùi/.test(s)){prev();return}if(/đọc lại|nhắc lại|lặp lại/.test(s)){render(true);return}if(/hẹn.*5|năm phút/.test(s)){document.querySelector('[data-cmd="timer"]').click();return}if(/nguyên liệu|định lượng|bao nhiêu/.test(s)&&!/thay|không có/.test(s)){document.querySelector('[data-cmd="ingredients"]').click();return}answer.textContent='Đang hỏi AI…';try{const r=await fetch('/api/cooking-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,dish,step:steps[idx]||'',ingredients:ingredients()})});const d=await r.json();if(!r.ok)throw new Error(d.error||'AI đang bận');answer.textContent=d.answer;speak(d.answer)}catch(e){answer.textContent='Lỗi: '+e.message}}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(SR){const rec=new SR();rec.lang='vi-VN';rec.interimResults=false;rec.continuous=false;rec.onstart=()=>{mic.classList.add('listening');mic.textContent='🔴 Đang nghe…';heard.textContent='Anh/chị cứ nói…'};rec.onend=()=>{mic.classList.remove('listening');mic.textContent='🎤 Nói với trợ lý'};rec.onerror=e=>{answer.textContent='Micro: '+e.error;mic.classList.remove('listening')};rec.onresult=e=>ask(e.results[0][0].transcript);mic.onclick=()=>{try{if('speechSynthesis'in window)speechSynthesis.cancel();rec.start()}catch(e){}}}else{mic.onclick=()=>{answer.textContent='Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy thử Chrome hoặc dùng các nút điều khiển.';speak(answer.textContent)}}
render(false);
})();</script>`;

http.createServer=function(handler,...rest){return original.call(http,(req,res)=>{
 if(req.method==='POST'&&(req.url||'').split('?')[0]==='/api/cooking-assistant')return assistant(req,res);
 const isRecipe=/^\/cong-thuc\/[^/?#]+\/?(?:\?.*)?$/.test(req.url||'');
 if(isRecipe){const end=res.end;res.end=function(chunk,...args){let body=chunk;if(typeof body==='string'&&body.includes('</body>'))body=body.replace('</body>',addon+'</body>');return end.call(this,body,...args)}}
 return handler(req,res)
},...rest)};
