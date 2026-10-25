(function(){
"use strict";
var LAT=37.5089, LON=-4.1104, TZ="Europe/Madrid";
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
function pad(n){return (n<10?"0":"")+n}
function setT(id,t){var e=document.getElementById(id);if(e){e.textContent=t;e.classList.remove("sk")}}
function setH(id,h){var e=document.getElementById(id);if(e){e.innerHTML=h}}

/* ---- hora en Madrid ---- */
function ahoraMadrid(){
  var p={};new Intl.DateTimeFormat("en-GB",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
  return {y:+p.year,m:+p.month,d:+p.day,h:+p.hour%24,mi:+p.minute,s:+p.second};
}
function fmtHora(d){return d.toLocaleTimeString("es-ES",{timeZone:TZ,hour:"2-digit",minute:"2-digit"})}

/* ---- menú ---- */
var bur=$(".ft-burger"),men=$(".ft-menu");
if(bur&&men){bur.addEventListener("click",function(){men.classList.toggle("open");bur.textContent=men.classList.contains("open")?"Cerrar":"Menú"})}
$$(".ft-menu a").forEach(function(a){var hr=a.getAttribute("href");if(hr.length>2&&location.pathname.slice(-hr.length)===hr)a.classList.add("on")});

/* ---- aparecer al hacer scroll ---- */
if("IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("vis");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});
  $$(".rv").forEach(function(el){io.observe(el)});
}else{$$(".rv").forEach(function(el){el.classList.add("vis")})}

/* ---- sol (algoritmo de SunCalc, simplificado) ---- */
var rad=Math.PI/180,dayMs=864e5,J1970=2440588,J2000=2451545,e=rad*23.4397;
function toJ(d){return d.valueOf()/dayMs-0.5+J1970}
function fromJ(j){return new Date((j+0.5-J1970)*dayMs)}
function toDays(d){return toJ(d)-J2000}
function solarM(d){return rad*(357.5291+0.98560028*d)}
function eclL(M){var C=rad*(1.9148*Math.sin(M)+0.02*Math.sin(2*M)+0.0003*Math.sin(3*M));return M+C+rad*102.9372+Math.PI}
function decl(l){return Math.asin(Math.sin(e)*Math.sin(l))}
function rasc(l){return Math.atan2(Math.sin(l)*Math.cos(e),Math.cos(l))}
function solTimes(date){
  var lw=rad*-LON,phi=rad*LAT,d=toDays(date),n=Math.round(d-0.0009-lw/(2*Math.PI));
  var ds=0.0009+lw/(2*Math.PI)+n,M=solarM(ds),L=eclL(M),dec=decl(L);
  var Jnoon=J2000+ds+0.0053*Math.sin(M)-0.0069*Math.sin(2*L);
  var w=Math.acos((Math.sin(-0.833*rad)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec)));
  var a=0.0009+(w+lw)/(2*Math.PI)+n,Jset=J2000+a+0.0053*Math.sin(M)-0.0069*Math.sin(2*L);
  return {rise:fromJ(Jnoon-(Jset-Jnoon)),set:fromJ(Jset),noon:fromJ(Jnoon)};
}
function solAltura(date){
  var lw=rad*-LON,phi=rad*LAT,d=toDays(date),M=solarM(d),L=eclL(M),dec=decl(L),ra=rasc(L);
  var H=rad*(280.16+360.9856235*d)-lw-ra;
  return Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H))/rad;
}

/* ---- luna ---- */
function luna(date){
  var ph=((toJ(date)-2451550.1)/29.530588853)%1;if(ph<0)ph+=1;
  var ilum=(1-Math.cos(2*Math.PI*ph))/2,n;
  if(ph<0.03||ph>0.97)n="Luna nueva";else if(ph<0.22)n="Luna creciente";else if(ph<0.28)n="Cuarto creciente";else if(ph<0.47)n="Creciente gibosa";else if(ph<0.53)n="Luna llena";else if(ph<0.72)n="Menguante gibosa";else if(ph<0.78)n="Cuarto menguante";else n="Luna menguante";
  return {fase:ph,ilum:ilum,nombre:n};
}
function lunaSVG(ph,r,cx,cy){
  cx=cx||50;cy=cy||50;r=r||40;
  var k=Math.cos(2*Math.PI*ph),rx=Math.abs(k)*r,waxing=ph<0.5;
  var sweepOuter=waxing?1:0, sweepInner=(k>0)===waxing?0:1;
  var d="M"+cx+","+(cy-r)+" A"+r+","+r+" 0 0,"+sweepOuter+" "+cx+","+(cy+r)+" A"+rx+","+r+" 0 0,"+sweepInner+" "+cx+","+(cy-r)+" Z";
  if(ph<0.5){/* zona iluminada a la derecha */}
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#2E3550"/><path d="'+d+'" fill="#F1E9C9"/><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="rgba(255,255,255,.15)"/>';
}

