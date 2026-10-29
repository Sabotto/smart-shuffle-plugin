"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrueShufflePlugin = exports.pluginSettings = void 0;
const shuffleEngine_1 = require("./shuffleEngine");
exports.pluginSettings = {
    mode: 'true_random',
    smartShuffleRatio: 3, // 1 rec per X tracks
    smartSampleSize: 5, // Number of tracks used for recommendation seeds
    playCountExponent: 1.0, // Weight aggressiveness (1.0 = linear, 3.0 = aggressive)
    artistSpacing: 1, // Number of tracks required between same artist
};
class TrueShufflePlugin {
    async onLoaded() {
        console.log('[TrueShuffle] Plugin initialized with custom parameters.');
        this.registerSettingsUI();
        this.patchQueueController();
    }
    registerSettingsUI() {
        if (window.Luna?.Settings) {
            window.Luna.Settings.registerPluginSettings('True & Smart Shuffle', [
                {
                    key: 'mode',
                    label: 'Shuffle Algorithm Mode',
                    type: 'select',
                    options: [
                        { label: 'True Random (Uniform Fisher-Yates)', value: 'true_random' },
                        { label: 'Smart Shuffle (Spotify style with Recs)', value: 'smart_shuffle' },
                        { label: 'Least Played First (Rediscover Old Gems)', value: 'least_played' },
                        { label: 'Most Played First (Favorites Heavy)', value: 'most_played' },
                        { label: 'Fun Mode (Artist Separated & Chaotic)', value: 'fun' },
                    ],
                    default: 'true_random',
                    onChange: (val) => { exports.pluginSettings.mode = val; },
                },
                {
                    key: 'smartShuffleRatio',
                    label: 'Smart Shuffle: Recommendation Frequency (1 rec every N tracks)',
                    type: 'number',
                    min: 1,
                    max: 10,
                    step: 1,
                    default: 3,
                    onChange: (val) => { exports.pluginSettings.smartShuffleRatio = val; },
                },
                {
                    key: 'smartSampleSize',
                    label: 'Smart Shuffle: Seed Sample Size (Tracks scanned for recommendations)',
                    type: 'number',
                    min: 1,
                    max: 10,
                    step: 1,
                    default: 5,
                    onChange: (val) => { exports.pluginSettings.smartSampleSize = val; },
                },
                {
                    key: 'playCountExponent',
                    label: 'Least/Most Played: Weight Bias Strength',
                    type: 'number',
                    min: 0.1,
                    max: 3.0,
                    step: 0.1,
                    default: 1.0,
                    onChange: (val) => { exports.pluginSettings.playCountExponent = val; },
                },
                {
                    key: 'artistSpacing',
                    label: 'Fun Mode: Minimum Song Buffer Between Same Artist',
                    type: 'number',
                    min: 1,
                    max: 5,
                    step: 1,
                    default: 1,
                    onChange: (val) => { exports.pluginSettings.artistSpacing = val; },
                },
            ]);
        }
    }
    patchQueueController() {
        const playerStore = window.Tidal?.PlayerStore || window._tidalStore;
        if (!playerStore) {
            console.warn('[TrueShuffle] Player store not found directly.');
            return;
        }
        const self = this;
        const originalSetQueue = playerStore.setQueue;
        playerStore.setQueue = async function (args) {
            if (args.isShuffled && args.tracks && args.tracks.length > 0) {
                const fullPlaylistTracks = await self.fetchAllPlaylistTracks(args.playlistId, args.tracks);
                args.tracks = await self.processShuffleMode(fullPlaylistTracks);
            }
            return originalSetQueue.apply(this, [args]);
        };
    }
    async fetchAllPlaylistTracks(playlistId, currentTracks) {
        if (currentTracks.length < 100)
            return currentTracks;
        try {
            const response = await window.Luna.API.getPlaylistTracks(playlistId, { limit: 10000 });
            return response.items || currentTracks;
        }
        catch (err) {
            console.error('[TrueShuffle] Failed to fetch full playlist tracks.', err);
            return currentTracks;
        }
    }
    async processShuffleMode(tracks) {
        switch (exports.pluginSettings.mode) {
            case 'true_random':
                return shuffleEngine_1.ShuffleEngine.trueRandom(tracks);
            case 'least_played':
                return shuffleEngine_1.ShuffleEngine.weightedShuffle(tracks, 'least_played', exports.pluginSettings.playCountExponent);
            case 'most_played':
                return shuffleEngine_1.ShuffleEngine.weightedShuffle(tracks, 'most_played', exports.pluginSettings.playCountExponent);
            case 'fun':
                return shuffleEngine_1.ShuffleEngine.funShuffle(tracks, exports.pluginSettings.artistSpacing);
            case 'smart_shuffle':
                return await shuffleEngine_1.ShuffleEngine.smartShuffle(tracks, async (samples) => {
                    const trackIds = samples.map(s => s.id).join(',');
                    const recs = await window.Luna.API.getRecommendations({ trackIds, limit: 10 });
                    return recs.items || [];
                }, exports.pluginSettings.smartShuffleRatio, exports.pluginSettings.smartSampleSize);
            default:
                return shuffleEngine_1.ShuffleEngine.trueRandom(tracks);
        }
    }
    onUnload() {
        console.log('[TrueShuffle] Plugin unloaded.');
    }
}
exports.TrueShufflePlugin = TrueShufflePlugin;
const plugin = new TrueShufflePlugin();
exports.default = plugin;
