import fetch from 'node-fetch'
import qs from 'querystring'



const get = async(url, data, isJson = true, isConver = false) => {
    let param = qs.stringify(data)
    let options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    url = url + '?' + param;
    let jsonValue = null;
    try {
        let value = await fetch(url, options)
        if (isJson == true) {
            jsonValue = await value.json()
        } else if (isConver == true) {
            let text = await value.text()
            let newstr = text.replace(/callback\(/, '')
            newstr = newstr.replace(/\);/i, '')
            jsonValue = JSON.parse(newstr)
        } else {
            let text = await value.text()
            jsonValue = qs.parse(text)
        }
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