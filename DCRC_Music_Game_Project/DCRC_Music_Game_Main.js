window.addEventListener("load", () => {
  let eightBitFont = document.createElement("link");
  eightBitFont.href = "https://fontlibrary.org/face/8bit-wonder";
  eightBitFont.rel = "stylesheet";
  eightBitFont.type = "text/css";
  document.getElementsByTagName("head")[0].appendChild(eightBitFont);
});

window.gameStart = function(url, score){

  //console.log(url, score);
  let panel_css = `
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.5);
    display: block;
  `;
  let delete_css = `
    position: absolute;
    top: 0px;
    right: 0px;
    width: 50px;
    height: 50px;
    font-size: 25pt;
    font-weight: bold;
    color: red;
    text-align: center;
    background-color: rgba(200, 200, 200, 0.5);
  `;
  let canvas_css = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: black;
  `;
  let sound_css = `
    position: absolute;
    top: 0px;
    left: 0px;
    display: none;
  `;
  let timer;
  let panel = document.createElement("div");
  panel.style = panel_css;
  let deleteButton = document.createElement("div");
  deleteButton.style = delete_css;
  deleteButton.innerHTML = "×";
  deleteButton.addEventListener("click", () => {
    window.removeEventListener("keydown", keyDown, false);
    window.removeEventListener("keyup", keyUp, false);
    deleteE(panel);
    panel = null;
    clearInterval(timer);
  });
  panel.appendChild(deleteButton);
  let canvas = document.createElement("canvas");
  canvas.style = canvas_css;
  canvas.width = 700;
  canvas.height = 500;
  panel.appendChild(canvas);
  let sound = document.createElement("div");
  sound.id = "sound";
  sound.style = sound_css;
  panel.appendChild(sound);
  document.body.appendChild(panel);

  let player = new YT.Player(
    "sound",
    {
      width: 20,
      height: 15,
      videoId: url,
      events: {
        onReady: () => {
          player.playVideo();
          let stopper = setInterval(() => {
            if(player.getPlayerState() == 1){
              player.pauseVideo();
              player.seekTo(0);
            }else if(player.getPlayerState() == 2){
              ctx.font = "9pt '8BITWONDERNominal'";
              ctx.fillStyle = "lime";
              ctx.fillText("press any key", 280, 240);
              gameState = 1;
              clearInterval(stopper);
            }
          }, 10);
        }
      }
    }
  );

  let scoreSum = 0;
  let scorePart = (() => {
    let n = 0;
    for(let i = 0; i < 6; i++){
      for(let j = 0; j < score[i].length; j++){
        n++;
      }
    }
    return 1000000 / n;
  })();

  let ctx = canvas.getContext("2d");
  let gameState = 0;  //0:loading, 1:waiting, 2:playing, 3:pausing 4:gameend
  let keyLogger = {
    s: false,
    d: false,
    f: false,
    j: false,
    k: false,
    l: false
  };
  let recent = {
    s: false,
    d: false,
    f: false,
    j: false,
    k: false,
    l: false
  };

  let startTime;
  let nowTime;
  let noteIndex = [0, 0, 0, 0, 0, 0, 0];
  let lane = ["s", "d", "f", "j", "k", "l"];

  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
  function keyDown(e){
    if(gameState == 1){
      gameState = 2;
      player.playVideo();
      startTime = Date.now();
      timer = setInterval(tick, 1000 / 45);
    }else if(gameState == 2){
      keyLogger[e.key] = true;
    }
  }
  function keyUp(e){
    keyLogger[e.key] = false;
  }

  function tick(){
    update();
    draw();
  }

  function update(){

    now = Date.now();
    for(let i = 0; i < 6; i++){
      if(noteIndex[i] >= score[i].length) continue;
      while(score[i][noteIndex[i]].time - 1000 <= now - startTime){
        drawQue[i].push([score[i][noteIndex[i]].time, score[i][noteIndex[i]].type]);
        noteIndex[i]++;
        if(noteIndex[i] >= score[i].length) break;
      }
    }
    while(score[6][noteIndex[6]] - 1000 <= now - startTime){
      if(!score[6][noteIndex[6]]) break;
      drawQue[6].push(score[6][noteIndex[6]]);
      noteIndex[6]++;
    }

    for(let i = 0; i < 6; i++){
      if(!recent[lane[i]] && keyLogger[lane[i]]){
        if(drawQue[i][0] && (drawQue[i][0][1] == 1 || drawQue[i][0][1] == 2)){
          if(Math.abs((now - startTime) - drawQue[i][0][0]) < 160){
            if(Math.abs((now - startTime) - drawQue[i][0][0]) < 100){
              if(Math.abs((now - startTime) - drawQue[i][0][0]) < 60){
                //console.log("Great");
                scoreSum += scorePart;
                effectQue[i].push([0, 0]);
              }else{
                //console.log("Good");
                scoreSum += scorePart / 2;
                effectQue[i].push([1, 0]);
              }
              if(drawQue[i][0][1] == 2){
                holdOn[i] = 1;
                if(drawQue[i].length == 1){
                  drawQue[i].push([score[i][noteIndex[i]].time, score[i][noteIndex[i]].type]);
                  noteIndex[i]++;
                }
              }
            }else{
              //console.log("Miss");
              holdOn[i] = 0;
              effectQue[i].push([2, 0]);
            }
            drawQue[i].shift();
          }
        }
      }else if(recent[lane[i]] && !keyLogger[lane[i]]){
        if(drawQue[i][0] && drawQue[i][0][1] == 3){
          if(Math.abs((now - startTime) - drawQue[i][0][0]) < 100){
            if(Math.abs((now - startTime) - drawQue[i][0][0]) < 60){
              //console.log("Great");
              scoreSum += scorePart;
              effectQue[i].push([0, 0]);
            }else{
              //console.log("Good");
              scoreSum += scorePart / 2;
              effectQue[i].push([1, 0]);
            }
          }else{
            //console.log("Miss");
            effectQue[i].push([2, 0]);
          }
          drawQue[i].shift();
          holdOn[i] = 0;
        }
      }
    }

    recent.s = keyLogger.s;
    recent.d = keyLogger.d;
    recent.f = keyLogger.f;
    recent.j = keyLogger.j;
    recent.k = keyLogger.k;
    recent.l = keyLogger.l;

  }

  let drawQue = [[],[],[],[],[],[],[]];
  let effectQue = [[],[],[],[],[],[]];
  let holdOn = [0, 0, 0, 0, 0, 0];

  function draw(){

    ctx.clearRect(0, 0, 700, 500);
    ctx.font = "15pt '8BITWONDERNominal'";
    ctx.fillStyle = "lime";
    let str = Math.round(scoreSum) + "";
    while(str.length < 7) str = "0" + str
    ctx.fillText(str, 510, 35);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    for(let i = 0; i < 6; i++){
      ctx.strokeRect(50 + 100 * i, 50, 100, 400);
      ctx.fillText(lane[i].toUpperCase(), 90 + 100 * i, 435);
    }
    ctx.beginPath();
    ctx.moveTo(50, 400);
    ctx.lineTo(650, 400);
    ctx.stroke();

    for(let i = 0; i < drawQue[6].length; i++){
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 1;
      if(400 + 350 * ((now - startTime - drawQue[6][i]) / 1000) > 450){
        drawQue[6].shift();
        i--;
        continue;
      }
      if(400 + 350 * ((now - startTime - drawQue[6][i]) / 1000) > 50){
        ctx.beginPath();
        ctx.moveTo(50, 400 + 350 * ((now - startTime - drawQue[6][i]) / 1000));
        ctx.lineTo(650, 400 + 350 * ((now - startTime - drawQue[6][i]) / 1000));
        ctx.stroke();
      }
    }

    for(let i = 0 ; i < 6; i++){
      for(let j = 0; j < drawQue[i].length; j++){
        if(drawQue[i][j][1] == 1 || drawQue[i][j][1] == 2){
          if(400 + 350 * ((now - startTime - drawQue[i][j][0]) / 1000) > 450){
            drawQue[i].shift();
            effectQue[i].push([2, 0]);
            j--;
            continue;
          }
        }
        if(drawQue[i][j][1] == 1){
          ctx.strokeStyle = "aqua";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(50 + 100 * i, 400 + 350 * ((now - startTime - drawQue[i][j][0]) / 1000));
          ctx.lineTo(150 + 100 * i, 400 + 350 * ((now - startTime - drawQue[i][j][0]) / 1000));
          ctx.stroke();
        }else if(drawQue[i][j][1] == 2){
          let start;
          if(400 + 350 * ((now - startTime - drawQue[i][j][0]) / 1000) > 450){
            start = 450;
          }else{
            start = 400 + 350 * ((now - startTime - drawQue[i][j][0]) / 1000);
          }
          let end;
          if(j == drawQue[i].length - 1){
            end = 50;
          }else{
            end = 400 + 350 * ((now - startTime - drawQue[i][j + 1][0]) / 1000);
          }
          ctx.strokeStyle = "black";
          ctx.fillStyle = "yellow";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(50 + 100 * i, start);
          ctx.lineTo(150 + 100 * i, start);
          ctx.lineTo(150 + 100 * i, end);
          ctx.lineTo(50 + 100 * i, end);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }else if(drawQue[i][j][1] == 3){
          let start;
          let end;
          if(holdOn[i] == 1){
            start = 400;
            if(400 + 350 * ((now - startTime - drawQue[i][j][0]) / 1000) < 50){
              end = 50;
            }else{
              end = 400 + 350 * ((now - startTime - drawQue[i][j][0]) / 1000);
            }
            if(end >= 400){
              drawQue[i].shift();
              effectQue[i].push([0, 0]);
              //console.log("Great");
              scoreSum += scorePart;
              holdOn[i] = 0;
            }else{
              ctx.strokeStyle = "black";
              ctx.fillStyle = "yellow";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(50 + 100 * i, start);
              ctx.lineTo(150 + 100 * i, start);
              ctx.lineTo(150 + 100 * i, end);
              ctx.lineTo(50 + 100 * i, end);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
          }
        }
      }
    }

    ctx.font = "12pt '8BITWONDERNominal'"
    for(let i = 0; i < 6; i++){
      for(let j = 0; j < effectQue[i].length; j++){
        let str;
        if(effectQue[i][j][0] == 0){
          ctx.fillStyle = "rgba(127, 127, 255, " + (20 - effectQue[i][j][1]) / 20 + ")";
          str = "Great";
        }else if(effectQue[i][j][0] == 1){
          ctx.fillStyle = "rgba(127, 255, 127, " + (20 - effectQue[i][j][1]) / 20 + ")";
          str = "Good";
        }else{
          ctx.fillStyle = "rgba(255, 0, 0, " + (20 - effectQue[i][j][1]) / 20 + ")";
          str = "Miss";
        }
        ctx.fillText(str, (effectQue[i][j][0] == 0 ? 60 : 70) + 100 * i, 480);
        effectQue[i][j][1]++;
        if(effectQue[i][j][1] >= 20){
          effectQue[i].shift();
          j--;
        }
      }
    }

  }

  function deleteE(elm){
    elm.parentNode.removeChild(elm);
  }
};
