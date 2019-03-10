import { to_json } from 'xmljson'

import moment from 'moment'


const generateOrderNo = () => {
    return moment().format('YYYYMMDDHHmmss') + random(1000, 9999)
}

const xmlToJson = (items) => {
    return new Promise((resolve, reject) => {
        let values = {}
        to_json(items, (err, data) => {
            if (err) {
                return reject(values)
            }
            try {
                for (let i = 0; i < data.fill.items.item[0].length; i++) {
                    let status = data.fill.items.item[i]['$']
                    values[status.name] = status.value
                }
            } catch (err) {
                console.log(err)
                values = {}
            }
            resolve(values)
        })
    })
}
const random = (num1, num2) => {
    return Math.floor((Math.random() * num2) + num1)
}
export default {
    xmlToJson,
    random,
    generateOrderNo
}