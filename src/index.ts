import { ShuffleEngine, Track } from './shuffleEngine';
import { Settings, pluginSettings } from './Settings';

export class TrueShufflePlugin {
  public async onLoaded() {
    console.log('[TrueShuffle] Plugin initialized with React Settings component.');
    this.patchQueueController();
  }

  private patchQueueController() {
    const playerStore = (window as any).Tidal?.PlayerStore || (window as any)._tidalStore;

    if (!playerStore) {
      console.warn('[TrueShuffle] Player store not found directly.');
      return;
    }

    const self = this;
    const originalSetQueue = playerStore.setQueue;

    playerStore.setQueue = async function (args: { playlistId: string; tracks: Track[]; isShuffled: boolean }) {
      if (args.isShuffled && args.tracks && args.tracks.length > 0) {
        const fullPlaylistTracks = await self.fetchAllPlaylistTracks(args.playlistId, args.tracks);
        args.tracks = await self.processShuffleMode(fullPlaylistTracks);
      }
      return originalSetQueue.apply(this, [args]);
    };
  }

  private async fetchAllPlaylistTracks(playlistId: string, currentTracks: Track[]): Promise<Track[]> {
    if (currentTracks.length < 100) return currentTracks;

    try {
      const lunaApi = (window as any).Luna?.API || (window as any).neptune?.actions;
      if (lunaApi?.getPlaylistTracks) {
        const response = await lunaApi.getPlaylistTracks(playlistId, { limit: 10000 });
        return response.items || currentTracks;
      }
      return currentTracks;
    } catch (err) {
      console.error('[TrueShuffle] Failed to fetch full playlist tracks.', err);
      return currentTracks;
    }
  }

  private async processShuffleMode(tracks: Track[]): Promise<Track[]> {
    const mode = pluginSettings.mode;

    switch (mode) {
      case 'true_random':
        return ShuffleEngine.trueRandom(tracks);

      case 'least_played':
        return ShuffleEngine.weightedShuffle(tracks, 'least_played', pluginSettings.playCountExponent);

      case 'most_played':
        return ShuffleEngine.weightedShuffle(tracks, 'most_played', pluginSettings.playCountExponent);

      case 'fun':
        return ShuffleEngine.funShuffle(tracks, pluginSettings.artistSpacing);

      case 'smart_shuffle':
        return await ShuffleEngine.smartShuffle(
          tracks,
          async (samples) => {
            try {
              const lunaApi = (window as any).Luna?.API || (window as any).neptune?.actions;
              if (lunaApi?.getRecommendations) {
                const trackIds = samples.map(s => s.id).join(',');
                const recs = await lunaApi.getRecommendations({ trackIds, limit: 10 });
                return recs.items || [];
              }
            } catch (e) {
              console.error('[TrueShuffle] Recommendation fetch error:', e);
            }
            return [];
          },
          pluginSettings.smartShuffleRatio,
          pluginSettings.smartSampleSize
        );

      default:
        return ShuffleEngine.trueRandom(tracks);
    }
  }

  public onUnload() {
    console.log('[TrueShuffle] Plugin unloaded.');
  }
}

// Export the Settings component so the client UI can render it under the plugin card
export { Settings };

const plugin = new TrueShufflePlugin();
plugin.onLoaded();

export default plugin;