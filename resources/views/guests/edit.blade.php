<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Guest</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container mt-5">
    <h3 class="mb-4">Edit Guest</h3>

    <form action="{{ route('guests.update', $guest->id) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="mb-3">
            <label class="form-label">Guest Name</label>
            <input type="text" name="guest_name" class="form-control"
                   value="{{ $guest->guest_name }}" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Number of Guest</label>
            <input type="number" name="number_of_guest" class="form-control"
                   value="{{ $guest->number_of_guest }}" min="1" required>
        </div>

        <button type="submit" class="btn btn-primary">Update</button>
        <a href="/" class="btn btn-secondary">Cancel</a>
    </form>
</div>

</body>
</html>
