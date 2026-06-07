/* ── js/api.js ── */
// ══════════════════════════════════════════════════════
//  api.js — Constante API + helper fetch centralisé
//  Toutes les requêtes passent par apiCall() ou apiForm()
// ══════════════════════════════════════════════════════

const API = "https://mosala.io";

/**
 * Requête JSON authentifiée
 * @param {string} path       - ex: "/projets/"
 * @param {object} options    - fetch options (method, body...)
 * @param {string} token      - JWT Bearer token
 */
async function apiCall(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { ...options, headers });
  return r;
}

/**
 * Requête form-urlencoded (login OAuth2)
 */
async function apiForm(path, params = {}) {
  const body = new URLSearchParams(params);
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  return r;
}

/**
 * Requête multipart (upload fichiers)
 */
async function apiUpload(path, formData, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers,
    body: formData
  });
  return r;
}


/* ── js/utils.js ── */
// ══════════════════════════════════════════════════════
//  utils.js — Helpers partagés (format, date, validation)
//  Aucune dépendance vers les autres modules
// ══════════════════════════════════════════════════════

const Utils = {

  /**
   * Formate un montant avec devise
   * ex: formatBudget(15000, 'CDF') → "15 000 CDF"
   */
  formatBudget(b, devise) {
    if (!b) return 'À négocier';
    return new Intl.NumberFormat('fr-FR').format(b) + ' ' + (devise || 'GNF');
  },

  formatMontant(m) {
    return new Intl.NumberFormat('fr-FR').format(m || 0) + ' GNF';
  },

  /**
   * Date lisible : "12 janv. 2026"
   */
  formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  /**
   * Temps relatif : "il y a 3 min", "hier", "il y a 2j"
   */
  timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60)    return "à l'instant";
    if (diff < 3600)  return 'il y a ' + Math.round(diff / 60) + ' min';
    if (diff < 86400) return 'il y a ' + Math.round(diff / 3600) + 'h';
    if (diff < 172800) return 'hier';
    return 'il y a ' + Math.round(diff / 86400) + 'j';
  },

  /**
   * Date transaction : "Aujourd'hui", "Hier", "12 juin"
   */
  formatTxDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    if (diff < 7)   return 'Il y a ' + diff + ' jours';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  },

  /**
   * Heure d'un message : "14:32"
   */
  formatMsgTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  },

  /**
   * Label statut projet
   */
  statutLabel(s) {
    const m = {
      en_attente: '⏳ Disponible',
      en_cours:   '🔧 En cours',
      termine:    '✅ Terminé',
      annule:     '❌ Annulé',
      litige:     '⚖️ Litige'
    };
    return m[s] || s;
  },

  /**
   * Emoji par tag de compétence
   */
  tagEmoji(tag) {
    const map = {
      'React':'⚛️', 'Node.js':'🟢', 'Python':'🐍', 'Design':'🎨',
      'UI/UX':'🖌️', 'Vidéo':'🎬', 'Montage':'✂️', 'SEO':'🔍',
      'Crypto':'₿', 'Traduction':'🌍', 'Réseau':'🔧', 'Mobile':'📱',
      'Fullstack':'💻', 'Community':'📢'
    };
    for (const [k, v] of Object.entries(map)) {
      if (tag.includes(k)) return v;
    }
    return '🏷️';
  },

  /**
   * Validation numéro de téléphone congolais
   * Accepte : +243810000000 | 0810000000
   */
  validatePhone(val) {
    if (!val) return '';
    if (!/^(\+\d{10,15}|0\d{8,12})$/.test(val.trim())) {
      return 'Format invalide. Ex: +243810000000 ou 0810000000';
    }
    return '';
  },

  /**
   * CountUp animé sur un élément DOM
   */
  countUp(elementId, target, duration = 900) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.round(current) + '%';
      if (current >= target) clearInterval(timer);
    }, stepTime);
  },

};


/* ── js/auth.js ── */
// ══════════════════════════════════════════════════════
//  auth.js — Inscription, Login, Logout, Google OAuth
//  Dépendances : api.js
// ══════════════════════════════════════════════════════

