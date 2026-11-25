import React from "react";
import { Landmark, GraduationCap } from "lucide-react";

export interface UniversityLogoProps {
  name?: string;
  country?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  showCountryFlag?: boolean;
}

// 1. Curated monogram mapping for high-recognition universities
const ACRONYM_MAP: Record<string, string> = {
  // UK Universities
  "university of oxford": "OXF",
  "university of cambridge": "CAM",
  "imperial college london": "ICL",
  "university college london": "UCL",
  "university of edinburgh": "UoE",
  "university of manchester": "UoM",
  "king's college london": "KCL",
  "london school of economics": "LSE",
  "university of bristol": "UoB",
  "university of warwick": "UoW",
  "university of glasgow": "UoG",
  "university of birmingham": "UB",
  "university of southampton": "SOT",
  "university of leeds": "UoL",
  "university of sheffield": "SHE",
  "university of nottingham": "NOT",
  "queen mary university of london": "QMUL",
  "university of york": "YORK",
  "lancaster university": "LAN",
  "newcastle university": "NCL",
  "university of exeter": "EXE",
  "cardiff university": "CAR",
  "university of bath": "BATH",
  "university of liverpool": "LIV",
  "university of aberdeen": "ABD",
  "queen's university belfast": "QUB",
  "university of sussex": "SUS",
  "loughborough university": "LBH",
  "university of leicester": "LEI",
  "university of surrey": "SUR",
  "university of strathclyde": "STR",
  "heriot-watt university": "HWU",
  "aston university": "AST",
  "city, university of london": "CITY",
  "brunel university london": "BRU",
  "birkbeck, university of london": "BBK",
  "royal holloway, university of london": "RHUL",
  "university of dundee": "DUN",
  "university of stirling": "STI",
  "coventry university": "COV",
  "kingston university": "KNG",
  "northumbria university": "NMB",
  "oxford brookes university": "OBU",
  "university of portsmouth": "POR",
  "university of plymouth": "PLY",
  "swansea university": "SWA",
  "bangor university": "BGR",
  "bournemouth university": "BOU",
  "university of brighton": "BRI",
  "university of greenwich": "GRE",
  "de montfort university": "DMU",
  "nottingham trent university": "NTU",
  "sheffield hallam university": "SHU",
  "manchester metropolitan university": "MMU",
  "birmingham city university": "BCU",
  "university of hertfordshire": "HER",
  "hertfordshire university": "HER",
  "warwick university": "UoW",
  "leeds university": "UoL",
  "birmingham university": "UB",
  "manchester university": "UoM",
  "middlesex university": "MDX",
  "university of westminster": "WES",
  "university of salford": "SAL",
  "university of huddersfield": "HUD",
  "university of central lancashire": "UCLan",
  "university of east london": "UEL",
  "london south bank university": "LSBU",
  "university of west london": "UWL",
  "staffordshire university": "STA",
  "teesside university": "TEE",
  "university of sunderland": "SUN",
  "university of bolton": "BOL",
  "university of south wales": "USW",

  // USA
  "harvard university": "HAR",
  "stanford university": "STA",
  "massachusetts institute of technology": "MIT",
  "columbia university": "COL",
  "princeton university": "PRN",
  "yale university": "YALE",
  "university of pennsylvania": "UPenn",
  "cornell university": "COR",
  "university of california, berkeley": "UCB",
  "university of california, los angeles": "UCLA",
  "university of southern california": "USC",
  "new york university": "NYU",
  "johns hopkins university": "JHU",
  "university of chicago": "UChi",
  "university of washington": "UW",
  "georgia institute of technology": "GT",

  // Canada
  "university of toronto": "UofT",
  "university of british columbia": "UBC",
  "mcgill university": "MCG",
  "mcmaster university": "McM",
  "university of waterloo": "UW",
  "university of alberta": "UofA",
  "university of montreal": "UdeM",
  "university of calgary": "UofC",
  "western university": "UWO",
  "simon fraser university": "SFU",

  // Australia
  "university of melbourne": "UniMelb",
  "university of sydney": "USYD",
  "australian national university": "ANU",
  "university of queensland": "UQ",
  "monash university": "MON",
  "university of new south wales": "UNSW",
  "university of western australia": "UWA",
  "university of adelaide": "ADL",
  "university of technology sydney": "UTS",
  "rmit university": "RMIT",

  // Germany
  "technical university of munich": "TUM",
  "ludwig maximilian university of munich": "LMU",
  "heidelberg university": "HD",
  "rwth aachen university": "RWTH",
  "humboldt university of berlin": "HUB",
  "free university of berlin": "FU",
  "karlsruhe institute of technology": "KIT",
  "technical university of berlin": "TUB",

  // New Zealand
  "university of auckland": "UoA",
  "university of otago": "OTA",
  "victoria university of wellington": "VUW",
  "university of canterbury": "UC",
  "massey university": "MAS",
  "university of waikato": "WAI",
  "lincoln university": "LIN",
  "auckland university of technology": "AUT",
};

