
class StateManager {
    constructor(config) {
        this.isPlaying;
        this.isPaused;
        this.lastHash = '';
        this.config = { ...{use_server: typeof user_id != 'undefined'}, ...config};

        this.STORAGE_KEY = 'tree_jump_state';
        this.DEFAULT_STATE = {
        };
        
        this.state = { ...this.DEFAULT_STATE };

        if (typeof new_user != 'undefined')
            localStorage.removeItem(this.STORAGE_KEY);

        this.try_saveStateToServer = debounce(()=>{
            this.saveStateServer();
        }, 1000, ()=>{
            this.lastHash = this.getHash();
        });

        $(window).on('beforeunload', (e)=>{
            this.saveImmediately();
        });

        /*
        $(window).on('unload', (e)=>{
            this.saveImmediately();
        });*/

        $(window).on('pagehide', (e)=>{
            this.saveImmediately();
        });

        $(window).on('freeze', (e)=>{
            this.saveImmediately();
        });

        $(window).on('visibilitychange', (e)=>{
            if (document.visibilityState != 'visible')
                this.saveImmediately();
        });

        $(window).on('blur', (e)=>{
            this.saveImmediately();
        });
    }

    getPaidUse(service, defValue = null) {
        let all = this.get('paid_use', {});

        if (typeof all[service] == 'undefined')
            return defValue;
        return all[service];
    }

    setPaidUse(service, value) {
        this.state.paid_use = {...this.state.paid_use, ...{[service]: value}};
        this.saveState();
    }

    get(name, defValue = null) {
        if (typeof this.state[name] == 'undefined')
            return defValue;
        return this.state[name];
    }

    set(name, value) {
        this.state[name] = value;
        this.saveState();
    }

    delete(name) {
        delete(this.state[name]);
        this.saveState();
    }

    getHash() {
        return CryptoJS.MD5(JSON.stringify(this.state)).toString();
    }

    isChanges() {
        return this.lastHash != this.getHash();
    }

    saveImmediately() {
        if (this.isChanges()) {
            if (this.config.use_server)
                this.saveStateServer();
            else this.saveState();
        }
    }
    
    saveState() {
        if (this.isChanges()) {
            if (this.config.use_server)
                this.try_saveStateToServer();
            else this.saveStateLocale();
        }
    }

    saveStateServer() {
        if (this.state) {
            if (this.config.use_server) {
                Ajax({
                    action: 'setUserState',
                    data: this.state
                })
                .then((response)=>{
                    if (!response) {
                        this.config.use_server = false;
                        this.saveStateLocale();
                    }
                })
                .catch((e)=>{
                    this.config.use_server = false;
                    this.saveStateLocale();
                });
            } else this.saveStateLocale();
            this.lastHash = this.getHash();
        }
    }

    saveStateLocale() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        this.lastHash = this.getHash();
    }
    
    loadState() {
        return new Promise((resolve, reject)=>{

            let returnDefault = ()=>{

                let saved = localStorage.getItem(this.STORAGE_KEY);
                if (saved)
                    saved = JSON.parse(saved);

                this.state = { ...this.DEFAULT_STATE, ...saved };

                if (this.state.currentPhraseList)
                    delete(this.state.currentPhraseList);

                resolve(this.state);
            }

            if (this.config.use_server) {
                try {
                    Ajax({
                        action: 'getUserState'
                    }).then((data)=>{
                        if (data && data.hasOwnProperty('state')) {
                            this.config.use_server = true;
                            this.state = { ...this.DEFAULT_STATE, ...data.state };

                            resolve(this.state);
                        }
                        else {
                            this.config.use_server = data == 0;
                            returnDefault();
                        }
                    }).catch((error)=>{
                        tracer.error(error);
                        returnDefault();                    
                    });
                } catch (error) {
                    console.error(Lang("error_loading_state"), error);
                    reject(error);
                }
            } else returnDefault();
        });
    }
    
    updatePlaybackState(state) {
        const playbackKeys = ['currentPhraseIndex', 'indexInMode', 'progress', 'paid_use'];
        playbackKeys.forEach(key => {
            if (state[key] !== undefined) {
                this.state[key] = state[key];
            }
        });
        this.saveState();
    }
    
    resetPlayback() {
        this.state.currentPhraseIndex = 0;
        this.state.indexInMode = 0;
        this.saveState();
    }
    
    getState() {
        return { ...this.state };
    }
    
    resetToDefault() {
        this.state = { ...this.DEFAULT_STATE };
        localStorage.removeItem(this.STORAGE_KEY);
    }
}