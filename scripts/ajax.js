
class AJAX {
    static x() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }

        let versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        let xhr;
        for (let i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
    };

    static sync_send(url, method, data) {
        let x = AJAX.x();
        x.open(method, url, false);
        if (method == 'POST') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.send(data)
        return [ x.status, x.responseText ];
    }

    static async_send(url, method, data) {
        return new Promise(function(resolve, reject) {
            let x = AJAX.x();
            x.open(method, url, true);
            x.onreadystatechange = function () {
                if (x.readyState == 4) {
                    resolve(x.responseText)
                }
            };
            if (method == 'POST') {
                x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
            x.send(data)
        });
    };

    static async_get(url, data) {
        let query = [];
        for (let key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        return AJAX.async_send(url + (query.length ? '?' + query.join('&') : ''), 'GET', null)
    };

    static sync_get(url, data) {
        let query = [];
        for (let key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        return AJAX.sync_send(url + (query.length ? '?' + query.join('&') : ''), 'GET', null)
    }

    static async_post(url, data) {
        let query = [];
        for (let key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        return AJAX.async_send(url, 'POST', query.join('&'))
    };

    static sync_post(url, data) {
        let query = [];
        for (let key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        return AJAX.sync_send(url, 'POST', query.join('&'))
    };
}

export const ajax = {
    sync: {
        get: AJAX.sync_get,
        post: AJAX.sync_post
    },
    async: {
        get: AJAX.async_get,
        post: AJAX.async_post
    }
};