/* ---- iconos del tiempo ---- */
var SOL='<circle cx="32" cy="32" r="12" fill="#FFD25A"/><g stroke="#FFD25A" stroke-width="4" stroke-linecap="round"><path d="M32 6v6M32 52v6M6 32h6M52 32h6M13.6 13.6l4.2 4.2M46.2 46.2l4.2 4.2M13.6 50.4l4.2-4.2M46.2 17.8l4.2-4.2"/></g>';
var LUNA='<path d="M40 10a22 22 0 1 0 14 34A18 18 0 0 1 40 10z" fill="#F1E9C9"/>';
var NUBE='<path d="M20 50h28a11 11 0 0 0 0-22 15 15 0 0 0-28-3 12 12 0 0 0 0 25z" fill="#fff"/>';
var NUBEG='<path d="M20 50h28a11 11 0 0 0 0-22 15 15 0 0 0-28-3 12 12 0 0 0 0 25z" fill="#D7DEE6"/>';
function icono(c,dia){
  var base=dia?SOL:LUNA;
  if(c===0)return base;
  if(c<=2)return '<g transform="translate(10,-8) scale(.75)">'+base+'</g>'+NUBE;
  if(c===3)return '<g transform="translate(-6,-6)">'+NUBEG+'</g>'+NUBE;
  if(c===45||c===48)return NUBEG+'<g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M14 56h36M20 62h26"/></g>';
  if(c>=95)return NUBEG+'<path d="M34 46l-8 10h7l-4 8 11-12h-7l4-6z" fill="#FFD25A"/>';
  if((c>=71&&c<=77)||c===85||c===86)return NUBE+'<g fill="#fff"><circle cx="24" cy="58" r="2.5"/><circle cx="34" cy="61" r="2.5"/><circle cx="44" cy="58" r="2.5"/></g>';
  return NUBEG+'<g stroke="#7FC0F0" stroke-width="3" stroke-linecap="round"><path d="M24 54l-3 7M34 54l-3 7M44 54l-3 7"/></g>';
}
function txtTiempo(c){
  var m={0:"Despejado",1:"Casi despejado",2:"Intervalos nubosos",3:"Nublado",45:"Niebla",48:"Niebla helada",51:"Llovizna débil",53:"Llovizna",55:"Llovizna intensa",56:"Llovizna helada",57:"Llovizna helada",61:"Lluvia débil",63:"Lluvia",65:"Lluvia fuerte",66:"Lluvia helada",67:"Lluvia helada",71:"Nieve débil",73:"Nieve",75:"Nieve fuerte",77:"Granizo fino",80:"Chubascos",81:"Chubascos",82:"Chubascos fuertes",85:"Chubascos de nieve",86:"Chubascos de nieve",95:"Tormenta",96:"Tormenta con granizo",99:"Tormenta con granizo"};
  return m[c]||"—";
}
function emoji(c,dia){if(c===0)return dia?"☀":"☾";if(c<=2)return "⛅";if(c===3||c===45||c===48)return "☁";if(c>=95)return "⛈";if(c>=71&&c<=86&&!(c>=80&&c<=82))return "❄";return "🌧"}
var DIAS=["dom","lun","mar","mié","jue","vie","sáb"];

/* ---- cielo del hero según el sol real ---- */
function pintaCielo(){
  var svg=$(".ft-hero svg");if(!svg)return;
  var now=new Date(),alt=solAltura(now),t=solTimes(now);
  var pal;
  if(alt>12)pal=["#3A7BB0","#9CC9E3","#F6E2B8"];
  else if(alt>2)pal=["#4C7FB0","#F2B880","#F7C98B"];
  else if(alt>-6)pal=["#3B4C7A","#C76F6A","#F2A65A"];
  else pal=["#0B1430","#1D2B55","#3A4A78"];
  ["c1","c2","c3"].forEach(function(id,i){var s=document.getElementById(id);if(s)s.setAttribute("stop-color",pal[i])});
  var noche=alt<=-6,astro=$("#astro"),disco=$("#disco"),est=$("#estrellas");
  if(est)est.setAttribute("opacity",noche?"1":(alt<2?".35":"0"));
  $$(".nube",svg).forEach(function(n){n.setAttribute("opacity",noche?".12":".75")});
  $$(".ventana",svg).forEach(function(v){v.setAttribute("fill",noche||alt<2?"#FFCB6B":"#5A4B3A")});
  if(astro){
    var x,y;
    if(!noche){var f=(now-t.rise)/(t.set-t.rise);f=Math.max(0,Math.min(1,f));x=160+f*1280;y=520-Math.sin(f*Math.PI)*390;}
    else{x=1240;y=200;}
    astro.setAttribute("transform","translate("+x.toFixed(0)+","+y.toFixed(0)+")");
    if(noche){var L=luna(now);astro.innerHTML='<circle r="120" fill="#F1E9C9" opacity=".08"/>'+lunaSVG(L.fase,40,0,0)}
    else if(disco){disco.setAttribute("fill",alt<6?"#FFC27A":"#FFF3CF")}
  }
}

