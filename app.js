(() => {
  'use strict';
  const STORAGE_KEY = 'parkingLineDemoV1';
  const SAMPLE_SPACES = [
    { id: 's1', title: 'Covered home garage', area: 'Gulshan 2, Dhaka', price: 120, type: 'Covered garage', rating: '4.9', emoji: '🏠' },
    { id: 's2', title: 'Private driveway space', area: 'Banani, Dhaka', price: 100, type: 'Private driveway', rating: '4.8', emoji: '🚘' },
    { id: 's3', title: 'Secure outdoor parking', area: 'Dhanmondi, Dhaka', price: 80, type: 'Outdoor parking', rating: '4.7', emoji: '🏡' },
    { id: 's4', title: 'Shaded family garage', area: 'Uttara Sector 7, Dhaka', price: 110, type: 'Covered garage', rating: '4.9', emoji: '🏘️' },
    { id: 's5', title: 'Wide driveway parking', area: 'Mohammadpur, Dhaka', price: 70, type: 'Private driveway', rating: '4.6', emoji: '🚗' },
    { id: 's6', title: 'Covered compact space', area: 'Bashundhara, Dhaka', price: 90, type: 'Covered garage', rating: '4.8', emoji: '🏠' }
  ];
  const $ = (selector, root = document) => root.querySelector(selector);
  const money = value => '৳' + Math.round(Number(value) || 0).toLocaleString('en-BD');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const freshData = () => ({ bookings: [], listings: [], expenses: { marketing: 0, operations: 0, other: 0 } });
  function readData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && Array.isArray(saved.bookings) && Array.isArray(saved.listings) ? { ...freshData(), ...saved, expenses: { ...freshData().expenses, ...(saved.expenses || {}) } } : freshData();
    } catch { return freshData(); }
  }
  let data = readData();
  let activeSpace = null;
  let toastTimer;
  const saveData = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  function toast(message) {
    const element = $('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 2800);
  }
  function localDate() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function allSpaces() {
    const ownerSpaces = data.listings.map((item, index) => ({
      ...item, id: `h${index}`, rating: 'New', emoji: item.type.includes('Covered') ? '🏠' : '🚘', ownerListing: true
    }));
    return [...ownerSpaces, ...SAMPLE_SPACES];
  }
  function renderSpaces(query = '') {
    const cards = $('#space-cards');
    if (!cards) return;
    const spaces = allSpaces().filter(space => !query || `${space.area} ${space.title} ${space.type}`.toLowerCase().includes(query.toLowerCase()));
    cards.innerHTML = spaces.length ? spaces.map(space => `
      <article class="space-card">
        <div class="space-visual"><span class="sample-flag">${space.ownerListing ? 'Your demo listing' : 'Sample listing'}</span><span>${space.emoji}</span></div>
        <div class="space-body"><div class="space-title-row"><h3>${escapeHtml(space.title)}</h3><span class="rating">★ ${space.rating}</span></div>
          <p class="location">⌖ ${escapeHtml(space.area)} · ${escapeHtml(space.type)}</p>
          <div class="space-foot"><div class="space-price">${money(space.price)} <small>/ hour</small></div><button class="button small book-button" type="button" data-id="${escapeHtml(space.id)}">Reserve</button></div>
        </div>
      </article>`).join('') : '<div class="empty-state">No sample spaces match that area. Try Gulshan, Banani, Dhanmondi, Uttara, Mohammadpur, or Bashundhara.</div>';
    $('#space-count') && ($('#space-count').textContent = spaces.length);
    cards.querySelectorAll('.book-button').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.id)));
  }
  function openBooking(spaceId) {
    activeSpace = allSpaces().find(space => space.id === spaceId);
    const modal = $('#booking-modal');
    if (!activeSpace || !modal) return;
    $('#modal-space-name').textContent = `${activeSpace.title} · ${activeSpace.area}`;
    $('#booking-form [name="spaceId"]').value = activeSpace.id;
    $('#booking-date').value = $('#search-date')?.value || localDate();
    $('#booking-duration').value = $('#search-hours')?.value || '2';
    updateBookingSummary();
    modal.showModal();
  }
  function updateBookingSummary() {
    if (!activeSpace || !$('#booking-summary')) return;
    const hours = Number($('#booking-duration').value);
    $('#booking-summary').innerHTML = `Estimated demo booking total<br><strong>${money(activeSpace.price * hours)}</strong> <span style="color:var(--muted);font-size:10px">(${money(activeSpace.price)} × ${hours} hour${hours === 1 ? '' : 's'})</span>`;
  }
  function renderListings() {
    const list = $('#listing-list');
    if (list) {
      list.innerHTML = data.listings.map((listing, index) => `
        <div class="listing-row"><div><strong>${escapeHtml(listing.title)}</strong><small>${escapeHtml(listing.area)} · ${money(listing.price)}/hour · ${escapeHtml(listing.availability)}</small></div>
        <button class="text-button remove-listing" type="button" data-index="${index}">Remove</button></div>`).join('') || '<p class="panel-intro">You have no demo listings yet.</p>';
      list.querySelectorAll('.remove-listing').forEach(button => button.addEventListener('click', () => {
        data.listings.splice(Number(button.dataset.index), 1);
        saveData(); renderListings(); renderSpaces($('#search-area')?.value.trim() || ''); renderDashboard(); toast('Demo listing removed.');
      }));
    }
    $('#listing-count') && ($('#listing-count').textContent = data.listings.length);
  }
  function monthlyBookings() {
    const month = localDate().slice(0, 7);
    return data.bookings.filter(booking => booking.date?.slice(0, 7) === month);
  }
  function renderDashboard() {
    const bookings = monthlyBookings();
    const gross = bookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0);
    const platformRevenue = gross * 0.2;
    const processing = gross * 0.02;
    const expenses = Number(data.expenses.marketing || 0) + Number(data.expenses.operations || 0) + Number(data.expenses.other || 0);
    $('#dash-gmv') && ($('#dash-gmv').textContent = money(gross));
    $('#dash-revenue') && ($('#dash-revenue').textContent = money(platformRevenue));
    $('#dash-profit') && ($('#dash-profit').textContent = money(platformRevenue - processing - expenses));
    $('#booking-count') && ($('#booking-count').textContent = data.bookings.length);
    $('#listing-count') && ($('#listing-count').textContent = data.listings.length);
    const bookingList = $('#booking-list');
    if (bookingList) bookingList.innerHTML = bookings.length ? bookings.map(booking => `<div class="data-row"><span>${escapeHtml(booking.title)} · ${escapeHtml(booking.date)} · ${Number(booking.hours)}h</span><strong>${money(booking.total)}</strong></div>`).join('') : '<div class="data-row"><span>No demo reservations this month yet</span><span>—</span></div>';
    const form = $('#expense-form');
    if (form) for (const name of ['marketing', 'operations', 'other']) form.elements[name].value = data.expenses[name] || 0;
  }
  function renderActivity() {
    const list = $('#activity-list');
    if (!list) return;
    const ordered = [...data.bookings].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    list.innerHTML = ordered.length ? ordered.map(booking => `
      <div class="record-row"><div><strong>${escapeHtml(booking.title)}</strong><small>${escapeHtml(booking.area)} · ${escapeHtml(booking.date)} at ${escapeHtml(booking.time)} · ${Number(booking.hours)} hour(s) · ${escapeHtml(booking.vehicle)}</small></div>
      <div style="text-align:right"><strong>${money(booking.total)}</strong><small>Demo reservation</small></div><button class="text-button cancel-booking" type="button" data-id="${escapeHtml(booking.id)}">Remove</button></div>`).join('') : '<div class="empty-state">No reservations yet. Browse sample spaces to try the demo booking flow.</div>';
    list.querySelectorAll('.cancel-booking').forEach(button => button.addEventListener('click', () => {
      data.bookings = data.bookings.filter(booking => booking.id !== button.dataset.id);
      saveData(); renderActivity(); renderDashboard(); toast('Demo reservation removed.');
    }));
    $('#activity-count') && ($('#activity-count').textContent = ordered.length);
  }
  $('#search-form')?.addEventListener('submit', event => {
    event.preventDefault();
    renderSpaces($('#search-area').value.trim());
    $('#spaces')?.scrollIntoView({ behavior: 'smooth' });
  });
  $('#host-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    data.listings.push({ title: form.elements.title.value.trim(), area: form.elements.area.value.trim(), price: Number(form.elements.price.value), type: form.elements.type.value, availability: form.elements.availability.value.trim() });
    saveData(); form.reset(); form.elements.price.value = 120;
    renderListings(); renderSpaces($('#search-area')?.value.trim() || ''); renderDashboard(); toast('Demo listing saved in this browser.');
  });
  $('#booking-duration')?.addEventListener('change', updateBookingSummary);
  $('.modal-close')?.addEventListener('click', () => $('#booking-modal')?.close());
  $('#booking-modal')?.addEventListener('click', event => { if (event.target === $('#booking-modal')) $('#booking-modal').close(); });
  $('#booking-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!activeSpace) return;
    const hours = Number(form.elements.hours.value), date = form.elements.date.value, time = form.elements.time.value;
    if (date < localDate()) { toast('Choose today or a future date.'); return; }
    data.bookings.push({ id: Date.now().toString(), spaceId: activeSpace.id, title: activeSpace.title, area: activeSpace.area, date, time, hours, vehicle: form.elements.vehicle.value, total: hours * Number(activeSpace.price) });
    saveData(); $('#booking-modal').close(); renderDashboard(); toast('Demo reservation saved. No payment was taken.');
    window.location.href = 'my-activity.html';
  });
  $('#expense-form')?.addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    data.expenses = { marketing: Number(form.elements.marketing.value) || 0, operations: Number(form.elements.operations.value) || 0, other: Number(form.elements.other.value) || 0 };
    saveData(); renderDashboard(); toast('Monthly estimate updated.');
  });
  $('#clear-demo')?.addEventListener('click', () => {
    if (!window.confirm('Clear all Parking Line demo reservations, listings, and expense inputs stored in this browser?')) return;
    data = freshData(); saveData(); renderDashboard(); renderListings(); renderSpaces($('#search-area')?.value.trim() || ''); renderActivity(); toast('This browser’s demo data was cleared.');
  });
  const today = localDate();
  if ($('#search-date')) { $('#search-date').min = today; $('#search-date').value = today; }
  if ($('#booking-date')) $('#booking-date').min = today;
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.getAttribute('href') === location.pathname.split('/').pop()) link.classList.add('active');
  });
  renderSpaces(); renderDashboard(); renderListings(); renderActivity();
})();

