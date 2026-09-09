// ==========================================
// HAZARDGUARD - SCRIPT.JS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    setupAssessment();
    initializeBiharMap();
});


// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error("Dashboard API failed");
        }

        const data = await response.json();

        console.log("Dashboard data:", data);

        // Dashboard cards
        const redZones = document.getElementById("redZones");
        const vulnerablePeople =
            document.getElementById("vulnerablePeople");
        const immediateRelocation =
            document.getElementById("immediateRelocation");
        const totalPopulation =
            document.getElementById("totalPopulation");

        if (redZones) {
            redZones.textContent = data.redZones ?? 0;
        }

        if (vulnerablePeople) {
            vulnerablePeople.textContent =
                Number(data.totalVulnerable || 0).toLocaleString();
        }

        if (immediateRelocation) {
            immediateRelocation.textContent =
                data.immediateRelocation ?? 0;
        }

        if (totalPopulation) {
            totalPopulation.textContent =
                Number(data.totalPopulation || 0).toLocaleString();
        }

        // Red zone table
        createRedZoneTable(data.habitations || []);

    } catch (error) {
        console.error("Dashboard error:", error);

        const table = document.getElementById("zonesTable");

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load dashboard data.
                    </td>
                </tr>
            `;
        }
    }
}


// ==========================================
// RED ZONE TABLE
// ==========================================

function createRedZoneTable(habitations) {

    const tableBody =
        document.getElementById("zonesTable");

    if (!tableBody) {
        console.error("zonesTable not found.");
        return;
    }

    // Only show high-risk / red-zone entries
    const redZones = habitations.filter(item => {
        return Number(item.risk || 0) >= 70 ||
               item.zone === "RED" ||
               item.priority === "Immediate" ||
               item.priority === "High";
    });

    if (redZones.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No red zones identified.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = "";

    redZones.forEach(item => {

        const row = document.createElement("tr");

        const district =
            item.district ||
            item.name ||
            "Unknown";

        const location =
            item.location ||
            item.state ||
            "Bihar";

        const hazard =
            item.hazard ||
            item.primaryHazard ||
            "Flood";

        const population =
            item.population ||
            item.pop ||
            0;

        const risk =
            item.risk ??
            item.redScore ??
            item.priorityScore ??
            0;

        const priority =
            item.priority ||
            getPriorityFromRisk(risk);

        row.innerHTML = `
            <td>${escapeHTML(district)}</td>

            <td>${escapeHTML(location)}</td>

            <td>${escapeHTML(hazard)}</td>

            <td>
                ${Number(population).toLocaleString()}
            </td>

            <td>
                <strong>${Math.round(Number(risk))}</strong>
            </td>

            <td>
                <span class="priority-badge ${priorityClass(priority)}">
                    ${escapeHTML(priority)}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ==========================================
// PRIORITY
// ==========================================

function getPriorityFromRisk(risk) {

    risk = Number(risk);

    if (risk >= 75) {
        return "Immediate";
    }

    if (risk >= 55) {
        return "High";
    }

    if (risk >= 30) {
        return "Medium";
    }

    return "Monitor";
}


function priorityClass(priority) {

    const value =
        String(priority).toLowerCase();

    if (value.includes("immediate")) {
        return "priority-immediate";
    }

    if (value.includes("high")) {
        return "priority-high";
    }

    if (value.includes("medium")) {
        return "priority-medium";
    }

    return "priority-monitor";
}


// ==========================================
// ASSESSMENT FORM
// ==========================================

function setupAssessment() {

    const form =
        document.getElementById("assessmentForm");

    if (!form) {
        console.error("assessmentForm not found.");
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const population =
            Number(
                document.getElementById("population").value
            );

        const capacity =
            Number(
                document.getElementById("capacity").value
            );

        const hazardScore =
            Number(
                document.getElementById("hazardScore").value
            );

        const vulnerability =
            Number(
                document.getElementById("vulnerability").value
            );


        try {

            const response = await fetch("/api/assess", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    population,
                    capacity,
                    hazardScore,
                    vulnerability
                })
            });


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.message ||
                    "Assessment failed."
                );

                return;
            }


            displayAssessmentResult(result);

        } catch (error) {

            console.error(
                "Assessment error:",
                error
            );

            alert(
                "Unable to connect to backend."
            );
        }
    });
}


// ==========================================
// DISPLAY ASSESSMENT RESULT
// ==========================================

function displayAssessmentResult(result) {

    const riskScore =
        document.getElementById("riskScore");

    const capacityUsage =
        document.getElementById("capacityUsage");

    const overCapacity =
        document.getElementById("overCapacity");

    const priority =
        document.getElementById("priority");

    const recommendation =
        document.getElementById("recommendation");


    if (riskScore) {
        riskScore.textContent =
            `${result.riskScore}/100`;
    }

    if (capacityUsage) {
        capacityUsage.textContent =
            `${result.capacityUsage}%`;
    }

    if (overCapacity) {
        overCapacity.textContent =
            Number(result.overloadedPeople || 0)
                .toLocaleString();
    }

    if (priority) {
        priority.textContent =
            result.priority;
    }

    if (recommendation) {
        recommendation.textContent =
            result.recommendation;
    }
}


// ==========================================
// BIHAR LEAFLET MAP
// ==========================================

let biharMap = null;


function initializeBiharMap() {

    const mapElement =
        document.getElementById("biharMap");

    if (!mapElement) {
        console.error("biharMap element not found.");
        return;
    }

    // Check Leaflet
    if (typeof L === "undefined") {
        console.error(
            "Leaflet library not loaded."
        );
        return;
    }


    // Prevent duplicate map initialization
    if (biharMap !== null) {
        biharMap.remove();
    }


    // Bihar approximate center
    biharMap = L.map("biharMap").setView(
        [25.96, 85.27],
        7
    );


    // OpenStreetMap layer
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 18,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(biharMap);
    addProjectDistrictHighlights();


    // Make sure Leaflet calculates correct size
    setTimeout(() => {
        biharMap.invalidateSize();
    }, 300);


    // Load project district information
    loadMapData();
}


