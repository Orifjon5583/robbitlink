// ========================================================
// 1. BOSHLANG'ICH MA'LUMOTLAR
// ========================================================

// Standart Havolalar ro'yxati
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

// Standart Dastur Kodlari ro'yxati
const defaultCodes = [
  {
    id: 'code-1',
    title: 'Python Turtle: Yulduzcha chizish',
    lang: 'Python',
    desc: 'Toshbaqacha yordamida 5 burchakli chiroyli yulduzcha hosil qilish kodi.',
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
  },
  {
    id: 'code-2',
    title: 'Rang-barang doiraviy spiral',
    lang: 'Python',
    desc: 'Ko\'p rangli aylanma chiziqlar orqali chiroyli spiral naqsh yaratish.',
    code: `import turtle

t = turtle.Turtle()
t.speed(0)
colors = ["red", "purple", "blue", "green", "orange", "yellow"]

for x in range(60):
    t.pencolor(colors[x % 6])
    t.width(x // 10 + 1)
    t.forward(x * 3)
    t.left(59)

turtle.done()`
  }
];

// ----------------- PAROL TIZIMI ----------------- //
// Maxfiy parol: 7896
const DEFAULT_ADMIN_PASSWORD = '7896';

if (localStorage.getItem('robbit_admin_pwd') === '1234') {
  localStorage.setItem('robbit_admin_pwd', '7896');
}

function getAdminPassword() {
  return localStorage.getItem('robbit_admin_pwd') || DEFAULT_ADMIN_PASSWORD;
}

let isAdmin = sessionStorage.getItem('robbit_is_admin') === 'true';
let pendingAction = null; // 'add_link', 'delete_link', 'add_code', 'edit_code', 'delete_code'
let pendingPayload = null;
let editingCodeId = null; // Kod tahrirlanayotgan bo'lsa uning IDsi

// LocalStorage dan yuklash
function loadLinks() {
  const stored = localStorage.getItem('robbit_links');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...defaultLinks];
}

function saveLinks(linksList) {
  localStorage.setItem('robbit_links', JSON.stringify(linksList));
}

function loadCodes() {
  const stored = localStorage.getItem('robbit_codes_list');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...defaultCodes];
}

function saveCodes(codesList) {
  localStorage.setItem('robbit_codes_list', JSON.stringify(codesList));
}

let links = loadLinks();
let codes = loadCodes();
let currentCategory = 'all';
let searchQuery = '';
let currentTab = 'links'; // 'links' yoki 'codes'

// ========================================================
// 2. DOM ELEMENTLARI
// ========================================================

// Tablar
const tabLinksBtn = document.getElementById('tabLinksBtn');
const tabCodesBtn = document.getElementById('tabCodesBtn');
const tabLinksBadge = document.getElementById('tabLinksBadge');
const tabCodesBadge = document.getElementById('tabCodesBadge');
const linksView = document.getElementById('linksView');
const codesView = document.getElementById('codesView');

// Header va Admin tugmalari
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminBtnText = document.getElementById('adminBtnText');
const openModalBtn = document.getElementById('openModalBtn');

// Havolalar bo'limi
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryTabs = document.getElementById('categoryTabs');
const linksGrid = document.getElementById('linksGrid');
const linksCount = document.getElementById('linksCount');
const emptyState = document.getElementById('emptyState');

// Dastur Kodlari bo'limi
const openAddCodeModalBtn = document.getElementById('openAddCodeModalBtn');
const codesList = document.getElementById('codesList');
const codesEmptyState = document.getElementById('codesEmptyState');

