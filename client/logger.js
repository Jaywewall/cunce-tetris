class GameLogger {
    constructor() {
        this.logs = [];
        this.startTime = Date.now();
    }

    log(event, data = {}) {
        const timestamp = new Date().toISOString();
        const entry = {
            timestamp,
            event,
            data
        };
        console.log(`[${event}]`, data);
        this.logs.push(entry);
    }

    download() {
        if (this.logs.length === 0) {
            alert("No logs to download.");
            return;
        }
        const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tetris_game_log_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clear() {
        this.logs = [];
        this.startTime = Date.now();
    }
}
