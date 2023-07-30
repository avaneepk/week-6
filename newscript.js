const birthDeathData = {
  labels: [],
  datasets: [
    {
      name: "Births",
      type: "bar",
      color: "#63d0ff",
      values: []
    },
    {
      name: "Deaths",
      type: "bar",
      color: "#363636",
      values: []
    }
  ]
};

const birthDeathConfig = {
  title: "Birth and Death Data",
  type: "bar",
  height: 450,
  colors: ["#63d0ff", "#363636"],
  x: {
    labels: []
  }
};

async function fetchBirthDeathData(areaCode) {
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
          values: ["vm01", "vm11"]
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
    console.error("Error fetching birth and death data:", error);
    return [];
  }
}

async function displayBirthDeathChart() {
  const areaCode = "SSS"; // Default area code for the whole country
  const birthDeathDataArr = await fetchBirthDeathData(areaCode);

  birthDeathData.labels = birthDeathDataArr.map((item) => item.key);
  birthDeathData.datasets[0].values = birthDeathDataArr
    .filter((item) => item.key.includes("vm01"))
    .map((item) => item.value);
  birthDeathData.datasets[1].values = birthDeathDataArr
    .filter((item) => item.key.includes("vm11"))
    .map((item) => item.value);

  birthDeathConfig.x.labels = birthDeathDataArr.map((item) => item.key);

  const birthDeathChart = new frappe.Chart("#birth-death-chart", {
    data: birthDeathData,
    title: birthDeathConfig.title,
    type: birthDeathConfig.type,
    height: birthDeathConfig.height,
    colors: birthDeathConfig.colors,
    x: birthDeathConfig.x
  });
}

document.addEventListener("DOMContentLoaded", () => {
  displayBirthDeathChart();

  const navigationLink = document.getElementById("navigation");
  navigationLink.addEventListener("click", () => {
    window.location.href = "/index.html";
  });
});
