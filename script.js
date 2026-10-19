// Boshlang'ich havolalar ro'yxati (Default Links)
const defaultLinks = [
  {
    id: 'link-1',
    title: 'Python Sandbox: Turtle',
    url: 'https://pythonsandbox.com/turtle',
    desc: 'Brauzerning o\'zida Python Turtle kodlarini yozish va shakllar chizish onlayn maydoni.',
    category: 'onlayn-muhit',
    icon: '🐢'
  },
  {
    id: 'link-2',
    title: 'Scratch MIT',
    url: 'https://scratch.mit.edu',
    desc: 'Blokli dasturlash orqali animatsiyalar va o\'yinlar yaratish platformasi.',
    category: 'dasturlash',
    icon: '🐱'
  },
  {
    id: 'link-3',
    title: 'W3Schools Darsliklari',
    url: 'https://www.w3schools.com',
    desc: 'HTML, CSS, JavaScript va Python bo\'yicha qulay interaktiv qo\'llanmalar.',
    category: 'foydali',
    icon: '📚'
  },
  {
    id: 'link-4',
    title: 'Replit Online IDE',
    url: 'https://replit.com',
    desc: 'Ko\'plab dasturlash tillarida onlayn kod yozish va loyihalar yaratish muhiti.',
    category: 'onlayn-muhit',
    icon: '💻'
  }
];

// LocalStorage dan yuklab olish yoki boshlang'ichlarini olish
function loadLinks() {
  const stored = localStorage.getItem('robbit_links');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Xatolik:', e);
    }
  }
  return [...defaultLinks];
}

function saveLinks(links) {
  localStorage.setItem('robbit_links', JSON.stringify(links));
}

let links = loadLinks();
let currentCategory = 'all';
let searchQuery = '';

// DOM elementlari
const linksGrid = document.getElementById('linksGrid');
const linksCount = document.getElementById('linksCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryTabs = document.getElementById('categoryTabs');
const emptyState = document.getElementById('emptyState');

// Modal elementlari
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const addLinkForm = document.getElementById('addLinkForm');

// Havolalarni ekranga chiqarish
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

  linksCount.textContent = `Jami: ${filtered.length} ta havola`;

  if (filtered.length === 0) {
    linksGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  linksGrid.innerHTML = filtered.map(item => {
    // URL dan domenni ajratib olish (e.g. pythonsandbox.com)
    let domain = '';
    try {
      domain = new URL(item.url).hostname;
    } catch (e) {
      domain = item.url;
    }

    const badgeClass = `badge-${item.category || 'dasturlash'}`;
    const categoryName = getCategoryName(item.category);

    return `
      <div class="link-card" data-id="${item.id}">
        <div class="link-card-top">
          <div class="link-card-icon">${item.icon || '🔗'}</div>
          <div class="link-card-info">
            <span class="link-category-badge ${badgeClass}">${categoryName}</span>
            <h3 class="link-card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
          </div>
        </div>

        <p class="link-card-desc">${escapeHtml(item.desc || 'Tavsif mavjud emas.')}</p>

        <div class="link-domain">
          <span>🌐</span> ${domain}
        </div>

        <div class="link-actions">
          <a 
            href="${escapeHtml(item.url)}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="link-visit-btn"
          >
            <span>Saytga kirish</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <button class="link-delete-btn" title="Havolani o'chirish" onclick="deleteLink('${item.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
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

// Havolani o'chirish
window.deleteLink = function(id) {
  if (confirm("Rostdan ham ushbu havolani o'chirmoqchimisiz?")) {
    links = links.filter(l => l.id !== id);
    saveLinks(links);
    renderLinks();
  }
};

// Qidiruv
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
  renderLinks();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  renderLinks();
});

// Kategoriya tanlash
categoryTabs.addEventListener('click', (e) => {
  if (e.target.classList.contains('cat-pill')) {
    categoryTabs.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.getAttribute('data-category');
    renderLinks();
  }
});

// Modal ochish / yopish
function openModal() {
  modalOverlay.classList.add('active');
  document.getElementById('linkTitle').focus();
}

function closeModal() {
  modalOverlay.classList.remove('active');
  addLinkForm.reset();
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Yangi havola qo'shish formasi
addLinkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
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
  closeModal();
  renderLinks();
});

// Boshlang'ich yuklash
renderLinks();
