const canvas = document.getElementById("lienzo");

canvas.style.width = 100 + '%';
canvas.style.height = 100 * 9 / 16 + '%';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
ctx.translate(canvas.width / 2, canvas.height / 2); // Centrar el canvas

var scale = 400; // Escala de la órbita
let orbitRadius = 400; // Radio de la órbita

let rotationAngle = 0; // Ángulo de rotación de la órbita
let orbitInclination = 0; // Ángulo de inclinación de la órbita (basado en mouseY)

let isMouseDown = false; // Variable para verificar si el mouse está presionado
let pointPosition = 0; // Posición del punto amarillo a lo largo de la órbita

// Escuchamos el evento mousedown para saber cuándo se hace clic
document.body.addEventListener('mousedown', () => {
    isMouseDown = true; // Cuando el mouse se presiona, activamos el movimiento
});

// Escuchamos el evento mouseup para saber cuándo se suelta el clic
document.body.addEventListener('mouseup', () => {
    isMouseDown = false; // Cuando el mouse se suelta, desactivamos el movimiento
});

// Escuchamos el movimiento del mouse
canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        // Calculamos la posición X del mouse en relación al centro del lienzo
        let mouseX = event.clientX;

        // Mapeamos el mouseX de manera que el movimiento de izquierda a derecha haga que el círculo gire de 360 a 0 grados
        pointPosition = -(canvas.width - mouseX) / canvas.width * 2 * Math.PI; // Mapeo invertido
        console.log("Posición del punto:", -pointPosition);

        // Calculamos la inclinación de la órbita basado en el movimiento del mouseY
        orbitInclination = Math.PI / 2 - 0.3; // Fijamos la inclinación para que sea constante

        // Cada vez que el mouse se mueve, dibujamos la órbita con el ángulo actualizado
        drawOrbit();
    }
});

function drawOrbit() {
    let startAngle = -0.91; // Ángulo de inicio (en radianes)
    let endAngle = Math.PI + 1.01; // Ángulo final (en radianes)

    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height); // Limpiamos el canvas

    // Aseguramos que startAngle sea menor que endAngle
    if (startAngle > endAngle) {
        [startAngle, endAngle] = [endAngle, startAngle]; // Intercambiamos si es necesario
    }

    // Número de puntos en la órbita
    const numPoints = 50;
    const angleStep = (endAngle - startAngle) / numPoints; // El ángulo de separación de cada punto basado en el rango

    ctx.beginPath(); // Comenzamos a dibujar las líneas

    // Dibujamos las líneas de la órbita
    for (let i = 0; i < numPoints; i++) {
        let angle = startAngle + i * angleStep; // El ángulo actual de la órbita

        // Calculamos la posición (x, y) de los puntos sobre la órbita
        let x = orbitRadius * Math.cos(angle);
        let y = orbitRadius * Math.sin(angle);

        // Aplicamos la proyección para simular la elipse
        let scaleY = Math.cos(orbitInclination); // Escala en Y para simular el ángulo de inclinación

        // Dibujamos las líneas que unen los puntos consecutivos de la órbita
        if (i === 0) {
            ctx.moveTo(x, y * scaleY); // Comenzamos el camino
        } else {
            ctx.lineTo(x, y * scaleY); // Conectamos los puntos
        }
    }

    ctx.strokeStyle = "white"; // Establecemos el color de las líneas
    ctx.lineWidth = 2; // Ajustamos el grosor de las líneas
    ctx.stroke(); // Dibujamos las líneas

    // Dibuja el punto amarillo sobre la órbita si está dentro del rango
    drawPointOnOrbit(pointPosition, startAngle, endAngle);
    // Dibuja la brújula en el centro
    drawCompass();
}

// Función para dibujar el punto amarillo que se mueve por la órbita
function drawPointOnOrbit(position, startAngle, endAngle) {
    let x = orbitRadius * Math.cos(position); // Calculamos la posición X del punto
    let y = orbitRadius * Math.sin(position); // Calculamos la posición Y del punto

    // Aplicamos la inclinación en Y
    let scaleY = Math.cos(orbitInclination); // Escala en Y para simular el ángulo de inclinación
    y *= scaleY; // Aplicamos la escala de Y

    // Verificamos si el punto está dentro del rango de la órbita
    visible = -position < 0.91 || -position > 2.25; // Verificamos si el punto está dentro del rango de la órbita
    console.log("Visible: ", -position >= startAngle, "Start Angle: ", startAngle, "End Angle: ", endAngle);
    if (visible) {
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI); // Dibujamos un círculo grande para el punto amarillo
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.strokeStyle = "black"; // Dibujamos el borde en negro para hacer el punto visible
        ctx.stroke();
    }
}

// Función para dibujar una flecha en una dirección específica
// Función para dibujar una flecha entre dos puntos
function drawArrow(x1, y1, x2, y2) {
    const arrowWidth = 10;  // Ancho de la punta de la flecha
    const headLength = 15;  // Longitud de la cabeza de la flecha

    // Dirección de la flecha (calculamos el ángulo entre los puntos)
    const angle = Math.atan2(y2 - y1, x2 - x1); // Ángulo entre el origen y el destino

    // Dibujamos el cuerpo de la flecha
    ctx.beginPath();
    ctx.moveTo(x1, y1); // Desde el origen
    ctx.lineTo(x2, y2); // Hasta el destino
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujamos la punta de la flecha (un triángulo)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
}

// Función para dibujar la brújula con flechas que comienzan en el origen
function drawCompass() {
    const compassRadius = window.innerHeight / 2 - 40; // Radio de la brújula

    // Dibujamos el círculo de la brújula
    ctx.beginPath();
    ctx.arc(0, 0, compassRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujamos las letras N, S, E, O (Norte, Sur, Este, Oeste)
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", 0, -compassRadius - 20); // Norte en la parte superior
    ctx.fillText("S", 0, compassRadius + 20); // Sur en la parte inferior
    ctx.fillText("E", compassRadius + 20, 0); // Este a la derecha
    ctx.fillText("O", -compassRadius - 20, 0); // Oeste a la izquierda

    // Dibujamos las flechas, todas comienzan desde el origen (0, 0)
    const arrowLength = 40;  // Longitud de la flecha
    const arrowWidth = 10;   // Ancho de la punta de la flecha

    // Flecha hacia el norte
    drawArrow(0, 0, 0, -compassRadius);  // Flecha hacia arriba (Norte)

    // Flecha hacia el sur
    drawArrow(0, 0, 0, compassRadius);   // Flecha hacia abajo (Sur)

    // Flecha hacia el este
    drawArrow(0, 0, compassRadius , 0);   // Flecha hacia la derecha (Este)

    // Flecha hacia el oeste
    drawArrow(0, 0, -compassRadius, 0);  // Flecha hacia la izquierda (Oeste)
}