const Auth = {

  async register() {
    if (this.phoneError) return;
    this.loading = true;
    this.emailAlreadyUsed = false;
    try {
      const payload = {};
      for (const [k, v] of Object.entries(this.form)) {
        payload[k] = (v === '' || v === undefined) ? null : v;
      }
      const r = await apiCall('/users/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const rawText = await r.text();
      let data;
      try { data = JSON.parse(rawText); }
      catch(e) { throw new Error('Erreur serveur. Réessaie dans quelques secondes.'); }

      if (!r.ok) {
        if (r.status === 400 && data.detail?.toLowerCase().includes('email')) {
          this.emailAlreadyUsed = true;
          return;
        }
        throw new Error(data.detail || 'Erreur inscription');
      }

      // Auto-login après inscription
      const rLogin = await apiForm('/auth/login', {
        username: this.form.telephone,
        password: this.form.password
      });
      const loginRaw = await rLogin.text();
      let loginData;
      try { loginData = JSON.parse(loginRaw); }
      catch(e) { throw new Error('Erreur connexion auto. Connecte-toi manuellement.'); }

      if (!rLogin.ok) {
        this.showToast('✅ Compte créé ! Connecte-toi.');
        this.loginForm.telephone = this.form.telephone;
        this.page = 'login';
        return;
      }

      this.token = loginData.access_token;
      sessionStorage.setItem('kv_token', this.token);
      const rMe = await apiCall('/auth/me', {}, this.token);
      this.user = await rMe.json();
      sessionStorage.setItem('kv_user', JSON.stringify(this.user));
      // → onboarding obligatoire
      // onboarding skip

    } catch(e) {
      this.showToast(e.message, 'error');
    } finally { this.loading = false; }
  },

  async loginWithGoogle() {
    if (!window.google) {
      this.showToast('Google non disponible, réessaie dans quelques secondes.', 'error');
      return;
    }
    this.loading = true;
    try {
      await new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: window.GOOGLE_CLIENT_ID,
          callback: resolve,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            reject(new Error('Popup Google bloqué. Autorisez les popups pour mosala.io.'));
          } else if (notification.isSkippedMoment()) {
            reject(new Error('Connexion Google annulée.'));
          }
        });
      }).then(async (response) => {
        const r = await apiCall('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ token: response.credential })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || 'Erreur Google');

        this.token = data.access_token;
        sessionStorage.setItem('kv_token', this.token);
        const rMe = await apiCall('/auth/me', {}, this.token);
        this.user = await rMe.json();
        sessionStorage.setItem('kv_user', JSON.stringify(this.user));

        if (!this.user.onboarding_done) {
          // onboarding skip
        } else if (!this.user.telephone) {
          this.page = 'complete-profil';
          this.showToast('👋 Bienvenue ' + this.user.prenom + ' ! Complète ton profil.');
        } else {
          this._postLoginSuccess();
        }
      });
    } catch(e) {
      if (e.message !== 'Connexion Google annulée.') {
        this.showToast(e.message, 'error');
      }
    } finally { this.loading = false; }
  },

  async login() {
    this.loading = true;
    try {
      const r = await apiForm('/auth/login', {
        username: this.loginForm.telephone,
        password: this.loginForm.password
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Identifiants incorrects');

      this.token = data.access_token;
      sessionStorage.setItem('kv_token', this.token);
      const rMe = await apiCall('/auth/me', {}, this.token);
      this.user = await rMe.json();
      sessionStorage.setItem('kv_user', JSON.stringify(this.user));

      if (!this.user.onboarding_done) {
        // onboarding skip
      } else {
        this._postLoginSuccess();
      }
    } catch(e) {
      this.showToast(e.message, 'error');
    } finally { this.loading = false; }
  },

  // Appelé après login réussi (login + Google)
  _postLoginSuccess() {
    this.page = 'app';
    this.showToast(`👋 Bienvenue ${this.user.prenom} !`);
    this.loadProjets();
    this.loadDashboard();
    this.startGlobalPolling();
    this.initNotifications();
    this._startInactivityTimer();
  },

  logout() {
    if (this._globalPollTimer) { clearInterval(this._globalPollTimer); this._globalPollTimer = null; }
    if (this._pollTimer)       { clearInterval(this._pollTimer);       this._pollTimer = null; }
    clearTimeout(this._inactivityTimer);
    this.token = null;
    this.user  = {};
    localStorage.removeItem('kv_token');
    localStorage.removeItem('kv_user');
    localStorage.removeItem('kv_remember');
    sessionStorage.removeItem('kv_token');
    sessionStorage.removeItem('kv_user');
    this.page = 'login';
    this.showToast('À bientôt 👋');
  },

};

// Google Identity callback (appelé par le SDK Google)
function handleGoogleCredential(response) {
  const appEl = document.querySelector('[x-data]');
  if (appEl && appEl._x_dataStack) {
    appEl._x_dataStack[0].loginWithGoogle();
  }
}


/* ── js/dashboard.js ── */
// ══════════════════════════════════════════════════════
//  dashboard.js — Overview, stats, graphique revenus
//  Dépendances : api.js, utils.js
// ══════════════════════════════════════════════════════

const Dashboard = {

  async loadDashboard() {
    try {
      const headers = { Authorization: `Bearer ${this.token}` };
      const [r, rc, rp] = await Promise.all([
        fetch(`${API}/dashboard/overview`, { headers }),
        fetch(`${API}/users/${this.user.id}/competences`, { headers }).catch(() => null),
        fetch(`${API}/dashboard/presence`).catch(() => null),
      ]);

      if (!r.ok) throw new Error('Erreur dashboard');
      const d = await r.json();

      // User
      if (d.user) {
        this.user = { ...this.user, ...d.user };
        sessionStorage.setItem('kv_user', JSON.stringify(this.user));
      }
      this.dashUser    = d.user || {};
      this.profileScore = d.user?.profile_completion || 0;

      // Wallet escrow
      if (d.wallet) {
        this.escrow = {
          disponible: d.wallet.solde        || 0,
          bloque:     d.wallet.solde_bloque || 0,
          total:      (d.wallet.solde || 0) + (d.wallet.solde_bloque || 0),
          devise:     d.wallet.devise || 'USD'
        };
      }

      this.dashStats       = d.stats              || {};
      this.mesProjets      = d.recent_projects    || [];
      this.dashMessages    = d.messages_recents   || [];
      this.dashRecommended = d.projets_recommandes || [];
      this.dashNotifs      = d.notifs_non_lues    || 0;
      this.dashGraphique   = d.graphique          || { '7j': [], '30j': [] };

      this.$nextTick(() => {
        this.renderEarningsChart();
        this.revealDashboard();
      });

      // Compétences
      try { if (rc?.ok) this.dashCompetences = await rc.json(); } catch {}

      // Presence
      try { if (rp?.ok) this.presence = await rp.json(); } catch {}

      // Activité récente
      this.dashActivite = [];
      if (d.stats?.revenus_mois > 0) {
        this.dashActivite.push({ icon: '✅', label: 'Paiement reçu', sub: '+$' + d.stats.revenus_mois.toFixed(2), time: 'ce mois' });
      }
      if (d.recent_projects?.length > 0) {
        this.dashActivite.push({ icon: '📁', label: 'Projet actif', sub: d.recent_projects[0].titre.substring(0, 30) + '...', time: 'récemment' });
      }
      if (d.messages_recents?.length > 0) {
        this.dashActivite.push({ icon: '💬', label: 'Message reçu', sub: d.messages_recents[0].expediteur || 'Nouveau message', time: 'récemment' });
      }

    } catch(e) {
      console.error('Dashboard error:', e);
    }
  },

  async loadPresence() {
    try {
      const r = await fetch(`${API}/dashboard/presence`);
      if (r.ok) this.presence = await r.json();
    } catch {}
  },

  async toggleDispo() {
    const newVal = this.user.disponibilite === 'disponible' ? 'occupé' : 'disponible';
    this.user.disponibilite = newVal;
    sessionStorage.setItem('kv_user', JSON.stringify(this.user));
    try {
      await apiCall('/users/moi', {
        method: 'PATCH',
        body: JSON.stringify({ disponibilite: newVal })
      }, this.token);
    } catch {}
    this.showToast(newVal === 'disponible' ? '✅ Tu es maintenant disponible' : '🔴 Statut : Occupé');
  },

  async generateCV() {
    if (!this.user.id) return;
    this.loadingCV = true;
    try {
      const r = await apiCall(`/users/${this.user.id}/generate-cv`, { method: 'POST' }, this.token);
      if (r.ok) this.showToast('📄 CV IA en cours de génération !');
      else throw new Error('Erreur génération CV');
    } catch(e) {
      this.showToast(e.message, 'error');
    } finally { this.loadingCV = false; }
  },

  switchPeriode(p) {
    this.dashPeriode = p;
    this.$nextTick(() => this.renderEarningsChart());
  },

  revealDashboard() {
    const blocks = document.querySelectorAll('.dash-block');
    blocks.forEach(el => el.classList.remove('revealed'));
    setTimeout(() => {
      blocks.forEach(el => el.classList.add('revealed'));
      if (window.lucide) window.lucide.createIcons();
      Utils.countUp('profileScoreDisplay', this.profileScore);
    }, 30);
  },

  renderEarningsChart() {
    const canvas = document.getElementById('earningsChart');
    if (!canvas) return;
    const data   = this.dashGraphique[this.dashPeriode] || [];
    const labels = data.map(d => d.date);
    const values = data.map(d => d.montant);
    const devise = this.escrow.devise || 'USD';

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 112);
    gradient.addColorStop(0, 'rgba(0,184,124,0.25)');
    gradient.addColorStop(1, 'rgba(0,184,124,0.00)');

    if (this.dashChart) this.dashChart.destroy();
    this.dashChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: devise,
          data: values,
          borderColor: '#00B87C',
          backgroundColor: gradient,
          borderWidth: 2,
          pointRadius: (ctx) => values[ctx.dataIndex] > 0 ? 3 : 0,
          pointBackgroundColor: '#00B87C',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          tension: 0.45,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleColor: '#94a3b8',
            bodyColor: '#fff',
            titleFont: { size: 10 },
            bodyFont: { size: 12, weight: 'bold' },
            padding: 8,
            cornerRadius: 8,
            callbacks: { label: (ctx) => ' $' + ctx.parsed.y.toFixed(2) }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
            border: { display: false },
            ticks: {
              font: { size: 9 }, color: '#94a3b8', maxTicksLimit: 4,
              callback: v => v >= 1000 ? '$' + (v/1000).toFixed(0) + 'k' : '$' + v
            }
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 9 }, color: '#94a3b8',
              maxTicksLimit: this.dashPeriode === '7j' ? 7 : 10,
              maxRotation: 0
            }
          }
        }
      }
    });
  },

};