/* ---- arco del sol y luna ---- */
function pintaSol(){
  var now=new Date(),t=solTimes(now);
  setT("sAmanece",fmtHora(t.rise));setT("sAnochece",fmtHora(t.set));
  var luz=(t.set-t.rise)/36e5;setT("sLuz",Math.floor(luz)+" h "+pad(Math.round((luz%1)*60))+" min");
  var f=Math.max(0,Math.min(1,(now-t.rise)/(t.set-t.rise))),p=$("#solPunto");
  if(p){var x=20+260*f,y=(1-f)*(1-f)*110+2*(1-f)*f*(-40)+f*f*110;p.setAttribute("cx",x.toFixed(1));p.setAttribute("cy",y.toFixed(1));if(now<t.rise||now>t.set)p.setAttribute("fill","#8E93A8")}
  var L=luna(now);setH("lunaSvg",lunaSVG(L.fase));setT("lunaFase",L.nombre);setT("lunaIlum",Math.round(L.ilum*100)+" % iluminada");
}

/* ---- reloj ---- */
function reloj(){var a=ahoraMadrid();var c=$("#chipHora b");if(c)c.textContent=pad(a.h)+":"+pad(a.mi)}

/* ---- fiestas ---- */
function pascua(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e2=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e2+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
function sabadoN(y,mes,n){var d=new Date(y,mes,1);while(d.getDay()!==6)d.setDate(d.getDate()+1);d.setDate(d.getDate()+7*(n-1));return d}
function add(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function fiestasDe(y){
  var sab=sabadoN(y,7,1);
  return [{n:"Fiestas de la Santa Cruz",d:add(sab,-1),fin:sab,t:"Misa, procesión, música, juegos y paella popular."}];
}
function fmtF(d){return d.toLocaleDateString("es-ES",{day:"numeric",month:"long"})}
function proxima(){
  var now=new Date(),y=now.getFullYear(),all=fiestasDe(y).concat(fiestasDe(y+1));
  for(var i=0;i<all.length;i++){var f=all[i],fin=f.fin?add(f.fin,1):add(f.d,1);if(!f.aprox&&fin>now)return f}
}
function pintaFiestas(){
  var p=proxima(),cal=$("#calFiestas"),now=new Date();
  if(cal){
    var y=now.getFullYear(),list=fiestasDe(y).map(function(f){var fin=f.fin?add(f.fin,1):add(f.d,1);return fin<now?fiestasDe(y+1).filter(function(g){return g.n===f.n})[0]:f});
    list.sort(function(a,b){return a.d-b.d});
    cal.innerHTML=list.map(function(f){
      var cuando=f.aprox?(f.n==="Carnaval"?"Febrero o marzo":f.n==="Semana Cultural"?"Finales de julio":"Segunda semana de agosto"):(f.fin?fmtF(f.d)+" – "+fmtF(f.fin):fmtF(f.d));
      var esP=p&&f.n===p.n;
      return '<div class="fi rv vis'+(esP?" prox":"")+'"><div class="f">'+cuando+'<small>'+f.d.getFullYear()+'</small></div><h4>'+(f.star?"★ ":"")+f.n+'</h4><p>'+f.t+'</p></div>';
    }).join("");
  }
  if(!p)return;
  setT("fNombre",p.n);setT("fFecha",(p.fin?fmtF(p.d)+" – "+fmtF(p.fin):fmtF(p.d))+" de "+p.d.getFullYear()+" · "+p.t);
  var ch=$("#chipFiesta b");
  function tick(){
    var ms=p.d-new Date();
    if(ms<0){if(ch){ch.textContent="¡Hoy es "+p.n+"!";ch.classList.remove("sk")}setH("fCuenta",'<div style="min-width:auto;padding:12px 18px"><b>¡Es hoy!</b></div>');return}
    var dd=Math.floor(ms/864e5),hh=Math.floor(ms/36e5)%24,mm=Math.floor(ms/6e4)%60,ss=Math.floor(ms/1e3)%60;
    setH("fCuenta",'<div><b>'+dd+'</b><span>días</span></div><div><b>'+pad(hh)+'</b><span>horas</span></div><div><b>'+pad(mm)+'</b><span>min</span></div><div><b>'+pad(ss)+'</b><span>seg</span></div>');
    if(ch){ch.textContent=p.n+" en "+dd+" días";ch.classList.remove("sk")}
  }
  tick();setInterval(tick,1000);
}

/* ---- el tiempo (Open-Meteo, gratis y sin clave) ---- */
function pintaTiempo(){
  var need=$("#tTemp")||$(".ft-tiempo-full")||$("#chipTemp");if(!need)return;
  var u="https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LON+"&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day,precipitation&hourly=temperature_2m,weather_code,precipitation_probability,is_day,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max&timezone="+encodeURIComponent(TZ)+"&forecast_days=7";
  fetch(u).then(function(r){return r.json()}).then(function(w){
    var c=w.current,dia=c.is_day===1,code=c.weather_code;
    var tc=$("#chipTemp");if(tc)tc.innerHTML=emoji(code,dia)+' <b>'+Math.round(c.temperature_2m)+'°</b> '+txtTiempo(code).toLowerCase();
    var tt=$("#tTemp");if(tt)tt.innerHTML=Math.round(c.temperature_2m)+"<sup>°C</sup>";
    setT("tEstado",txtTiempo(code));
    setH("tIco",icono(code,dia));
    setH("tMini","<span>Sensación "+Math.round(c.apparent_temperature)+"°</span><span>Humedad "+c.relative_humidity_2m+" %</span><span>Viento "+Math.round(c.wind_speed_10m)+" km/h</span>");
    var D=w.daily,h="";
    for(var i=1;i<6&&i<D.time.length;i++){var dt=new Date(D.time[i]+"T12:00");h+='<div>'+DIAS[dt.getDay()]+'<svg viewBox="0 0 64 64">'+icono(D.weather_code[i],true)+'</svg><b>'+Math.round(D.temperature_2m_max[i])+'°</b>'+Math.round(D.temperature_2m_min[i])+'°</div>'}
    setH("tDias",h);
    var uv=D.uv_index_max[0];
    if($("#aUv")){setT("aUv",uv.toFixed(1));$("#aUvM").style.left=Math.min(100,uv/11*100)+"%";setT("aUvTxt",uv<3?"Bajo":uv<6?"Moderado":uv<8?"Alto":uv<11?"Muy alto":"Extremo")}
    if(window.ftEstrellas)window.ftEstrellas(w,luna(new Date()));var alt=$("#altitud");if(alt&&w.elevation)alt.textContent=Math.round(w.elevation)+" m";
    var full=$(".ft-tiempo-full");
    if(full){
      var hd='<h2>Próximos 7 días</h2><div class="tz-dias">';
      for(var j=0;j<D.time.length;j++){var dj=new Date(D.time[j]+"T12:00");hd+='<div class="tz-dia"><div>'+(j===0?"Hoy":DIAS[dj.getDay()]+" "+dj.getDate())+'</div><svg viewBox="0 0 64 64">'+icono(D.weather_code[j],true)+'</svg><b>'+Math.round(D.temperature_2m_max[j])+'°</b> <span class="min">'+Math.round(D.temperature_2m_min[j])+'°</span><div class="ll">💧 '+(D.precipitation_probability_max[j]||0)+' %</div><div style="font-size:12px;color:var(--suave)">'+txtTiempo(D.weather_code[j])+'</div></div>'}
      hd+='</div><h2>Hora a hora</h2><div class="tz-horas">';
      var H=w.hourly,nowISO=new Date().toLocaleString("sv-SE",{timeZone:TZ}).slice(0,13),k0=0;
      for(var k=0;k<H.time.length;k++){if(H.time[k].slice(0,13)>=nowISO){k0=k;break}}
      for(var q=k0;q<k0+24&&q<H.time.length;q++){hd+='<div class="tz-h">'+H.time[q].slice(11,16)+'<svg viewBox="0 0 64 64">'+icono(H.weather_code[q],H.is_day[q]===1)+'</svg><b>'+Math.round(H.temperature_2m[q])+'°</b><span style="color:var(--cielo);font-size:12px">'+(H.precipitation_probability[q]||0)+'%</span></div>'}
      hd+='</div><p style="font-size:13px;color:var(--suave)">Datos de <a href="https://open-meteo.com/" rel="nofollow noopener" target="_blank">Open-Meteo</a>, actualizados cada hora. Previsión orientativa.</p>';
      full.innerHTML=hd;
    }
  }).catch(function(){setT("tEstado","No se pudo cargar el tiempo");var tc=$("#chipTemp");if(tc)tc.style.display="none"});
  if($("#aIca")){
    fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude="+LAT+"&longitude="+LON+"&current=european_aqi&timezone="+encodeURIComponent(TZ)).then(function(r){return r.json()}).then(function(a){
      var v=a.current.european_aqi;setT("aIca",Math.round(v));$("#aIcaM").style.left=Math.min(100,v/100*100)+"%";
      setT("aIcaTxt",v<=20?"Muy buena":v<=40?"Buena":v<=60?"Moderada":v<=80?"Mala":v<=100?"Muy mala":"Pésima");
    }).catch(function(){});
  }
}

