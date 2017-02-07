window.addEventListener("load", function(){

  let Syousetsu = createSyousetsuClass();

  let firstBpm = 120;
  let firstDiray = 1;
  let gloBpm = 120;
  let gloMeasure = 48;
  let putNote = 1;
  let createPart = 4;
  let holdState = [0, 0, 0, 0, 0, 0];

  let fumen = [new Syousetsu(0)];

  getE("bunsu").addEventListener("input", createPartUpdate);
  getE("bunbo").addEventListener("input", createPartUpdate);
  function createPartUpdate(){
    createPart = Number(getE("bunbo").value) / Number(getE("bunsu").value);
    for(let i = 0; i < fumen.length; i++){
      fumen[i].rePaint();
    }
  }
  getE("bpm").addEventListener("input", function(){
    firstBpm = Number(getE("bpm").value);
  });
  getE("note").addEventListener("input", function(){
    putNote = Number(getE("note").value);
  });
  getE("syouplus").addEventListener("click", function(){
    fumen.push(new Syousetsu(fumen.length));
  });
  getE("syouminus").addEventListener("click", function(){
    if(fumen.length > 1){
      deleteE(fumen[fumen.length - 1].d1);
      fumen.pop();
    }
  });
  getE("diray").addEventListener("input", function(){
    firstDiray = Number(getE("diray").value);
  });
  getE("allChange").addEventListener("click", function(){
    let b = Number(getE("allValue").value);
    for(let i = 0; i < fumen.length; i++){
      fumen[i].bpmChanges[0][1] = b;
      fumen[i].optionUpdate();
    }
  });

  function makeScore(){
    let result = new Array(7);
    for(let i = 0; i < 7; i++){
      result[i] = [];
    }
    let bpm = firstBpm;
    let t = firstDiray;
    let dis = 60 / bpm / 12;
    let bci;
    let hold = [0, 0, 0, 0, 0, 0];
    for(let i = 0; i < fumen.length; i++){
      bci = 0;
      result[6].push(Math.round(t * 1000))
      for(let j = 0; j < fumen[i].measure; j++){
        for(let k = 0; k < 6; k++){
          if(fumen[i].score[k][j] != 0){
            if(hold[k] == 0 && (fumen[i].score[k][j] == 1 || fumen[i].score[k][j] == 2)){
              result[k].push({
                time: Math.round(t * 1000),
                type: fumen[i].score[k][j]
              });
              if(fumen[i].score[k][j] == 2) hold[k] = 1;
            }else if(hold[k] == 1 && fumen[i].score[k][j] == 3){
              result[k].push({
                time: Math.round(t * 1000),
                type: fumen[i].score[k][j]
              });
              hold[k] = 0;
            }
          }
        }
        if(bci < fumen[i].bpmChanges.length && fumen[i].bpmChanges[bci][0] - 1 == j){
          bpm = fumen[i].bpmChanges[bci][1];
          dis = 60 / bpm / 12;
          bci++;
        }
        t += dis;
      }
    }
    let str = `gameStart("${getE("soundSource").value}",[`;
    for(let i = 0; i < 6; i++){
      str += "[";
      for(let j = 0; j < result[i].length; j++){
        str += "{";
        for(let k in result[i][j]){
          str += k + ":" + result[i][j][k] + ",";
        }
        str = str.substr(0, str.length - 1);
        str += "}" + (j < result[i].length - 1 ? "," : "");
      }
      str += "],";
    }
    str += "[";
    for(let i = 0; i < result[6].length; i++){
      str += result[6][i] + (i < result[6].length - 1 ? "," : "");
    }
    str += "]])";
    return str;
  }
  getE("textOut").addEventListener("click", function(){
    let str = makeScore();
    getE("output").value = str;
    //console.log(eval(str));
  });
  getE("saveText").addEventListener("click", function(){
    let result = "[{firstBpm:" + firstBpm + ",firstDiray:" + firstDiray + "},";
    for(let i = 0; i < fumen.length; i++){
      result += "{measure:" + fumen[i].measure + ",";
      result += "score:[";
      for(let j = 0; j < 6; j++){
        result += "[";
        for(let k = 0; k < fumen[i].measure; k++){
          result += fumen[i].score[j][k] + (k < fumen[i].score[j].length - 1 ? "," : "");
        }
        result += "]" + (j < 5 ? "," : "");
      }
      result += "],bpmChanges:[";
      for(let j = 0; j < fumen[i].bpmChanges.length; j++){
        result += "[" + fumen[i].bpmChanges[j][0] + "," + fumen[i].bpmChanges[j][1] + "]";
        result += (j < fumen[i].bpmChanges.length - 1 ? "," : "");
      }
      result += "]}" + (i < fumen.length - 1 ? "," : "");
    }
    result += "]";
    getE("output").value = result;
  });
  getE("loadText").addEventListener("click", function(){
    try{
      let source = eval(getE("output").value);
      firstBpm = source[0].firstBpm;
      firstDiray = source[0].firstDiray;
      getE("bpm").value = firstBpm;
      getE("diray").value = firstDiray;
      for(let i = 0; i < fumen.length; i++){
        deleteE(fumen[i].d1);
      }
      fumen = [];
      for(let i = 0; i < source.length - 1; i++){
        fumen.push(new Syousetsu(i));
        //console.log(fumen[i])
        fumen[i].measure = source[i + 1].measure;
        fumen[i].score = source[i + 1].score;
        fumen[i].bpmChanges = source[i + 1].bpmChanges;
        fumen[i].canvasUpdate();
        fumen[i].optionUpdate();
      }
    }catch(exc){
      console.log(exc);
      alert(exc.toString());
    }
  });
  getE("testPlay").addEventListener("click", function(e){
    e.target.blur();
    let str = makeScore();
    //console.log(str);
    eval(str);
  });

  function createSyousetsuClass(){
    function Syousetsu(_n){
      this.syou = _n;
      this.measure = gloMeasure;
      this.bpmSelect = 1;
      this.bpmChanges = [[1, gloBpm]];
      this.d1 = document.createElement("div");
      this.d1.className = "syou";
      this.d1.style.width = (8 * this.measure) + "px";
      this.d2 = document.createElement("div");
      this.d2.textContent = (_n + 1);
      this.d1.appendChild(this.d2);
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = (8 * this.measure);
      this.canvas.height = 180;
      this.d1.appendChild(this.canvas);
      this.d1.appendChild(document.createElement("br"));
      this.t1 = document.createTextNode("measure:");
      this.d1.appendChild(this.t1);
      this.i1 = document.createElement("input");
      this.i1.type = "number";
      this.i1.value = this.measure;
      this.i1.min = "1";
      this.i1.max = "144";
      this.i1.step = "1";
      this.d1.appendChild(this.i1);
      this.d1.appendChild(document.createElement("br"));
      this.t2 = document.createTextNode("select:");
      this.d1.appendChild(this.t2);
      this.i2 = document.createElement("input");
      this.i2.type = "number";
      this.i2.value = "1";
      this.i2.min = "1";
      this.i2.max = this.measure;
      this.i2.step = "1";
      this.d1.appendChild(this.i2);
      this.d1.appendChild(document.createElement("br"));
      this.t3 = document.createTextNode("bpmChange:");
      this.d1.appendChild(this.t3);
      this.i3 = document.createElement("input");
      this.i3.type = "number";
      this.i3.value = gloBpm;
      this.i3.min = "1";
      this.i3.max = "1000";
      this.i3.step = "0.01";
      this.d1.appendChild(this.i3);
      this.i4 = document.createElement("input");
      this.i4.type = "button";
      this.i4.value = "addBpmChange";
      this.d1.appendChild(this.i4);
      this.d1.appendChild(document.createElement("br"));
      this.select = document.createElement("select");
      this.d1.appendChild(this.select);
      this.i5 = document.createElement("input");
      this.i5.type = "button";
      this.i5.value = "removeBpmChange";
      this.d1.appendChild(this.i5);

      this.score = new Array(6);
      for(let i = 0; i < 6; i++){
        this.score[i] = new Array(this.measure);
      }
      for(let i = 0; i < 6; i++){
        for(let j = 0; j < this.measure; j++){
          this.score[i][j] = 0;
        }
      }

      this.canvasUpdate = () => {
        this.measure = Number(this.i1.value);
        this.d1.style.width = (8 * this.measure) + "px";
        this.canvas.width = (8 * this.measure);
        this.i2.max = this.measure;
        this.score = ((old) => {
          let arr = new Array(6);
          for(let i = 0; i < 6; i++){
            arr[i] = new Array(this.measure);
          }
          for(let i = 0; i < 6; i++){
            for(let j = 0; j < this.measure; j++){
              if(typeof(old[i][j]) != "undefined"){
                arr[i][j] = old[i][j];
              }else{
                arr[i][j] = 0;
              }
            }
          }
          return arr;
        })(this.score);
        this.rePaint();
      }
      this.i1.addEventListener("input", this.canvasUpdate);
      this.i2.addEventListener("input", () => {
        this.bpmSelect = Number(this.i2.value);
      });
      this.optionUpdate = () => {
        this.select.innerHTML = "";
        for(let i = 0; i < this.bpmChanges.length - 1; i++){
          for(let j = i + 1; j < this.bpmChanges.length; j++){
            if(this.bpmChanges[i][0] > this.bpmChanges[j][0]){
              [this.bpmChanges[i], this.bpmChanges[j]] = [this.bpmChanges[j], this.bpmChanges[i]];
            }else if(this.bpmChanges[i][0] == this.bpmChanges[j][0]){
              this.bpmChanges[i] = this.bpmChanges[j];
              this.bpmChanges.splice(j, 1);
              j--;
            }
          }
        }
        for(let i = 0; i < this.bpmChanges.length; i++){
          let op = document.createElement("option");
          op.innerHTML = this.bpmChanges[i][0] + ":" + this.bpmChanges[i][1];
          this.select.appendChild(op);
        }
      };
      this.optionUpdate();
      this.i4.addEventListener("click", () => {
        this.bpmChanges.push([this.bpmSelect, Number(this.i3.value)]);
        gloBpm = Number(this.i3.value);
        this.optionUpdate();
      });
      this.i5.addEventListener("click", () => {
        if(this.bpmChanges.length > 1 && this.bpmChanges[this.select.selectedIndex][0] != 1) this.bpmChanges.splice(this.select.selectedIndex, 1);
        this.optionUpdate();
      });

      this.rePaint = () => {
        let ctx = this.ctx;
    		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    		ctx.strokeStyle = "white";
    		ctx.lineWidth = 1;
    		for(var i = 0; i < Math.floor(this.measure / (48 / createPart)) + 1; i++){
    			ctx.beginPath();
    			ctx.moveTo((8 * 48 / createPart) * i, 0);
    			ctx.lineTo((8 * 48 / createPart) * i, 180);
    			ctx.stroke();
    		}
    		for(var i = 0; i < 7; i++){
    			ctx.beginPath();
    			ctx.moveTo(0, 30 * i);
    			ctx.lineTo(this.canvas.width, 30 * i);
    			ctx.stroke();
    		}
    		for(var i = 0; i < 6; i++){
    			for(var j = 0; j < this.measure; j++){
            if(this.score[i][j] != 0){
      				if(this.score[i][j] == 1){
      					ctx.strokeStyle = "aqua";
      				}else if(this.score[i][j] == 2){
                ctx.strokeStyle = "yellow";
              }else if(this.score[i][j] == 3){
                ctx.strokeStyle = "red";
              }
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(8 * j, 30 * i);
              ctx.lineTo(8 * j, 30 * i + 30);
              ctx.stroke();
            }
    			}
    		}
    	}
      this.rePaint();
      this.canvas.addEventListener("click", (e) => {
        var rect = e.target.getBoundingClientRect();
    		var x = e.clientX - rect.left;
    		var y = e.clientY - rect.top;
    		var lane = Math.floor(y / 30);
    		var time = Math.floor(x / (8 * 48 / createPart)) * (48 / createPart);
    		if(this.score[lane][time] != putNote){
          if(putNote == 1 || putNote == 0){
            this.score[lane][time] = putNote;
          }else if(putNote == 2){
            this.score[lane][time] = holdState[lane] == 0 ? 2 : 3;
            holdState[lane] = 1 - holdState[lane];
          }
        }else{
          this.score[lane][time] = 0;
        }
        this.rePaint();
      });

      document.getElementById("timeline").appendChild(this.d1);
    }

    return Syousetsu;
  }

  function getE(id){
    return document.getElementById(id);
  }
  function deleteE(elm){
    elm.parentNode.removeChild(elm);
  }

});