// Yangi havola modali
const modalOverlay = document.getElementById('modalOverlay');
const addLinkForm = document.getElementById('addLinkForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// Parol so'rash modali
const authModalOverlay = document.getElementById('authModalOverlay');
const authForm = document.getElementById('authForm');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const cancelAuthModalBtn = document.getElementById('cancelAuthModalBtn');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const authErrorMsg = document.getElementById('authErrorMsg');
const togglePasswordVisibilityBtn = document.getElementById('togglePasswordVisibilityBtn');

// Kod yuklash/tahrirlash modali
const editCodeModalOverlay = document.getElementById('editCodeModalOverlay');
const editCodeForm = document.getElementById('editCodeForm');
const closeEditCodeModalBtn = document.getElementById('closeEditCodeModalBtn');
const cancelEditCodeModalBtn = document.getElementById('cancelEditCodeModalBtn');
const codeTitleInput = document.getElementById('codeTitleInput');
const codeLangSelect = document.getElementById('codeLangSelect');
const codeDescInput = document.getElementById('codeDescInput');
const codeTextarea = document.getElementById('codeTextarea');

// ========================================================
// 3. TABLARNI ALMASHTIRISH (NAVIGATION)
// ========================================================

function switchTab(tabName) {
  currentTab = tabName;
  if (tabName === 'links') {
    tabLinksBtn.classList.add('active');
    tabCodesBtn.classList.remove('active');
    linksView.style.display = 'block';
    codesView.style.display = 'none';
    openModalBtn.style.display = 'inline-flex';
    openModalBtn.querySelector('span').textContent = 'Yangi havola';
  } else {
    tabCodesBtn.classList.add('active');
    tabLinksBtn.classList.remove('active');
    linksView.style.display = 'none';
    codesView.style.display = 'block';
    openModalBtn.style.display = 'none'; // Kodlar tabida alohida 'Yangi kod yuklash' tugmasi bor
    renderCodes();
  }
  refreshLucide();
}

tabLinksBtn.addEventListener('click', () => switchTab('links'));
tabCodesBtn.addEventListener('click', () => switchTab('codes'));

// ========================================================
// 4. DASTUR KODLARI BO'LIMI FUNKSIYALARI
// ========================================================

function renderCodes() {
  tabCodesBadge.textContent = codes.length;

  if (codes.length === 0) {
    codesList.innerHTML = '';
    codesEmptyState.style.display = 'block';
    refreshLucide();
    return;
  }

  codesEmptyState.style.display = 'none';

  codesList.innerHTML = codes.map((item, index) => {
    // Faqat admin uchun tahrirlash va o'chirish tugmalari ko'rinadi
    const adminActionsHtml = isAdmin ? `
      <div class="code-admin-actions">
        <button class="code-edit-btn" onclick="openEditCodeModal('${item.id}')" title="Kodni tahrirlash">
          <i data-lucide="edit-3"></i>
          <span>Tahrirlash</span>
        </button>
        <button class="code-delete-btn" onclick="deleteCode('${item.id}')" title="Kodni o'chirish">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    ` : '';

    return `
      <div class="code-item-card" data-code-id="${item.id}">
        <div class="code-item-header">
          <div class="code-item-title-wrap">
            <div class="code-item-icon">
              <i data-lucide="terminal"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 class="code-item-title">${escapeHtml(item.title)}</h3>
                <span class="code-item-lang">${escapeHtml(item.lang || 'Python')}</span>
              </div>
            </div>
          </div>
        </div>

        <p class="code-item-desc">${escapeHtml(item.desc || 'Ushbu kodni ko\'chirib oling va dasturlash muhitida ishga tushiring.')}</p>

        <!-- Read-only kod maydoni (o'quvchilar tahrirlay olmaydi) -->
        <div class="code-pre-box">
          <pre><code>${escapeHtml(item.code)}</code></pre>
        </div>

        <div class="code-item-actions">
          <button class="copy-code-btn" onclick="copyCodeSnippet(this, '${item.id}')">
            <i data-lucide="copy"></i>
            <span>Kodni nusxalash</span>
          </button>
          ${adminActionsHtml}
        </div>
      </div>
    `;
  }).join('');

  refreshLucide();
}

// Kodni nusxalash (O'quvchilar uchun)
window.copyCodeSnippet = async function(btn, codeId) {
  const targetCode = codes.find(c => c.id === codeId);
  if (!targetCode) return;

  try {
    await navigator.clipboard.writeText(targetCode.code);
    const span = btn.querySelector('span');
    const originalText = span.textContent;
    span.textContent = 'Nusxa olindi! ✅';
    btn.style.background = '#059669';

    setTimeout(() => {
      span.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  } catch (err) {
    console.error('Nusxalashda xatolik:', err);
  }
};

// Kod yuklash tugmasi bosilganda
openAddCodeModalBtn.addEventListener('click', () => {
  if (!isAdmin) {
    openAuthModal('add_code');
  } else {
    editingCodeId = null;
    openCodeModalForAdd();
  }
});

function openCodeModalForAdd() {
  editCodeForm.reset();
  editingCodeId = null;
  editCodeModalOverlay.querySelector('h3').textContent = "Yangi Dars Kodini Yuklash";
  editCodeModalOverlay.classList.add('active');
  codeTitleInput.focus();
  refreshLucide();
}

window.openEditCodeModal = function(codeId) {
  if (!isAdmin) {
    openAuthModal('edit_code', codeId);
    return;
  }

  const target = codes.find(c => c.id === codeId);
  if (!target) return;

  editingCodeId = codeId;
  codeTitleInput.value = target.title;
  codeLangSelect.value = target.lang || 'Python';
  codeDescInput.value = target.desc || '';
  codeTextarea.value = target.code;

  editCodeModalOverlay.querySelector('h3').textContent = "Dars Kodini Tahrirlash";
  editCodeModalOverlay.classList.add('active');
  codeTextarea.focus();
  refreshLucide();
};

function closeEditCodeModal() {
  editCodeModalOverlay.classList.remove('active');
  editCodeForm.reset();
  editingCodeId = null;
}

closeEditCodeModalBtn.addEventListener('click', closeEditCodeModal);
cancelEditCodeModalBtn.addEventListener('click', closeEditCodeModal);
editCodeModalOverlay.addEventListener('click', (e) => {
  if (e.target === editCodeModalOverlay) closeEditCodeModal();
});

// Kod formasi saqlanganda
editCodeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!isAdmin) {
    alert("Faqat o'qituvchi kod yuklay oladi!");
    closeEditCodeModal();
    return;
  }

  const title = codeTitleInput.value.trim();
  const lang = codeLangSelect.value;
  const desc = codeDescInput.value.trim();
  const code = codeTextarea.value;

  if (editingCodeId) {
    // Mavjud kodni yangilash
    codes = codes.map(c => c.id === editingCodeId ? { ...c, title, lang, desc, code } : c);
  } else {
    // Yangi kod qo'shish
    const newCode = {
      id: 'code-' + Date.now(),
      title,
      lang,
      desc,
      code
    };
    codes.unshift(newCode);
  }

  saveCodes(codes);
  closeEditCodeModal();
  renderCodes();
});

