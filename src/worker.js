'use strict'
const queue = require('./queue')
const http_check = require('./checker_http')
const nats = require('nats').connect({ url: queue.connect, json: true })

nats.subscribe(queue.ping_in, { queue: 'http.worker' }, async function (msg) {

    const data = {
        id: msg.id,
        date: new Date()
    }

    try {
        const status = await http_check(msg.url)

        data.status = status.status

        data.duration = 0
        data.downloadSize = 0

        if (data.status == 'Ok') {
            data.duration = status.duration
            data.downloadSize = status.downloadSize
        }

        nats.publish(queue.ping_out, data)
        console.log(data.date.toLocaleString('ru-RU'), `Check url='${msg.url}', id='${msg.id}', status='${data.status}'`)
    }
    catch (error) {
        console.log("Error:", error)
    }
})