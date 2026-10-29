export type ShuffleMode = 'true_random' | 'least_played' | 'most_played' | 'fun' | 'smart_shuffle';

export interface Track {
  id: string;
  title: string;
  artist: string;
  playCount?: number;
  genre?: string;
  isRecommendation?: boolean;
}

export class ShuffleEngine {
  public static trueRandom<T>(array: T[]): T[] {
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
  public static weightedShuffle(
    tracks: Track[], 
    preference: 'least_played' | 'most_played',
    exponent: number = 1.0
  ): Track[] {
    const pool = [...tracks];
    const result: Track[] = [];

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
  public static funShuffle(tracks: Track[], spacing: number = 1): Track[] {
    const randomized = this.trueRandom(tracks);
    const result: Track[] = [];
    const recentArtists: string[] = [];

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
  public static async smartShuffle(
    tracks: Track[], 
    fetchRecommendations: (sampleTracks: Track[]) => Promise<Track[]>,
    ratio: number = 3,
    sampleSize: number = 5
  ): Promise<Track[]> {
    const baseList = this.trueRandom(tracks);
    const samples = baseList.slice(0, Math.min(sampleSize, baseList.length));
    const recommendedTracks = await fetchRecommendations(samples);
    const randomizedRecs = this.trueRandom(recommendedTracks.map(r => ({ ...r, isRecommendation: true })));

    const result: Track[] = [];
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