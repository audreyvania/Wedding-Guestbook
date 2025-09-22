<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Scanner</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">

    <style>
        body {
            background: url('{{ asset("img/MONO0390.jpg") }}') no-repeat center center fixed;
            background-size: cover;
        }

        .scanner-frame {
            width: 300px;
            height: 300px;
            position: relative;
            border: 5px solid black;
        }

        .scanner-frame::before,
        .scanner-frame::after {
            content: "";
            position: absolute;
            border: 3px solid white;
            width: 20px;
            height: 20px;
        }

        .scanner-frame::before {
            top: 0;
            left: 0;
            border-right: none;
            border-bottom: none;
        }

        .scanner-frame::after {
            bottom: 0;
            right: 0;
            border-left: none;
            border-top: none;
        }

        .scanner-frame video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1); /* mirror untuk kamera depan */
}

        

    </style>
</head>
<body>

<div class="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100 text-white">
        {{-- <div class="position-absolute top-0 start-0 w-100 h-100" style="background-color: rgba(0,0,0,0.3);"></div> --}}

    
    <h2 class="text-center fw-bold" style="color: #ae3f9a;">QR Code Scanner</h2>
    <p class="text-center mb-4">Scan Here</p>

    <div class="scanner-frame rounded position-relative overflow-hidden">
        <video id="preview"></video>
    </div>

    <div class="d-flex gap-3 mt-4">
        <button id="start-scan" class="btn btn-light d-flex align-items-center gap-2">
            <i class="bi bi-camera"></i> Start Scan
        </button>
        <button id="retry-scan" class="btn btn-light d-flex align-items-center gap-2">
            <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
    </div>
</div>

<!-- Instascan JS -->
<script src="https://rawgit.com/schmich/instascan-builds/master/instascan.min.js"></script>
<script>
    let scanner = new Instascan.Scanner({
        video: document.getElementById('preview'),
        mirror: false  // nonaktifin mirror default kamera depan
    });

    scanner.addListener('scan', function (content) {
        console.log("QR scanned:", content);
        alert('QR Code Scanned: ' + content);

        fetch('/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({ qr_code_data: content })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response from backend:", data);
        })
        .catch(err => console.error("Fetch error:", err));
    });

    document.getElementById('start-scan').addEventListener('click', function () {
        console.log("Start button clicked");
        Instascan.Camera.getCameras().then(function (cameras) {
            console.log("Cameras found:", cameras);
            if (cameras.length > 0) {
                scanner.start(cameras[0]); // kamera depan (biasanya index 0)
            } else {
                alert('No cameras found!');
            }
        }).catch(function (e) {
            console.error("Camera error:", e);
            alert("Camera error: " + e);
        });
    });

    document.getElementById('retry-scan').addEventListener('click', function () {
        console.log("Retry button clicked");
        scanner.stop();
        document.getElementById('preview').src = "";
        document.getElementById('start-scan').click();
    });
</script>

</body>
</html>
