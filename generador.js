const boton = document.getElementById("generar");
const textarea = document.getElementById("nombres");
const resultado = document.getElementById("resultado");

const urlBase = "https://isabelybenjamin.github.io/?id=";

const scriptURL =
    "https://script.google.com/macros/s/AKfycbxNt4IbGwszcwIVpXuWSvuMy0Fff0c3xIaZ04CxnuCJi1ldtu7kfqJWMTcXsGVTYi0fVQ/exec";

/* ===========================
   Generar ID
=========================== */

function generarID(longitud = 10) {

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let id = "";

    while (id.length < longitud) {

        id += caracteres[
            Math.floor(
                Math.random() * caracteres.length
            )
        ];

    }

    return id;

}

/* ===========================
   Separar familias
=========================== */

function obtenerFamilias(texto) {

    return texto
        .trim()
        .split(/\n\s*\n/)
        .map(familia =>
            familia
                .split("\n")
                .map(nombre => nombre.trim())
                .filter(Boolean)
        )
        .filter(f => f.length);

}

/* ===========================
   Guardar invitación
=========================== */

async function guardarInvitacion(id, nombres) {

    const respuesta = await fetch(scriptURL, {

        method: "POST",

        body: JSON.stringify({

            accion: "crearInvitado",

            id: id,

            nombre: nombres.join("\n"),

            link: urlBase + id

        })

    });

    return await respuesta.json();

}

/* ===========================
   Pintar resultado
=========================== */

function crearTarjeta(id, nombres) {

    const div = document.createElement("div");

    div.className = "familia";

    const enlace = urlBase + id;

    div.innerHTML = `

<pre>${nombres.join("\n")}</pre>

<div class="linea"></div>

<div class="enlace">

${enlace}

</div>

<button class="copiar">

Copiar enlace

</button>

`;

    div.querySelector(".copiar")
        .addEventListener("click", () => {

            navigator.clipboard.writeText(enlace);

            alert("Enlace copiado.");

        });

    resultado.appendChild(div);

}

/* ===========================
   Generar
=========================== */

boton.addEventListener("click", async () => {

    resultado.innerHTML = "";

    const familias =
        obtenerFamilias(textarea.value);

    if (!familias.length) {

        alert("Escribe al menos una familia.");

        return;

    }

    for (const familia of familias) {

        const id = generarID();

        const respuesta =
            await guardarInvitacion(id, familia);

        if (!respuesta.ok) {

            alert(respuesta.mensaje);

            continue;

        }

        crearTarjeta(id, familia);

    }

});