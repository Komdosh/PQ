window.onload = function () {
  main();
};

//**********************************************************************************
//Main constants
const P = 0;
const Q = 1;
const PQ = 2;
let marketNeedP = 100;
let marketNeedQ = 50;
let workTimeInMinutes;
//Classes
const workerAgents = function (nameInp, tfm) { //Worker Agent
  this.name = nameInp;
  this.timeForMake = tfm;		//time Array
  this.wholeTimeOfWork = 0;

  this.getWholeTimeOfWork = function () {
    let wholeTimeOfWork = 0;
    wholeTimeOfWork += this.timeForMake[P] * marketNeedP;
    wholeTimeOfWork += this.timeForMake[Q] * marketNeedQ;
    wholeTimeOfWork += this.timeForMake[PQ] * (marketNeedP + marketNeedQ);
    this.wholeTimeOfWork = wholeTimeOfWork;
    return wholeTimeOfWork;
  };

  this.areYouConstraint = function () {
    return this.getWholeTimeOfWork() > workTimeInMinutes;
  }
};

const marketAgents = function (nameInp, priceInp, materialCostInp, marketNeedInp, nop) { //Market Agent
  this.name = nameInp;
  this.priceForOne = priceInp;
  this.materialCost = materialCostInp;
  this.marketNeed = marketNeedInp; //in a week
  this.numberOfProduct = nop;
  this.throughput = 0;
  this.thPerMinute = 0; //throughputPerMinute
  this.countMake = 0;

  this.countThroughput = function () {
    let temp = this.priceForOne;
    for (let x in this.materialCost)
      temp -= this.materialCost[x];
    this.throughput = temp;
    if (this.name === 'P')
      this.thPerMinute = temp / (constraint.timeForMake[P] + constraint.timeForMake[PQ]);
    else
      this.thPerMinute = temp / (constraint.timeForMake[Q] + constraint.timeForMake[PQ]);
  }
};

let workDays = 5;
let workHours = 8;
workTimeInMinutes = workDays * workHours * 60;
let operExp = 6000;
const wA = [
  new workerAgents("A", [15, 10, 0]), //indexes: 0 - for P, 1 for Q, 2 - for PQ
  new workerAgents("B", [0, 15, 15]),
  new workerAgents("C", [10, 0, 5]),
  new workerAgents("D", [15, 5, 0])
];
const mA = [
  new marketAgents("P", 90, [20, 20, 0, 5], marketNeedP, P),
  new marketAgents("Q", 100, [0, 20, 20, 0], marketNeedQ, Q)
];

let interfaceDiv;
let mainDiv;
let constraint;
//***********************************************************************************
//main func like C program xD
function main() {
  document.body.innerHTML = "";
  interfaceDiv = document.createElement("div");
  mainDiv = document.createElement("div");
  document.body.appendChild(interfaceDiv);
  document.body.appendChild(mainDiv);

  buildInterface();
  calculate();
}

function findConstraints() {
  const constraints = [];
  let constraint;
  let i = 0;
  wA.forEach(agent => {
      if (agent.areYouConstraint()) {
        constraints[i] = agent;
        ++i;
      }
      mainDiv.innerHTML += agent.name + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' + agent.wholeTimeOfWork
        + '&nbsp&nbsp&nbsp&nbsp' + agent.areYouConstraint() + '<br>';
    }
  );

  constraint = constraints[0] == null ? wA[0] : constraints[0];
  constraints.forEach(c => {
    if (c.wholeTimeOfWork > constraint.wholeTimeOfWork)
      constraint = c;
  });

  return constraint;
}


function calculate() {
  mainDiv.innerHTML += "Name Time Constraint<br>";
  constraint = findConstraints();
  mA.forEach(agent => agent.countThroughput());
  mainDiv.innerHTML += "<br>Throughput P: " + mA[0].thPerMinute + "$/min";
  mainDiv.innerHTML += "<br>Throughput Q: " + mA[1].thPerMinute + "$/min";
  mainDiv.innerHTML += "<br>Market Need P: " + marketNeedP + " pcs/week";
  mainDiv.innerHTML += "<br>Market Need Q: " + marketNeedQ + " pcs/week";

  let maxEffective = (mA[0].thPerMinute > mA[1].thPerMinute) ? mA[0] : mA[1];
  let minEffective = (maxEffective === mA[1]) ? mA[0] : mA[1];
  let tempTimeOfConstraint = workTimeInMinutes;

  if ((maxEffective.marketNeed * constraint.timeForMake[maxEffective.numberOfProduct] +
    maxEffective.marketNeed * constraint.timeForMake[PQ]) < workTimeInMinutes) {

    tempTimeOfConstraint -= maxEffective.marketNeed * constraint.timeForMake[maxEffective.numberOfProduct] +
      maxEffective.marketNeed * constraint.timeForMake[PQ];
    maxEffective.countMake = maxEffective.marketNeed;
    minEffective.countMake = tempTimeOfConstraint / (constraint.timeForMake[minEffective.numberOfProduct] +
      constraint.timeForMake[PQ]);
  } else {
    minEffective.countMake = 0;
    maxEffective.countMake = tempTimeOfConstraint / (constraint.timeForMake[maxEffective.numberOfProduct] +
      constraint.timeForMake[PQ]);
  }
  const profit = maxEffective.countMake * maxEffective.throughput + minEffective.countMake * minEffective.throughput;
  mainDiv.innerHTML += "<br>Profit: " + profit + " - " + operExp + " = " + (profit - operExp);
}

