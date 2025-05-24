const canvas = document.getElementById("lienzo");

canvas.style.width = 100 + '%';
canvas.style.height = 100 * 9 / 16 + '%';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
ctx.translate(canvas.width / 2, canvas.height / 2);

var scale = 400;
let v = Math.random() / 10 - Math.random() / 10;
const cubo1 = new Cubo(1000, 0, 4, 0, -0.01, 0);
const cubo2 = new Cubo(-1000, 0, 4, 0, 0.01, 0);
const cubo3 = new Cubo(0, 0, 3, 0, v, 0);
cubo3.draw();

let isMouseDown = false; // Variable para verificar si el mouse está presionado

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
        let mouseX = event.clientX - canvas.width / 2;

        // Calculamos el ángulo basado en la posición del mouse (de 0 a 360 grados)
        rotationY = (mouseX / (canvas.width / 2)) * 180; // De -180 a 180
        rotationY = (rotationY + 180) % 360; // Aseguramos que esté entre 0 y 360

        // Cada vez que el mouse se mueve, dibujamos el cubo con la nueva rotación
        drawCubo();
    }
});

// Función que dibuja el cubo con la rotación actual
function drawCubo() {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    // Actualizamos la rotación con el ángulo calculado por el mouse
    alphay = (rotationY * Math.PI) / 180; // Convertimos a radianes

    cubo3.rotate(0, alphay, 0); // Aplicamos la rotación
}

//Clase Circulo
function Circle(x, y, z, r, c, z0) {
    this.vector = [[x], [y], [z]];
    this.initial_vector = [[x], [y], [z]];
    this.r = r;
    this.c = c;
    this.z0 = z0;

    this.proy_vec;

    this.draw = function (x0, y0) {
        //Matrix de proyeccion
        let d = 1 / (this.z0 - this.vector[2][0]) //Cuanto más lejos más pequeño
        R_proy = [
            [d, 0, 0],
            [0, d, 0],
            [0, 0, 0],
        ]

        this.proy_vec = multiply(R_proy, this.vector);

        this.proy_vec[0][0] = this.proy_vec[0][0] * scale + x0;
        this.proy_vec[1][0] = this.proy_vec[1][0] * scale + y0;

        ctx.beginPath();
        ctx.strokeStyle = this.c;
        ctx.fillStyle = this.c;
        ctx.stroke();
        ctx.fill();
    }

    this.rotate = function (x0, y0, alphax, alphay, alphaz) {
        //Matrices de Rotación 3D
        Rz = [
            [Math.cos(alphaz), -Math.sin(alphaz), 0],
            [Math.sin(alphaz), Math.cos(alphaz), 0],
            [0, 0, 1],
        ];
        Rx = [
            [1, 0, 0],
            [0, Math.cos(alphax), -Math.sin(alphax)],
            [0, Math.sin(alphax), Math.cos(alphax)],
        ];
        Ry = [
            [Math.cos(alphay), 0, Math.sin(alphay)],
            [0, 1, 0],
            [-Math.sin(alphay), 0, Math.cos(alphay)],
        ];

        this.vector = multiply(Rz, this.initial_vector);
        this.vector = multiply(Rx, this.initial_vector);
        this.vector = multiply(Ry, this.initial_vector);

        this.draw(x0, y0);
    }
}

//Clase Linea
function Line(c) {
    this.c = c;

    this.draw = function (p0, p1, z0) {
        this.x0 = p0.proy_vec[0][0];
        this.y0 = p0.proy_vec[1][0];
        this.x1 = p1.proy_vec[0][0];
        this.y1 = p1.proy_vec[1][0];

        ctx.beginPath();
        ctx.strokeStyle = this.c;
        ctx.lineWidth = 20 / z0 * scale / 1000;
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(this.x1, this.y1);
        ctx.stroke();
    }
}

//Clase Cubo
function Cubo(x0, y0, z0, alphax, alphay, alphaz) {
    this.x0 = x0;
    this.y0 = y0;
    this.z0 = z0;
    this.alphax = alphax;
    this.alphay = alphay;
    this.alphaz = alphaz;

    this.puntos = new Array(8);

    //Define los 8 puntos del cubo
    this.puntos[0] = new Circle(-1, 1, -1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)
    this.puntos[1] = new Circle(1, 1, -1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)
    this.puntos[2] = new Circle(1, -1, -1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)
    this.puntos[3] = new Circle(-1, -1, -1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)

    this.puntos[4] = new Circle(-1, 1, 1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)
    this.puntos[5] = new Circle(1, 1, 1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)
    this.puntos[6] = new Circle(1, -1, 1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)
    this.puntos[7] = new Circle(-1, -1, 1, 10, "#FFFFFF", this.z0, this.alphax, this.alphay, this.alphaz)

    let l1 = new Line("#FFFFFF");

    this.rotate = function (alphax, alphay, alphaz) {

        //Rota los 8 puntos
        for (i = 0; i < this.puntos.length; i++) {
            this.puntos[i].rotate(this.x0, this.y0, alphax, alphay, alphaz);
        }

        this.draw();
    }
    this.draw = function () {
        //Rota los 8 puntos
        for (i = 0; i < this.puntos.length; i++) {
            this.puntos[i].draw(this.x0, this.y0);
        }

        //Dibuja todas las lineas
        l1.draw(this.puntos[0], this.puntos[1], this.z0);
        l1.draw(this.puntos[1], this.puntos[2], this.z0);
        l1.draw(this.puntos[2], this.puntos[3], this.z0);
        l1.draw(this.puntos[0], this.puntos[3], this.z0);

        l1.draw(this.puntos[4], this.puntos[5], this.z0);
        l1.draw(this.puntos[5], this.puntos[6], this.z0);
        l1.draw(this.puntos[6], this.puntos[7], this.z0);
        l1.draw(this.puntos[4], this.puntos[7], this.z0);

        l1.draw(this.puntos[0], this.puntos[4], this.z0);
        l1.draw(this.puntos[1], this.puntos[5], this.z0);
        l1.draw(this.puntos[2], this.puntos[6], this.z0);
        l1.draw(this.puntos[3], this.puntos[7], this.z0);
    }

}

//Multiplicación de matrices
function multiply(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}
