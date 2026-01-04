@extends('layouts.app')

@section('content')
<div class="container mt-5" style="max-width: 600px">
    <h3 class="mb-4">Add New Guest</h3>

    @if ($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('guests.store') }}" method="POST">
        @csrf

        <div class="mb-3">
            <label class="form-label">Guest Name</label>
            <input
                type="text"
                name="guest_name"
                class="form-control"
                required
            >
        </div>

        <div class="mb-3">
            <label class="form-label">Number of Guests</label>
            <input
                type="number"
                name="number_of_guest"
                class="form-control"
                min="1"
                value="1"
                required
            >
        </div>

        <div class="d-flex justify-content-between">
            <a href="/" class="btn btn-secondary">Back</a>
            <button type="submit" class="btn btn-success">
                Save Guest
            </button>
        </div>
    </form>
</div>
@endsection
