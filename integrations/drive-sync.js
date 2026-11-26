(function(){
  'use strict';

  // Même client OAuth que Google Calendar ; seul le droit "drive.appdata" est demandé ici.
  const CLIENT_ID = '813866094414-oa35s352ttl9trpurvi5vtgls85neib3.apps.googleusercontent.com';
  const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const FILE_NAME = 'cadence-sync.json';
  const API = 'https://www.googleapis.com/drive/v3';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

  let tokenClient = null;
  let accessToken = null;
  let tokenExpiresAt = 0;
  let readyResolve;
  const ready = new Promise(resolve => { readyResolve = resolve; });
  let pending = null; // { resolve, reject } de la demande d'autorisation en cours

  function explainAuth(code, description){
    if(code==='access_denied') return 'Accès refusé par Google. Tant que l’application est en mode Test, votre compte doit figurer parmi les utilisateurs test et l’autorisation se renouvelle tous les 7 jours : relancez la synchronisation et acceptez la demande.';
    if(code==='popup_closed') return 'La fenêtre Google a été fermée avant la fin. Relancez la synchronisation.';
    if(code==='popup_failed_to_open') return 'Le navigateur a bloqué la fenêtre Google : autorisez les fenêtres pop-up pour ce site, puis réessayez.';
    return description || code || 'Autorisation Google impossible.';
  }
  function loadGIS(){
    return new Promise((resolve, reject) => {
      if(window.google?.accounts?.oauth2) return resolve();
      let waited = 0;
      if(!document.querySelector('script[data-google-gis]')){
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleGis = 'true';
        document.head.appendChild(script);
      }
      const timer = setInterval(() => {
        if(window.google?.accounts?.oauth2){ clearInterval(timer); resolve(); }
        else if((waited += 100) > 15000){ clearInterval(timer); reject(new Error('Impossible de charger Google Identity Services.')); }
      }, 100);
    });
  }

  async function init(){
    try{
      await loadGIS();
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: response => {
          if(!pending) return;
          const p = pending; pending = null;
          if(response.error){ p.reject(new Error(explainAuth(response.error, response.error_description))); return; }
          accessToken = response.access_token;
          tokenExpiresAt = Date.now() + (Number(response.expires_in) || 3600) * 1000;
          p.resolve(accessToken);
        },
        error_callback: err => {
          if(!pending) return;
          const p = pending; pending = null;
          p.reject(new Error(explainAuth(err && err.type)));
        }
      });
      readyResolve(true);
    }catch(error){
      console.error('Synchronisation Drive :', error);
      readyResolve(false);
    }
  }

  function isConnected(){ return !!accessToken && Date.now() < tokenExpiresAt - 60000; }

  async function getToken(){
    if(isConnected()) return accessToken;
    await ready;
    if(!tokenClient) throw new Error('Google Identity Services n’est pas disponible.');
    return new Promise((resolve, reject) => {
      pending = { resolve, reject };
      try{ tokenClient.requestAccessToken({ prompt: '' }); }
      catch(error){ pending = null; reject(error); }
    });
  }

  async function driveFetch(url, options = {}){
    const token = await getToken();
    let response;
    try{
      response = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: 'Bearer ' + token } });
    }catch(error){
      throw new Error('Pas de connexion à Internet, ou Google est injoignable. Vérifiez votre réseau puis réessayez.');
    }
    if(!response.ok){
      let raw = '';
      try{ const data = await response.json(); raw = (data.error && data.error.message) || ''; }catch(e){}
      if(response.status === 401){ accessToken = null; tokenExpiresAt = 0; throw new Error('Votre session Google a expiré : relancez la synchronisation.'); }
      if(response.status === 403){
        if(/not been used|disabled|accessNotConfigured/i.test(raw)) throw new Error('L’API Google Drive n’est pas activée pour ce projet (console Google Cloud, API et services, Bibliothèque).');
        throw new Error('Google refuse l’accès à l’espace privé de Cadence sur Drive : relancez la synchronisation en acceptant la demande d’accès à Drive.');
      }
      if(response.status >= 500) throw new Error('Google Drive est momentanément indisponible. Réessayez dans quelques minutes.');
      throw new Error(raw || 'Erreur Google Drive (' + response.status + ').');
    }
    return response;
  }

  async function findFile(){
    const qs = new URLSearchParams({
      spaces: 'appDataFolder',
      q: "name='" + FILE_NAME + "' and trashed=false",
      fields: 'files(id,name)',
      pageSize: '1'
    });
    const response = await driveFetch(API + '/files?' + qs.toString());
    const data = await response.json();
    return (data.files && data.files[0]) || null;
  }

  async function download(id){
    const response = await driveFetch(API + '/files/' + encodeURIComponent(id) + '?alt=media');
    return response.json();
  }

  async function create(content){
    const boundary = 'cadence' + Math.random().toString(36).slice(2);
    const body =
      '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] }) +
      '\r\n--' + boundary + '\r\nContent-Type: application/json\r\n\r\n' + content +
      '\r\n--' + boundary + '--';
    await driveFetch(UPLOAD + '/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/related; boundary=' + boundary },
      body
    });
  }

  async function update(id, content){
    await driveFetch(UPLOAD + '/files/' + encodeURIComponent(id) + '?uploadType=media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: content
    });
  }

  function buildPayload(cb){
    const stamp = cb.stamp(); // garantit que les données locales ont une date de modification
    const local = cb.getLocal();
    return JSON.stringify({
      cadenceSync: 1,
      syncedAt: new Date().toISOString(),
      updatedAt: stamp,
      data: local.data
    });
  }

  /*
    cb.getLocal()  -> { updatedAt, data }
    cb.stamp()     -> donne une date de modification aux données locales si elles n'en ont pas, et la renvoie
    cb.applyRemote(data) -> remplace les données locales par celles de Drive
    Résultat : 'uploaded' | 'downloaded' | 'uptodate'
  */
  async function sync(cb){
    await getToken();
    const file = await findFile();

    if(!file){
      await create(buildPayload(cb));
      return 'uploaded';
    }

    const remote = await download(file.id);
    if(!remote || remote.cadenceSync !== 1 || !remote.data || typeof remote.data !== 'object'){
      throw new Error('Le fichier de synchronisation sur Drive est illisible. Rien n’a été modifié.');
    }

    const L = cb.getLocal().updatedAt || '';
    const R = remote.updatedAt || '';

    if(R && (!L || R > L)){
      cb.applyRemote(remote.data);
      return 'downloaded';
    }
    if(!R || L > R){
      await update(file.id, buildPayload(cb));
      return 'uploaded';
    }
    return 'uptodate';
  }

  window.CadenceDriveSync = { ready, isConnected, sync };

  init();
})();
