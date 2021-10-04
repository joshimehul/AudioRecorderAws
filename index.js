function createAudioElement(blobUrl){
    const downloadEl = document.createElement('a');
    downloadEl.style = 'display: block';
    downloadEl.innerHTML = 'download';
    downloadEl.download = 'audio.webm';
    downloadEl.href = blobUrl;
    const audioEl = document.createElement('audio');
    audioEl.controls = true;
    const sourceEl = document.createElement('source');
    sourceEl.src = blobUrl;
    sourceEl.type = 'audio/webm';
    audioEl.appendChild(sourceEl);
    document.body.appendChild(audioEl);
    document.body.appendChild(downloadEl)

}



//begin streaming audio

var device = navigator.mediaDevices.getUserMedia({audio:true});

device.then(stream =>{

    var items=[];    
     var recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e =>{
        items.push(e.data);
        if(recorder.state == 'inactive')
        {
            var blob = new Blob (items, {type:'audio/webm',lastModified:Date.now()});
             createAudioElement(URL.createObjectURL(blob));
             uploadAWS(blob);
        }
    }
   
    record.onclick= e =>{
        
        console.log("Record button clicked")
        record.disabled= true;
        record.style.backgroundColor="red";
        document.getElementById("record").innerHTML="Recording";
        stopRecord.disabled=false;
        recorder.start();
        
    
    }

    stopRecord.onclick = e =>{
        console.log("Stop button clicked")
        record.disabled=false;
        stop.disabled=true;
        record.style.backgroundColor="green";
        document.getElementById("record").innerHTML="Record";
        recorder.stop();
    }

    

    function uploadAWS(blob) {
        var vaultBucketName = "BucketName";
        var bucketRegion = "RegionName";
        var identityPoolId = "PoolId";
        
        //Let's create a filename as a DD-MM-YYYY--HH-SS.webm 
        var currentDate = new Date();
        var recordkey = currentDate.getDate().toString() + '-' + currentDate.getMonth().toString() + '-' +
            currentDate.getFullYear().toString() + '--' + currentDate.getHours().toString() + '-' + currentDate.getMinutes().toString() + '.webm';
        AWS.config.region ="ap-south-1"; 
             
            
    
        AWS.config.httpOptions.timeout = 0;
        AWS.config.update({
            accessKeyId: 'AKIA55REPXRE6WWQIDWG', 
            secretAccessKey: '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',
            region:bucketRegion,
            AccessOrigin:'*',
           
        })

        var s3 = new AWS.S3({
            apiVersion: "2014-06-13",
            region:'ap-south-1',
            params: { Bucket: vaultBucketName,
               
                 }
        });

        AWS.config.credentials.get(function(err) {
            if (err) console.log(err);
            else console.log(AWS.config.credentials);
          });
       
        var upload = new AWS.S3.ManagedUpload({
            service : s3,
            params: {
                Bucket: vaultBucketName,
                Key: recordkey,
                Body: blob,
                
                ACL: "public-read"
              
             }
        });

        var promise = upload.promise();
        console.log( AWS.config.credentials);
        promise.then(
            function (data) {
                console.log("Successfully uploaded new record to AWS bucket " + vaultBucketName + "!",data.message);
            },
            function (err) {
                return alert("There was an error uploading your record: ", err.message);
            }
        );
    }
    
})