/* ---- noticias: ocultar si no hay ---- */
var nb=$(".ft-blog-home");if(nb&&!nb.querySelector(".noti")){var ns=$("#noticias");if(ns)ns.style.display="none";nb.style.display="none"}

/* ---- arranque ---- */
window.ftEstrellas=function(w,L){var el=document.getElementById("estrellas-blk");if(!el)return;var H=w.hourly,hoy=new Date().toLocaleString("sv-SE",{timeZone:TZ}).slice(0,10),nubes=[];for(var i=0;i<H.time.length;i++){var t=H.time[i],h=+t.slice(11,13),d=t.slice(0,10);if((d===hoy&&h>=22)||(d>hoy&&h<=3&&nubes.length<6&&nubes.length>=0&&d<=new Date(Date.now()+864e5).toLocaleString("sv-SE",{timeZone:TZ}).slice(0,10)))nubes.push(H.cloud_cover[i])}var c=nubes.length?nubes.reduce(function(a,b){return a+b},0)/nubes.length:50;var nota=Math.max(0,Math.round(10-c/12-L.ilum*4));var txt=nota>=8?"Noche ideal para ver estrellas":nota>=5?"Buena noche, con algo de luna o nubes":nota>=3?"Regular: se verán las más brillantes":"Mala noche para mirar el cielo";setT("eNota",nota+"/10");setT("eTxt",txt);setT("eNubes",Math.round(c)+" %");setT("eLuna",Math.round(L.ilum*100)+" %")};
(function(){var el=document.getElementById("parajes");if(!el)return;var P=[["Las Cabañas",37.5106,-4.1213],["Las Pozuelas",37.5182,-4.1150],["Cerro de la Cabeza",37.5080,-4.1296],["Las Salinas",37.5201,-4.1229],["Los Barrancos del Tejar",37.5246,-4.1199],["Cerro de los Yesos",37.5055,-4.0860],["Pozo del Cura",37.5023,-4.1301],["Fuente-Tójar (pueblo)",37.5107,-4.1459]];var R=["norte","noreste","este","sureste","sur","suroeste","oeste","noroeste"];el.innerHTML=P.map(function(p){var dy=(p[1]-LAT)*111.2,dx=(p[2]-LON)*111.2*Math.cos(LAT*rad),d=Math.sqrt(dx*dx+dy*dy),ang=(Math.atan2(dx,dy)/rad+360)%360;return [d,'<div>'+p[0]+' <span style="color:var(--suave);font-weight:600;font-size:13px">al '+R[Math.round(ang/45)%8]+'</span><b>'+d.toFixed(1).replace(".",",")+' km</b></div>']}).sort(function(a,b){return a[0]-b[0]}).map(function(x){return x[1]}).join("")})();
/* ---- contador de visitas (abacus) ---- */
(function(){var el=document.getElementById("ftVisitas");if(!el)return;var NS="lacubertilla-github-io",nueva=true;try{nueva=!sessionStorage.getItem("ftv");sessionStorage.setItem("ftv","1")}catch(e){}
fetch("https://abacus.jasoncameron.dev/"+(nueva?"hit":"get")+"/"+NS+"/visitas").then(function(r){return r.json()}).then(function(j){if(typeof j.value==="number"){document.getElementById("ftVisitasN").textContent=j.value.toLocaleString("es-ES");el.hidden=false}}).catch(function(){})})();
pintaCielo();pintaSol();reloj();pintaFiestas();pintaTiempo();
setInterval(reloj,15000);setInterval(pintaCielo,300000);setInterval(pintaSol,300000);
var y=$("#anyo");if(y)y.textContent=new Date().getFullYear();
})();