// 2. Deterministic Palettes: Dignified academic colors with gradients and contrast
const COLOR_PALETTES = [
  {
    bg: "from-[#0c2340] to-[#1e3a8a]",
    border: "border-blue-400/40",
    text: "text-white",
    accent: "text-blue-300",
    tag: "Navy",
  },
  {
    bg: "from-[#4a0404] to-[#991b1b]",
    border: "border-red-400/40",
    text: "text-white",
    accent: "text-red-200",
    tag: "Crimson",
  },
  {
    bg: "from-[#064e3b] to-[#047857]",
    border: "border-emerald-400/40",
    text: "text-white",
    accent: "text-emerald-200",
    tag: "Emerald",
  },
  {
    bg: "from-[#3b0764] to-[#6b21a8]",
    border: "border-purple-400/40",
    text: "text-white",
    accent: "text-purple-200",
    tag: "Royal Purple",
  },
  {
    bg: "from-[#1e1b4b] to-[#3730a3]",
    border: "border-indigo-400/40",
    text: "text-white",
    accent: "text-indigo-200",
    tag: "Imperial Indigo",
  },
  {
    bg: "from-[#0f172a] to-[#334155]",
    border: "border-slate-400/40",
    text: "text-white",
    accent: "text-slate-300",
    tag: "Slate Tech",
  },
  {
    bg: "from-[#134e4a] to-[#0f766e]",
    border: "border-teal-400/40",
    text: "text-white",
    accent: "text-teal-200",
    tag: "Deep Teal",
  },
  {
    bg: "from-[#78350f] to-[#b45309]",
    border: "border-amber-400/40",
    text: "text-white",
    accent: "text-amber-200",
    tag: "Amber Gold",
  },
  {
    bg: "from-[#701a75] to-[#a21caf]",
    border: "border-fuchsia-400/40",
    text: "text-white",
    accent: "text-fuchsia-200",
    tag: "Plum Berry",
  },
  {
    bg: "from-[#164e63] to-[#0e7490]",
    border: "border-cyan-400/40",
    text: "text-white",
    accent: "text-cyan-200",
    tag: "Dark Cyan",
  },
];

