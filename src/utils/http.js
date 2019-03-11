import fetch from 'node-fetch'
import qs from 'querystring'




const get = async(url, data) => {
    let param = qs.stringify(data);
    let options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    url = url + '?' + param;
    let jsonValue = null;
    try {
        let value = await fetch(url, options)
        jsonValue = await value.json()
        console.log('sddssd', jsonValue)
        return Promise.resolve(jsonValue)
    } catch (err) {
        console.log('sddssd22', err)
        return Promise.reject('problem with request: ' + err.message)
    }
};

const post = async(url, data) => {
    let options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    };
    let jsonValue = null;
    try {
        let value = await fetch(url, options)
        jsonValue = await value.json()
        return Promise.resolve(jsonValue)
    } catch (err) {
        return Promise.reject('problem with request: ' + err.message)
    }
};

export default {
    get: get,
    post: post
};