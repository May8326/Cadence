(function(){
  'use strict';

  const CLIENT_ID = '813866094414-oa35s352ttl9trpurvi5vtgls85neib3.apps.googleusercontent.com';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.calendarlist.readonly';
  const TOKEN_URL = 'https://oauth2.googleapis.com/tokeninfo';
  const API_URL = 'https://www.googleapis.com/calendar/v3';

  let tokenClient = null;
  let accessToken = null;
  let tokenExpiresAt = 0;
  let readyResolve;
  const ready = new Promise(resolve => { readyResolve = resolve; });
  let gisLoading = null;

  function loadGIS(){
    if(window.google?.accounts?.oauth2) return Promise.resolve();
    if(gisLoading) return gisLoading;
    gisLoading = new Promise((resolve,reject)=>{
      const existing = document.querySelector('script[data-google-gis]');
      if(existing){
        existing.addEventListener('load',()=>resolve());
        existing.addEventListener('error',()=>reject(new Error('Impossible de charger Google Identity Services.')));
        return;
      }
      const script=document.createElement('script');
      script.src='https://accounts.google.com/gsi/client';
      script.async=true;
      script.defer=true;
      script.dataset.googleGis='true';
      script.onload=resolve;
      script.onerror=()=>reject(new Error('Impossible de charger Google Identity Services.'));
      document.head.appendChild(script);
    });
    return gisLoading;
  }

  async function init(){
    try{
      await loadGIS();
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: ()=>{}
      });
      readyResolve(true);
    }catch(error){
      console.error('Google Calendar:',error);
      readyResolve(false);
    }
  }

  function isConnected(){
    return !!accessToken && Date.now() < tokenExpiresAt - 60000;
  }

  function disconnect(){
    if(accessToken && window.google?.accounts?.oauth2){
      try{ google.accounts.oauth2.revoke(accessToken,()=>{}); }catch(e){}
    }
    accessToken=null;
    tokenExpiresAt=0;
  }

  async function connect(){
    await ready;
    if(!tokenClient) throw new Error('Google Identity Services n’est pas disponible.');
    return new Promise((resolve,reject)=>{
      tokenClient.callback = response=>{
        if(response.error){ reject(new Error(response.error_description || response.error)); return; }
        accessToken=response.access_token;
        tokenExpiresAt=Date.now() + (Number(response.expires_in)||3600)*1000;
        resolve(response);
      };
      try{
        tokenClient.requestAccessToken({prompt: accessToken ? '' : 'consent'});
      }catch(error){ reject(error); }
    });
  }

  async function ensureToken(){
    if(isConnected()) return accessToken;
    await connect();
    return accessToken;
  }

  async function api(path, options={}){
    const token=await ensureToken();
    const response=await fetch(API_URL + path, {
      ...options,
      headers:{...(options.headers||{}), Authorization:'Bearer '+token}
    });
    if(response.status===401){
      accessToken=null;
      tokenExpiresAt=0;
      await connect();
      const retry=await fetch(API_URL + path, {...options,headers:{...(options.headers||{}),Authorization:'Bearer '+accessToken}});
      if(!retry.ok) throw new Error('Google Calendar a refusé la requête ('+retry.status+').');
      return retry.json();
    }
    if(!response.ok){
      let message='Erreur Google Calendar ('+response.status+').';
      try{ const data=await response.json(); message=data.error?.message || message; }catch(e){}
      throw new Error(message);
    }
    return response.json();
  }

  async function getCalendars(){
    let all=[];
    let pageToken='';
    do{
      const qs=new URLSearchParams({maxResults:'250'});
      if(pageToken) qs.set('pageToken',pageToken);
      const data=await api('/users/me/calendarList?'+qs.toString());
      all=all.concat(data.items || []);
      pageToken=data.nextPageToken || '';
    }while(pageToken);
    return all;
  }

  async function getEvents(calendarId,timeMin,timeMax){
    const qs=new URLSearchParams({
      timeMin:timeMin.toISOString(),
      timeMax:timeMax.toISOString(),
      singleEvents:'true',
      orderBy:'startTime',
      maxResults:'2500'
    });
    const data=await api('/calendars/'+encodeURIComponent(calendarId)+'/events?'+qs.toString());
    return data.items || [];
  }

  window.CadenceGoogleCalendar={
    ready,
    connect,
    disconnect,
    isConnected,
    getCalendars,
    getEvents,
    getStored:()=>({connected:isConnected()})
  };

  init();
})();
