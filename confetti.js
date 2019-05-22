let canvasf = document.getElementById("confetti-front");
let canvasb = document.getElementById("confetti-back");

let width, height;

function setSize(){
  width = document.body.clientWidth;
  height = document.body.clientHeight;
  canvasf.width = width;
  canvasf.height = height;
  canvasb.width = width;
  canvasb.height = height;
}
setSize();

let maxDepth = 10;
let confettiCount = 75;
let p = window.navigator.platform.toLowerCase();
if(p.includes("android") || p.includes("ios")){
  confettiCount = 1;
}

let ctxf = canvasf.getContext("2d");
let ctxb = canvasb.getContext("2d");

let timeScale = .4;

class Confetti{
  constructor(z){
    this.z = z;
    this.w = randomFloat(10, 15);
    this.h = randomFloat(20, 50); 
    this.x = randomFloat(0, width-this.w);
    this.y = -this.h*2;

    this.speed = lerp(2,3,z);
    this.amp = randomFloat(5, 30);

    this.time = randomFloat(0,100);

    this.r = randomFloat(100,255);
    this.g = randomFloat(100,255);
    this.b = randomFloat(100,255);
  }
  draw(ctx, delta){
    ctx.save();
    ctx.translate(this.x+this.w/2, this.y+this.h/2);
    ctx.translate(this.amp*Math.sin(this.time*timeScale), 0);
    ctx.rotate(this.time*timeScale/2);
    ctx.scale(Math.cos(this.time*timeScale), Math.sin(this.time*timeScale))
    ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
    ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
    ctx.restore();
    this.y += this.speed*timeScale;
    this.time += (15/(1000/delta));
  }
}

let confettis = [];
for(var i = 0; i < confettiCount; i++){
  confettis.push(new Confetti(randomInt(0,maxDepth)));
}

function confDraw(delta){
  ctxf.clearRect(0,0,width, height);
  ctxb.clearRect(0,0,width, height);
  ctxf.save();

  for(var i = 0; i < confettiCount; i++){
    if(confettis[i].z > maxDepth/4){
      confettis[i].draw(ctxf, delta);
    }
    else{
      confettis[i].draw(ctxb, delta);
    }
    if(confettis[i].y > height){
      confettis[i] = new Confetti(randomInt(0, maxDepth));
    }
  }
  ctxb.filter = "blur(2px)";
}