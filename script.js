let stream = null;
let chunks = [];
let recorder = null;
let startButton = null;
let stopButton = null;
let downloadButton = null;
let recordedVideo = null;

async function setUp(){
    try{
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: { 
                mediaSource: "screen" 
            },
            audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
			}
        });
        playVideo();
    }catch(e){
        console.error(e);
    }
}

function playVideo(){
    if (stream){
        const videoScreen = document.querySelector('.videoScreen');
        videoScreen.srcObject = stream;
        videoScreen.play();
    }else{
        console.warn("Stream isn't available");
    }
}

async function startRecord(){
    await setUp();
    if (stream){
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = handleDataAvailable;
        recorder.onstop = handleStop;
        recorder.start(200);
        startButton.disabled = true;
        stopButton.disabled = false;
        window.onbeforeunload = function(e) {
            return "Video isn't downloaded, are you sure?";
        };
    }else{
        console.warn("Stream isn't available");
    }
}


function stopRecord(){
    recorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
}

function handleDataAvailable (e) {
	chunks.push(e.data);
}

function handleStop(e){
    const blob = new Blob(chunks,{type:'video/mp4'});
    chunks = [];
    downloadButton.href = URL.createObjectURL(blob);
    downloadButton.download = 'video.mp4';
    downloadButton.disabled = false;
    recordedVideo.src = URL.createObjectURL(blob);
    recordedVideo.load();   
    recordedVideo.onloadeddata = function(){
        const wrap = document.querySelector('.recorded-video-wrap');
        wrap.removeAttribute("hidden");
        wrap.scrollIntoView({ behavior: "smooth", block: "start" });
        recordedVideo.play();
    }
    stream.getTracks().forEach((track) => track.stop());
}

window.addEventListener('load',()=>{
    startButton = document.querySelector('.startButton');
    stopButton = document.querySelector('.stopButton');
    downloadButton = document.querySelector('.downloadButton');
    recordedVideo = document.querySelector('.recordedVideo');

    startButton.addEventListener('click',startRecord);
    stopButton.addEventListener('click',stopRecord);
    downloadButton.addEventListener('click',()=>{
        window.onbeforeunload = function () {}
    })
});
