// Boshlang'ich havolalar ro'yxati (Default Links) - Lucide Icons bilan
const defaultLinks = [
  {
    id: 'link-1',
    title: 'Python Sandbox: Turtle',
    url: 'https://pythonsandbox.com/turtle',
    desc: 'Brauzerning o\'zida Python Turtle kodlarini yozish va shakllar chizish onlayn maydoni.',
    category: 'onlayn-muhit',
    icon: 'terminal'
  },
  {
    id: 'link-2',
    title: 'Scratch MIT',
    url: 'https://scratch.mit.edu',
    desc: 'Blokli dasturlash orqali animatsiyalar va o\'yinlar yaratish platformasi.',
    category: 'dasturlash',
    icon: 'gamepad-2'
  },
  {
    id: 'link-3',
    title: 'W3Schools Darsliklari',
    url: 'https://www.w3schools.com',
    desc: 'HTML, CSS, JavaScript va Python bo\'yicha qulay interaktiv qo\'llanmalar.',
    category: 'foydali',
    icon: 'book-open'
  },
  {
    id: 'link-4',
    title: 'Replit Online IDE',
    url: 'https://replit.com',
    desc: 'Ko\'plab dasturlash tillarida onlayn kod yozish va loyihalar yaratish muhiti.',
    category: 'onlayn-muhit',
    icon: 'laptop'
  }
];

// O'qituvchi (Admin) Paroli
// Standart parol: '1234'. O'qituvchi xohlasa localStorage orqali o'zgartirishi mumkin
function getAdminPassword() {
  return localStorage.getItem('robbit_admin_pwd') || '1234';
}

// Boshlang'ich holatlar
let isAdmin = sessionStorage.getItem('robbit_is_admin') === 'true';
let pendingAction = null; // 'add' yoki 'delete'
let pendingDeleteId = null;

// LocalStorage dan havolalarni yuklash
function loadLinks() {
  const stored = localStorage.getItem('robbit_links');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map(item => {
        if (item.id === 'link-1' && item.icon === '🐢') item.icon = 'terminal';
        if (item.id === 'link-2' && item.icon === '🐱') item.icon = 'gamepad-2';
        if (item.id === 'link-3' && item.icon === '📚') item.icon = 'book-open';
        if (item.id === 'link-4' && item.icon === '💻') item.icon = 'laptop';
        return item;
      });
    } catch (e) {
      console.error('Xatolik:', e);
    }
  }
  return [...defaultLinks];
}

function saveLinks(linksList) {
  localStorage.setItem('robbit_links', JSON.stringify(linksList));
}

let links = loadLinks();
let currentCategory = 'all';
let searchQuery = '';

