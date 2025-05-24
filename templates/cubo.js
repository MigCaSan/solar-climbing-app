const canvas = document.getElementById("lienzo");

canvas.style.width = 100 + '%';
canvas.style.height = 100*9/16 + '%';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
ctx.translate(canvas.width/2,canvas.height/2);

var scale = 400;
let v = Math.random()/10 - Math.random()/10;
const cubo1 = new Cubo(1000,0,4,0,-0.01,0);
const cubo2 = new Cubo(-1000,0,4,0,0.01,0);
const cubo3 = new Cubo(0,0,3,0,v,0);

//Función que se repite
function loop(){
    ctx.clearRect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);

    //cubo1.rotate();
    //cubo2.rotate();
    cubo3.rotate();

    requestAnimationFrame(loop);
}
loop();

//Clase Circulo
function Circle(x,y,z,r,c,z0,alphax,alphay,alphaz){
    this.vector = [[x],[y],[z],];
    this.r = r;
    this.c = c;
    this.z0 = z0;
    this.alphaz = alphaz;
    this.alphax = alphax;
    this.alphay = alphay;

    this.proy_vec;

    this.draw = function (x0,y0) {
        //Matrix de proyeccion
        let d = 1/(this.z0-this.vector[2][0]) //Cuanto mas lejos mas pequeño
        R_proy = [[d,0,0],
                  [0,d,0],
                  [0,0,0],        
                 ]

        this.proy_vec = multiply(R_proy,this.vector);

        this.proy_vec[0][0] = this.proy_vec[0][0]*scale + x0;
        this.proy_vec[1][0] = this.proy_vec[1][0]*scale + y0;

        ctx.beginPath();
        ctx.strokeStyle = this.c;
        ctx.fillStyle = this.c;
        //ctx.arc(this.proy_vec[0][0],this.proy_vec[1][0], 10*d*this.r*scale/1000, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    } 
    
    this.rotate = function(x0,y0){
        //Matrices de Rotacion 3D
        Rz = [[Math.cos(this.alphaz), -Math.sin(this.alphaz),0],
              [Math.sin(this.alphaz),  Math.cos(this.alphaz),0],
              [0, 0, 1],
             ];
        Rx = [[1,0,0],
              [0,Math.cos(this.alphax), -Math.sin(this.alphax)],
              [0,Math.sin(this.alphax),  Math.cos(this.alphax)],
             ];
        Ry = [[Math.cos(this.alphay), 0, Math.sin(this.alphay)],
              [0, 1, 0],
              [-Math.sin(this.alphay), 0, Math.cos(this.alphay)],
             ];

        this.vector = multiply(Rz,this.vector);
        this.vector = multiply(Rx,this.vector);
        this.vector = multiply(Ry,this.vector);

        this.draw(x0,y0);
    }
}

//Clase Linea
function Line(c){
    this.c = c;

    this.draw = function(p0,p1,z0){
        this.x0 = p0.proy_vec[0][0];
        this.y0 = p0.proy_vec[1][0];
        this.x1 = p1.proy_vec[0][0];
        this.y1 = p1.proy_vec[1][0];
        
        ctx.beginPath();
        ctx.strokeStyle = this.c;
        ctx.lineWidth = 20/z0*scale/1000;
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(this.x1, this.y1);
        ctx.stroke();
    }
}

//Clase cubo
function Cubo(x0,y0,z0,alphax,alphay,alphaz){
    this.x0 = x0;
    this.y0 = y0;
    this.z0 = z0;
    this.alphax = alphax;
    this.alphay = alphay;
    this.alphaz = alphaz;

    this.puntos = new Array(8);

    //Define los 8 puntos del cubo
    this.puntos[0] = new Circle(-1,1,-1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)
    this.puntos[1] = new Circle(1,1,-1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)
    this.puntos[2] = new Circle(1,-1,-1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)
    this.puntos[3] = new Circle(-1,-1,-1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)

    this.puntos[4] = new Circle(-1,1,1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)
    this.puntos[5] = new Circle(1,1,1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)
    this.puntos[6] = new Circle(1,-1,1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)
    this.puntos[7] = new Circle(-1,-1,1,10,"#FFFFFF",this.z0,this.alphax,this.alphay,this.alphaz)

    let l1 = new Line("#FFFFFF");

    this.rotate = function(){
        
        //Rota los 8 puntos
        for(i=0;i<this.puntos.length;i++){
            this.puntos[i].rotate(this.x0,this.y0);
        }

        //Dibuja todas las lineas
        l1.draw(this.puntos[0],this.puntos[1],this.z0);
        l1.draw(this.puntos[1],this.puntos[2],this.z0);
        l1.draw(this.puntos[2],this.puntos[3],this.z0);
        l1.draw(this.puntos[0],this.puntos[3],this.z0);

        l1.draw(this.puntos[4],this.puntos[5],this.z0);
        l1.draw(this.puntos[5],this.puntos[6],this.z0);
        l1.draw(this.puntos[6],this.puntos[7],this.z0);
        l1.draw(this.puntos[4],this.puntos[7],this.z0);

        l1.draw(this.puntos[0],this.puntos[4],this.z0);
        l1.draw(this.puntos[1],this.puntos[5],this.z0);
        l1.draw(this.puntos[2],this.puntos[6],this.z0);
        l1.draw(this.puntos[3],this.puntos[7],this.z0);
    }
}

//Multiplicacion de matrices
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