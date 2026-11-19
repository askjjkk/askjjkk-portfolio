(function livePreview(){
const scans = {
  alternator: {
    id:"e94842c63e6b4557a20f5751779c7e7f",
    title:"Автомобильный генератор",
    source:"https://sketchfab.com/3d-models/alternator-e94842c63e6b4557a20f5751779c7e7f",
    detail:"Вращайте скан и рассмотрите шкив, форму корпуса и крепления."
  },
  starter: {
    id:"b48fdd43679545de846a3ea3e0f58981",
    title:"Автомобильный стартер",
    source:"https://sketchfab.com/3d-models/starter-photogrammetry-b48fdd43679545de846a3ea3e0f58981",
    detail:"Поверните стартер, чтобы увидеть корпус, выводы и втягивающее реле."
  }
};
const panel = document.querySelector("#scan-viewer");
const figure = document.querySelector("#viewer");
const poster = document.querySelector("#scan-poster");
const caption = document.querySelector("#scan-title");
const loading = document.querySelector("#scan-status");
const dock = document.querySelector(".scan-dock");
const close = document.querySelector("#close-scan");
const change = document.querySelector("#scan-change");
const buttons = [...document.querySelectorAll("[data-scan-part]")];
const source = document.querySelector(".scan-source");
const stagePhoto = document.querySelector(".scan-stage img");
const stageCaption = document.querySelector(".scan-stage figcaption");
const statusText = document.querySelector(".scan-detail-copy");
const inspectTitle = document.querySelector(".scan-note h3");
const media = matchMedia("(prefers-reduced-motion: reduce)");
let selected = "alternator";
let waiting;
let opener;
let sdk;
let scanApi;
const tools = document.querySelector(".scan-tools");
function getSDK() {
  if (!sdk) {
    sdk = new Promise((resolve,reject)=>{
      const script = document.createElement("script");
      script.src = new URL("./vendor/sketchfab-viewer-1.12.1.js",import.meta.url);
      script.onload = ()=>window.Sketchfab ? resolve(window.Sketchfab) : reject(Error("SDK недоступен"));
      script.onerror = ()=>{script.remove();reject(Error("SDK недоступен"));};
      document.head.append(script);
    }).catch(error=>{sdk=undefined;throw error;});
  }
  return sdk;
}
function select(part) {
  selected = part;
  const scan = scans[part];
  for (const button of buttons) button.setAttribute("aria-pressed",String(button.dataset.scanPart===part));
  source.href = scan.source;
  source.textContent = part==="starter" ? "Источник скана стартера" : "Источник скана генератора";
  inspectTitle.textContent = scan.title;
  statusText.textContent = scan.detail;
  change.textContent = part==="starter"?"Генератор":"Стартер";
  stagePhoto.src = new URL(`./assets/real/${part}.webp`,import.meta.url);
  stagePhoto.alt = part==="starter"?"Фотография стартера с втягивающим реле":"Фотография генератора в моторном отсеке";
  stageCaption.textContent = part==="starter"?"Стартер и втягивающее реле":"Шкив и корпус генератора";
}
function reveal(frame) {
  if (!panel.contains(frame)) return;
  clearTimeout(waiting);
  loading.textContent = "";
  panel.classList.add("is-ready");
  tools.hidden = false;
  caption.hidden = true;
}
async function open(button) {
  opener = button;
  scanApi = undefined;
  tools.hidden = true;
  clearTimeout(waiting);
  const model = scans[selected];
  const frame = document.createElement("iframe");
  frame.title = "3D-скан · " + model.title;
  frame.allow = "autoplay; fullscreen";
  frame.allowFullscreen = true;
  frame.referrerPolicy = "no-referrer";
  panel.classList.remove("is-ready");
  panel.replaceChildren(frame);
  panel.hidden = false;
  dock.hidden = false;
  poster.hidden = false;
  caption.hidden = true;
  loading.textContent = "Загружается 3D-скан…";
  const fallback = ()=>{
    if (panel.contains(frame)) loading.textContent = "Скан не открылся. Можно посмотреть его у автора по ссылке под осмотром.";
  };
  waiting = setTimeout(()=>{
    if (panel.contains(frame)) loading.textContent = "Скан ещё загружается. Можно вернуться к фото или открыть скан у автора.";
  },15000);
  figure.scrollIntoView({block:"nearest",behavior:media.matches?"instant":"smooth"});
  close.focus({preventScroll:true});
  try {
    const Sketchfab = await getSDK();
    if (!panel.contains(frame)) return;
    const viewer = new Sketchfab("1.12.1",frame);
    viewer.init(model.id,{
      autostart:1,autospin:media.matches?0:.14,ui_infos:0,ui_stop:0,ui_hint:0,dnt:1,
      error:fallback,
      success:api=>{
        if (!panel.contains(frame)) return;
        api.addEventListener("viewerready",()=>{
          if (!panel.contains(frame)) return;
          scanApi = api;
          api.setBackground({color:[.07,.11,.13]},()=>reveal(frame));
          // Some embeds only signal viewerready. Keep inspection usable in that case.
          setTimeout(()=>reveal(frame),850);
        });
        api.start();
      }
    });
  } catch { fallback(); }
}
function showPhoto() {
  scanApi = undefined;
  tools.hidden = true;
  clearTimeout(waiting);
  panel.replaceChildren();
  panel.classList.remove("is-ready");
  panel.hidden = true;
  dock.hidden = true;
  poster.hidden = false;
  caption.hidden = false;
  loading.textContent = "";
  if (opener?.isConnected) opener.focus();
}
for (const button of buttons) button.addEventListener("click",()=>{
  if (selected===button.dataset.scanPart) return;
  select(button.dataset.scanPart);
  if (!panel.hidden) open(opener || button);
});
for (const link of document.querySelectorAll("[data-open-scan]")) {
  link.addEventListener("click",event=>{event.preventDefault();open(link);});
}
change.addEventListener("click",()=>{
  select(selected==="starter"?"alternator":"starter");
  open(opener);
});
close.addEventListener("click",showPhoto);
for (const button of tools.querySelectorAll("[data-scan-view]")) {
  button.addEventListener("click",()=>{
    const api = scanApi;
    if (!api) return;
    api.getCameraLookAt((error,camera)=>{
      if (error || !camera || scanApi!==api) return;
      const {position,target} = camera;
      const [x,y,z] = position.map((value,i)=>value-target[i]);
      const direction = button.dataset.scanView;
      let delta;
      if (direction==="left" || direction==="right") {
        const angle = direction==="left" ? .30 : -.30;
        delta = [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle),z];
      } else {
        const factor = direction==="in" ? .84 : 1.19;
        delta = [x*factor,y*factor,z*factor];
      }
      api.setCameraLookAt(delta.map((value,i)=>target[i]+value),target,media.matches?0:.24);
    });
  });
}
select(selected);
})();