// DOM Elementlari
const linksGrid = document.getElementById('linksGrid');
const linksCount = document.getElementById('linksCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryTabs = document.getElementById('categoryTabs');
const emptyState = document.getElementById('emptyState');

// Havola qo'shish modali elementlari
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const addLinkForm = document.getElementById('addLinkForm');

// Admin Parol modali elementlari
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminBtnText = document.getElementById('adminBtnText');
const adminIcon = document.getElementById('adminIcon');
const authModalOverlay = document.getElementById('authModalOverlay');
const authForm = document.getElementById('authForm');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const cancelAuthModalBtn = document.getElementById('cancelAuthModalBtn');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const authErrorMsg = document.getElementById('authErrorMsg');
const togglePasswordVisibilityBtn = document.getElementById('togglePasswordVisibilityBtn');

// Lucide icon html generatsiyasi
function renderIconHtml(iconName) {
  if (!iconName) return `<i data-lucide="globe"></i>`;
  const isEmoji = /\p{Extended_Pictographic}/u.test(iconName);
  if (isEmoji) {
    return `<span class="emoji-icon">${iconName}</span>`;
  }
  return `<i data-lucide="${iconName}"></i>`;
}

// Admin UI holatini yangilash
function updateAdminUI() {
  if (isAdmin) {
    adminToggleBtn.classList.add('admin-unlocked');
    adminBtnText.textContent = "Admin (Chiqish)";
    adminToggleBtn.innerHTML = `
      <i data-lucide="unlock"></i>
      <span>Admin (Chiqish)</span>
    `;
    adminToggleBtn.title = "Admin rejimidan chiqish uchun bosing";
  } else {
    adminToggleBtn.classList.remove('admin-unlocked');
    adminToggleBtn.innerHTML = `
      <i data-lucide="lock"></i>
      <span>O'qituvchi</span>
    `;
    adminToggleBtn.title = "O'qituvchi (Admin) rejimi uchun bosing";
  }
  refreshLucide();
}

// Havolalarni render qilish
function renderLinks() {
  const filtered = links.filter(item => {
    const matchCategory = currentCategory === 'all' || item.category === currentCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query || 
      item.title.toLowerCase().includes(query) || 
      (item.desc && item.desc.toLowerCase().includes(query)) ||
      item.url.toLowerCase().includes(query);

    return matchCategory && matchSearch;
  });

  const adminTag = isAdmin ? `<span class="admin-mode-indicator"><i data-lucide="shield-check"></i> Admin rejimi</span>` : '';
  linksCount.innerHTML = `Jami: ${filtered.length} ta havola ${adminTag}`;

  if (filtered.length === 0) {
    linksGrid.innerHTML = '';
    emptyState.style.display = 'block';
    refreshLucide();
    return;
  }

  emptyState.style.display = 'none';

  linksGrid.innerHTML = filtered.map(item => {
    let domain = '';
    try {
      domain = new URL(item.url).hostname;
    } catch (e) {
      domain = item.url;
    }

    const badgeClass = `badge-${item.category || 'dasturlash'}`;
    const categoryName = getCategoryName(item.category);

    // O'chirish tugmasi FAQAT admin rejimida ko'rinadi va ishlaydi!
    const deleteButtonHtml = isAdmin ? `
      <button class="link-delete-btn" title="Havolani o'chirish (Admin)" onclick="deleteLink('${item.id}')">
        <i data-lucide="trash-2"></i>
      </button>
    ` : '';

    return `
      <div class="link-card" data-id="${item.id}">
        <div class="link-card-top">
          <div class="link-card-icon">
            ${renderIconHtml(item.icon)}
          </div>
          <div class="link-card-info">
            <span class="link-category-badge ${badgeClass}">${categoryName}</span>
            <h3 class="link-card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
          </div>
        </div>

        <p class="link-card-desc">${escapeHtml(item.desc || 'Tavsif kiritilmagan.')}</p>

        <div class="link-domain">
          <i data-lucide="globe" class="domain-icon"></i>
          <span>${domain}</span>
        </div>

        <div class="link-actions">
          <a 
            href="${escapeHtml(item.url)}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="link-visit-btn"
          >
            <span>Saytga kirish</span>
            <i data-lucide="external-link"></i>
          </a>
          ${deleteButtonHtml}
        </div>
      </div>
    `;
  }).join('');

  refreshLucide();
}

function refreshLucide() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function getCategoryName(cat) {
  switch (cat) {
    case 'dasturlash': return 'Dasturlash';
    case 'onlayn-muhit': return 'Onlayn Muhit';
    case 'foydali': return 'Foydali Sayt';
    default: return 'Boshqa';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

// ----------------- PAROL & ADMIN TIZIMI ----------------- //

// Parol so'rash modalini ochish
function openAuthModal(action = null, payload = null) {
  pendingAction = action;
  pendingDeleteId = payload;
  authErrorMsg.style.display = 'none';
  adminPasswordInput.value = '';
  authModalOverlay.classList.add('active');
  adminPasswordInput.focus();
  refreshLucide();
}

function closeAuthModal() {
  authModalOverlay.classList.remove('active');
  authErrorMsg.style.display = 'none';
  adminPasswordInput.value = '';
  pendingAction = null;
  pendingDeleteId = null;
}

// Admin tugmasi bosilganda
adminToggleBtn.addEventListener('click', () => {
  if (isAdmin) {
    if (confirm("Admin rejimidan chiqmoqchimisiz?")) {
      isAdmin = false;
      sessionStorage.removeItem('robbit_is_admin');
      updateAdminUI();
      renderLinks();
    }
  } else {
    openAuthModal('toggle_admin');
  }
});

// Parol tekshirish
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const enteredPassword = adminPasswordInput.value.trim();
  const correctPassword = getAdminPassword();

  if (enteredPassword === correctPassword) {
    isAdmin = true;
    sessionStorage.setItem('robbit_is_admin', 'true');
    updateAdminUI();
    renderLinks();

    const action = pendingAction;
    const deleteId = pendingDeleteId;
    closeAuthModal();

    if (action === 'add') {
      openAddModal();
    } else if (action === 'delete' && deleteId) {
      deleteLink(deleteId);
    }
  } else {
    authErrorMsg.style.display = 'block';
    adminPasswordInput.focus();
    adminPasswordInput.select();
  }
});

closeAuthModalBtn.addEventListener('click', closeAuthModal);
cancelAuthModalBtn.addEventListener('click', closeAuthModal);
authModalOverlay.addEventListener('click', (e) => {
  if (e.target === authModalOverlay) closeAuthModal();
});

// Parolni ko'rsatish / yashirish
togglePasswordVisibilityBtn.addEventListener('click', () => {
  const isPass = adminPasswordInput.type === 'password';
  adminPasswordInput.type = isPass ? 'text' : 'password';
  togglePasswordVisibilityBtn.innerHTML = isPass ? 
    `<i data-lucide="eye-off"></i>` : 
    `<i data-lucide="eye"></i>`;
  refreshLucide();
});

// ----------------- HAVOLA QO'SHISH & O'CHIRISH ----------------- //

// Havola qo'shish tugmasi
openModalBtn.addEventListener('click', () => {
  if (!isAdmin) {
    // Parol so'raladi
    openAuthModal('add');
  } else {
    // Admin allaqachon tasdiqlangan
    openAddModal();
  }
});

function openAddModal() {
  modalOverlay.classList.add('active');
  document.getElementById('linkTitle').focus();
  refreshLucide();
}

function closeAddModal() {
  modalOverlay.classList.remove('active');
  addLinkForm.reset();
}

closeModalBtn.addEventListener('click', closeAddModal);
cancelModalBtn.addEventListener('click', closeAddModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeAddModal();
});

