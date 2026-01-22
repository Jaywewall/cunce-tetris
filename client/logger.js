class GameLogger {
    constructor() {
        this.logs = [];
    }

    log(message) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);
        this.logs.push(logEntry);
    }

    download() {
        if (this.logs.length === 0) {
            alert("No logs to download.");
            return;
        }
        const blob = new Blob([this.logs.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tetris_game_log_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clear() {
        this.logs = [];
    }
}
