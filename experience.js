'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const entrance = document.querySelector('#entrance');
  const safeStorage = {get(k){try{return sessionStorage.getItem(k)}catch{return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch{}}};
  let audio, master, timer, step=0, nextNote=0, soundOn=false;
  const soundButton=document.querySelector('#sound-toggle');
  const volume=document.querySelector('#sound-volume');
  const soundStatus=document.querySelector('#sound-status');
  const chords=[[130.81,164.81,196,246.94],[110,130.81,164.81,196],[87.31,110,130.81,164.81],[98,123.47,146.83,196]];
  function note(freq,time,duration,type,gain,cutoff=1300){
    const osc=audio.createOscillator(),filter=audio.createBiquadFilter(),env=audio.createGain();
    osc.type=type;osc.frequency.value=freq;filter.type='lowpass';filter.frequency.value=cutoff;
    env.gain.setValueAtTime(0,time);env.gain.linearRampToValueAtTime(gain,time+.035);env.gain.exponentialRampToValueAtTime(.0001,time+duration);
    osc.connect(filter);filter.connect(env);env.connect(master);osc.start(time);osc.stop(time+duration+.1);osc.onended=()=>{osc.disconnect();filter.disconnect();env.disconnect()};
  }
  function schedule(){if(!soundOn||audio.state!=='running')return;while(nextNote<audio.currentTime+.18){const chord=chords[Math.floor(step/16)%4],beat=step%16;
    note(chord[[0,2,1,3,2,1,3,2][step%8]]*2,nextNote,.65,'triangle',.07,1600);
    if(beat===0){chord.forEach(f=>note(f,nextNote,3.1,'sine',.028));note(chord[0]/2,nextNote,2.6,'sine',.13,500)}
    if(beat%4===0)note(48,nextNote,.17,'sine',.09,180);
    step++;nextNote+=60/88/2;
  }}
  async function toggleSound(force){const want=typeof force==='boolean'?force:!soundOn;
    try{if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio unavailable');audio=new Audio();master=audio.createGain();master.gain.value=Number(volume?.value||22)/100;master.connect(audio.destination)}
      if(want){await audio.resume();soundOn=true;nextNote=audio.currentTime+.06;clearInterval(timer);timer=setInterval(schedule,80);schedule()}else{soundOn=false;clearInterval(timer);await audio.suspend()}
      soundButton?.setAttribute('aria-pressed',String(soundOn));if(soundButton)soundButton.textContent=soundOn?'◖ Sound on':'◖ Sound off';document.body.classList.toggle('sound-on',soundOn);if(soundStatus)soundStatus.textContent=soundOn?'Ambient synth playing':'Sound off';
    }catch{if(soundStatus)soundStatus.textContent='Audio is unavailable in this browser.'}
  }
  soundButton?.addEventListener('click',()=>toggleSound());volume?.addEventListener('input',()=>{if(master)master.gain.setTargetAtTime(Number(volume.value)/100,audio.currentTime,.1)});
  document.addEventListener('visibilitychange',()=>{if(!audio||!soundOn)return;if(document.hidden){audio.suspend();clearInterval(timer)}else{audio.resume().then(()=>{nextNote=audio.currentTime+.06;timer=setInterval(schedule,80)})}});
  function enter(){if(!entrance)return;entrance.close();document.body.classList.remove('intro-open');safeStorage.set('pm-entered','1');document.querySelector('h1')?.focus({preventScroll:true})}
  if(entrance){
    document.querySelector('#enter-world').addEventListener('click',()=>{if(document.querySelector('#intro-audio').checked)toggleSound(true);enter()});
    document.querySelector('#skip-entrance').addEventListener('click',enter);entrance.addEventListener('cancel',()=>{safeStorage.set('pm-entered','1');document.body.classList.remove('intro-open')});
    if(!safeStorage.get('pm-entered')&&!location.hash&&!reduced.matches){entrance.showModal();document.body.classList.add('intro-open')}
    document.querySelector('#replay-intro')?.addEventListener('click',()=>{document.querySelector('#intro-audio').checked=soundOn;entrance.showModal();document.body.classList.add('intro-open')});
  }
  const filters=document.querySelectorAll('[data-filter]');const cards=document.querySelectorAll('[data-category]');
  filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;cards.forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++});const status=document.querySelector('#filter-status');if(status)status.textContent=`${count} stories`;}));
  const readProgress=document.querySelector('#reading-progress');
  if(readProgress){const update=()=>{const main=document.querySelector('article');if(!main)return;const rect=main.getBoundingClientRect(),total=Math.max(1,rect.height-innerHeight);readProgress.style.width=Math.max(0,Math.min(100,-rect.top/total*100))+'%'};addEventListener('scroll',update,{passive:true});update()}
})();