// Yangi havola qo'shish formasi
addLinkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (!isAdmin) {
    alert("Kechirasiz, havola qo'shish uchun avval parolni kiritishingiz lozim.");
    closeAddModal();
    openAuthModal('add');
    return;
  }

  const title = document.getElementById('linkTitle').value.trim();
  let url = document.getElementById('linkUrl').value.trim();
  const desc = document.getElementById('linkDesc').value.trim();
  const category = document.getElementById('linkCategory').value;
  const icon = document.getElementById('linkIcon').value;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const newLink = {
    id: 'link-' + Date.now(),
    title,
    url,
    desc,
    category,
    icon
  };

  links.unshift(newLink);
  saveLinks(links);
  closeAddModal();
  renderLinks();
});

// Havolani o'chirish (faqat admin)
window.deleteLink = function(id) {
  if (!isAdmin) {
    openAuthModal('delete', id);
    return;
  }

  if (confirm("Rostdan ham ushbu havolani o'chirmoqchimisiz?")) {
    links = links.filter(l => l.id !== id);
    saveLinks(links);
    renderLinks();
  }
};

// ----------------- QIDIRUV & FILTR ----------------- //

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
  renderLinks();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  renderLinks();
});

categoryTabs.addEventListener('click', (e) => {
  if (e.target.classList.contains('cat-pill')) {
    categoryTabs.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.getAttribute('data-category');
    renderLinks();
  }
});

// Dastlabki ishga tushirish
updateAdminUI();
renderLinks();
