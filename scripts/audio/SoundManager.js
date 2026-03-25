class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.masterVolume = 1;
        this.muted = false;
        this.activeSources = new Map(); // Хранилище активных источников
        this.suspendedSources = new Map(); // Хранилище приостановленных источников
    }
    
    // Инициализация (должна вызываться после взаимодействия с пользователем)
    async init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await this.audioContext.resume();
    }

    isActivated() {
        return this.audioContext != null;
    }
    
    // Загрузка звука
    async loadSound(name, url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds.set(name, audioBuffer);
    }
    
    // Воспроизведение звука
    play(name, a_options) {
        let options = {...{volume: 0.5, loop: false, startTime: 0}, ...a_options};

        if (!this.audioContext || this.muted) 
            return null;
        
        const buffer = this.sounds.get(name);
        if (!buffer) return null;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = options.loop;
        
        const gainNode = this.audioContext.createGain();
        
        gainNode.gain.value = options.volume * this.masterVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const sourceId = Symbol();
        const sourceInfo = {
            id: sourceId,
            source,
            gainNode,
            name,
            volume: options.volume,
            loop: options.loop,
            startTime: options.startTime,
            startOffset: 0,
            startTimestamp: this.audioContext.currentTime
        };
        
        this.activeSources.set(sourceId, sourceInfo);
        
        source.onended = () => {
            if (!source.loop) {
                this.activeSources.delete(sourceId);
            }
        };
        
        source.start(0, options.startTime);
        
        return { source, gainNode, sourceId };
    }
    
    // Приостановка всех звуков (пауза)
    pauseAllSounds() {

        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        this.activeSources.forEach((sourceInfo, sourceId) => {
            try {
                // Сохраняем текущее время воспроизведения
                const elapsed = now - sourceInfo.startTimestamp;
                const currentOffset = sourceInfo.startOffset + elapsed;
                
                sourceInfo.source.stop();
                
                // Сохраняем в приостановленные
                this.suspendedSources.set(sourceId, {
                    id: sourceId,
                    name: sourceInfo.name,
                    volume: sourceInfo.volume,
                    loop: sourceInfo.loop,
                    startTime: currentOffset,
                    buffer: this.sounds.get(sourceInfo.name),
                    options: { volume: sourceInfo.volume, loop: sourceInfo.loop, startTime: currentOffset }
                });
            } catch (e) {
                console.warn('Ошибка при остановке:', e);
            }
        });
        
        this.activeSources.clear();
        console.log('звуки на паузе');
    }
    
    // Возобновление всех приостановленных звуков
    resumeAllSounds() {
        if (this.muted) return;
        
        this.suspendedSources.forEach((sourceInfo, sourceId) => {
            const buffer = this.sounds.get(sourceInfo.name);
            if (!buffer) return;
            
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = sourceInfo.loop;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = sourceInfo.volume * this.masterVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const startOffset = sourceInfo.startTime;
            
            const newSourceInfo = {
                id: sourceId,
                source,
                gainNode,
                name: sourceInfo.name,
                volume: sourceInfo.volume,
                loop: sourceInfo.loop,
                startTime: startOffset,
                startOffset: startOffset,
                startTimestamp: this.audioContext.currentTime
            };
            
            this.activeSources.set(sourceId, newSourceInfo);
            
            source.onended = () => {
                if (!source.loop) {
                    this.activeSources.delete(sourceId);
                }
            };
            
            source.start(0, startOffset);
        });
        
        this.suspendedSources.clear();
        console.log('звуки возобновлены');
    }
    
    // Остановка всех активных звуков (полная остановка)
    stopAllSounds() {
        this.activeSources.forEach(sourceInfo => {
            try {
                sourceInfo.source.stop();
            } catch (e) {}
        });
        this.activeSources.clear();
        
        // Также очищаем приостановленные
        this.suspendedSources.clear();
        
        console.log('звуки остановлены');
    }
    
    // Установка громкости
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        this.activeSources.forEach(sourceInfo => {
            if (sourceInfo.gainNode) {
                sourceInfo.gainNode.gain.value = sourceInfo.volume * this.masterVolume;
            }
        });
    }

    setMuted(value) {
        if (value) this.mute();
        else this.unmute();
    }
    
    mute() {
        if (this.muted) return;
        
        this.muted = true;
        
        // Приостанавливаем все активные звуки
        this.pauseAllSounds();
        
        console.log('Звук выключен (все звуки на паузе)');
    }
    
    unmute() {
        if (!this.muted) return;
        
        this.muted = false;
        
        // Возобновляем все приостановленные звуки
        this.resumeAllSounds();
        
        console.log('Звук включен (звуки продолжаются)');
    }
    
    // Возобновление контекста (после бездействия браузера)
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            
            // Если был muted, нужно восстановить звуки
            if (!this.muted && this.suspendedSources.size > 0) {
                this.resumeAllSounds();
            }
        }
    }
}

/*
const soundManager = new SoundManager();
document.addEventListener('click', async () => {
    await soundManager.init();
}, { once: true });
*/