/* ── js/marketplace.js ── */
// ══════════════════════════════════════════════════════
//  marketplace.js — Chargement projets, candidatures
//  Dépendances : api.js, utils.js
// ══════════════════════════════════════════════════════

const Marketplace = {

  async loadProjets() {
    this.loadingProjets = true;
    try {
      let url = `/projets/?limit=30`;
      if (this.filtreStatut) url += `&statut=${this.filtreStatut}`;
      const r = await apiCall(url, {}, this.token);
      this.projets = await r.json();
    } catch(e) {
      this.showToast('Erreur chargement projets', 'error');
    } finally { this.loadingProjets = false; }
  },

  async openProjet(p) {
    this.selectedProjet = p;
    this.jalonsProjet = [];
    try {
      const r = await apiCall(`/projets/${p.id}/jalons`, {}, this.token);
      if (r.ok) this.jalonsProjet = await r.json();
    } catch {}
  },

  postuler() {
    if (this.selectedProjet) {
      this.ouvrirPostuler(this.selectedProjet);
      this.selectedProjet = null;
    }
  },

  ouvrirPostuler(projet) {
    this.selectedProjet = null;
    this.postuleProjet  = projet;
    this.postuleForm    = { message: '', budget: projet.budget || '', delai: '' };
    this.modalPostuler  = true;
    this.$nextTick(() => { if (window.lucide) window.lucide.createIcons(); });
  },

  async envoyerCandidature() {
    if (!this.postuleForm.message.trim()) {
      this.showToast('Écris un message pour le client', 'error');
      return;
    }
    this.postuleLoading = true;
    try {
      const r = await apiCall('/candidatures/', {
        method: 'POST',
        body: JSON.stringify({
          projet_id:       this.postuleProjet.id,
          message:         this.postuleForm.message,
          budget_propose:  this.postuleForm.budget  ? parseFloat(this.postuleForm.budget) : null,
          delai_jours:     this.postuleForm.delai   ? parseInt(this.postuleForm.delai)    : null,
        })
      }, this.token);
      const data = await r.json();
      if (r.ok) {
        this.showToast('✅ Candidature envoyée !');
        this.mesCandidatures.push(this.postuleProjet.id);
        this.modalPostuler = false;
      } else {
        this.showToast(data.detail || 'Erreur', 'error');
      }
    } catch {
      this.showToast('Erreur réseau', 'error');
    } finally { this.postuleLoading = false; }
  },

  async loadMesCandidatures() {
    try {
      const r = await apiCall('/candidatures/mes-candidatures', {}, this.token);
      if (r.ok) {
        const data = await r.json();
        this.mesCandidatures = data.map(c => c.projet_id || c.id);
      }
    } catch {}
  },

  // ── NOUVEAU PROJET ──
  addJalon() {
    this.projetForm.jalons.push({ titre: '', montant: '' });
  },

  async createProjet() {
    this.loading = true;
    try {
      const r = await apiCall('/projets/', {
        method: 'POST',
        body: JSON.stringify({
          titre:       this.projetForm.titre,
          description: this.projetForm.description,
          budget:      this.projetForm.budget ? Number(this.projetForm.budget) : null,
          devise:      this.projetForm.devise,
        })
      }, this.token);
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Erreur création projet');

      // Jalons
      for (const j of this.projetForm.jalons) {
        if (j.titre && j.montant) {
          await apiCall(`/projets/${data.id}/jalons`, {
            method: 'POST',
            body: JSON.stringify({ titre: j.titre, montant: Number(j.montant) })
          }, this.token);
        }
      }

      this.showToast('🚀 Projet publié avec succès !');
      this.projetForm = { titre: '', description: '', budget: '', devise: 'GNF', jalons: [] };
      this.activeTab  = 'marketplace';
      await this.loadProjets();
    } catch(e) {
      this.showToast(e.message, 'error');
    } finally { this.loading = false; }
  },

};


