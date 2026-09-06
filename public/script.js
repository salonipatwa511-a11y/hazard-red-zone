// ==========================================
// LOAD DASHBOARD DATA FROM NODE.JS BACKEND
// ==========================================

async function loadDashboard() {

    try {

        const response = await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error("Dashboard data load nahi hua");
        }

        const data = await response.json();


        // Dashboard numbers
        document.getElementById("redZones").textContent =
            data.redZones;

        document.getElementById("vulnerablePeople").textContent =
            data.totalVulnerable;

        document.getElementById("immediateRelocation").textContent =
            data.immediateRelocation;

        document.getElementById("totalPopulation").textContent =
            data.totalPopulation;


        // Red Zone Table
        const table = document.getElementById("zonesTable");

        table.innerHTML = "";


        const redZones = data.habitations.filter(
            item => item.risk >= 75
        );


        redZones.forEach(item => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.location}</td>
                <td>${item.hazard}</td>
                <td>${item.population}</td>
                <td>${item.risk}</td>
                <td>${item.priority}</td>
            `;

            table.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}


// ==========================================
// RISK ASSESSMENT FORM
// ==========================================

const assessmentForm =
    document.getElementById("assessmentForm");


if (assessmentForm) {

    assessmentForm.addEventListener(
        "submit",
        async function (event) {

            // Page reload ko rokna
            event.preventDefault();


            // Form values
            const population = Number(
                document.getElementById("population").value
            );

            const capacity = Number(
                document.getElementById("capacity").value
            );

            const hazardScore = Number(
                document.getElementById("hazardScore").value
            );

            const vulnerability = Number(
                document.getElementById("vulnerability").value
            );


            try {

                // Backend ko data bhejna
                const response = await fetch(
                    "/api/assess",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            population: population,
                            capacity: capacity,
                            hazardScore: hazardScore,
                            vulnerability: vulnerability

                        })
                    }
                );


                const data = await response.json();


                // Error response
                if (!data.success) {

                    alert(data.message);

                    return;

                }


                // =================================
                // SHOW RESULT ON WEBSITE
                // =================================

                document.getElementById(
                    "riskScore"
                ).textContent =
                    data.riskScore;


                document.getElementById(
                    "capacityUsage"
                ).textContent =
                    data.capacityUsage + "%";


                document.getElementById(
                    "overCapacity"
                ).textContent =
                    data.overloadedPeople +
                    " people";


                document.getElementById(
                    "priority"
                ).textContent =
                    data.priority;


                document.getElementById(
                    "recommendation"
                ).textContent =
                    data.recommendation;


            } catch (error) {

                console.error(
                    "Assessment Error:",
                    error
                );

                alert(
                    "Server error! Please check Node.js server."
                );

            }

        }
    );

}


// ==========================================
// START DASHBOARD
// ==========================================

loadDashboard();
/* =========================================
   BIHAR RISK MAP
========================================= */

let biharMap;

function initializeBiharMap(districts) {

    if (typeof L === "undefined") {
        console.error("Leaflet library not loaded.");
        return;
    }

    const mapElement = document.getElementById("biharMap");

    if (!mapElement) {
        return;
    }

    biharMap = L.map("biharMap").setView(
        [25.9, 85.5],
        7
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 18,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(biharMap);


    /*
       Approximate district locations for
       visual project mapping.
    */

    const districtCoordinates = {

        "Muzaffarpur District": [26.12, 85.39],

        "Darbhanga District": [26.15, 85.89],

        "Madhubani District": [26.35, 86.07],

        "Samastipur District": [25.86, 85.78],

        "Vaishali District": [25.68, 85.36],

        "Saharsa District": [25.88, 86.60],

        "Supaul District": [26.13, 86.60],

        "Khagaria District": [25.50, 86.47],

        "Katihar District": [25.54, 87.57],

        "Bhagalpur District": [25.25, 87.00]
    };


    districts.forEach(district => {

        const coordinates =
            districtCoordinates[district.name];

        if (!coordinates) {
            return;
        }

        const marker = L.marker(coordinates)
            .addTo(biharMap);


        marker.bindPopup(`
            <div>
                <div class="map-popup-title">
                    ${district.name}
                </div>

                <b>Hazard:</b>
                ${district.hazard}<br>

                <b>Population:</b>
                ${Number(district.population)
                    .toLocaleString("en-IN")}<br>

                <b>Vulnerability:</b>
                ${district.hazardCategory}<br>

                <b>Model Risk Score:</b>
                <span class="map-popup-risk">
                    ${district.riskScore || district.risk}
                </span><br>

                <b>Priority:</b>
                ${district.priority}
            </div>
        `);

    });
}
fetch("/api/dashboard")
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            initializeBiharMap(data.habitations);
        }
    })
    .catch(error => {
        console.error("Map data error:", error);
    });
