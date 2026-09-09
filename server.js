// ====
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ==========================================
// HABITATION / DASHBOARD DATA
// ==========================================

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


// ==========================================
// GENERAL HELPER
// ==========================================

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}


// ==========================================
// HASH FUNCTION
// SAME AS ORIGINAL HTML
// ==========================================

function hashNum(str) {

    let h = 2166136261;

    for (const ch of str) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }

    return h >>> 0;
}


// ==========================================
// RISK CALCULATION
// PROPOSED PROJECT MODEL
// ==========================================

function calculateRisk(data) {

    const capacityUsage =
        (data.population / data.capacity) * 100;

    const overloadedPeople =
        Math.max(
            0,
            data.population - data.capacity
        );

    const riskScore = Math.min(
        100,
        Math.round(
            data.hazardScore * 0.55 +
            data.vulnerability * 0.25 +
            Math.min(capacityUsage, 150) * 0.20
        )
    );

    let priority;

    if (
        riskScore >= 80 ||
        overloadedPeople > 0
    ) {
        priority = "Immediate";
    }
    else if (riskScore >= 65) {
        priority = "High";
    }
    else if (riskScore >= 45) {
        priority = "Medium";
    }
    else {
        priority = "Monitor";
    }

    let recommendation;

    if (priority === "Immediate") {

        recommendation =
            "Immediate relocation assessment and emergency shelter planning required.";

    }
    else if (priority === "High") {

        recommendation =
            "Prepare relocation plans and strengthen emergency response.";

    }
    else if (priority === "Medium") {

        recommendation =
            "Continuous monitoring and preparedness measures recommended.";

    }
    else {

        recommendation =
            "Continue monitoring hazard and population conditions.";

    }

    return {
        capacityUsage:
            Number(capacityUsage.toFixed(2)),

        overloadedPeople,

        riskScore,

        priority,

        recommendation
    };
}


// ==========================================
// PROCESSED HABITATION DATA
// ==========================================

const processedHabitations =
    habitations.map(item => {

        const result =
            calculateRisk(item);

        return {
            ...item,
            ...result,
            risk: result.riskScore
        };
    });


// ==========================================
// BIHAR DISTRICTS
// 38 DISTRICTS
// ==========================================

