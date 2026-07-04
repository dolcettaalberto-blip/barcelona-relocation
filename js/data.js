// Single source of truth — embedded verbatim from the June 2026 research brief.
// Data updates happen by editing this object. No runtime fetches.
const DATA = {
  "meta": {
    "asOf": "2026-06",
    "cityAvgApartmentPerSqm": 4459,
    "cityAvgHousePerSqm": 3100,
    "bikeLanesKm": 200,
    "cycleFriendlyKm": 1000,
    "targetSqm": 150
  },
  "districts": [
    {
      "id": "sarria",
      "name": "Sarrià-Sant Gervasi",
      "lat": 41.401, "lng": 2.121,
      "pricePerSqm": 6200,
      "price150sqm": 930000,
      "tier": "prime",
      "vibe": "Prestigious, quiet, village feel; closest to Collserola nature",
      "green": 5, "bike": 3, "schoolAccess": 5, "safety": 5,
      "notes": "Densest cluster of premium international schools. Hilly, so bike rating lower."
    },
    {
      "id": "lescorts",
      "name": "Les Corts / Pedralbes",
      "lat": 41.387, "lng": 2.115,
      "pricePerSqm": 6300,
      "price150sqm": 945000,
      "tier": "prime",
      "vibe": "Low density, safe, family-calm; Jardins de Pedralbes, Parc de Cervantes",
      "green": 4, "bike": 4, "schoolAccess": 5, "safety": 5,
      "notes": "St Peter's in-district; ASB just over the boundary in Esplugues."
    },
    {
      "id": "eixample",
      "name": "Eixample",
      "lat": 41.392, "lng": 2.164,
      "pricePerSqm": 6330,
      "price150sqm": 950000,
      "tier": "prime",
      "vibe": "Central grid, interior-courtyard oases, most services per block",
      "green": 3, "bike": 5, "schoolAccess": 4, "safety": 4,
      "notes": "20+ public primaries, best flat-grid cycling in the city. Most expensive per sqm."
    },
    {
      "id": "gracia",
      "name": "Gràcia",
      "lat": 41.404, "lng": 2.157,
      "pricePerSqm": 5590,
      "price150sqm": 838000,
      "tier": "upper-mid",
      "vibe": "Bohemian, low-rise, plaza culture; borders Park Güell",
      "green": 4, "bike": 4, "schoolAccess": 4, "safety": 4,
      "notes": "15 public primaries + 10 concertada incl. English School Barcelona, Jesuïtes Gràcia. 150 sqm stock is scarce, mostly older buildings."
    },
    {
      "id": "santmarti",
      "name": "Sant Martí / Poblenou",
      "lat": 41.403, "lng": 2.202,
      "pricePerSqm": 4930,
      "price150sqm": 740000,
      "tier": "upper-mid",
      "vibe": "Beach + sports district, 22@ tech area, flat coastal bike lanes",
      "green": 4, "bike": 5, "schoolAccess": 3, "safety": 4,
      "notes": "Largest share of municipal sports facilities. International schools require commute; typical pattern is public primary, then move for secondary."
    },
    {
      "id": "sants",
      "name": "Sants-Montjuïc",
      "lat": 41.372, "lng": 2.142,
      "pricePerSqm": 4462,
      "price150sqm": 670000,
      "tier": "mid",
      "vibe": "Traditional, local; Montjuïc parks, museums, sports venues",
      "green": 5, "bike": 3, "schoolAccess": 3, "safety": 3,
      "notes": "More space per euro while staying central. International campuses 20-40 min away."
    },
    {
      "id": "horta",
      "name": "Horta-Guinardó",
      "lat": 41.425, "lng": 2.157,
      "pricePerSqm": 4130,
      "price150sqm": 620000,
      "tier": "value",
      "vibe": "Hilly, residential, authentically local",
      "green": 4, "bike": 2, "schoolAccess": 2, "safety": 3,
      "notes": "Local public system; commute for international schools."
    },
    {
      "id": "santandreu",
      "name": "Sant Andreu",
      "lat": 41.435, "lng": 2.190,
      "pricePerSqm": 3900,
      "price150sqm": 585000,
      "tier": "value",
      "vibe": "Old-town-village core, local family life",
      "green": 3, "bike": 3, "schoolAccess": 2, "safety": 3,
      "notes": ""
    },
    {
      "id": "noubarris",
      "name": "Nou Barris",
      "lat": 41.442, "lng": 2.177,
      "pricePerSqm": 3220,
      "price150sqm": 483000,
      "tier": "value",
      "vibe": "Cheapest district; local, peripheral",
      "green": 3, "bike": 2, "schoolAccess": 1, "safety": 2,
      "notes": "150 sqm stock limited and basic. Include for completeness, likely not shortlisted."
    }
  ],
  "suburbs": [
    {
      "id": "santcugat",
      "name": "Sant Cugat del Vallès",
      "lat": 41.472, "lng": 2.086,
      "distanceKm": 20,
      "vibe": "Rail-connected school hub; larger homes, gardens, pools",
      "schools": ["Agora Sant Cugat", "Europa International School", "Japanese School of Barcelona"],
      "notes": "€/sqm comparable to or slightly below Zona Alta, but houses larger (150-200 sqm + outdoor space)."
    },
    {
      "id": "santjust",
      "name": "Sant Just Desvern / Esplugues",
      "lat": 41.383, "lng": 2.072,
      "distanceKm": 8,
      "vibe": "High-end school cluster just outside city boundary",
      "schools": ["American School of Barcelona", "German School of Barcelona"],
      "notes": "Houses with outdoor space; short drive to Les Corts / Pedralbes."
    },
    {
      "id": "alella",
      "name": "Alella / Tiana (Maresme)",
      "lat": 41.494, "lng": 2.295,
      "distanceKm": 15,
      "vibe": "Wine-country villages above the coast; houses with gardens, sea views",
      "schools": ["Hamelin-Laie (Montgat, ~10 min)"],
      "notes": "Best geometry in the whole set for this brief: school in Montgat plus C-32/coastal commute straight into Poblenou. €900k buys a detached or semi-detached house here. Verify current €/sqm, estimate ~€3,800-4,500."
    },
    {
      "id": "castelldefels",
      "name": "Castelldefels / Gavà Mar",
      "lat": 41.265, "lng": 1.975,
      "distanceKm": 20,
      "vibe": "Beach-town living, flat, family sports culture, large expat community",
      "schools": ["British School of Barcelona (Castelldefels campus)", "Bon Soleil (Gavà)"],
      "notes": "Strong quality of life, but wrong side of the city for Poblenou; commute crosses all of Barcelona. Verify current €/sqm, estimate ~€3,800-4,600."
    },
    {
      "id": "sitges",
      "name": "Sitges",
      "lat": 41.237, "lng": 1.806,
      "distanceKm": 35,
      "vibe": "Handsome coastal town, international community, best pure quality-of-living of the set",
      "schools": ["British School of Barcelona (Sitges campus)"],
      "notes": "50-60 min to Poblenou on a good day; realistic only with heavy remote work. Include so the tradeoff is visible on screen. Estimate ~€4,500-5,500/sqm in the good zones."
    }
  ],
  "monthlyRent150sqmEstimate": {
    "eixample": 3600, "sarria": 3600, "lescorts": 3500, "gracia": 3200,
    "santmarti": 3000, "sants": 2600, "horta": 2300, "santandreu": 2200,
    "noubarris": 1900, "santcugat": 2800, "santjust": 2900,
    "alella": 2900, "castelldefels": 2800, "sitges": 3100
  },
  "commuteMinutesToGlovo": {
    "santmarti": 8, "santandreu": 25, "eixample": 20, "gracia": 30,
    "sants": 35, "horta": 35, "noubarris": 35, "sarria": 42, "lescorts": 42,
    "santjust": 48, "santcugat": 50, "alella": 28, "castelldefels": 50, "sitges": 58
  },
  "schools": [
    { "name": "Benjamin Franklin Int'l School", "type": "international", "curriculum": "US/IB, English", "district": "sarria", "lat": 41.406, "lng": 2.109, "feesPrimary": [16000, 22000], "feesSecondary": [22000, 28000] },
    { "name": "British School of Barcelona (city)", "type": "international", "curriculum": "British, English", "district": "sarria", "lat": 41.399, "lng": 2.125, "feesPrimary": [16000, 22000], "feesSecondary": [22000, 28000] },
    { "name": "Olive Tree School", "type": "bilingual", "curriculum": "Bilingual EN/ES/CA primary", "district": "sarria", "lat": 41.403, "lng": 2.118, "feesPrimary": [7500, 10000], "feesSecondary": null },
    { "name": "St Peter's School", "type": "international", "curriculum": "British IGCSE/A-Level", "district": "lescorts", "lat": 41.390, "lng": 2.112, "feesPrimary": [9500, 12000], "feesSecondary": [12000, 15000] },
    { "name": "American School of Barcelona", "type": "international", "curriculum": "US/IB, English + ES/CA", "district": "santjust", "lat": 41.379, "lng": 2.075, "feesPrimary": [16000, 22000], "feesSecondary": [22000, 25000] },
    { "name": "Barcelona High School", "type": "international", "curriculum": "IB Diploma, English", "district": "eixample", "lat": 41.393, "lng": 2.162, "feesPrimary": [10000, 18000], "feesSecondary": [13000, 18000] },
    { "name": "English School Barcelona", "type": "bilingual", "curriculum": "Bilingual concertada", "district": "gracia", "lat": 41.405, "lng": 2.156, "feesPrimary": [6000, 12000], "feesSecondary": [6000, 12000] },
    { "name": "Hamelin-Laie Int'l", "type": "international", "curriculum": "IB, trilingual", "district": null, "lat": 41.492, "lng": 2.263, "feesPrimary": [11000, 15500], "feesSecondary": [14000, 18000], "notes": "Montgat, coastal commute from Sant Martí" },
    { "name": "SEK Catalunya", "type": "international", "curriculum": "IB", "district": null, "lat": 41.611, "lng": 2.288, "feesPrimary": [11000, 15500], "feesSecondary": [14000, 18000], "notes": "La Garriga, far; realistic only with bus" },
    { "name": "Lycée Français de Barcelone", "type": "international", "curriculum": "French homologué, FR + ES/CA", "district": "lescorts", "lat": 41.390, "lng": 2.106, "feesPrimary": [5500, 7000], "feesSecondary": [6000, 8500], "preferred": true, "notes": "Preferred school (Bosch i Gimpera, Pedralbes). Fees are editorial estimates — conventionné, far cheaper than Anglo internationals; verify current schedule." }
  ],
  "feeBands": {
    "premiumAngloAmerican": { "primary": [16000, 22000], "secondary": [22000, 28000] },
    "midTierIBBilingual": { "primary": [11000, 15500], "secondary": [14000, 18000] },
    "smallBilingual": { "primary": [6000, 10000], "secondary": null },
    "public": { "excluded": true, "note": "State schooling ruled out by the user; do not render as an option, keep only as context in copy" },
    "hiddenCosts": "Enrolment, lunch, bus, uniforms, exams add 25-35% to headline tuition"
  }
};

