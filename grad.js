let core = document.getElementById("content");
let core_static = document.getElementById("static-content");
let text = document.getElementById("text");
function gradResize(){
  core.width = .8*width;
  core.height = .9*height;
  core_static.width = core.width;
  core_static.height = core.height;
  text.width = core.width;
  text.height = core.height;
}
gradResize();
let corectx = core.getContext("2d");
let staticctx = core_static.getContext("2d");
let textctx = text.getContext("2d");

let gradTimeScale = 1;

class DisplayImg{
  constructor(img){
    this.img = new Image();
    this.img.onload = () => {
      if(core.width < core.height){
        this.targetScale = (((core.height-30)/2)/this.img.naturalHeight)/1.7;
      }
      else{
        this.targetScale = (((core.width-30)/2)/this.img.naturalWidth);
      }
      this.x = randomFloat(10, core.width - (this.img.naturalWidth*this.targetScale + 10));
      this.y = randomFloat(10, core.height - (this.img.naturalHeight*this.targetScale + 10));
      this.initialScale = (this.img.naturalWidth/core.width)/2;
      this.hasLoaded = true;
    };
    this.index = 0;
    this.img.src = "imgs/"+img;
    this.active = false;
    this.finished = false;
    this.hasLoaded = false;
    this.onFinish = function(){};
    this.initialScale = 1;
    this.targetRotation = randomFloat(-20*Math.PI/180, 20*Math.PI/180);
    this.initialRotation = randomFloat(-Math.PI/4, Math.PI/4);
    this.timeToFinish = randomFloat(1,1.7);
    this.time = 0;
    this.progress = 0;
    this.copied = false;
  }
  draw(ctx, delta){
    if(!this.hasLoaded) return
    if(this.active){
      this.time += delta*gradTimeScale/1000;
      this.progress = this.time/this.timeToFinish;
    }
    if(this.progress >= 1){
      this.progress = 1;
      this.active = false;
      this.finished = true;
      this.onFinish();
    }
    if(this.active || this.finished){
      ctx.save();
      let scale = lerp(this.initialScale, this.targetScale, this.progress);
      ctx.translate(this.x, this.y);
      let rot = lerp(this.initialRotation, this.targetRotation, this.progress);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      if(this.active)
        ctx.globalAlpha = lerp(0,1,this.progress);
      ctx.drawImage(this.img, 0, 0);
      ctx.restore();
    }
    if(!this.copied && this.finished){
      this.copyToStatic();
    }
  }
  animate(){
    if(!(this.index == 0)){
      window.setTimeout(function(){
        this.active = true;
      }.bind(this), 4000);
    }
    else{
      this.active = true;
    }
  }
  copyToStatic(){
    if(this.isCopied) return;
    this.isCopied = true;
    staticctx.drawImage(core, 0, 0);
  }
}
let imgcount = 11;
let imgs = [];
var lasti, curr;
for(var i = 0; i < imgcount; i++){
  imgs.push(new DisplayImg(`${i+1}.jpg`));
  imgs[i].index = i;
  if(i > 0){
    imgs[i-1].onFinish = imgs[i].animate.bind(imgs[i]);
  }
}