// Kodni o'chirish (faqat admin)
window.deleteCode = function(codeId) {
  if (!isAdmin) {
    openAuthModal('delete_code', codeId);
    return;
  }

  if (confirm("Rostdan ham ushbu kodni o'chirmoqchimisiz?")) {
    codes = codes.filter(c => c.id !== codeId);
    saveCodes(codes);
    renderCodes();
  }
};

// ========================================================
// 5. HAVOLALAR (LINKS) BO'LIMI FUNKSIYALARI
// ========================================================

function renderLinks() {
  tabLinksBadge.textContent = links.length;

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

function getCategoryName(cat) {
  switch (cat) {
    case 'dasturlash': return 'Dasturlash';
    case 'onlayn-muhit': return 'Onlayn Muhit';
    case 'foydali': return 'Foydali Sayt';
    default: return 'Boshqa';
  }
}

function renderIconHtml(iconName) {
  if (!iconName) return `<i data-lucide="globe"></i>`;
  const isEmoji = /\p{Extended_Pictographic}/u.test(iconName);
  if (isEmoji) {
    return `<span class="emoji-icon">${iconName}</span>`;
  }
  return `<i data-lucide="${iconName}"></i>`;
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

function refreshLucide() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// Havola qo'shish modali
openModalBtn.addEventListener('click', () => {
  if (!isAdmin) {
    openAuthModal('add_link');
  } else {
    openAddLinkModal();
  }
});

function openAddLinkModal() {
  modalOverlay.classList.add('active');
  document.getElementById('linkTitle').focus();
  refreshLucide();
}

function closeAddLinkModal() {
  modalOverlay.classList.remove('active');
  addLinkForm.reset();
}

closeModalBtn.addEventListener('click', closeAddLinkModal);
cancelModalBtn.addEventListener('click', closeAddLinkModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeAddLinkModal();
});

addLinkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!isAdmin) {
    alert("Havola qo'shish uchun avval parolni kiriting.");
    closeAddLinkModal();
    openAuthModal('add_link');
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
  closeAddLinkModal();
  renderLinks();
});

window.deleteLink = function(id) {
  if (!isAdmin) {
    openAuthModal('delete_link', id);
    return;
  }

  if (confirm("Rostdan ham ushbu havolani o'chirmoqchimisiz?")) {
    links = links.filter(l => l.id !== id);
    saveLinks(links);
    renderLinks();
  }
};

// ========================================================
// 6. ADMIN & PAROL (AUTH) TIZIMI
// ========================================================

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
  renderLinks();
  renderCodes();
  refreshLucide();
}

function openAuthModal(action = null, payload = null) {
  pendingAction = action;
  pendingPayload = payload;
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
  pendingPayload = null;
}

adminToggleBtn.addEventListener('click', () => {
  if (isAdmin) {
    if (confirm("Admin rejimidan chiqmoqchimisiz?")) {
      isAdmin = false;
      sessionStorage.removeItem('robbit_is_admin');
      updateAdminUI();
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

    const action = pendingAction;
    const payload = pendingPayload;
    closeAuthModal();

    if (action === 'add_link') {
      openAddLinkModal();
    } else if (action === 'delete_link' && payload) {
      deleteLink(payload);
    } else if (action === 'add_code') {
      openCodeModalForAdd();
    } else if (action === 'edit_code' && payload) {
      openEditCodeModal(payload);
    } else if (action === 'delete_code' && payload) {
      deleteCode(payload);
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

togglePasswordVisibilityBtn.addEventListener('click', () => {
  const isPass = adminPasswordInput.type === 'password';
  adminPasswordInput.type = isPass ? 'text' : 'password';
  togglePasswordVisibilityBtn.innerHTML = isPass ? 
    `<i data-lucide="eye-off"></i>` : 
    `<i data-lucide="eye"></i>`;
  refreshLucide();
});

// ========================================================
// 7. QIDIRUV VA KATEGORIYALAR
// ========================================================

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
switchTab('links');
