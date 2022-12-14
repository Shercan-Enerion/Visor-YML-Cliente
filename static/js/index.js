// Modal para la grafica
var graphData = [];
var nameElement = "";
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("btn-cerrar-modal");
function openModal(element) {
  nameElement = element.name;
  console.log(element.name);
  httpGet(element.name);
  // graphData = httpGet(30);
  modal.showModal();
}

btnCerrar.addEventListener("click", () => {
  graphData = [];
  modal.close();
});

// Grafica de datos
const ctx = document.getElementById("myChart").getContext("2d");

var newChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
    datasets: [
      {
        label: "Register ##",
        data: [],
        borderColor: "rgb(75, 192, 192)",
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
Chart.defaults.backgroundColor = "#48E42E";
Chart.defaults.borderColor = "#48E42E";
Chart.defaults.color = "#000000";

// Websocket de conexion
var ws = new WebSocket("ws://" + window.location.host + "/ws/");
var control = true;
async function processMessage(event) {
  const d = new Date();
  var jsonObj = JSON.parse(event.data);
  jsonObj.forEach((key) => {
    document.getElementById(key.name).value = key.value;
    if (key.name == nameElement && d.getSeconds() == 0 && control == true) {
      if (newChart.data.datasets[0].data.length > 20) {
        graphData.shift();
      }
      console.log(key.name + " " + key.value);
      graphData.push(key.value);
      newChart.data.datasets[0].data = graphData;
      newChart.update();
      control = false;
    } else if (d.getSeconds() != 0) {
      control = true;
    }
  });
}
function closedWs(event) {
  event.console.log("Connection closed");
}
ws.onmessage = processMessage;
ws.onclose = function (event) {
  alert("Connection closed");
};

function sendValue(element) {
  console.log("in" + element.name);
  let jsonObj = {
    name: element.name,
    value: document.getElementById("in" + element.name).value,
  };

  console.log(jsonObj);
  ws.send(JSON.stringify(jsonObj));
}
// llamada a la pagina web

// async function httpGet(elemento) {
//   let theUrl = "http://141.147.133.37/get_registers";
//   // let theUrl = "http://127.0.0.1:5000/get_registers";
//   let response = await fetch(theUrl);
//   await response.json().forEach((element) => {
//     if (graphData.length < 20) {
//       graphData.push(element[30]);
//       newChart.data.datasets[0].data = graphData;
//     }
//   });
// }
function httpGet(registerName) {
  let theUrl = "http://" + window.location.host + "/get_registers";
  // let theUrl = "http://127.0.0.1:5000/get_registers";
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl + "/" + registerName, false); // false for synchronous request
  xmlHttp.send(null);
  console.log(xmlHttp.responseText);
  try {
    JSON.parse(xmlHttp.responseText).forEach((element) => {
      if (graphData.length < 20) {
        graphData.push(element["data"]);
        newChart.data.datasets[0].data = graphData;
      }
    });
  } catch (e) {
    alert("Error in database");
  }
  console.log(graphData);
}
