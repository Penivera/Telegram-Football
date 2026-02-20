// calculateElo() based on Standard Elo Rating formula:
// R_new = R_old + K * (Actual - Expected)

const K_FACTOR = 32;

export interface EloResult {
    newRatingA: number;
    newRatingB: number;
    ratingChangeA: number;
    ratingChangeB: number;
}

export function calculateElo(
    ratingA: number,
    ratingB: number,
    scoreA: number,
    scoreB: number
): EloResult {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    let actualA = 0.5; // Draw
    let actualB = 0.5;

    if (scoreA > scoreB) {
        actualA = 1;
        actualB = 0;
    } else if (scoreA < scoreB) {
        actualA = 0;
        actualB = 1;
    }

    const newRatingA = Math.round(ratingA + K_FACTOR * (actualA - expectedA));
    const newRatingB = Math.round(ratingB + K_FACTOR * (actualB - expectedB));

    return {
        newRatingA,
        newRatingB,
        ratingChangeA: newRatingA - ratingA,
        ratingChangeB: newRatingB - ratingB
    };
}