class TypeText{
  constructor(ctx){
    this.script = [];
    let puisi = randomInt(1,5);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if(xhr.readyState === XMLHttpRequest.DONE){
        if(xhr.status === 200){
          this.script = xhr.responseText.split('\n');
          this.timePerChar = this.timePerLine / this.script[this.currentLine].length;
          this.currentLineWidth = ctx.measureText(this.script[this.currentLine]).width;
          this.isReady = true;
        }
      }
      else{
      }
    }
    xhr.open("GET", `puisi/${puisi}.txt`, true);
    xhr.send();
    this.finalLine = "Congraduations! See you!";
    this.fontSize = 50;
    if(width < height){
      this.fontSize = 26;
    }
    ctx.font = `${this.fontSize}px Raleway`;
    this.currentLine = 0;
    this.currentChar = 0;
    this.fadeTime = 1;
    this.currentFadeTime = 0;
    this.linePersistenceDelay = .6;
    this.currentPersistence = 0;
    this.delayPerLine = 1+this.linePersistenceDelay+this.fadeTime;
    this.time = 0;
    this.timePerLine = 2;
    this.active = false;
    this.started = false;
    this.onFinish = startConfetti;
    this.finished = false;
    this.exit = false;
    this.entrance = false;
    this.finished = false;
    this.isReady = false;
  }
  drawText(ctx, delta){
    if(!this.isReady) return;
    if(this.finished && !this.exit){
      this.currentFadeTime += delta/1000;
      return this.drawFinal(ctx, delta);
    }
    if(!this.started || !this.active) return;
    if(!this.entrance)
      this.time += delta/1000;
    this.currentChar = Math.floor(this.time / this.timePerChar);
    let x = (text.width - this.currentLineWidth) / 2;
    if(this.currentChar > this.script[this.currentLine].length+1){
      this.currentPersistence += delta/1000;
      if(this.currentPersistence > this.linePersistenceDelay){
        this.currentChar = this.script[this.currentLine].length;
        this.currentFadeTime += delta/1000;
        ctx.globalAlpha = lerp(1, 0, this.currentFadeTime/this.fadeTime);
      }
      if(!this.exit && this.currentPersistence > this.linePersistenceDelay){
        this.advanceLine(ctx);
        this.currentPersistence = 0;
      }
    }
    else{
      ctx.globalAlpha = 1;
    }
    if(this.entrance){
      this.currentFadeTime += delta/1000;
      ctx.globalAlpha = lerp(0,1, this.currentFadeTime/this.fadeTime);
    }
    let drawn = this.script[this.currentLine].substring(0, this.currentChar);
    let y = text.height/2;
    ctx.save();
    if(this.exit)
      ctx.globalAlpha = lerp(.7,0, this.currentFadeTime/this.fadeTime);
    else if(this.entrance)
      ctx.globalAlpha = lerp(0, .7, this.currentFadeTime/this.fadeTime);
    else
      ctx.globalAlpha = .7;
    ctx.fillStyle = "#333";
    ctx.filter = "blur(2px)";
    ctx.fillRect(x-3, y-this.fontSize, this.currentLineWidth+6, this.fontSize*1.2);
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.fillText(drawn,x,y);
    if(this.currentFadeTime > this.fadeTime && this.entrance){
      this.entrance = false;
      this.currentFadeTime = 0;
    }
  }
  start(){
    this.started = true;
    this.active = true;
    this.entrance = true;
    this.currentFadeTime = 0;
  }
  advanceLine(ctx){
    this.exit = true;
    window.setTimeout(() => {
      this.exit = false;
      this.entrance = true;
      this.currentLine+=1;
      if(this.currentLine >= this.script.length){
        this.exit = false;
        this.finished = true;
        this.entrance = true;
        this.currentFadeTime = 0;
        this.drawFinal(ctx);
        this.onFinish();
        return;
      }
      this.time = 0;
      this.currentChar = 1;
      this.timePerChar = this.timePerLine / this.script[this.currentLine].length;
      this.currentLineWidth = ctx.measureText(this.script[this.currentLine]).width;
      this.currentFadeTime = 0;
    }, this.delayPerLine*1000);
  }
  drawFinal(ctx, delta){
    if(this.entrance){
      ctx.globalAlpha = lerp(0,1,this.currentFadeTime/this.fadeTime);
    }
    ctx.clearRect(0,0,text.width, text.height);
    let w = ctx.measureText(this.finalLine).width;
    ctx.fillStyle = "white";
    ctx.save();
    ctx.fillStyle = "#000";
    if(this.entrance)
      ctx.globalAlpha = lerp(0,.3,this.currentFadeTime/this.fadeTime);
    else
      ctx.globalAlpha = .3
    ctx.fillRect(0,0,text.width, text.height);
    ctx.restore();
    ctx.fillText(this.finalLine, (text.width - w)/2, text.height / 2);
    if(this.currentFadeTime > this.fadeTime && this.entrance){
      this.entrance = false;
      this.currentFadeTime = 0;
    }
  }
}

let type = new TypeText(textctx);
window.setTimeout(() => {
  type.start();
}, 2000);

function gradDraw(delta){
  corectx.clearRect(0,0,core.width, core.height);
  if(imgs[0].hasLoaded && (!imgs[0].active || !imgs[0].finished)){
    imgs[0].animate();
  }
  for(img of imgs){
    if(!img.finished)
      img.draw(corectx, delta);
  }
}

function textDraw(delta){
  textctx.clearRect(0,0,text.width, text.height);
  type.drawText(textctx, delta);
}