// ==========================================
// MAP DATA
// ==========================================

async function loadMapData() {

    try {

        const response =
            await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error(
                "Unable to load map data"
            );
        }

        const data =
            await response.json();

        const habitations =
            data.habitations || [];


        /*
         * The uploaded project HTML does not provide
         * district latitude/longitude coordinates.
         *
         * Therefore we do NOT invent district coordinates.
         *
         * The Bihar geographical map itself is displayed
         * using Leaflet + OpenStreetMap.
         */


        // Map information box
        addMapInfo(habitations);


    } catch (error) {

        console.error(
            "Map data error:",
            error
        );
    }
}

// ==========================================
// BIHAR PROJECT DISTRICT HIGHLIGHTS
// ==========================================

function addProjectDistrictHighlights() {

    if (!biharMap) {
        return;
    }

    const districtCenters = {

        "Darbhanga": [26.1542, 85.8918],

        "Madhubani": [26.3497, 86.0717],

        "Sitamarhi": [26.5881, 85.5016],

        "Sheohar": [26.5139, 85.2931],

        "Supaul": [26.1260, 86.6050],

        "Saharsa": [25.8830, 86.6000],

        "Khagaria": [25.5022, 86.4671],

        "Purnia": [25.7771, 87.4753],

        "Katihar": [25.5393, 87.5789],

        "Araria": [26.1320, 87.4650],

        "Kishanganj": [26.1025, 87.9540]

    };


    Object.entries(
        districtCenters
    ).forEach(
        ([district, coordinates]) => {

            const marker =
                L.circleMarker(
                    coordinates,
                    {
                        radius: 9,
                        weight: 3,
                        fillOpacity: 0.75
                    }
                );


            marker
                .bindPopup(`
                    <strong>
                        ${district}
                    </strong>
                    <br>
                    Bihar Project District
                    <br><br>
                    Click the district
                    selector below to view
                    block-level analysis.
                `)
                .addTo(biharMap);
        }
    );
}

// ==========================================
// MAP INFO
// ==========================================

function addMapInfo(habitations) {

    if (!biharMap) {
        return;
    }


    const redCount =
        habitations.filter(item => {

            const risk =
                Number(
                    item.risk ??
                    item.redScore ??
                    0
                );

            return risk >= 70 ||
                   item.zone === "RED";

        }).length;


    const info =
        L.control({
            position: "topright"
        });


    info.onAdd = function () {

        const div =
            L.DomUtil.create(
                "div",
                "map-info-box"
            );

        div.innerHTML = `
            <strong>Bihar Risk Monitoring</strong>
            <br>
            District records:
            ${habitations.length}
            <br>
            High-risk records:
            ${redCount}
        `;

        return div;
    };


    info.addTo(biharMap);
}


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// ==========================================
// BLOCK LEVEL ANALYSIS
// ==========================================

const projectDistricts = [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran"
];

function setupBlockAnalysis() {

    const select =
        document.getElementById("districtSelect");

    if (!select) {
        return;
    }


    projectDistricts.forEach(district => {

        const option =
            document.createElement("option");

        option.value = district;
        option.textContent = district;

        select.appendChild(option);

    });


    select.addEventListener(
        "change",
        () => {

            const district =
                select.value;

            if (district) {
                loadBlockData(district);
            }

        }
    );
}


async function loadBlockData(district) {

    const container =
        document.getElementById("blockCards");

    if (!container) {
        console.error("blockCards element not found.");
        return;
    }

    container.innerHTML = `
        <div class="district block-placeholder">
            Loading block data...
        </div>
    `;

    try {

        const response = await fetch(
            `/api/blocks/${encodeURIComponent(district)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Unable to load block data."
            );
        }

        renderBlockData(result);

    } catch (error) {

        console.error(
            "Block data error:",
            error
        );

        container.innerHTML = `
            <div class="district block-placeholder">
                Unable to load block data.
            </div>
        `;
    }
}


function renderBlockData(result) {
    const container = document.getElementById("blockCards");
    const blockCount = document.getElementById("blockCount");
    const highRiskBlocks = document.getElementById("highRiskBlocks");
    const immediateBlocks = document.getElementById("immediateBlocks");

    if (!container) return;

    // Total blocks
    if (blockCount) {
        blockCount.textContent = result.blocks.length;
    }

    // High Risk = Risk Score 75 or above
    const highRisk = result.blocks.filter(
        block => Number(block.riskScore) >= 75
    );

    if (highRiskBlocks) {
        highRiskBlocks.textContent = highRisk.length;
    }

    // High Priority = Priority is High
    const highPriority = result.blocks.filter(
        block => String(block.priority).trim().toLowerCase() === "high"
    );

    if (immediateBlocks) {
        immediateBlocks.textContent = highPriority.length;
    }

    // Render 5 blocks
    container.innerHTML = "";

    result.blocks.forEach(block => {
        const card = document.createElement("div");

        card.className = "district";

        card.innerHTML = `
            <b>${escapeHTML(block.block)}</b>
            Risk ${Number(block.riskScore)}/100
            <small>
                Access ${Number(block.access)}%<br>
                Priority ${escapeHTML(block.priority)}
            </small>
        `;

        container.appendChild(card);
    });
}


// ==========================================
// START BLOCK MODULE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupBlockAnalysis();
    }
);