/* ── js/messages.js ── */
// ══════════════════════════════════════════════════════
//  messages.js — Conversations, envoi, polling, upload
//  Dépendances : api.js, notifications.js
// ══════════════════════════════════════════════════════

const Messages = {

  async loadMessages() {
    this.convLoading = true;
    try {
      const r = await apiCall('/messages/conversations', {}, this.token);
      if (r.ok) {
        const convs = await r.json();
        this.conversations = convs.map(cv => ({
          ...cv,
          nom_interlocuteur: cv.client_id === this.user.id
            ? (cv.freelance_prenom || '') + ' ' + (cv.freelance_nom || '')
            : (cv.client_prenom   || '') + ' ' + (cv.client_nom    || ''),
          photo_interlocuteur: cv.client_id === this.user.id ? cv.freelance_photo : cv.client_photo,
          titre_projet: cv.projet_titre || ''
        }));
        this.unreadMessages = this.conversations.reduce((s, cv) => s + (cv.messages_non_lus || 0), 0);
      }
    } catch {}
    this.convLoading = false;
  },

  async openConversation(conv) {
    this.activeConv   = conv;
    this.convMessages = [];
    this.msgLoading   = true;
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
    try {
      const r = await apiCall(`/messages/conversations/${conv.id}/messages`, {}, this.token);
      if (r.ok) this.convMessages = await r.json();
    } catch {}
    this.msgLoading = false;
    this.$nextTick(() => {
      const z = document.getElementById('msgZone');
      if (z) z.scrollTop = z.scrollHeight;
    });
    this.atBottom = true;
    this._pollTimer = setInterval(() => this.pollMessages(), 5000);
    this.startTypingPoll();
    this.loadConvProjet(conv);
    // Marquer comme lu
    conv.messages_non_lus = 0;
    this.unreadMessages = this.conversations.reduce((s, cv) => s + (cv.messages_non_lus || 0), 0);
  },

  async sendMessage() {
    const text = this.newMessage.trim();
    if (!text || this.msgSending || !this.activeConv) return;
    this.msgSending  = true;
    this.newMessage  = '';
    try {
      const r = await apiCall(`/messages/conversations/${this.activeConv.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: text, type_message: 'texte' })
      }, this.token);
      if (r.ok) {
        const msg = await r.json();
        this.convMessages.push(msg);
        const conv = this.conversations.find(cv => cv.id === this.activeConv.id);
        if (conv) { conv.dernier_message = text; conv.last_message_at = msg.created_at; this.conversations = [...this.conversations]; }
        this.$nextTick(() => { const z = document.getElementById('msgZone'); if (z) z.scrollTop = z.scrollHeight; });
      }
    } catch {}
    this.msgSending = false;
  },

  async uploadFile(e) {
    const file = e.target.files[0];
    if (!file || !this.activeConv) return;
    if (file.size > 10 * 1024 * 1024) { this.showToast('Fichier trop lourd (max 10MB)', 'error'); return; }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const r = await apiCall(`/messages/conversations/${this.activeConv.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message: ev.target.result, type_message: 'image' })
          }, this.token);
          if (r.ok) {
            const msg = await r.json();
            this.convMessages.push(msg);
            this.$nextTick(() => { const z = document.getElementById('msgZone'); if (z) z.scrollTop = z.scrollHeight; });
          }
        } catch {}
      };
      reader.readAsDataURL(file);
    } else {
      try {
        const r = await apiCall(`/messages/conversations/${this.activeConv.id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ message: `📎 ${file.name}`, type_message: 'fichier' })
        }, this.token);
        if (r.ok) { const msg = await r.json(); this.convMessages.push(msg); }
      } catch {}
    }
    e.target.value = '';
  },

  signalTyping() {
    if (!this.activeConv || !this.token) return;
    if (this._typingTimer) return; // throttle 3s
    this._typingTimer = setTimeout(() => { this._typingTimer = null; }, 3000);
    fetch(`${API}/messages/conversations/${this.activeConv.id}/typing`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` }
    }).catch(() => {});
  },

  startTypingPoll() {
    if (this._typingPollTimer) clearInterval(this._typingPollTimer);
    this._typingPollTimer = setInterval(async () => {
      if (!this.activeConv || !this.token) return;
      try {
        const r = await apiCall(`/messages/conversations/${this.activeConv.id}/typing`, {}, this.token);
        if (r.ok) {
          const data = await r.json();
          this.peerTyping = data.typing;
          if (this.peerTyping) {
            this.$nextTick(() => { const z = document.getElementById('msgZone'); if (z) z.scrollTop = z.scrollHeight; });
          }
        }
      } catch {}
    }, 2000);
  },

  stopTypingPoll() {
    if (this._typingPollTimer) { clearInterval(this._typingPollTimer); this._typingPollTimer = null; }
    this.peerTyping = false;
  },

  async pollMessages() {
    if (!this.activeConv || !this.token) return;
    try {
      const last  = this.convMessages[this.convMessages.length - 1];
      const after = last ? `?after=${encodeURIComponent(last.created_at)}` : '';
      const r = await apiCall(`/messages/conversations/${this.activeConv.id}/messages${after}`, {}, this.token);
      if (r.ok) {
        const all     = await r.json();
        const existing = new Set(this.convMessages.map(m => m.id));
        const newMsgs  = all.filter(m => !existing.has(m.id));
        if (newMsgs.length > 0) {
          const incoming = newMsgs.filter(m => m.sender_id !== this.user.id);
          if (incoming.length > 0) {
            this.playSound('message');
            this.sendBrowserNotif(this.activeConv.nom_interlocuteur || 'Message', incoming[incoming.length - 1].message);
          }
          this.convMessages.push(...newMsgs);
          const lastMsg = newMsgs[newMsgs.length - 1];
          const conv = this.conversations.find(cv => cv.id === this.activeConv.id);
          if (conv) { conv.dernier_message = lastMsg.message; conv.last_message_at = lastMsg.created_at; this.conversations = [...this.conversations]; }
          if (this.atBottom) this.$nextTick(() => { const z = document.getElementById('msgZone'); if (z) z.scrollTop = z.scrollHeight; });
        }
      }
    } catch {}
  },

  async loadConvProjet(conv) {
    if (!conv.projet_id) return;
    try {
      const r = await apiCall(`/projets/${conv.projet_id}`, {}, this.token);
      if (r.ok) this.convProjet = await r.json();
    } catch {}
  },

  // ── Helpers affichage messages ──
  getMsgDateLabel(dateStr) {
    if (!dateStr) return '';
    const d         = new Date(dateStr);
    const today     = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const msgDay    = new Date(d); msgDay.setHours(0,0,0,0);
    if (msgDay.getTime() === today.getTime())     return "Aujourd'hui";
    if (msgDay.getTime() === yesterday.getTime()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  },

  shouldShowDateSep(index) {
    if (index === 0) return true;
    const prev = this.convMessages[index - 1];
    const curr = this.convMessages[index];
    if (!prev || !curr) return false;
    const d1 = new Date(prev.created_at); d1.setHours(0,0,0,0);
    const d2 = new Date(curr.created_at); d2.setHours(0,0,0,0);
    return d1.getTime() !== d2.getTime();
  },

  formatMsgTime(dateStr) {
    return Utils.formatMsgTime(dateStr);
  },

  checkScrollBottom() {
    const z = document.getElementById('msgZone');
    if (z) this.atBottom = z.scrollHeight - z.scrollTop - z.clientHeight < 50;
  },

  scrollToBottom() {
    const z = document.getElementById('msgZone');
    if (z) z.scrollTop = z.scrollHeight;
    this.atBottom = true;
  },

};