const biharDistricts = [

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


// ==========================================
// 5 PROJECT BLOCKS FOR EVERY DISTRICT
// ==========================================

const biharBlocks =
    Object.fromEntries(

        biharDistricts.map(district => [

            district,

            [
                "Block A",
                "Block B",
                "Block C",
                "Block D",
                "Block E"
            ]

        ])
    );


// ==========================================
// ORIGINAL HTML MODEL
// BIHAR HAZARD DATA
// ==========================================

const stateHazardBase = {

    Bihar: {

        Flood: 78,

        Earthquake: 45

    }

};


// ==========================================
// KNOWN BIHAR HOTSPOTS
// SAME AS ORIGINAL HTML
// ==========================================

const knownHotspots = {

    Bihar: [

        "Darbhanga",
        "Madhubani",
        "Sitamarhi",
        "Sheohar",
        "Supaul",
        "Saharsa",
        "Khagaria",
        "Purnia",
        "Katihar",
        "Araria",
        "Kishanganj"

    ]

};


// ==========================================
// BIHAR PROFILE
// ==========================================

const profile = {

    Bihar: {

        haz: "Flood / Earthquake",

        base:
            "Flood exposure is a major concern, especially in vulnerable low-lying areas."

    }

};


// ==========================================
// DISTRICT MODEL
// SAME LOGIC AS ORIGINAL HTML
// ==========================================

function districtModel(name, state) {

    const h =
        hashNum(
            name + "|" + state
        );


    const hotspot =
        (knownHotspots[state] || [])
            .includes(name);


    const popL =
        1.2 +
        ((h % 190) / 10);


    const vulnerability =
        clamp(
            22 +
            ((h >>> 5) % 46) +
            (hotspot ? 12 : 0)
        );


    const road =
        clamp(
            45 +
            ((h >>> 9) % 48) -
            (hotspot ? 6 : 0)
        );


    const health =
        clamp(
            43 +
            ((h >>> 14) % 48)
        );


    const shelterCount =
        8 +
        ((h >>> 19) % 54);


    const perShelter =
        140 +
        ((h >>> 24) % 241);


    const shelterCapacity =
        shelterCount *
        perShelter;


    const infrastructureStress =
        clamp(
            100 -
            ((road + health) / 2) +
            ((h >>> 3) % 16)
        );


    const hazards = {};


    for (
        const [hazard, base]
        of Object.entries(
            stateHazardBase[state] || {}
        )
    ) {

        hazards[hazard] =
            clamp(
                base +
                (
                    (
                        h >>>
                        ((hazard.length * 3) % 20)
                    ) % 23
                ) -
                5 +
                (hotspot ? 7 : 0)
            );

    }


    const primary =
        (
            profile[state]?.haz ||
            "Flood / Earthquake"
        )
        .split(" / ")[0];


    const primaryHaz =
        hazards[primary] ||
        50;


    const secondary =
        Object.entries(hazards)

            .filter(
                ([key]) =>
                    key !== primary
            )

            .reduce(
                (max, [, value]) =>
                    Math.max(max, value),
                0
            );


    const capacityNeed =
        Math.ceil(
            popL *
            100000 *
            (
                0.12 +
                vulnerability / 500
            )
        );


    const capacityGap =
        clamp(
            (
                (
                    capacityNeed -
                    shelterCapacity
                ) /
                Math.max(
                    capacityNeed,
                    1
                )
            ) * 100
        );


    const accessPenalty =
        (100 - road) * 0.55 +
        (100 - health) * 0.45;


    const redScore =
        clamp(

            primaryHaz * 0.42 +

            secondary * 0.12 +

            vulnerability * 0.18 +

            infrastructureStress * 0.12 +

            capacityGap * 0.10 +

            accessPenalty * 0.06

        );


    const priorityScore =
        clamp(

            redScore * 0.72 +

            capacityGap * 0.16 +

            (100 - road) * 0.07 +

            (100 - health) * 0.05

        );


    return {

        popL,

        vulnerability,

        road,

        health,

        shelterCount,

        perShelter,

        shelterCapacity,

        capacityNeed,

        capacityGap,

        infrastructureStress,

        primaryHaz,

        secondary,

        redScore,

        priorityScore,

        hazards

    };
}


// ==========================================
// BLOCK MODEL
// SAME LOGIC AS ORIGINAL HTML
// ==========================================

function blockModel(block, district) {

    const districtData = districtModel(district, "Bihar");

    const blockIndex =
        biharBlocks[district].indexOf(block);

    // ==========================================
    // BLOCK-SPECIFIC FACTORS
    // ==========================================

    // Har block ke liye different factor
    const blockFactors = [
        -10,
        -4,
        2,
        7,
        12
    ];

    const blockFactor =
        blockFactors[blockIndex];


    // ==========================================
    // BLOCK HAZARD
    // ==========================================

    const blockHazard =
        clamp(
            districtData.primaryHaz +
            blockFactor
        );


    // ==========================================
    // BLOCK VULNERABILITY
    // ==========================================

    const blockVulnerability =
        clamp(
            districtData.vulnerability +
            Math.round(blockFactor * 0.7)
        );


    // ==========================================
    // BLOCK ACCESS
    // ==========================================

    const accessChanges = [
        -12,
        -6,
        0,
        7,
        13
    ];

    const access =
        clamp(
            Math.round(
                districtData.road +
                accessChanges[blockIndex]
            )
        );


    // ==========================================
    // BLOCK CAPACITY GAP
    // ==========================================

    const capacityChanges = [
        15,
        8,
        0,
        -7,
        -14
    ];

    const capacityGap =
        clamp(
            districtData.capacityGap +
            capacityChanges[blockIndex]
        );


    // ==========================================
    // BLOCK INFRASTRUCTURE STRESS
    // ==========================================

    const infrastructureStress =
        clamp(
            districtData.infrastructureStress +
            Math.round(blockFactor * 0.8)
        );


    // ==========================================
    // FINAL BLOCK RISK SCORE
    // ==========================================

    const riskScore =
        clamp(
            Math.round(

                blockHazard * 0.40 +

                blockVulnerability * 0.22 +

                infrastructureStress * 0.15 +

                capacityGap * 0.13 +

                (100 - access) * 0.10

            )
        );


    // ==========================================
    // PRIORITY
    // ==========================================

    let priority;


    if (
        riskScore >= 82 ||
        capacityGap >= 60 ||
        access < 40
    ) {

        priority = "Immediate";

    }

    else if (
        riskScore >= 68 ||
        capacityGap >= 45 ||
        access < 55
    ) {

        priority = "High";

    }

    else if (
        riskScore >= 50 ||
        capacityGap >= 25 ||
        access < 70
    ) {

        priority = "Medium";

    }

    else {

        priority = "Monitor";

    }


    return {

        district,

        block,

        riskScore,

        access,

        priority,

        hazardScore:
            Math.round(blockHazard),

        vulnerability:
            Math.round(blockVulnerability),

        capacityGap:
            Math.round(capacityGap),

        infrastructureStress:
            Math.round(infrastructureStress)

    };
}



// DASHBOARD API

app.get(
    "/api/dashboard",
    (req, res) => {

        const totalPopulation =
            processedHabitations.reduce(

                (sum, item) =>
                    sum + item.population,

                0

            );


        const totalVulnerable =
            processedHabitations.reduce(

                (sum, item) =>

                    sum +
                    Math.round(
                        item.population *
                        item.vulnerability /
                        100
                    ),

                0

            );


        const immediateRelocation =
            processedHabitations.filter(

                item =>
                    item.priority ===
                    "Immediate"

            ).length;


        const redZones =
            processedHabitations.filter(

                item =>
                    item.risk >= 75

            ).length;


        res.json({

            success: true,

            redZones,

            totalPopulation,

            totalVulnerable,

            immediateRelocation,

            habitations:
                processedHabitations

        });

    }
);


// ==========================================
// ASSESSMENT API
// ==========================================

app.post(
    "/api/assess",
    (req, res) => {

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

            return res.status(400).json({

                success: false,

                message:
                    "Please provide all assessment values."

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

            return res.status(400).json({

                success: false,

                message:
                    "Please enter valid values."

            });

        }


        const result =
            calculateRisk({

                population,

                capacity,

                hazardScore,

                vulnerability

            });


        res.json({

            success: true,

            ...result

        });

    }
);


// ==========================================
// PARTICULAR DISTRICT API
// ==========================================

app.get(
    "/api/habitation/:id",
    (req, res) => {

        const id =
            Number(req.params.id);


        const habitation =
            processedHabitations.find(

                item =>
                    item.id === id

            );


        if (!habitation) {

            return res.status(404).json({

                success: false,

                message:
                    "District not found."

            });

        }


        res.json({

            success: true,

            habitation

        });

    }
);


// ==========================================
// BLOCK API
// ==========================================

app.get(
    "/api/blocks/:district",
    (req, res) => {

        const district =
            decodeURIComponent(
                req.params.district
            );


        const blocks =
            biharBlocks[district];


        if (!blocks) {

            return res.status(404).json({

                success: false,

                message:
                    "District not found."

            });

        }


        const data =
            blocks.map(

                block =>
                    blockModel(
                        block,
                        district
                    )

            );


        res.json({

            success: true,

            district,

            totalBlocks:
                data.length,

            blocks:
                data

        });

    }
);


// ==========================================
// ALL BIHAR BLOCK DATA API
// ==========================================

app.get(
    "/api/blocks",
    (req, res) => {

        const result = {};


        Object.keys(
            biharBlocks
        ).forEach(

            district => {

                result[district] =
                    biharBlocks[district]
                        .map(

                            block =>
                                blockModel(
                                    block,
                                    district
                                )

                        );

            }

        );


        res.json({

            success: true,

            districts:
                result

        });

    }
);


// ==========================================
// TEST API
// ==========================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Node.js backend is working!"

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);