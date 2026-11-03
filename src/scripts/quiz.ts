import {readProgress,writeProgress,recordScore} from './progress.mjs';
interface Question {id:string;title:string;question:string;options:string[];answer:number;explanation:string;url:string}
function element<K extends keyof HTMLElementTagNameMap>(tag:K, cls='', text='') {const el=document.createElement(tag);el.className=cls;el.textContent=text;return el;}
document.querySelectorAll<HTMLElement>('[data-quiz-id]').forEach(root=>{
  const questions:Question[]=JSON.parse(root.querySelector('[data-quiz-data]')!.textContent!);
  const stage=root.querySelector<HTMLElement>('[data-quiz-stage]')!;
  const counter=root.querySelector<HTMLElement>('[data-quiz-counter]')!;
  const bar=root.querySelector<HTMLElement>('[data-quiz-bar]')!;
  const fr=root.dataset.lang==='fr'; const t=(a:string,b:string)=>fr?a:b;
  let index=0;let responses:number[]=[];
  function showQuestion(focus=false) {
    if(!questions.length){stage.textContent=t('Aucune question disponible.','No questions available.');return;}
    const q=questions[index];stage.replaceChildren();counter.textContent=`${index+1} / ${questions.length}`;bar.style.width=`${index/questions.length*100}%`;
    const form=element('form');const fieldset=element('fieldset');const legend=element('legend','',q.question);legend.tabIndex=-1;
    fieldset.append(legend);const options=element('div','quiz-options');
    q.options.forEach((option,i)=>{
      const label=element('label','quiz-option');const input=element('input');input.type='radio';input.name=`answer-${root.dataset.quizId}`;input.value=String(i);input.required=true;
      label.append(input,element('span','',option));options.append(label);
    });
    fieldset.append(options);form.append(fieldset);
    const feedback=element('div','quiz-feedback');feedback.hidden=true;feedback.setAttribute('role','status');form.append(feedback);
    const actions=element('div','quiz-actions');const hint=element('span','muted',t('Une seule réponse correcte','One correct answer'));hint.style.fontSize='.7rem';
    const check=element('button','button primary',t('Vérifier la réponse','Check answer'));check.type='submit';actions.append(hint,check);form.append(actions);stage.append(form);
    let answered=false;
    form.addEventListener('submit',event=>{
      event.preventDefault();if(answered)return;
      const selected=form.querySelector<HTMLInputElement>('input:checked');if(!selected)return;
      answered=true;const choice=Number(selected.value);responses.push(choice);
      options.querySelectorAll<HTMLInputElement>('input').forEach(input=>{input.disabled=true;if(Number(input.value)===q.answer)input.closest('label')!.classList.add('correct');else if(input.checked)input.closest('label')!.classList.add('incorrect');});
      feedback.hidden=false;feedback.append(element('strong','',choice===q.answer?t('✓ Bien joué !','✓ Well done!'):t('À revoir — voici pourquoi.','Worth revisiting — here is why.')),element('p','',q.explanation));
      if(choice!==q.answer)feedback.append(element('p','',`${t('Réponse correcte :','Correct answer:')} ${q.options[q.answer]}`));
      const next=element('button','button primary',index===questions.length-1?t('Voir le résultat','See results'):t('Question suivante →','Next question →'));next.type='button';check.replaceWith(next);
      next.addEventListener('click',()=>{index++;if(index===questions.length)showResults();else showQuestion(true);});next.focus();
    });
    if(focus)legend.focus();
  }
  function showResults(){
    const correct=questions.filter((q,i)=>q.answer===responses[i]).length;
    const score=Math.round(correct/questions.length*100);
    writeProgress(recordScore(readProgress(),root.dataset.quizId!,score));
    stage.replaceChildren();bar.style.width='100%';counter.textContent=t('Session terminée','Session complete');
    const result=element('div','quiz-result');const heading=element('h3','',t('Un pas de plus vers la maîtrise.','One step closer to mastery.'));heading.tabIndex=-1;
    result.append(element('div','score',`${correct} / ${questions.length}`),heading,element('p','',`${score}% · ${t('Ton meilleur score est conservé sur ce navigateur.','Your best score is saved in this browser.')}`));
    const review=element('div','quiz-review');
    if(correct<questions.length){review.append(element('p','',t('Les notions à revoir :','Concepts to revisit:')));questions.forEach((q,i)=>{if(q.answer!==responses[i]){const link=element('a','',`${q.id.replace('-','.')} · ${q.title} →`);link.href=q.url;review.append(link);}});}else{review.append(element('p','',t('Tout est correct. Essaie de reformuler chaque explication sans regarder le cours.','All correct. Try explaining each answer without looking at the lesson.')));}
    result.append(review);const retry=element('button','button',t('Recommencer le quiz','Try again'));retry.style.marginTop='20px';retry.addEventListener('click',()=>{index=0;responses=[];showQuestion(true);});result.append(retry);stage.append(result);heading.focus();
  }
  showQuestion();
});