/* ── js/notifications.js ── */
// ══════════════════════════════════════════════════════
//  notifications.js — Push browser, sons, polling global
//  Dépendances : api.js
// ══════════════════════════════════════════════════════

const Notifications = {

  async initNotifications() {
    // Permission browser
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.notifPermission = 'granted';
      } else if (Notification.permission !== 'denied') {
        const p = await Notification.requestPermission();
        this.notifPermission = p;
      } else {
        this.notifPermission = 'denied';
      }
    }
    // Sons
    this._msgSound   = new Audio('/sounds/message.wav');
    this._notifSound = new Audio('/sounds/notif.wav');
    this._msgSound.volume   = 0.5;
    this._notifSound.volume = 0.4;
  },

  playSound(type = 'message') {
    if (!this.soundEnabled) return;
    try {
      const s = type === 'notif' ? this._notifSound : this._msgSound;
      if (s) { s.currentTime = 0; s.play().catch(() => {}); }
    } catch {}
  },

  sendBrowserNotif(title, body) {
    if (this.notifPermission !== 'granted' || document.visibilityState === 'visible') return;
    try {
      const n = new Notification(title, { body });
      n.onclick = () => { window.focus(); this.navigateTo('messages'); n.close(); };
      setTimeout(() => n.close(), 5000);
    } catch {}
  },

  /**
   * Polling global toutes les 5s : badge non-lus + notif son
   */
  startGlobalPolling() {
    if (this._globalPollTimer) return;
    this._globalPollTimer = setInterval(async () => {
      if (!this.token) return;
      try {
        const r = await apiCall('/messages/conversations', {}, this.token);
        if (r.ok) {
          const convs = await r.json();
          const total = convs.reduce((s, cv) => s + (cv.messages_non_lus || 0), 0);
          if (total > this.unreadMessages) {
            this.playSound('notif');
            this.sendBrowserNotif('Mosala', 'Vous avez de nouveaux messages');
            if (this.activeTab === 'messages') this.loadMessages();
          } else {
            // Mettre à jour les previews sans recharger tout
            convs.forEach(nc => {
              const ex = this.conversations.find(cv => cv.id === nc.id);
              if (ex && nc.last_message_at !== ex.last_message_at) {
                ex.dernier_message  = nc.dernier_message;
                ex.last_message_at  = nc.last_message_at;
                ex.messages_non_lus = nc.messages_non_lus;
              }
            });
            this.conversations = [...this.conversations];
          }
          this.unreadMessages = total;
        }
      } catch {}
    }, 5000);
  },

  stopGlobalPolling() {
    if (this._globalPollTimer) {
      clearInterval(this._globalPollTimer);
      this._globalPollTimer = null;
    }
  },

};


