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

// ----------------- PAROL SOZLAMALARI ----------------- //
// Yangi maxfiy parol: 7896
const DEFAULT_ADMIN_PASSWORD = '7896';

// Agar eski 1234 paroli qolib ketgan bo'lsa uni avtomatik 7896 ga yangilash
if (localStorage.getItem('robbit_admin_pwd') === '1234') {
  localStorage.setItem('robbit_admin_pwd', '7896');
}

function getAdminPassword() {
  return localStorage.getItem('robbit_admin_pwd') || DEFAULT_ADMIN_PASSWORD;
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

// Havola qo'shish modali
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const addLinkForm = document.getElementById('addLinkForm');

// Admin Parol modali
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminBtnText = document.getElementById('adminBtnText');
const authModalOverlay = document.getElementById('authModalOverlay');
const authForm = document.getElementById('authForm');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const cancelAuthModalBtn = document.getElementById('cancelAuthModalBtn');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const authErrorMsg = document.getElementById('authErrorMsg');
const togglePasswordVisibilityBtn = document.getElementById('togglePasswordVisibilityBtn');

// Kod qismi (Shared Code) elementlari
const codeTitleDisplay = document.getElementById('codeTitleDisplay');
const codeDescDisplay = document.getElementById('codeDescDisplay');
const codeLangLabel = document.getElementById('codeLangLabel');
const codeTextDisplay = document.getElementById('codeTextDisplay');
const copySharedCodeBtn = document.getElementById('copySharedCodeBtn');
const copyBtnText = document.getElementById('copyBtnText');
const editCodeBtn = document.getElementById('editCodeBtn');

// Kod tahrirlash modali
const editCodeModalOverlay = document.getElementById('editCodeModalOverlay');
const editCodeForm = document.getElementById('editCodeForm');
const closeEditCodeModalBtn = document.getElementById('closeEditCodeModalBtn');
const cancelEditCodeModalBtn = document.getElementById('cancelEditCodeModalBtn');
const codeTitleInput = document.getElementById('codeTitleInput');
const codeLangSelect = document.getElementById('codeLangSelect');
const codeDescInput = document.getElementById('codeDescInput');
const codeTextarea = document.getElementById('codeTextarea');

// ----------------- O'QITUVCHI DARSI KODI (SHARED CODE) ----------------- //
const defaultSharedCode = {
  title: "🐍 Python Turtle: Yulduzcha chizish",
  desc: "O'qituvchi tomonidan taqdim etilgan kod. Ko'chirib oling va Sandbox'da ishga tushiring!",
  lang: "Python",
  code: `# Python Turtle namunasi
import turtle

t = turtle.Turtle()
t.shape("turtle")
t.color("forestgreen")
t.speed(3)

# Yulduzcha chizish
for _ in range(5):
    t.forward(120)
    t.right(144)

turtle.done()`
};

function loadSharedCode() {
  const stored = localStorage.getItem('robbit_shared_code');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Kod yuklashda xatolik:', e);
    }
  }
  return defaultSharedCode;
}

function saveSharedCode(codeData) {
  localStorage.setItem('robbit_shared_code', JSON.stringify(codeData));
}

// Kodni sahifada ko'rsatish (o'quvchilar faqat ko'radi va nusxalaydi)
function renderSharedCode() {
  const data = loadSharedCode();
  if (codeTitleDisplay) codeTitleDisplay.textContent = data.title || "🐍 Dars Kodi";
  if (codeDescDisplay) codeDescDisplay.textContent = data.desc || "O'qituvchi kodi";
  if (codeLangLabel) codeLangLabel.textContent = data.lang || "Python";
  if (codeTextDisplay) codeTextDisplay.textContent = data.code || "# Kod mavjud emas";

  // Kodni o'zgartirish tugmasi FAQAT admin rejimida ko'rinadi!
  if (editCodeBtn) {
    editCodeBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  }
  refreshLucide();
}

// Kodni nusxalash tugmasi (O'quvchilar uchun)
if (copySharedCodeBtn) {
  copySharedCodeBtn.addEventListener('click', async () => {
    const code = codeTextDisplay.textContent;
    try {
      await navigator.clipboard.writeText(code);
      const originalText = copyBtnText.textContent;
      copyBtnText.textContent = "Nusxa olindi! ✅";
      copySharedCodeBtn.style.background = "#059669";
      
      setTimeout(() => {
        copyBtnText.textContent = originalText;
        copySharedCodeBtn.style.background = "";
      }, 2000);
    } catch (err) {
      console.error("Nusxa olishda xatolik:", err);
    }
  });
}

// Kodni tahrirlash (Faqat O'qituvchi / Admin)
if (editCodeBtn) {
  editCodeBtn.addEventListener('click', () => {
    if (!isAdmin) {
      openAuthModal();
      return;
    }
    const currentData = loadSharedCode();
    codeTitleInput.value = currentData.title || '';
    codeLangSelect.value = currentData.lang || 'Python';
    codeDescInput.value = currentData.desc || '';
    codeTextarea.value = currentData.code || '';
    
    editCodeModalOverlay.classList.add('active');
    codeTextarea.focus();
    refreshLucide();
  });
}

function closeEditCodeModal() {
  editCodeModalOverlay.classList.remove('active');
  editCodeForm.reset();
}

if (closeEditCodeModalBtn) closeEditCodeModalBtn.addEventListener('click', closeEditCodeModal);
if (cancelEditCodeModalBtn) cancelEditCodeModalBtn.addEventListener('click', closeEditCodeModal);
if (editCodeModalOverlay) {
  editCodeModalOverlay.addEventListener('click', (e) => {
    if (e.target === editCodeModalOverlay) closeEditCodeModal();
  });
}

// Yangi kodni saqlash formasi
if (editCodeForm) {
  editCodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Faqat o'qituvchi kodni o'zgartira oladi!");
      closeEditCodeModal();
      return;
    }

    const updatedData = {
      title: codeTitleInput.value.trim(),
      lang: codeLangSelect.value,
      desc: codeDescInput.value.trim(),
      code: codeTextarea.value
    };

    saveSharedCode(updatedData);
    closeEditCodeModal();
    renderSharedCode();
  });
}

// ----------------- ADMIN UI & HOLAT ----------------- //

function renderIconHtml(iconName) {
  if (!iconName) return `<i data-lucide="globe"></i>`;
  const isEmoji = /\p{Extended_Pictographic}/u.test(iconName);
  if (isEmoji) {
    return `<span class="emoji-icon">${iconName}</span>`;
  }
  return `<i data-lucide="${iconName}"></i>`;
}

function updateAdminUI() {
  if (isAdmin) {
    adminToggleBtn.classList.add('admin-unlocked');
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
  renderSharedCode();
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

// ----------------- PAROL & AUTH TIZIMI ----------------- //

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
    authErrorMsg.style.display = 'flex';
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

openModalBtn.addEventListener('click', () => {
  if (!isAdmin) {
    openAuthModal('add');
  } else {
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
renderSharedCode();
