/**
 * Deep Search & KWIC Indexing
 */

export const DeepSearch = {
    index: [],

    init(videos) {
        this.index = videos.map(v => ({
            id: v.videoId,
            title: v.title,
            transcript: v.transcript || "",
            metadata: v
        }));
    },

    search(query) {
        if (!query || query.length < 2) return [];

        const q = query.toLowerCase();
        const results = [];

        this.index.forEach(item => {
            let score = 0;
            let snippet = "";

            if (item.title.toLowerCase().includes(q)) score += 10;

            const transcriptIdx = item.transcript.toLowerCase().indexOf(q);
            if (transcriptIdx !== -1) {
                score += 5;
                snippet = this.getSnippet(item.transcript, transcriptIdx, q);
            }

            if (score > 0) {
                results.push({
                    ...item.metadata,
                    score,
                    snippet
                });
            }
        });

        return results.sort((a, b) => b.score - a.score);
    },

    getSnippet(text, index, query) {
        const padding = 40;
        const start = Math.max(0, index - padding);
        const end = Math.min(text.length, index + query.length + padding);

        let snippet = text.substring(start, end);
        if (start > 0) snippet = "..." + snippet;
        if (end < text.length) snippet = snippet + "...";

        // Wrap query in <mark> for the "Polish Pass"
        const regex = new RegExp(`(${query})`, 'gi');
        return snippet.replace(regex, '<mark>$1</mark>');
    }
};

window.DeepSearch = DeepSearch;
