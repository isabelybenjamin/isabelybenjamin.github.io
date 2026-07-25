const boton = document.getElementById("generar");
const textarea = document.getElementById("nombres");
const resultado = document.getElementById("resultado");

const urlBase = "index.html?invitados=";

boton.addEventListener("click", function () {

    resultado.innerHTML = "";

    const familias = textarea.value
        .trim()
        .split("\n\n");

    familias.forEach(function (familia) {

        const nombres = familia
            .split("\n")
            .map(nombre => nombre.trim())
            .filter(nombre => nombre !== "");

        const enlace = urlBase + nombres
            .map(nombre => encodeURIComponent(nombre))
            .join("|");

        resultado.innerHTML += `
    <div class="familia">

        <pre>${familia}</pre>

        <div class="linea"></div>

        <div class="enlace">
    ${enlace}
</div>

        <button class="copiar" data-enlace="${enlace}">
            📋 Copiar enlace
        </button>

    </div>
`;
    });

    const botonesCopiar = document.querySelectorAll(".copiar");

    botonesCopiar.forEach(function (botonCopiar) {

        botonCopiar.addEventListener("click", function () {

            navigator.clipboard.writeText(
                botonCopiar.dataset.enlace
            );

            botonCopiar.innerHTML = "✅ Enlace copiado";

            setTimeout(function () {

               botonCopiar.innerHTML = "📋 Copiar enlace";

            }, 1500);

        });

    });

});