// Helper to hash a string to a palette index
function getPaletteForName(name: string) {
  const norm = (name || "").toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = norm.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

// Helper to get initials/monogram
export function getUniversityInitials(name?: string): string {
  if (!name) return "UNI";
  const clean = name.trim();
  const lower = clean.toLowerCase();

  // Check custom map
  if (ACRONYM_MAP[lower]) return ACRONYM_MAP[lower];

  // Also check if lower matches partially
  for (const [key, val] of Object.entries(ACRONYM_MAP)) {
    if (lower.includes(key)) return val;
  }

  // Algorithmic fallback
  const words = clean
    .replace(/[()[\]{},.\-–&/]/g, " ")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !["of", "and", "the", "for", "at", "in", "de", "der", "und"].includes(w.toLowerCase()));

  if (words.length === 0) return "UNI";
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  if (words.length === 2) {
    if (words[0].toLowerCase() === "university") {
      return `U${words[1].slice(0, 2).toUpperCase()}`;
    }
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }
  if (words.length === 3) {
    return words.map((w) => w.charAt(0).toUpperCase()).join("");
  }
  // 4 or more words
  return words
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

// Helper to get country flag
export function getCountryFlag(countryOrName?: string): string {
  if (!countryOrName) return "🌐";
  const str = ` ${countryOrName.toLowerCase().replace(/[^a-z0-9]/g, " ")} `;

  // Australia
  if (
    str.includes(" australia ") ||
    str.includes(" aus ") ||
    str.includes(" sydney ") ||
    str.includes(" melbourne ") ||
    str.includes(" brisbane ") ||
    str.includes(" perth ") ||
    str.includes(" adelaide ") ||
    str.includes(" canberra ") ||
    str.includes(" nsw ") ||
    str.includes(" vic ") ||
    str.includes(" qld ")
  ) {
    return "🇦🇺";
  }

  // Canada
  if (
    str.includes(" canada ") ||
    str.includes(" can ") ||
    str.includes(" ontario ") ||
    str.includes(" toronto ") ||
    str.includes(" vancouver ") ||
    str.includes(" montreal ") ||
    str.includes(" calgary ") ||
    str.includes(" alberta ") ||
    str.includes(" quebec ")
  ) {
    return "🇨🇦";
  }

  // Germany
  if (
    str.includes(" germany ") ||
    str.includes(" deutschland ") ||
    str.includes(" deu ") ||
    str.includes(" berlin ") ||
    str.includes(" munich ") ||
    str.includes(" aachen ") ||
    str.includes(" heidelberg ")
  ) {
    return "🇩🇪";
  }

  // New Zealand
  if (
    str.includes(" new zealand ") ||
    str.includes(" nz ") ||
    str.includes(" nzl ") ||
    str.includes(" auckland ") ||
    str.includes(" wellington ") ||
    str.includes(" canterbury ") ||
    str.includes(" otago ")
  ) {
    return "🇳🇿";
  }

  // United Kingdom
  if (
    str.includes(" united kingdom ") ||
    str.includes(" uk ") ||
    str.includes(" england ") ||
    str.includes(" scotland ") ||
    str.includes(" wales ") ||
    str.includes(" britain ") ||
    str.includes(" london ") ||
    str.includes(" manchester ") ||
    str.includes(" birmingham ") ||
    str.includes(" oxford ") ||
    str.includes(" cambridge ") ||
    str.includes(" edinburgh ")
  ) {
    return "🇬🇧";
  }

  // United States
  if (
    str.includes(" united states ") ||
    str.includes(" usa ") ||
    str.includes(" us ") ||
    str.includes(" u s ") ||
    str.includes(" u s a ") ||
    str.includes(" america ")
  ) {
    return "🇺🇸";
  }

  // Ireland
  if (str.includes(" ireland ") || str.includes(" ire ") || str.includes(" dublin ")) {
    return "🇮🇪";
  }

  return "🌐";
}

export function getPosterLogo(_name?: string): string | null {
  return null;
}

/**
 * UniversityBadge: Dignified, highly identifiable academic institutional badge
 * Replaces unreliable external image files with a persistent, crisp monogram seal.
 */
export function UniversityBadge({
  name = "University",
  country,
  size = "md",
  className = "",
  showCountryFlag = false,
}: UniversityLogoProps) {
  const monogram = getUniversityInitials(name);
  const palette = getPaletteForName(name);
  const flag = country ? getCountryFlag(country) : getCountryFlag(name);

  const sizeClasses = {
    xs: "w-7 h-7 text-[9px] rounded-lg border",
    sm: "w-8 h-8 text-[10px] rounded-lg border",
    md: "w-10 h-10 text-xs rounded-xl border-2",
    lg: "w-12 h-12 text-sm rounded-xl border-2",
    xl: "w-16 h-16 text-base rounded-2xl border-2",
  };

  const watermarkSizes = {
    xs: "w-3 h-3 -right-0.5 -bottom-0.5",
    sm: "w-3.5 h-3.5 -right-0.5 -bottom-0.5",
    md: "w-4.5 h-4.5 -right-0.5 -bottom-0.5",
    lg: "w-5.5 h-5.5 -right-1 -bottom-1",
    xl: "w-7 h-7 -right-1.5 -bottom-1.5",
  };

  const flagSizes = {
    xs: "text-[9px] -bottom-1 -right-1",
    sm: "text-[10px] -bottom-1 -right-1",
    md: "text-xs -bottom-1 -right-1",
    lg: "text-sm -bottom-1 -right-1",
    xl: "text-base -bottom-1.5 -right-1.5",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title={`${name}${country ? ` (${country})` : ""}`}
    >
      <div
        className={`relative inline-flex items-center justify-center font-black select-none shrink-0 overflow-hidden shadow-xs bg-gradient-to-br ${palette.bg} ${palette.border} ${palette.text} ${sizeClasses[size]}`}
      >
        {/* Background Academic Insignia Watermark */}
        <Landmark
          className={`absolute text-white/20 pointer-events-none ${watermarkSizes[size]}`}
        />

        {/* Monogram Acronym */}
        <span className="font-extrabold tracking-wider leading-none z-10 drop-shadow-xs">
          {monogram}
        </span>
      </div>

      {/* Optional Mini Country Flag Tag (rendered outside overflow-hidden with high z-index) */}
      {showCountryFlag && (
        <span
          className={`absolute z-20 leading-none bg-white rounded-full shadow-sm border border-slate-200/90 flex items-center justify-center p-0.5 ${flagSizes[size]}`}
          title={country || "Country"}
        >
          {flag}
        </span>
      )}
    </div>
  );
}

// Backwards compatibility export
export const UniversityLogo = UniversityBadge;
