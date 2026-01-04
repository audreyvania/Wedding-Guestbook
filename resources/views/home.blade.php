<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wedding Guestbook</title>

    {{-- BOOTSTRAP --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

    {{-- FONT STYLE --}}
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
    </style>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sail&display=swap"
        rel="stylesheet">

    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Rosarivo:ital@0;1&family=Sail&display=swap"
        rel="stylesheet">
    <style>
        body {
            font-family: 'Rosarivo', serif;
            background-color: #fffafc;
        }

        .font-playfair {
            font-family: 'Playfair Display', serif;
        }

        .font-sail {
            font-family: 'Sail', cursive;
        }


        .hero {
            background: url('img/MONO0332.jpg') no-repeat center center;
            background-size: cover;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #fff;
            text-align: center;
        }

        .hero-text h1 {
            font-size: 64px;
            color: #F0C0B2;
            -webkit-text-stroke: 1px #ffffff;
        }

        .hero-text h1.font-sail {
            font-weight: 400 !important;
            /* override fw-bold */
        }


        .stats-box {
            border-radius: 15px;
            padding: 20px;
            color: #444;
            font-weight: bold;
        }

        .stats-total {
            background-color: #FAD1D7;
        }

        .stats-attended {
            background-color: #C7E9E5;
        }

        .stats-absent {
            background-color: #E5E5E5;
        }

        .status-attended {
            background-color: #6CB4A2;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
        }

        .status-absent {
            background-color: #dc3545;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
        }

        .table thead {
            background-color: #FAD1D7;
        }


        .btn-1 {
            color: #000;
            /* teks, bisa #FFDD82 juga */
            background-color: #FFDD82;
            /* ini bikin tombol filled */
            border: none;
            /* optional, hilangkan border default */
        }

        .btn-1:hover {
            background-color: #e6c266;
            /* sedikit gelap saat hover */
            color: #000;
            /* teks tetap terbaca */
        }

        .btn-2 {
            color: #fff;
            background-color: #31B0FF;
            border: none;
        }

        .btn-2:hover {
            background-color: #2691d6;
            /* sedikit gelap saat hover */
            color: #fff;
        }

        .btn-3 {
            color: #fff;
            background-color: #BC1E51;
            border: none;
        }

        .btn-3:hover {
            background-color: #a01746;
            /* sedikit gelap saat hover */
            color: #fff;
        }
    </style>
</head>

<body>

    <!-- Hero Section -->
    <div class="hero position-relative">
        <div class="position-absolute top-0 start-0 w-100 h-100" style="background-color: rgba(0,0,0,0.5);"></div>


        <div class="hero-text position-relative text-center text-white">
            <h1 class="mb-3 font-playfair">The Wedding Of</h1>
            <h1 class="fw-bold font-sail">Raihan</h1>
            <h1 class="fw-bold font-sail">&</h1>
            <h1 class="fw-bold font-sail">Debby</h1>
        </div>

        <div class="mt-4 col-md-4 position-relative">
            <form action="/home" method="GET">
                <div class="input-group">
                    <input type="text" name="search" class="form-control" placeholder="Search Guest Name Here..">

                    <!-- Tombol search -->
                    <button class="btn btn-outline-light" type="submit">
                        <i class="bi bi-search"></i>
                    </button>

                    <!-- Tombol scan QR -->
                    <a href="{{ url('/qr-scanner') }}" class="btn btn-outline-light">
                        <i class="bi bi-camera"></i>
                    </a>

                </div>

            </form>
        </div>
    </div>

    <!-- Stats -->
    <div class="container text-center my-5">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="stats-box stats-total">
                    <h5>Total Guests</h5>
                    <h2>{{ $total }}</h2>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-box stats-attended">
                    <h5>Attended</h5>
                    <h2>{{ $attended }}</h2>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-box stats-absent">
                    <h5>Absent</h5>
                    <h2>{{ $absent }}</h2>
                </div>
            </div>
        </div>
    </div>

    <!-- Guest Table -->
    <div class="container mb-5">
        <div class="d-flex justify-content-between mb-3">
            <a href="#" class="btn btn-1">Export PDF</a>
            <a href="#" class="btn btn-success">+ Add New Guest</a>
        </div>
        <div class="table-responsive">
            <table class="table table-bordered align-middle text-center">
                <thead>
                    <tr>
                        <th>Guest Name</th>
                        <th>Number Of Guest</th>
                        <th>Check-in Time</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($guests as $guest)
                        <tr>
                            <td>{{ $guest->guest_name }}</td>
                            <td>{{ $guest->number_of_guest }}</td>
                            <td>{{ $guest->check_in_time }}</td>
                            <td>
                                @if($guest->status == 'Attended')
                                    <span class="status-attended">Attended</span>
                                @else
                                    <span class="status-absent">Absent</span>
                                @endif
                            </td>
                            <td>
                                <!-- Tombol Edit -->
                                <a href="{{ route('guests.edit', $guest->id) }}" class="btn btn-2">
                                    <i class="bi bi-pencil-square"></i> Edit
                                </a>

                                <!-- Tombol Delete -->
                                <form action="{{ route('guests.destroy', $guest->id) }}" method="POST"
                                    style="display:inline-block;"
                                    onsubmit="return confirm('Are you sure you want to delete this guest?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-3">
                                        <i class="bi bi-trash"></i> Delete
                                    </button>

                                </form>
                            </td>

                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-center mt-3">
            {{ $guests->links() }}
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Modal untuk pilih number of guest -->
<div class="modal fade" id="attendModal" tabindex="-1" aria-hidden="true">
  ...
</div>

<!-- Script AJAX -->
<script>
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('input[name="search"]');
    let selectedGuestId = null;

    searchInput.addEventListener('keyup', function() {
        const query = this.value;

        if (query.length < 2) return; // minimal 2 huruf
        fetch(`/guests/search?q=${query}`)
            .then(res => res.json())
            .then(data => {
                let list = '';
                data.forEach(g => {
                    list += `<li class="list-group-item list-group-item-action" data-id="${g.id}">${g.guest_name}</li>`;
                });
                let dropdown = document.getElementById('searchDropdown');
                if (!dropdown) {
                    dropdown = document.createElement('ul');
                    dropdown.id = 'searchDropdown';
                    dropdown.className = 'list-group position-absolute w-100';
                    searchInput.parentNode.appendChild(dropdown);
                }
                dropdown.innerHTML = list;

                // klik guest
                dropdown.querySelectorAll('li').forEach(li => {
                    li.addEventListener('click', function() {
                        selectedGuestId = this.dataset.id;
                        document.getElementById('modal_guest_id').value = selectedGuestId;
                        const modal = new bootstrap.Modal(document.getElementById('attendModal'));
                        modal.show();
                        dropdown.innerHTML = '';
                    });
                });
            });
    });

    // submit modal form
    document.getElementById('attendForm').addEventListener('submit', function(e){
        e.preventDefault();
        const formData = new FormData(this);
        fetch('{{ route("guests.attend") }}', {
            method: 'POST',
            headers: {'X-CSRF-TOKEN': '{{ csrf_token() }}'},
            body: formData
        }).then(res => res.json())
          .then(data => {
              if(data.success){
                  location.reload(); // reload halaman setelah update status
              }
          });
    });
});
</script>

</body>

</html>