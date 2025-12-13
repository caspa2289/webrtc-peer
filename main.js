let candidateDescription = null

let dataChannel = null

const handleMessage = (event) => {
    if (event.data) {
        navigator.vibrate([1000])
    }
}

const init = async () => {
    const connection = new RTCPeerConnection()

    connection.ondatachannel = (event) => {
        if (!dataChannel) {
            dataChannel = event.channel

            const sensor = new AbsoluteOrientationSensor({
                frequency: 60,
                referenceFrame: 'device',
            })

            sensor.addEventListener('reading', () => {
                const buffer = new ArrayBuffer(
                    16 * Float64Array.BYTES_PER_ELEMENT
                )

                const array = new Float64Array(buffer)
                sensor.populateMatrix(array)

                dataChannel.send(buffer)
            })

            sensor.start()

            dataChannel.onmessage = handleMessage
        }
    }

    connection.onicecandidate = (event) => {
        console.log(event.candidate)
        if (event.candidate && !candidateDescription) {
            connection.addIceCandidate(event.candidate)
            candidateDescription = event.candidate.candidate

            navigator.clipboard.writeText(
                JSON.stringify(connection.localDescription) +
                    'POOPY_BALLS' +
                    candidateDescription
            )
        }
    }

    return connection
}

const handleInput = async (hostData, connection) => {
    const [jsonString, candidate] = hostData.split('POOPY_BALLS')

    const desc = JSON.parse(jsonString)

    await connection.setRemoteDescription(desc)
    await connection.setLocalDescription(await connection.createAnswer())

    await connection.addIceCandidate({
        candidate,
        sdpMLineIndex: 0,
        sdpMid: '0',
    })
}

init().then((connection) => {
    document.getElementById('button').addEventListener('click', () => {
        handleInput(document.getElementById('input').value, connection)
    })
})
