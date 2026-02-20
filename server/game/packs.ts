export type Rarity = "Common" | "Rare" | "Epic" | "Legendary";
export type PackType = "Standard" | "Premium" | "Elite";

interface PlayerDrop {
    name: string;
    position: string;
    rarity: Rarity;
    attack: number;
    defense: number;
    speed: number;
    stamina: number;
    overallRating: number;
    level: number;
    maxLevel: number;
}

const POSITIONS = ["FW", "MF", "DF", "GK"];
const FIRST_NAMES = ["Lionel", "Cristiano", "Kylian", "Erling", "Kevin", "Virgil", "Luka", "Harry"];
const LAST_NAMES = ["Smith", "Ronaldo", "Mbappe", "Haaland", "De Bruyne", "Van Dijk", "Modric", "Kane"];

function generateName(): string {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${first} ${last}`;
}

export function openPack(packType: PackType): PlayerDrop {
    const rand = Math.random() * 100;
    let rarity: Rarity = "Common";

    // Standard: 70% Common, 25% Rare, 5% Epic
    // Premium: 50% Rare, 35% Epic, 15% Legendary
    // Elite: 30% Epic, 70% Legendary

    if (packType === "Standard") {
        if (rand < 70) rarity = "Common";
        else if (rand < 95) rarity = "Rare";
        else rarity = "Epic";
    } else if (packType === "Premium") {
        if (rand < 50) rarity = "Rare";
        else if (rand < 85) rarity = "Epic";
        else rarity = "Legendary";
    } else if (packType === "Elite") {
        if (rand < 30) rarity = "Epic";
        else rarity = "Legendary";
    }

    const baseStats = {
        Common: { min: 20, max: 40, maxLevel: 10 },
        Rare: { min: 40, max: 60, maxLevel: 20 },
        Epic: { min: 60, max: 80, maxLevel: 30 },
        Legendary: { min: 80, max: 95, maxLevel: 40 },
    };

    const limits = baseStats[rarity];

    const generateStat = () => Math.floor(Math.random() * (limits.max - limits.min + 1)) + limits.min;

    const attack = generateStat();
    const defense = generateStat();
    const speed = generateStat();
    const stamina = generateStat();
    const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];

    const overallRating = Math.round((attack * 0.35) + (defense * 0.30) + (speed * 0.20) + (stamina * 0.15));

    return {
        name: generateName(),
        position,
        rarity,
        attack,
        defense,
        speed,
        stamina,
        overallRating,
        level: 1,
        maxLevel: limits.maxLevel
    };
}
