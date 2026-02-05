const input = document.getElementById("fileInput");
const table = document.getElementById("table");
const searchInput = document.getElementById("searchInput");

let globalData = [];
let scoreKey = "";


input.addEventListener("change", async () => {

    const form = new FormData();
    form.append("file", input.files[0]);

    const res = await fetch("/upload", {
        method: "POST",
        body: form
    });

    const data = await res.json();
    globalData = data;

    const keys = Object.keys(data[0]);

    scoreKey = keys.find(k => typeof data[0][k] === "number");

    const scores = data.map(d => d[scoreKey]);

    // ===== KPI CARDS =====
    document.getElementById("students").innerHTML = `Students<br><b>${scores.length}</b>`;
    document.getElementById("avg").innerHTML = `Avg<br><b>${avg(scores)}</b>`;
    document.getElementById("max").innerHTML = `Max<br><b>${Math.max(...scores)}</b>`;
    document.getElementById("min").innerHTML = `Min<br><b>${Math.min(...scores)}</b>`;

    // ===== CHART =====
    new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels: scores.map((_, i) => i + 1),
            datasets: [{
                label: "Scores",
                data: scores
            }]
        }
    });

    renderTable(globalData);
});


// ===== TABLE RENDER WITH COLOR =====
function renderTable(data) {

    table.innerHTML = "";

    if (!data.length) return;

    const keys = Object.keys(data[0]);

    let header = "<tr>" + keys.map(k => `<th>${k}</th>`).join("") + "</tr>";

    let rows = data.map(d => {

        const score = d[scoreKey];

        let color = "";
        if (score >= 0.8) color = "#d4edda";      // green
        else if (score >= 0.5) color = "#fff3cd"; // yellow
        else color = "#f8d7da";                   // red

        return `<tr style="background:${color}">
            ${keys.map(k => `<td>${d[k]}</td>`).join("")}
        </tr>`;
    }).join("");

    table.innerHTML = header + rows;
}


// ===== SEARCH =====
searchInput.addEventListener("keyup", () => {

    const value = searchInput.value.toLowerCase();

    const filtered = globalData.filter(row =>
        Object.values(row).join(" ").toLowerCase().includes(value)
    );

    renderTable(filtered);
});


// ===== UTILS =====
function avg(arr) {
    return (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2);
}