/* ── js/profile.js ── */
// ══════════════════════════════════════════════════════
//  profile.js — Chargement, édition, photo, compétences
//  Dépendances : api.js, utils.js
// ══════════════════════════════════════════════════════

const Profile = {

  async loadProfil() {
    this.profilLoading = true;
    try {
      const r = await apiCall('/auth/me', {}, this.token);
      if (r.ok) {
        const u = await r.json();
        this.user = { ...this.user, ...u };
        sessionStorage.setItem('kv_user', JSON.stringify(this.user));
        this.profileScore = u.profile_completion || 0;
      }
      // Compétences
      const rc = await apiCall(`/users/${this.user.id}/competences`, {}, this.token);
      if (rc.ok) this.profilCompetences = await rc.json();
    } catch {}
    this.profilLoading = false;
  },

  editProfil() {
    this.profilEdit = true;
    this.profilForm = {
      nom:          this.user.nom          || '',
      prenom:       this.user.prenom       || '',
      bio:          this.user.bio          || '',
      ville:        this.user.ville        || '',
      disponibilite: this.user.disponibilite || 'disponible',
    };
  },

  cancelEditProfil() {
    this.profilEdit = false;
  },

  async saveProfil() {
    this.profilSaving = true;
    try {
      const r = await apiCall('/users/moi', {
        method: 'PATCH',
        body: JSON.stringify(this.profilForm)
      }, this.token);
      const data = await r.json();
      if (r.ok) {
        this.user = { ...this.user, ...data };
        sessionStorage.setItem('kv_user', JSON.stringify(this.user));
        this.profileScore = data.profile_completion || this.profileScore;
        this.profilEdit = false;
        this.showToast('✅ Profil mis à jour !');
      } else {
        this.showToast(data.detail || 'Erreur sauvegarde', 'error');
      }
    } catch {
      this.showToast('Erreur réseau', 'error');
    } finally { this.profilSaving = false; }
  },

  async uploadPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showToast('Sélectionne une image (JPG, PNG)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image trop lourde (max 5MB)', 'error');
      return;
    }
    this.photoUploading = true;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const r = await apiUpload(`/users/${this.user.id}/photo`, formData, this.token);
      const data = await r.json();
      if (r.ok) {
        this.user.photo_url = data.photo_url || data.url || data;
        sessionStorage.setItem('kv_user', JSON.stringify(this.user));
        this.showToast('📸 Photo mise à jour !');
      } else {
        this.showToast(data.detail || 'Erreur upload photo', 'error');
      }
    } catch {
      this.showToast('Erreur réseau', 'error');
    } finally {
      this.photoUploading = false;
      e.target.value = '';
    }
  },

  async addCompetence(competenceId, niveau = 3) {
    try {
      const r = await apiCall(`/competences/users/${this.user.id}`, {
        method: 'POST',
        body: JSON.stringify({ competence_id: competenceId, niveau })
      }, this.token);
      if (r.ok) {
        await this.loadProfil();
        this.showToast('✅ Compétence ajoutée !');
      }
    } catch {
      this.showToast('Erreur ajout compétence', 'error');
    }
  },

};


/* ── js/wallet.js ── */
// ══════════════════════════════════════════════════════
//  wallet.js — Solde, transactions, retrait, dépôt
//  Dépendances : api.js, utils.js
// ══════════════════════════════════════════════════════

const Wallet = {

  async loadWallet() {
    this.walletLoading = true;
    try {
      const r = await apiCall('/wallet/', {}, this.token);
      if (r.ok) {
        const d = await r.json();
        this.wDispo  = d.solde          || 0;
        this.wBloque = d.solde_bloque   || 0;
        this.wTotal  = (d.solde || 0) + (d.solde_bloque || 0);
        this.wMois   = d.revenus_mois   || 0;
        this.walletDevise = d.devise    || 'USD';
      }
    } catch {}

    // Transactions
    try {
      const r = await apiCall('/wallet/transactions', {}, this.token);
      if (r.ok) this.walletTx = await r.json();
    } catch {}

    this.walletLoading = false;
  },

  async demanderRetrait() {
    if (!this.retraitMontant || !this.retraitNumero) {
      this.showToast('Remplis tous les champs', 'error');
      return;
    }
    this.retraitLoading = true;
    try {
      const r = await apiCall('/wallet/retrait', {
        method: 'POST',
        body: JSON.stringify({
          montant:  parseFloat(this.retraitMontant),
          mobile:   this.retraitMobile,
          numero:   this.retraitNumero,
        })
      }, this.token);
      const data = await r.json();
      if (r.ok) {
        this.retraitDone = true;
        this.showToast('✅ Demande de retrait envoyée !');
        await this.loadWallet();
      } else {
        this.showToast(data.detail || 'Erreur retrait', 'error');
      }
    } catch {
      this.showToast('Erreur réseau', 'error');
    } finally { this.retraitLoading = false; }
  },

  formatTxDate(dateStr) {
    return Utils.formatTxDate(dateStr);
  },

};


