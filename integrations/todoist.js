/* Cadence — Todoist integration (OAuth 2 + PKCE, public browser client) */
(function(){
  'use strict';

  const CLIENT_ID = 'https://may8326.github.io/Cadence/integrations/todoist-client.json';
  const REDIRECT_URI = 'https://may8326.github.io/Cadence/';
  const AUTH_URL = 'https://app.todoist.com/oauth/authorize';
  const TOKEN_URL = 'https://api.todoist.com/oauth/access_token';
  const API_URL = 'https://api.todoist.com/api/v1';
  const STORAGE_KEY = 'cadence-todoist-v1';
  const PENDING_KEY = 'cadence-todoist-oauth-pending-v1';

  function readStored(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch(e){ return null; }
  }
  function store(value){ localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }
  function clearStored(){ localStorage.removeItem(STORAGE_KEY); }

  function randomString(length){
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => String.fromCharCode(65 + (b % 26))).join('');
  }
  function base64url(bytes){
    let str='';
    bytes.forEach(b => str += String.fromCharCode(b));
    return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  async function sha256(value){
    return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  }

  async function startOAuth(){
    const verifier = randomString(64);
    const challenge = base64url(await sha256(verifier));
    const state = randomString(32);
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({verifier, state, createdAt:Date.now()}));
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'data:read',
      state,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });
    window.location.assign(AUTH_URL + '?' + params.toString());
  }

  async function finishOAuth(){
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const returnedState = params.get('state');
    const error = params.get('error');
    if(!code && !error) return null;

    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null');
    sessionStorage.removeItem(PENDING_KEY);
    if(error) throw new Error(params.get('error_description') || error);
    if(!pending || !returnedState || returnedState !== pending.state) throw new Error('La vérification OAuth a échoué (state invalide).');

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: pending.verifier
    });
    const response = await fetch(TOKEN_URL, {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body
    });
    const data = await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error_description || data.error || 'Impossible de récupérer le jeton Todoist.');
    store({
      accessToken:data.access_token,
      refreshToken:data.refresh_token || null,
      expiresAt:Date.now() + ((data.expires_in || 3600) * 1000),
      scope:data.scope || 'data:read'
    });
    history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    return data;
  }

  async function refreshToken(){
    const saved = readStored();
    if(!saved || !saved.refreshToken) return null;
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type:'refresh_token',
      refresh_token:saved.refreshToken
    });
    const response = await fetch(TOKEN_URL, {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body
    });
    const data = await response.json().catch(()=>({}));
    if(!response.ok){ clearStored(); throw new Error(data.error_description || data.error || 'La connexion Todoist a expiré.'); }
    store({
      accessToken:data.access_token,
      refreshToken:data.refresh_token || saved.refreshToken,
      expiresAt:Date.now() + ((data.expires_in || 3600) * 1000),
      scope:data.scope || saved.scope || 'data:read'
    });
    return data;
  }

  async function getAccessToken(){
    let saved = readStored();
    if(!saved || !saved.accessToken) return null;
    if(saved.expiresAt && Date.now() > saved.expiresAt - 60000){
      saved = await refreshToken();
      if(!saved) return null;
    }
    return readStored()?.accessToken || null;
  }

  async function api(path, options){
    let token = await getAccessToken();
    if(!token) throw new Error('Todoist n’est pas connecté.');
    const request = Object.assign({}, options || {}, {headers:Object.assign({}, options?.headers || {}, {Authorization:'Bearer '+token})});
    let response = await fetch(API_URL + path, request);
    if(response.status === 401){
      await refreshToken();
      token = await getAccessToken();
      if(!token) throw new Error('La connexion Todoist a expiré.');
      request.headers.Authorization = 'Bearer ' + token;
      response = await fetch(API_URL + path, request);
    }
    const data = await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error || data.error_description || `Erreur Todoist (${response.status}).`);
    return data;
  }

  async function getTasks(){
    let all=[];
    let cursor='';
    do{
      const qs = new URLSearchParams({limit:'200'});
      if(cursor) qs.set('cursor',cursor);
      const data = await api('/tasks?' + qs.toString());
      all = all.concat(data.results || []);
      cursor = data.next_cursor || '';
    }while(cursor);
    return all;
  }

  async function getSections(){
    let all=[];
    let cursor='';
    do{
      const qs = new URLSearchParams({limit:'200'});
      if(cursor) qs.set('cursor',cursor);
      const data = await api('/sections?' + qs.toString());
      all = all.concat(data.results || []);
      cursor = data.next_cursor || '';
    }while(cursor);
    return all;
  }

  function isConnected(){ return !!readStored()?.accessToken; }
  function disconnect(){ clearStored(); }

  window.CadenceTodoist = {startOAuth, finishOAuth, getTasks, getSections, isConnected, disconnect, getStored:readStored};

  window.CadenceTodoistReady = finishOAuth().catch(err => ({error:err.message}));
})();