// Editorial €/sqm estimate ranges for out-of-city areas. Alella, Castelldefels
// and Sitges ranges come from the brief's notes; Sant Cugat is read off
// "comparable to or slightly below Zona Alta"; Sant Just is an editorial guess.
// All flagged in the UI as estimates to verify on idealista.
const SUBURB_PRICE_EST = {
  "santcugat":     [5300, 6100],
  "santjust":      [4200, 5000],
  "alella":        [3800, 4500],
  "castelldefels": [3800, 4600],
  "sitges":        [4500, 5500]
};

const GLOVO_HQ = { name: "Glovo HQ", address: "Carrer de Pallars 190, Poblenou", lat: 41.3986, lng: 2.1957 };
const DANONE_HQ = { name: "Danone HQ", address: "Carrer de Buenos Aires 21, near Francesc Macià", lat: 41.3922, lng: 2.1409 };

// Editorial door-to-door commute estimates (minutes), added July 2026 at the
// user's request. Bike is the family's main mode. Same status as the brief's
// commuteMinutesToGlovo: estimates, not routed times — verify the shortlist
// by actually riding them. Sant Cugat by bike crosses Collserola; Sitges by
// bike crosses the Garraf — both listed for honesty, not realism.
const COMMUTE_EST = {
  "bikeToGlovo": {
    "santmarti": 5, "eixample": 15, "gracia": 20, "santandreu": 20,
    "sants": 30, "horta": 30, "noubarris": 30, "sarria": 35, "lescorts": 35,
    "santjust": 45, "alella": 50, "castelldefels": 70, "santcugat": 75, "sitges": 105
  },
  "mixedToDanone": {
    "lescorts": 10, "eixample": 12, "sarria": 15, "sants": 15, "gracia": 18,
    "santjust": 18, "santmarti": 25, "horta": 30, "santandreu": 30,
    "noubarris": 32, "santcugat": 32, "castelldefels": 40, "sitges": 48, "alella": 50
  },
  "bikeToDanone": {
    "lescorts": 10, "eixample": 12, "sarria": 15, "sants": 15, "gracia": 18,
    "santjust": 25, "santmarti": 25, "horta": 30, "santandreu": 32,
    "noubarris": 35, "castelldefels": 55, "santcugat": 65, "alella": 65, "sitges": 95
  }
};