/* ── js/app.js ── */
// ══════════════════════════════════════════════════════
//  app.js — Shell Alpine.js principal
//  Rôle : état global + init + navigation + helpers UI
//  Logique métier → modules séparés (auth, dashboard...)
// ══════════════════════════════════════════════════════

// Tailwind config
tailwind.config = {
  theme: {
    extend: {
      colors: {
        kv: {
          green: '#16a34a', dark: '#14532d',
          light: '#dcfce7', gold: '#ca8a04', bg: '#f0fdf4',
        }
      }
    }
  }
};

// ── Navbar scroll compacte ──
(function() {
  const wrapper = document.getElementById('kzNavWrapper');
  if (!wrapper) return;
  window.addEventListener('scroll', () => {
    wrapper.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });
  document.querySelectorAll('.kz-navlink').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.kz-navlink').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
})();

// ── Command palette (⌘K) ──
var kzCmdFocusIdx = -1;

function kzCmdOpen() {
  document.getElementById('kzCmdOverlay').classList.add('open');
  setTimeout(() => {
    const input = document.getElementById('kzCmdInput');
    if (input) { input.value = ''; input.focus(); }
    kzCmdFilter('');
    kzCmdFocusIdx = -1;
  }, 50);
  document.body.style.overflow = 'hidden';
}

function kzCmdClose() {
  document.getElementById('kzCmdOverlay').classList.remove('open');
  document.body.style.overflow = '';
  kzCmdFocusIdx = -1;
}

function kzCmdFilter(q) {
  q = q.toLowerCase().trim();
  const items  = document.querySelectorAll('#kzCmdList .kz-cmd-item');
  const groups = document.querySelectorAll('#kzCmdList .kz-cmd-group-label');
  const groupVisible = {};
  items.forEach(item => {
    const label = (item.getAttribute('data-label') || '').toLowerCase();
    const text  = label + ' ' + (item.textContent || '');
    const show  = !q || text.toLowerCase().includes(q);
    item.style.display = show ? '' : 'none';
    if (show) {
      let prev = item.previousElementSibling;
      while (prev) {
        if (prev.classList.contains('kz-cmd-group-label')) {
          groupVisible[prev.getAttribute('data-group')] = true;
          break;
        }
        prev = prev.previousElementSibling;
      }
    }
  });
  groups.forEach(g => {
    g.style.display = groupVisible[g.getAttribute('data-group')] ? '' : 'none';
  });
  kzCmdFocusIdx = -1;
  kzCmdSetFocus(-1);
}

function kzCmdVisibleItems() {
  return Array.from(document.querySelectorAll('#kzCmdList .kz-cmd-item'))
    .filter(i => i.style.display !== 'none');
}

function kzCmdSetFocus(idx) {
  const items = kzCmdVisibleItems();
  items.forEach(i => i.classList.remove('focused'));
  if (idx >= 0 && idx < items.length) {
    items[idx].classList.add('focused');
    items[idx].scrollIntoView({ block: 'nearest' });
  }
}

function kzCmdKey(e) {
  const items = kzCmdVisibleItems();
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    kzCmdFocusIdx = Math.min(kzCmdFocusIdx + 1, items.length - 1);
    kzCmdSetFocus(kzCmdFocusIdx);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    kzCmdFocusIdx = Math.max(kzCmdFocusIdx - 1, 0);
    kzCmdSetFocus(kzCmdFocusIdx);
  } else if (e.key === 'Enter') {
    if (kzCmdFocusIdx >= 0 && items[kzCmdFocusIdx]) items[kzCmdFocusIdx].click();
  } else if (e.key === 'Escape') {
    kzCmdClose();
  }
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const overlay = document.getElementById('kzCmdOverlay');
    overlay?.classList.contains('open') ? kzCmdClose() : kzCmdOpen();
  }
  if (e.key === 'Escape' && document.getElementById('kzCmdOverlay')?.classList.contains('open')) {
    kzCmdClose();
  }
});

// ══════════════════════════════════════════════════════
//  Alpine app() — état global + init + navigation
// ══════════════════════════════════════════════════════

