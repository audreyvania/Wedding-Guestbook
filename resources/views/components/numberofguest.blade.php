<!-- Modal -->
<div class="modal fade" id="attendModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <form id="attendForm">
      @csrf
      <input type="hidden" name="guest_id" id="modal_guest_id">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Number of Guest</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input type="number" name="number_of_guest" id="modal_number" class="form-control" min="1" value="1">
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Confirm</button>
        </div>
      </div>
    </form>
  </div>
</div>
