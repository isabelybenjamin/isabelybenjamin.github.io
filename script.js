const CONFIG = window.WEDDING_CONFIG;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const invitedGuests = (params.get("invitados") || "")
  .split("|").map(v => v.trim()).filter(Boolean).slice(0, 12);

function joinNames(names){
    return names.join("<br>");
}

function fillPage(){
  $("eventDateShort").textContent = CONFIG.eventDateShort;
  $("deadline").textContent = CONFIG.confirmationDeadline;
  $("eventDateLong").textContent = CONFIG.eventDateLong;
  $("eventTime").textContent = CONFIG.eventTime;
  $("venue").textContent = CONFIG.venue;
  $("dressCode").textContent = CONFIG.adultsOnly ? `${CONFIG.dressCode} · Evento exclusivo para adultos` : CONFIG.dressCode;
  $("mapsButton").href = CONFIG.mapsUrl;
  if(invitedGuests.length) $("guestNames").innerHTML = joinNames(invitedGuests);
  else $("guestNames").textContent = "Nuestros invitados";
}

function buildGuestChecklist(){
  const fieldset = $("guestChecklist");
  fieldset.querySelectorAll("label").forEach(el => el.remove());
  const names = invitedGuests.length ? invitedGuests : ["Persona invitada"];
  names.forEach((name,index)=>{
    const label=document.createElement("label");
    label.className="check-row";
    const input=document.createElement("input");
    input.type="checkbox"; input.name="confirmedGuest"; input.value=name; input.id=`guest-${index}`;
    const span=document.createElement("span"); span.textContent=name;
    label.append(input,span); fieldset.appendChild(label);
  });
  const none=document.createElement("label"); none.className="check-row none-row";
  none.innerHTML='<input type="checkbox" id="noneAttending"><span>Ninguna de las personas invitadas podrá asistir</span>';
  fieldset.appendChild(none);
  const noneBox=$("noneAttending");
  const boxes=[...document.querySelectorAll('input[name="confirmedGuest"]')];
  noneBox.addEventListener("change",()=>{
    boxes.forEach(box=>{ if(noneBox.checked) box.checked=false; box.disabled=noneBox.checked; });
  });
  boxes.forEach(box=>box.addEventListener("change",()=>{if(box.checked) noneBox.checked=false;}));
}

function openDialog(id){$(id).showModal()}
document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>$(btn.dataset.close).close()));
document.querySelectorAll("dialog").forEach(dialog=>dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()}));
$("rsvpButton").addEventListener("click",()=>openDialog("rsvpDialog"));
$("giftButton").addEventListener("click",()=>openDialog("giftDialog"));

$("rsvpForm").addEventListener("submit",event=>{
  event.preventDefault();
  const selected=[...document.querySelectorAll('input[name="confirmedGuest"]:checked')].map(el=>el.value);
  const none=$("noneAttending").checked;
  if(!selected.length && !none){alert("Marca quiénes asistirán o selecciona que ninguna persona podrá asistir.");return;}
  const invited = invitedGuests.length ? joinNames(invitedGuests) : "Invitación sin personalizar";
  const diet=$("diet").value.trim()||"Ninguna";
  const message=$("message").value.trim()||"Sin mensaje adicional";
  const text=[
    `Hola, queremos confirmar nuestra asistencia a la boda civil de ${CONFIG.couple.replace("&","y")}.`,"",
    `Invitación para: ${invited}`,
    none ? "Confirmación: No podremos asistir." : `Asistirán: ${joinNames(selected)}.`,
    `Restricciones alimenticias: ${diet}`,
    `Mensaje: ${message}`
  ].join("\n");
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`,"_blank","noopener");
});

function setupBank(){
  const complete=CONFIG.bank && CONFIG.clabe && CONFIG.accountHolder;
  if(!complete) return;
  $("giftIntro").textContent="Si desean tener un detalle con nosotros, compartimos los siguientes datos:";
  $("bankDetails").hidden=false;
  $("bankName").textContent=CONFIG.bank;
  $("clabeValue").textContent=CONFIG.clabe;
  $("holderName").textContent=CONFIG.accountHolder;
  $("copyClabe").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(CONFIG.clabe);$("copyStatus").textContent="CLABE copiada correctamente."}
    catch{$("copyStatus").textContent=`Copia manualmente esta CLABE: ${CONFIG.clabe}`}
  });
}

$("calendarButton").addEventListener("click",()=>{
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Invitacion Isabel y Benjamin//ES","BEGIN:VEVENT",
    "UID:isabel-benjamin-20260829@invitacion.local",`DTSTART:${CONFIG.calendarStartUtc}`,`DTEND:${CONFIG.calendarEndUtc}`,
    `SUMMARY:Boda civil de ${CONFIG.couple}`,`LOCATION:${CONFIG.venue}`,
    `DESCRIPTION:${CONFIG.dressCode}. Confirmar antes del ${CONFIG.confirmationDeadline}.`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  const url=URL.createObjectURL(new Blob([ics],{type:"text/calendar;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="boda-isabel-benjamin.ics";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
});

fillPage();buildGuestChecklist();setupBank();
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