function app() {
  return {

    // ── État global ──
    page:       sessionStorage.getItem('kv_token') ? 'app' : 'home',
    activeTab:  'marketplace',
    token:      sessionStorage.getItem('kv_token') || null,
    user:       JSON.parse(sessionStorage.getItem('kv_user') || '{}'),
    loading:    false,
    loadingCV:  false,
    loadingProjets: false,
    rememberMe: false,
    _historySetup: false,
    _inactivityTimer: null,

    // ── Toast ──
    toast: { show: false, msg: '', type: 'success' },

    // ── Formulaires auth ──
    completeProfil: { telephone: '', ville: '', loading: false, error: '' },
    form:      { nom:'', prenom:'', postnom:'', email:'', telephone:'', ville:'', password:'' },
    loginForm: { telephone:'', password:'' },
    phoneError: '',
    emailAlreadyUsed: false,
    regStep: 1,
    showRegPwd: false,
    pwdLen: false, pwdUpper: false, pwdNum: false,
    forgotEmail: '', forgotSent: false, forgotLoading: false,
    otpDigits: ['','','','','',''], otpLoading: false, otpError: '',
    resetToken: new URLSearchParams(window.location.search).get('reset_token') || '',
    resetPwd: '', resetPwd2: '', resetDone: false, resetLoading: false,

    // ── Marketplace ──
    projets: [], filtreStatut: '', selectedProjet: null, jalonsProjet: [],
    modalPostuler: false, postuleProjet: null,
    postuleForm: { message: '', budget: '', delai: '' },
    postuleLoading: false, mesCandidatures: [],

    // ── Dashboard ──
    profileScore: 0,
    escrow: { bloque: 0, disponible: 0, total: 0, devise: 'USD' },
    mesProjets: [], dashStats: {}, dashMessages: [], dashRecommended: [],
    dashGraphique: { '7j': [], '30j': [] }, dashPeriode: '7j',
    dashChart: null, dashUser: {}, dashNotifs: 0, dashCompetences: [],
    dashActivite: [],
    presence: { freelances_online: 0, projets_disponibles: 0, nouveaux_projets_24h: 0, nouveaux_membres_7j: 0 },

    // ── Messages ──
    conversations: [], activeConv: null, convMessages: [],
    newMessage: '', msgSearch: '',
    convLoading: false, msgLoading: false, msgSending: false,
    atBottom: true, peerTyping: false, convProjet: null,
    unreadMessages: 0, soundEnabled: true, notifPermission: 'default',
    _pollTimer: null, _typingTimer: null, _typingPollTimer: null, _globalPollTimer: null,

    // ── Wallet ──
    walletLoading: true, walletTx: [],
    wDispo: 0, wBloque: 0, wTotal: 0, wMois: 0, walletDevise: 'USD',
    retraitMontant: '', retraitMobile: 'airtel', retraitNumero: '',
    retraitLoading: false, retraitDone: false,

    // ── Profil ──
    profilLoading: false, profilEdit: false, profilSaving: false,
    profilForm: {}, profilCompetences: [], photoUploading: false,

    // ══════════════════════════════════════════════════
    //  INIT
    // ══════════════════════════════════════════════════
    init() {
      // Bouton retour navigateur
      window.addEventListener('popstate', (e) => {
        const tab = e.state?.tab || window.location.hash.replace('#', '') || 'marketplace';
        if (['dashboard','marketplace','messages','wallet','profil','nouveau'].includes(tab)) {
          this.activeTab = tab;
          if      (tab === 'dashboard')   this.loadDashboard();
          else if (tab === 'marketplace') this.loadProjets();
          else if (tab === 'messages')    this.loadMessages();
        }
      });

      if (this.resetToken) {
        this.page = 'reset';
        return;
      }

      if (this.token) {
        const initHash = window.location.hash.replace('#', '');
        const valid = ['dashboard','marketplace','messages','wallet','profil','nouveau'];
        if (valid.includes(initHash)) this.activeTab = initHash;

        this.loadPresence();
        setInterval(() => this.loadPresence(), 60000);
        this.loadMesCandidatures();
        this.loadProjets();
        this.loadDashboard();
        this._startInactivityTimer();
      }
    },

    // ══════════════════════════════════════════════════
    //  NAVIGATION
    // ══════════════════════════════════════════════════
    navigateTo(tab, load = true) {
      const valid = ['dashboard','marketplace','messages','wallet','profil','nouveau'];
      if (!valid.includes(tab)) return;
      this.activeTab = tab;
      const hash = '#' + tab;
      if (window.location.hash !== hash) window.history.pushState({ tab }, '', hash);
      if (!load) return;
      if      (tab === 'dashboard')   this.loadDashboard();
      else if (tab === 'marketplace') this.loadProjets();
      else if (tab === 'messages')    this.loadMessages();
      else if (tab === 'wallet')      this.loadWallet();
      else if (tab === 'profil')      this.loadProfil();
    },

    // ══════════════════════════════════════════════════
    //  HELPERS UI
    // ══════════════════════════════════════════════════
    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => this.toast.show = false, 3500);
    },

    validatePhone() {
      this.phoneError = Utils.validatePhone(this.form.telephone);
    },

    checkPwd() {
      const v = this.form.password || '';
      this.pwdLen   = v.length >= 6;
      this.pwdUpper = /[A-Z]/.test(v);
      this.pwdNum   = /[0-9]/.test(v);
    },

    formatDate(d)             { return Utils.formatDate(d); },
    formatBudget(b, devise)   { return Utils.formatBudget(b, devise); },
    formatMontant(m)          { return Utils.formatMontant(m); },
    timeAgo(d)                { return Utils.timeAgo(d); },
    statutLabel(s)            { return Utils.statutLabel(s); },
    tagEmoji(tag)             { return Utils.tagEmoji(tag); },

    // ── Inactivité 30 min ──
    _startInactivityTimer() {
      if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
      this._inactivityTimer = setTimeout(() => {
        this.showToast('Session expirée par inactivité.');
        this.logout();
      }, 30 * 60 * 1000);
      ['mousemove','keydown','touchstart','click'].forEach(evt => {
        document.addEventListener(evt, () => {
          if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
          this._inactivityTimer = setTimeout(() => {
            this.showToast('Session expirée par inactivité.');
            this.logout();
          }, 30 * 60 * 1000);
        }, { passive: true, once: false });
      });
    },

    // ── Spread modules ──
    ...Auth,
    ...Marketplace,
    ...Dashboard,
    ...Messages,
    ...Wallet,
    ...Profile,
    ...Notifications,

  };
}
