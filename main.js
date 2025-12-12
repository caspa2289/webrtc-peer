let candidateDescription = null

let dataChannel = null

const handleMessage = (event) => {
    if (event.data) {
        alert(event.data)
        navigator.vibrate([1000])
    }
}

const init = async () => {
    const connection = new RTCPeerConnection()

    connection.ondatachannel = (event) => {
        if (!dataChannel) {
            dataChannel = event.channel

            dataChannel.send('farts from peer')

            dataChannel.onmessage = handleMessage
        }
    }

    return connection
}

const handleInput = async (hostData, connection) => {
    const [jsonString, candidate] = hostData.split('POOPY_BALLS')

    const desc = JSON.parse(jsonString)

    await connection.setRemoteDescription(desc)
    await connection.setLocalDescription(await connection.createAnswer())

    connection.addIceCandidate({
        candidate,
        sdpMLineIndex: 0,
        sdpMid: '0',
    })

    alert('copied data to clipboard')
    navigator.clipboard.writeText(JSON.stringify(connection.localDescription))
}

init().then((connection) => {
    document.getElementById('button').addEventListener('click', () => {
        handleInput(document.getElementById('input').value, connection)
    })
})
