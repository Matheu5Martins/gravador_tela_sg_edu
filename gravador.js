document.addEventListener("DOMContentLoaded", function () {
    let shouldStop = false;
    let stopped = false;
    const videoElement = document.getElementsByTagName("video")[0];
    const downloadLink = document.getElementById('download');
    const stopButton = document.getElementById('stop');
    document.getElementById("recordAudio").addEventListener("click", recordAudio);
    document.getElementById("recordVideo").addEventListener("click", recordVideo);
    document.getElementById("recordScreen").addEventListener("click", recordScreen);
    function startRecord() {
        $('.btn-info').prop('disabled', true);
        $('#stop').prop('disabled', false);
        $('#download').css('display', 'none')
    }
    function stopRecord() {
        $('.btn-info').prop('disabled', false);
        $('#stop').prop('disabled', true);
        $('#download').css('display', 'block')
    }
    const audioRecordConstraints = {
        echoCancellation: true
    }

    stopButton.addEventListener('click', function () {
        shouldStop = true;
    });

    const handleRecord = function ({ stream, mimeType }) {
        startRecord()
        let recordedChunks = [];
        stopped = false;
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function (e) {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }

            if (shouldStop === true && stopped === false) {
                mediaRecorder.stop();
                stopped = true;
            }
        };

        mediaRecorder.onstop = function () {
            const blob = new Blob(recordedChunks, {
                type: mimeType
            });
            recordedChunks = []
            const filename = window.prompt('Digite o nome do arquivo');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${filename || 'recording'}.webm`;
            stopRecord();
            videoElement.srcObject = null;
        };

        mediaRecorder.start(200);
    };

    async function recordAudio() {
        const mimeType = 'audio/mp4';
        shouldStop = false;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioRecordConstraints });
        handleRecord({ stream, mimeType })
    }

    async function recordVideo() {
        const mimeType = 'video/mp4';
        shouldStop = false;
        const constraints = {
            audio: {
                "echoCancellation": false
            },
            video: {
                "width": {
                    "min": 640,
                    "max": 1024
                },
                "height": {
                    "min": 480,
                    "max": 768
                }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        handleRecord({ stream, mimeType })
    }

    async function recordScreen() {
        const mimeType = 'video/mp4';
        shouldStop = false;
        const constraints = {
            video: {
                cursor: 'motion'
            }
        };
        if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
            return window.alert('Gravação de tela não disponivel, recomendado usar o chrome ou edge.')
        }
        let stream = null;
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "motion" }, audio: { 'echoCancellation': true } });
        if (window.confirm("Gravar audio com a tela?")) {
            const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: { 'echoCancellation': false }, video: false });
            let tracks = [...displayStream.getTracks(), ...voiceStream.getAudioTracks()]
            stream = new MediaStream(tracks);
            handleRecord({ stream, mimeType })
        } else {
            stream = displayStream;
            handleRecord({ stream, mimeType });
        };
        videoElement.srcObject = stream;
    }
})