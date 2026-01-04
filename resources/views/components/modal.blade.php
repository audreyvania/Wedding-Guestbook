<!-- Button Trigger Modal -->
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#guestModal">
  + Add Guest
</button>

<!-- Modal -->
<div class="modal fade" id="guestModal" tabindex="-1" aria-labelledby="guestModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 shadow-lg border-0">
      <div class="modal-header">
        <h5 class="modal-title fw-bold" id="guestModalLabel">Add / Edit Guest</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <form id="guestForm" method="POST" action="{{ route('guests.store') }}">
        @csrf
        <div class="modal-body">
          <!-- Guest Name -->
          <div class="mb-3">
            <label class="form-label">Guest Name</label>
            <input type="text" class="form-control rounded-3" name="guest_name" placeholder="Name" required>
          </div>

          <!-- Number of Guest -->
          <div class="mb-3">
            <label class="form-label">Number of Guest</label>
            <select class="form-select rounded-3" name="number_of_guest">
              <option value="1">1 People</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
              <option value="4">4 People</option>
            </select>
          </div>

          <!-- Status -->
          <div class="mb-3">
            <label class="form-label d-block">Status</label>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="status" value="Attended" checked>
              <label class="form-check-label">Attended</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="status" value="Absent">
              <label class="form-check-label">Absent</label>
            </div>
          </div>

          <!-- Category -->
          <div class="mb-3">
            <label class="form-label">Category</label>
            <select class="form-select rounded-3" name="category">
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="modal-footer d-flex justify-content-between">
          <button type="button" class="btn btn-outline-warning px-4 rounded-3" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-warning px-4 rounded-3 text-white">Save</button>
        </div>
      </form>
    </div>
  </div>
</div>
