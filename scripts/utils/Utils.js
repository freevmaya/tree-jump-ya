function When(conditionFn, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = setInterval(() => {
      if (conditionFn()) {
        clearInterval(check);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(check);
        reject(new Error('Таймаут ожидания условия'));
      }
    }, 100);
  });
}

function randomArray(length, density) {
  const result = new Array(length).fill(0);
  const onesCount = Math.floor(length * density);
  
  for (let i = 0; i < onesCount; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * length);
    } while (result[randomIndex]);
    
    result[randomIndex] = true;
  }
  
  return result;
}

function enumerateTo(fromNum, toNum, totalTime, callback, finishCallBack = null) {
  let tik = 60;
  let tcount = Math.ceil(totalTime / tik);
  let i = 0;
  let timerId = setInterval(()=>{
    if (i > tcount) {
      clearInterval(timerId);
      callback(toNum);
      if (finishCallBack)
        finishCallBack();
    } else callback(fromNum + (toNum - fromNum) * i / tcount);
    i++;
  }, tik);
}

function sawToSine(x, t = 0.5) {
  // Нормализуем t от 0 до 1
  t = Math.max(0, Math.min(1, t));
  const saw = 2 * (x / (2 * Math.PI) - Math.floor(0.5 + x / (2 * Math.PI)));
  const sine = Math.sin(x);
  return (1 - t) * saw + t * sine;
}

function debounce(func, wait, start = null) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        if (start) start();
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

function getClassName(obj) { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((obj).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
};


async function Ajax(params, after = null, userData = null) {

    var formData;
    if (getClassName(params) == 'FormData') 
        formData = params
    else {
        formData = new FormData();
        for (let key in params) {
            let data = params[key];
            formData.append(key, (typeof data == 'string') ? data : JSON.stringify(data));
        }

        if ((typeof jsdata !== 'undefined') && typeof(jsdata.ajaxRequestId) != 'undefined')
            formData.append('ajax-request-id', jsdata.ajaxRequestId);
    }

    let headers = {};
    let token = (typeof X_CSRF_Token === 'string') ? X_CSRF_Token : null;

    if (token) {
        headers['X-CSRF-Token'] = token;
        formData.append('token', token);
    }

    headers['X-Requested-With'] = 'XMLHttpRequest';

    const request = new Request(document.location.origin + "?page=ajax", {
        method: "POST",
        headers: headers,
        body: formData
    });

    let result = null;
    let serverTime = Date.now();
    try {

        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        if (response.headers.has('Server-Time'))
            serverTime = Date.parse(response.headers.get('Server-Time'));

        if (response.headers.has('X-CSRF-Token')) {
            X_CSRF_Token = response.headers.get('X-CSRF-Token');
        }

        result = await response.json();

        if (result.error && (result.message == 'The token has expired') && (token != X_CSRF_Token)) {
        }
    } catch (error) {
        tracer.error(error.message);
    }
    if (after != null) after(result, serverTime, userData);
    return result;
}

function onAllImagesLoaded(callback, includeCSS = true, includeImg = true) {
  const promises = [];
  
  // Ждем загрузки тегов <img>
  if (includeImg) {
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        promises.push(new Promise(resolve => {
          img.onload = img.onerror = resolve;
        }));
      }
    });
  }
  
  // Ждем загрузки CSS фонов
  if (includeCSS) {
    const bgImages = new Set();
    
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      
      if (bgImage && bgImage !== 'none') {
        const matches = bgImage.match(/url\(["']?([^"')]+)["']?\)/g);
        if (matches) {
          matches.forEach(match => {
            const url = match.replace(/url\(["']?|["']?\)/g, '');
            if (!url.startsWith('data:')) {
              bgImages.add(url);
            }
          });
        }
      }
    });
    
    bgImages.forEach(url => {
      promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = url;
      }));
    });
  }
  
  Promise.all(promises).then(callback);
}

function btnOnClick(selector, onClick, wait = 3000) {
  const btn = $(selector);
  if (btn.length > 0) {
    btn.on('click', () => {
      btn[0].disabled = true;
      setTimeout(()=>{
        btn[0].disabled = false;
      }, wait);
      onClick();
    });
  }
}

function delayAnimation(ms, callback) {
  const start = performance.now();
  
  function check(time) {
    if (time - start >= ms) {
      callback();
    } else {
      requestAnimationFrame(check);
    }
  }
  
  requestAnimationFrame(check);
}

function getScriptParam(paramName) {
  const scripts = document.getElementsByTagName('script');
  const currentScript = document.currentScript || scripts[scripts.length - 1];
  
  if (currentScript && currentScript.src) {
    const url = new URL(currentScript.src, window.location.href);
    return url.searchParams.get(paramName);
  }
  return null;
}