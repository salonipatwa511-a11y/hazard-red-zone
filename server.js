const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

/*
====================================================
REAL DATA SOURCE
====================================================

Population:
Census of India 2011

Hazard classification:
Government of Bihar flood-prone district classification

NOTE:
Population is official Census 2011 data.
Risk score, capacity and priority are calculated
by our proposed assessment model.
====================================================
*/

const habitations = [
    {
        id: 1,
        name: "Muzaffarpur District",
        location: "Muzaffarpur, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 4801062,
        capacity: 4200000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 2,
        name: "Darbhanga District",
        location: "Darbhanga, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 3937385,
        capacity: 3500000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 3,
        name: "Madhubani District",
        location: "Madhubani, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 4487379,
        capacity: 4000000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 4,
        name: "Samastipur District",
        location: "Samastipur, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 4261566,
        capacity: 3800000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 5,
        name: "Vaishali District",
        location: "Vaishali, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 3495021,
        capacity: 3200000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 6,
        name: "Saharsa District",
        location: "Saharsa, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 1900661,
        capacity: 1700000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 7,
        name: "Supaul District",
        location: "Supaul, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 2229076,
        capacity: 2000000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 8,
        name: "Khagaria District",
        location: "Khagaria, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 1666886,
        capacity: 1450000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 9,
        name: "Katihar District",
        location: "Katihar, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 3071029,
        capacity: 2750000,
        vulnerability: 90,
        hazardScore: 90
    },

    {
        id: 10,
        name: "Bhagalpur District",
        location: "Bhagalpur, Bihar",
        hazard: "Flood",
        hazardCategory: "Most Vulnerable",
        population: 3037766,
        capacity: 2700000,
        vulnerability: 90,
        hazardScore: 90
    }
];


/*
====================================================
RISK CALCULATION
====================================================
This is the project's proposed model.
It is NOT an official government risk score.
*/

function calculateRisk(data) {

    const capacityUsage =
        (data.population / data.capacity) * 100;

    const overloadedPeople =
        Math.max(0, data.population - data.capacity);

    const riskScore = Math.min(
        100,
        Math.round(
            data.hazardScore * 0.55 +
            data.vulnerability * 0.25 +
            Math.min(capacityUsage, 150) * 0.20
        )
    );

    let priority;

    if (riskScore >= 80 || overloadedPeople > 0) {
        priority = "Immediate";
    } else if (riskScore >= 65) {
        priority = "High";
    } else if (riskScore >= 45) {
        priority = "Medium";
    } else {
        priority = "Monitor";
    }

    let recommendation;

    if (priority === "Immediate") {
        recommendation =
            "Immediate relocation assessment and emergency shelter planning required.";
    } else if (priority === "High") {
        recommendation =
            "Prepare relocation plans and strengthen emergency response.";
    } else if (priority === "Medium") {
        recommendation =
            "Continuous monitoring and preparedness measures recommended.";
    } else {
        recommendation =
            "Continue monitoring hazard and population conditions.";
    }

    return {
        capacityUsage: Number(capacityUsage.toFixed(2)),
        overloadedPeople,
        riskScore,
        priority,
        recommendation
    };
}


/*
====================================================
ADD CALCULATED DATA TO HABITATIONS
====================================================
*/

const processedHabitations = habitations.map(item => {

    const result = calculateRisk(item);

    return {
        ...item,
        ...result,
        risk: result.riskScore
    };
});


/*
====================================================
GET DASHBOARD DATA
====================================================
*/

app.get("/api/dashboard", (req, res) => {

    const totalPopulation =
        processedHabitations.reduce(
            (sum, item) => sum + item.population,
            0
        );

    const immediateRelocation =
        processedHabitations.filter(
            item => item.priority === "Immediate"
        ).length;

    const redZones =
        processedHabitations.filter(
            item => item.risk >= 75
        ).length;

    res.json({
        success: true,

        redZones: redZones,

        totalPopulation: totalPopulation,

        totalVulnerable: totalPopulation,

        immediateRelocation: immediateRelocation,

        habitations: processedHabitations
    });
});


/*
====================================================
ASSESSMENT API
====================================================
*/

app.post("/api/assess", (req, res) => {

    const {
        population,
        capacity,
        hazardScore,
        vulnerability
    } = req.body;

    if (
        population === undefined ||
        capacity === undefined ||
        hazardScore === undefined ||
        vulnerability === undefined
    ) {
        return res.json({
            success: false,
            message: "Please provide all assessment values."
        });
    }

    if (
        population <= 0 ||
        capacity <= 0 ||
        hazardScore < 0 ||
        hazardScore > 100 ||
        vulnerability < 0 ||
        vulnerability > 100
    ) {
        return res.json({
            success: false,
            message: "Please enter valid values."
        });
    }

    const result = calculateRisk({
        population,
        capacity,
        hazardScore,
        vulnerability
    });

    res.json({
        success: true,
        ...result
    });
});


/*
====================================================
GET PARTICULAR DISTRICT
====================================================
*/

app.get("/api/habitation/:id", (req, res) => {

    const id = Number(req.params.id);

    const habitation =
        processedHabitations.find(
            item => item.id === id
        );

    if (!habitation) {
        return res.status(404).json({
            success: false,
            message: "District not found."
        });
    }

    res.json({
        success: true,
        habitation
    });
});


/*
====================================================
TEST API
====================================================
*/

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Node.js backend is working!"
    });

});


/*
====================================================
START SERVER
====================================================
*/

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});