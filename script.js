const CONFIG = window.WEDDING_CONFIG;
const $ = (id) => document.getElementById(id);

const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxNt4IbGwszcwIVpXuWSvuMy0Fff0c3xIaZ04CxnuCJi1ldtu7kfqJWMTcXsGVTYi0fVQ/exec";

let invitedGuests = [];
let invitadoActual = null;

async function llamarServidor(datos){

    const respuesta = await fetch(SCRIPT_URL,{
        method:"POST",
        body:JSON.stringify(datos)
    });

    return await respuesta.json();

}

function joinNames(names){
    return names.join("<br>");
}

async function cargarInvitacion(){

    const id = new URLSearchParams(window.location.search).get("id");

    if(!id){
        alert("Invitación no válida.");
        return;
    }

    const respuesta = await llamarServidor({
        accion:"buscarInvitado",
        id:id
    });

    if(!respuesta.ok){
        alert("Invitación no encontrada.");
        return;
    }

    invitadoActual = respuesta.invitado;
    invitedGuests = respuesta.invitado.personas || [respuesta.invitado.nombre];

    fillPage();
    buildGuestChecklist();
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
  const names = invitedGuests;
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

$("rsvpForm").addEventListener("submit", async event => {

  event.preventDefault();

  const selected = [...document.querySelectorAll('input[name="confirmedGuest"]:checked')].map(el => el.value);
  const none = $("noneAttending").checked;

  if (!selected.length && !none) {
    alert("Marca quiénes asistirán o selecciona que ninguna persona podrá asistir.");
    return;
  }

  const invited = invitedGuests.length ? joinNames(invitedGuests) : "Invitación sin personalizar";

  const diet = $("diet").value.trim() || "Ninguna";
  const message = $("message").value.trim() || "Sin mensaje adicional";

  const text = [
    `Hola, queremos confirmar nuestra asistencia a la boda civil de ${CONFIG.couple.replace("&","y")}.`,
    "",
    `Invitación para: ${invited}`,
    none ? "Confirmación: No podremos asistir." : `Asistirán: ${joinNames(selected)}.`,
    `Restricciones alimenticias: ${diet}`,
    `Mensaje: ${message}`
  ].join("\n");

  await llamarServidor({

  accion: "confirmarAsistencia",

  id: invitadoActual.id,

  asistira: !none,

  restricciones: diet,

  mensaje: message

});

const whatsappUrl =
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
  
$("thanksDialog").showModal();

$("openWhatsapp").onclick = () => {

  window.open(
    whatsappUrl,
    "_blank",
    "noopener"
  );

  $("thanksDialog").close();
  $("rsvpDialog").close();

};

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

setupBank();
cargarInvitacion();
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));