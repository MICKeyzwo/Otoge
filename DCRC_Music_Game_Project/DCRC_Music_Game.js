window.addEventListener("load", () => {
  let sl = [];
  let script = document.createElement("script");
  script.src = "score_list.js";
  script.type = "text/javascript";
  script.id = "score_list";
  document.body.appendChild(script);
  window._getScoreList = (list) => {
    sl = list;
    deleteE(script);
    console.log(sl);
    let str = `
      <table class="songTable">
        <tr>
          <th>Title</th>
          <th>Easy</th>
          <th>Normal</th>
          <th>Hard</th>
        </tr>
    `;
    for(let i = 0; i < sl.length; i++){
      str += `
        <tr>
          <td class="songTitle">
            ${sl[i].title}<br>
            <span class="subTitle">
              ${sl[i].subtitle}
            </span>
          </td>
          <td class="songLevel">
            <a href="javascript:void(0);" style="color: aqua;" onclick="openGame(${i}, 0)">
              ${sl[i].level[0]}
            </a>
          </td>
          <td class="songLevel">
            <a href="javascript:void(0);" style="color: lime;" onclick="openGame(${i}, 1)">
              ${sl[i].level[1]}
            </a>
          </td>
          <td class="songLevel">
            <a href="javascript:void(0);" style="color: red;" onclick="openGame(${i}, 2)">
              ${sl[i].level[2]}
            </a>
          </td>
        </tr>
      `;
    }
    str += "</table>";
    getE("songList").innerHTML += str;
  }

  function openGame(index, level){
    let script = document.createElement("script");
    script.src = sl[index].src[level];
    script.type = "text/javascript";
    document.body.appendChild(script);
  }
  window.openGame = openGame;

  function getE(id){
    return document.getElementById(id);
  }

  function deleteE(elm){
    elm.parentNode.removeChild(elm);
  }
});
