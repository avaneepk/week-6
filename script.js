const chartData = {
  labels: [],
  datasets: [
    {
      name: "Population",
      type: "line",
      color: "#eb5146",
      values: []
    }
  ]
};

const chartConfig = {
  title: "Population Data",
  type: "line",
  height: 450,
  colors: ["#eb5146"],
  x: {
    labels: []
  }
};

function calculateDeltaMean(data) {
  if (data.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < data.length; i++) {
    sum += data[i] - data[i - 1];
  }
  return sum / (data.length - 1);
}

async function fetchData(areaCode) {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const body = {
    query: [
      {
        code: "Vuosi",
        selection: {
          filter: "item",
          values: [
            "2000",
            "2001",
            "2002",
            "2003",
            "2004",
            "2005",
            "2006",
            "2007",
            "2008",
            "2009",
            "2010",
            "2011",
            "2012",
            "2013",
            "2014",
            "2015",
            "2016",
            "2017",
            "2018",
            "2019",
            "2020",
            "2021"
          ]
        }
      },
      {
        code: "Alue",
        selection: {
          filter: "item",
          values: [areaCode]
        }
      },
      {
        code: "Tiedot",
        selection: {
          filter: "item",
          values: ["vaesto"]
        }
      }
    ],
    response: {
      format: "json-stat2"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data.dataset.value;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

async function fetchMunicipalityCodes() {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.dataset.dimension.Alue.category.index;
  } catch (error) {
    console.error("Error fetching municipality codes:", error);
    return {};
  }
}

async function displayDataOnChart() {
  const areaCode = "SSS"; // Default area code for the whole country
  const populationData = await fetchData(areaCode);

  chartData.labels = populationData.map((item) => item.key);
  chartData.datasets[0].values = populationData.map((item) => item.value);

  chartConfig.x.labels = populationData.map((item) => item.key);

  const chart = new frappe.Chart("#chart", {
    data: chartData,
    title: chartConfig.title,
    type: chartConfig.type,
    height: chartConfig.height,
    colors: chartConfig.colors,
    x: chartConfig.x
  });
}

document.addEventListener("DOMContentLoaded", () => {
  displayDataOnChart();

  const inputArea = document.getElementById("input-area");
  const submitButton = document.getElementById("submit-data");
  const addDataButton = document.getElementById("add-data");

  submitButton.addEventListener("click", async () => {
    const municipalityCodes = await fetchMunicipalityCodes();
    const areaName = inputArea.value.trim().toLowerCase();
    const areaCode = municipalityCodes[1].findIndex(
      (item) => item === areaName
    );
    if (areaCode !== -1) {
      const populationData = await fetchData(municipalityCodes[0][areaCode]);
      const populationValues = populationData.map((item) => item.value);
      chartData.labels = populationData.map((item) => item.key);
      chartData.datasets[0].values = populationValues;
      chartConfig.x.labels = populationData.map((item) => item.key);
      chart.update(chartData);
    } else {
      alert("Invalid municipality name. Please try again.");
    }
  });

  addDataButton.addEventListener("click", () => {
    const populationValues = chartData.datasets[0].values;
    const deltaMean = calculateDeltaMean(populationValues);
    const nextValue = population;
    const nextValue2 =
      populationValues[populationValues.length - 1] + deltaMean;
    populationValues.push(nextValue);
    chartData.labels.push(
      (parseInt(chartData.labels[chartData.labels.length - 1]) + 1).toString()
    );
    chart.update(chartData);
  });

  const navigationLink = document.getElementById("navigation");
  navigationLink.addEventListener("click", () => {
    window.location.href = "/newchart.html";
  });
});
