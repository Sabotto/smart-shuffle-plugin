export class ShuffleEngine {
    static trueRandom(array) {
        const list = [...array];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }
    /**
     * Shuffles tracks weighted by play count with customizable exponential bias.
     */
    static weightedShuffle(tracks, preference, exponent = 1.0) {
        const pool = [...tracks];
        const result = [];
        while (pool.length > 0) {
            const weights = pool.map(t => {
                const count = t.playCount ?? 0;
                const base = count + 1;
                return preference === 'least_played'
                    ? 1 / Math.pow(base, exponent)
                    : Math.pow(base, exponent);
            });
            const totalWeight = weights.reduce((acc, w) => acc + w, 0);
            let randomVal = Math.random() * totalWeight;
            let chosenIndex = 0;
            for (let i = 0; i < weights.length; i++) {
                randomVal -= weights[i];
                if (randomVal <= 0) {
                    chosenIndex = i;
                    break;
                }
            }
            result.push(pool[chosenIndex]);
            pool.splice(chosenIndex, 1);
        }
        return result;
    }
    /**
     * Fun Mode: Ensures a configurable buffer of tracks between songs from the same artist.
     */
    static funShuffle(tracks, spacing = 1) {
        const randomized = this.trueRandom(tracks);
        const result = [];
        const recentArtists = [];
        const remaining = [...randomized];
        while (remaining.length > 0) {
            // Find track whose artist isn't in recent history buffer
            const index = remaining.findIndex(t => !recentArtists.includes(t.artist));
            const targetIndex = index !== -1 ? index : 0;
            const chosen = remaining.splice(targetIndex, 1)[0];
            result.push(chosen);
            recentArtists.push(chosen.artist);
            if (recentArtists.length > spacing) {
                recentArtists.shift();
            }
        }
        return result;
    }
    /**
     * Smart Shuffle with configurable seed count and track injection ratio.
     */
    static async smartShuffle(tracks, fetchRecommendations, ratio = 3, sampleSize = 5) {
        const baseList = this.trueRandom(tracks);
        const samples = baseList.slice(0, Math.min(sampleSize, baseList.length));
        const recommendedTracks = await fetchRecommendations(samples);
        const randomizedRecs = this.trueRandom(recommendedTracks.map(r => ({ ...r, isRecommendation: true })));
        const result = [];
        let recIdx = 0;
        for (let i = 0; i < baseList.length; i++) {
            result.push(baseList[i]);
            if ((i + 1) % ratio === 0 && recIdx < randomizedRecs.length) {
                result.push(randomizedRecs[recIdx++]);
            }
        }
        return result;
    }
}
