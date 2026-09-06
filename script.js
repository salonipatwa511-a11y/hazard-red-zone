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