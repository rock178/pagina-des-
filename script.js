// ===== State =====
let links = JSON.parse(localStorage.getItem('teamLinks') || '[]');

// ===== DOM Elements =====
const linkForm = document.getElementById('linkForm');
const linkResult = document.getElementById('linkResult');
const generatedLink = document.getElementById('generatedLink');
const copyBtn = document.getElementById('copyBtn');
const linksTableBody = document.getElementById('linksTableBody');
const emptyState = document.getElementById('emptyState');
const tableWrapper = document.getElementById('tableWrapper');
const totalLinksEl = document.getElementById('totalLinks');
const activeLinksEl = document.getElementById('activeLinks');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  updateExpiredLinks();
  renderTable();
  updateStats();
});

// ===== Form Submit =====
linkForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('memberName').value.trim();
  const email = document.getElementById('memberEmail').value.trim();
  const role = document.getElementById('memberRole').value;
  const expiry = document.getElementById('linkExpiry').value;

  if (!name || !email) return;

  const token = generateToken();
  const baseUrl = window.location.origin + window.location.pathname;
  const accessLink = `${baseUrl}?invite=${token}`;

  const linkData = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    email,
    role,
    token,
    link: accessLink,
    expiry,
    expiresAt: calculateExpiry(expiry),
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  links.unshift(linkData);
  saveLinks();

  // Show result
  generatedLink.value = accessLink;
  document.getElementById('linkMemberInfo').textContent = `Para: ${name}`;
  document.getElementById('linkRoleInfo').textContent = `Rol: ${capitalizeFirst(role)}`;
  document.getElementById('linkExpiryInfo').textContent = `Expira: ${formatExpiry(expiry)}`;
  linkResult.style.display = 'block';
  linkResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Reset form
  linkForm.reset();

  // Update UI
  renderTable();
  updateStats();
  showToast('Enlace de acceso generado exitosamente');
});

// ===== Generate Token =====
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = '';
    for (let i = 0; i < 6; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
}

// ===== Calculate Expiry Date =====
function calculateExpiry(expiry) {
  if (expiry === 'never') return null;

  const now = new Date();
  const map = {
    '24h': 24 * 60 * 60 * 1000,
    '48h': 48 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  return new Date(now.getTime() + (map[expiry] || 0)).toISOString();
}

// ===== Format Expiry Label =====
function formatExpiry(expiry) {
  const map = {
    '24h': '24 horas',
    '48h': '48 horas',
    '7d': '7 días',
    '30d': '30 días',
    'never': 'Sin expiración'
  };
  return map[expiry] || expiry;
}

// ===== Copy Link =====
function copyLink() {
  const link = generatedLink.value;
  navigator.clipboard.writeText(link).then(() => {
    copyBtn.textContent = 'Copiado';
    copyBtn.classList.add('copied');
    showToast('Enlace copiado al portapapeles');
    setTimeout(() => {
      copyBtn.textContent = 'Copiar';
      copyBtn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    generatedLink.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copiado';
    copyBtn.classList.add('copied');
    showToast('Enlace copiado al portapapeles');
    setTimeout(() => {
      copyBtn.textContent = 'Copiar';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
}

// ===== Copy from Table =====
function copyTableLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    showToast('Enlace copiado al portapapeles');
  }).catch(() => {
    showToast('No se pudo copiar el enlace');
  });
}

// ===== Revoke Link =====
function revokeLink(id) {
  const linkIndex = links.findIndex(l => l.id === id);
  if (linkIndex !== -1) {
    links[linkIndex].status = 'revoked';
    saveLinks();
    renderTable();
    updateStats();
    showToast('Enlace revocado');
  }
}

// ===== Delete Link =====
function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderTable();
  updateStats();
  showToast('Enlace eliminado');
}

// ===== Update Expired Links =====
function updateExpiredLinks() {
  const now = new Date();
  links.forEach(link => {
    if (link.status === 'active' && link.expiresAt && new Date(link.expiresAt) < now) {
      link.status = 'expired';
    }
  });
  saveLinks();
}

// ===== Render Table =====
function renderTable() {
  if (links.length === 0) {
    emptyState.style.display = 'block';
    tableWrapper.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  tableWrapper.style.display = 'block';

  linksTableBody.innerHTML = links.map(link => {
    const shortToken = link.token.substring(0, 14) + '...';
    const statusBadge = getStatusBadge(link.status);
    const roleBadge = `<span class="badge badge-role">${capitalizeFirst(link.role)}</span>`;
    const createdDate = new Date(link.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    let expiryText = 'Sin expiración';
    if (link.expiresAt) {
      const expiryDate = new Date(link.expiresAt);
      expiryText = expiryDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    const isActive = link.status === 'active';

    return `
      <tr>
        <td>
          <div class="member-info">
            <span class="member-name">${escapeHtml(link.name)}</span>
            <span class="member-email">${escapeHtml(link.email)}</span>
          </div>
        </td>
        <td>${roleBadge}</td>
        <td>
          <button class="link-short" onclick="copyTableLink('${escapeHtml(link.link)}')" title="Clic para copiar">
            ${shortToken}
          </button>
        </td>
        <td>${expiryText}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="actions">
            ${isActive ? `<button class="btn btn-sm btn-outline" onclick="revokeLink('${link.id}')">Revocar</button>` : ''}
            <button class="btn btn-sm btn-danger-outline" onclick="deleteLink('${link.id}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ===== Status Badge =====
function getStatusBadge(status) {
  const map = {
    active: '<span class="badge badge-active">Activo</span>',
    expired: '<span class="badge badge-expired">Expirado</span>',
    revoked: '<span class="badge badge-expired">Revocado</span>',
    pending: '<span class="badge badge-pending">Pendiente</span>'
  };
  return map[status] || status;
}

// ===== Update Stats =====
function updateStats() {
  totalLinksEl.textContent = links.length;
  activeLinksEl.textContent = links.filter(l => l.status === 'active').length;
}

// ===== Save to LocalStorage =====
function saveLinks() {
  localStorage.setItem('teamLinks', JSON.stringify(links));
}

// ===== Toast Notification =====
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== Utilities =====
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
