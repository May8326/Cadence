/*
  Rendu Markdown minimal et sûr pour l'aperçu des notes de Cadence.
  - aucune dépendance ;
  - tout le texte est échappé avant d'être mis en forme : aucun HTML saisi n'est conservé ;
  - seuls les liens http, https et mailto sont autorisés.
  Pris en charge : titres, gras, italique, barré, code, blocs de code, listes
  (à puces, numérotées, imbriquées, à cocher), citations, tableaux, liens, séparateurs.
*/
(function(){
  'use strict';

  function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function inline(src){
    const stash=[];
    const hold=html=>{ stash.push(html); return '\u0000'+(stash.length-1)+'\u0000'; };
    const anchor=(url,labelHtml)=>hold('<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+labelHtml+'</a>');

    function emphasis(t){
      return t
        .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g,'<strong>$1</strong>')
        .replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g,'$1<strong>$2</strong>')
        .replace(/~~(?=\S)([\s\S]*?\S)~~/g,'<del>$1</del>')
        .replace(/(^|[^*\w])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?!\*)/g,'$1<em>$2</em>')
        .replace(/(^|[^\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?!\w)/g,'$1<em>$2</em>');
    }

    let t=String(src);
    // 1. code en ligne (contenu protégé)
    t=t.replace(/`([^`\n]+)`/g,(m,code)=>hold('<code>'+escapeHtml(code)+'</code>'));
    // 2. échappement de tout le reste
    t=escapeHtml(t);
    // 3. liens [texte](url) : http, https, mailto uniquement
    t=t.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/gi,(m,label,url)=>anchor(url,emphasis(label)));
    // 4. adresses nues
    t=t.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/gi,(m,pre,url)=>{
      let trail=''; const end=url.match(/[.,;:!?)]+$/);
      if(end){ trail=end[0]; url=url.slice(0,-trail.length); }
      return pre+anchor(url,url)+trail;
    });
    // 5. gras, italique, barré
    t=emphasis(t);
    // 6. restitution des parties protégées (imbriquées possibles)
    let guard=0;
    while(/\u0000\d+\u0000/.test(t) && guard++<5){
      t=t.replace(/\u0000(\d+)\u0000/g,(m,i)=>stash[+i]);
    }
    return t;
  }

  const RE = {
    fence:/^\s*```+\s*([\w+-]*)\s*$/,
    heading:/^(#{1,6})\s+(.*?)\s*#*\s*$/,
    hr:/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/,
    quote:/^\s{0,3}>\s?(.*)$/,
    list:/^(\s*)([-*+]|\d+[.)])\s+(.*)$/,
    tableSep:/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/
  };

  function splitRow(line){
    let l=line.trim();
    if(l.startsWith('|')) l=l.slice(1);
    if(l.endsWith('|')) l=l.slice(0,-1);
    return l.split('|').map(c=>c.trim());
  }
  function aligns(sepLine){
    return splitRow(sepLine).map(c=>c.startsWith(':')&&c.endsWith(':')?'center':c.endsWith(':')?'right':c.startsWith(':')?'left':'');
  }
  const startsBlock=(line,next)=>
    RE.fence.test(line)||RE.heading.test(line)||RE.hr.test(line)||RE.quote.test(line)||RE.list.test(line)||
    (line.includes('|') && next!==undefined && RE.tableSep.test(next) && next.includes('-'));

  function renderList(items){
    // items : [{indent, ordered, text}] ; imbrication selon l'indentation
    let html='', stack=[];
    const close=()=>{ const top=stack.pop(); html+='</li></'+top.tag+'>'; };
    items.forEach(it=>{
      const tag=it.ordered?'ol':'ul';
      while(stack.length && it.indent<stack[stack.length-1].indent) close();
      if(stack.length && it.indent===stack[stack.length-1].indent){
        if(stack[stack.length-1].tag!==tag){ close(); }
        else { html+='</li>'; }
      }
      if(!stack.length || it.indent>stack[stack.length-1].indent){
        html+='<'+tag+'>'; stack.push({indent:it.indent,tag});
      }
      const task=it.text.match(/^\[( |x|X)\]\s+(.*)$/);
      if(task){
        html+='<li class="task"><input type="checkbox" disabled'+(task[1]===' '?'':' checked')+'> '+inline(task[2]);
      }else{
        html+='<li>'+inline(it.text);
      }
    });
    while(stack.length) close();
    return html;
  }

  function blocks(lines){
    const out=[]; let i=0;
    while(i<lines.length){
      const line=lines[i];
      if(!line.trim()){ i++; continue; }

      let m=line.match(RE.fence);
      if(m){
        const code=[]; i++;
        while(i<lines.length && !RE.fence.test(lines[i])){ code.push(lines[i]); i++; }
        i++; // ligne de fermeture (ou fin du texte)
        out.push('<pre><code>'+escapeHtml(code.join('\n'))+'</code></pre>');
        continue;
      }
      m=line.match(RE.heading);
      if(m){ const n=m[1].length; out.push('<h'+n+'>'+inline(m[2])+'</h'+n+'>'); i++; continue; }
      if(RE.hr.test(line)){ out.push('<hr>'); i++; continue; }
      if(RE.quote.test(line)){
        const q=[];
        while(i<lines.length && RE.quote.test(lines[i])){ q.push(lines[i].match(RE.quote)[1]); i++; }
        out.push('<blockquote>'+blocks(q)+'</blockquote>');
        continue;
      }
      if(RE.list.test(line)){
        const items=[];
        while(i<lines.length){
          const lm=lines[i].match(RE.list);
          if(lm){
            items.push({indent:lm[1].replace(/\t/g,'    ').length, ordered:/\d/.test(lm[2]), text:lm[3]});
            i++;
          }else if(lines[i].trim() && /^\s+\S/.test(lines[i]) && items.length){
            items[items.length-1].text+=' '+lines[i].trim(); i++;   // suite d'un élément
          }else break;
        }
        out.push(renderList(items));
        continue;
      }
      if(line.includes('|') && i+1<lines.length && RE.tableSep.test(lines[i+1]) && lines[i+1].includes('-')){
        const head=splitRow(line), al=aligns(lines[i+1]); i+=2;
        const rows=[];
        while(i<lines.length && lines[i].trim() && lines[i].includes('|')){ rows.push(splitRow(lines[i])); i++; }
        const cell=(tag,c,k)=>'<'+tag+(al[k]?' style="text-align:'+al[k]+'"':'')+'>'+inline(c||'')+'</'+tag+'>';
        out.push('<div class="md-table-wrap"><table><thead><tr>'+head.map((c,k)=>cell('th',c,k)).join('')+'</tr></thead><tbody>'+
          rows.map(r=>'<tr>'+head.map((_,k)=>cell('td',r[k],k)).join('')+'</tr>').join('')+'</tbody></table></div>');
        continue;
      }
      // paragraphe : lignes consécutives, un retour à la ligne simple reste visible
      const para=[line]; i++;
      while(i<lines.length && lines[i].trim() && !startsBlock(lines[i],lines[i+1])){ para.push(lines[i]); i++; }
      out.push('<p>'+para.map(l=>inline(l.trim())).join('<br>')+'</p>');
    }
    return out.join('');
  }

  function render(src){
    return blocks(String(src==null?'':src).replace(/\r\n?/g,'\n').split('\n'));
  }

  const api={render, renderInline:inline, escapeHtml};
  if(typeof window!=='undefined') window.CadenceMarkdown=api;
  if(typeof module!=='undefined' && module.exports) module.exports=api;
})();