let createCellWithHtml = function (innerHTML) {
  const td = document.createElement('td');
  td.innerHTML = innerHTML;
  return td;
};

let appendRowWithCell = function (rowElements, tb) {
  let tr = document.createElement('tr');

  rowElements.forEach(element => {
    tr.appendChild(createCellWithHtml(element))
  });

  tb.appendChild(tr);
};

let createInputTd = function (value, inputId, placeholder = "15") {
  const td = document.createElement('td');
  td.appendChild(createInput(value, inputId, placeholder));
  return td;
};

let createInput = function (value, inputId, placeholder = "15") {
  const inp = document.createElement('input');
  inp.setAttribute("placeholder", placeholder);
  inp.setAttribute("value", value);
  inp.setAttribute("style", "width: 120px");
  inp.type = 'number';
  inp.id = inputId;
  return inp;
};

let companyTimingTable = function () {
  let tb = document.createElement('table');
  tb.setAttribute("border", "1px");

  const tableHeaders = ["Company Name", "Time for create P", "Time for create Q", "Time for create PQ"];
  appendRowWithCell(tableHeaders, tb);

  const productNames = ["A", "B", "C", "D"];
  productNames.forEach((name, companyId) => {
    const tr = document.createElement('tr');

    tr.appendChild(createCellWithHtml(name));
    for (let materialId = 0; materialId < 3; ++materialId) {
      tr.appendChild(createInputTd(wA[companyId].timeForMake[materialId], materialId + 'tfm' + companyId));
    }

    tb.appendChild(tr);
  });

  interfaceDiv.appendChild(tb);
  interfaceDiv.innerHTML += "<hr>";
};

let costTable = function () {
  let tb = document.createElement('table');
  tb.setAttribute("border", "1px");

  let tr = document.createElement('tr');

  const costHeaders = ["Product", "Cost of 1 pcs."];

  for (let materialId = 1; materialId < 5; ++materialId) {
    costHeaders.push(materialId + " material cost");
  }

  costHeaders.push("Pcs. per week");
  appendRowWithCell(costHeaders, tb);

  const names = ["P", "Q"];
  for (let materialId = 0; materialId < 2; ++materialId) {
    tr = document.createElement('tr');

    tr.appendChild(createCellWithHtml(names[materialId]));
    tr.appendChild(createInputTd(mA[materialId].priceForOne, 'priceForOne' + materialId));

    for (let materialCostId = 0; materialCostId < 4; ++materialCostId) {
      tr.appendChild(createInputTd(mA[materialId].materialCost[materialCostId], materialCostId + 'materialCost' + materialId));
    }

    tr.appendChild(createInputTd(mA[materialId].marketNeed, 'marketNeed' + materialId));

    tb.appendChild(tr);
  }

  interfaceDiv.appendChild(tb);
  interfaceDiv.innerHTML += "<hr>";
};

let resultTable = function () {
  const tb = document.createElement('table');
  tb.setAttribute("border", "1px");

  const resultHeaders = ["Operating Expenses", "Work days", "Work hours"];
  appendRowWithCell(resultHeaders, tb);

  const tr = document.createElement('tr');

  tr.appendChild(createInputTd(operExp, 'operExp', 6000));
  tr.appendChild(createInputTd(workDays, 'workDays', 5));
  tr.appendChild(createInputTd(workHours, 'workHours', 9));

  tb.appendChild(tr);

  interfaceDiv.appendChild(tb);
};

let recalculateButton = function () {
  interfaceDiv.innerHTML += "<br>";
  var button = document.createElement('Button');
  button.innerHTML = "Recalculate";
  button.addEventListener('click', changeNumbers, false);
  interfaceDiv.appendChild(button);
  var hr = document.createElement('hr');
  interfaceDiv.appendChild(hr);
};

function buildInterface() {
  companyTimingTable();
  costTable();
  resultTable();
  recalculateButton();
}

const changeNumbers = function () {
  operExp = parseInt(document.getElementById('operExp').value);
  workDays = parseInt(document.getElementById('workDays').value);
  workHours = parseInt(document.getElementById('workHours').value);
  workTimeInMinutes = workDays * workHours * 60;

  wA.forEach((agent, companyId) => {
    for (let materialId = 0; materialId < 3; ++materialId) {
      agent.timeForMake[materialId] = parseInt(document.getElementById(materialId + "tfm" + companyId).value);
    }
  });

  mA.forEach((agent, materialId) => {
    agent.priceForOne = parseInt(document.getElementById("priceForOne" + materialId).value);
    for (let materialCostId = 0; materialCostId < 4; ++materialCostId) {
      agent.materialCost[materialCostId] = parseInt(document.getElementById(materialCostId + "materialCost" + materialId).value);
    }
    agent.marketNeed = parseInt(document.getElementById("marketNeed" + materialId).value);
  });

  marketNeedP = parseInt(document.getElementById("marketNeed0").value);
  marketNeedQ = parseInt(document.getElementById("marketNeed1").value);
  main();
};
