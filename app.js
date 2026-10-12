/**
 * Anurag Rajak Portfolio - Interactive Engine
 * Handles page switching, continuous scroll mode, project filtering,
 * modal dialogs, copy actions, and form handling.
 */

// Project Data Store with full architectural details from resume & mockups
const PROJECTS_DATA = {
  smartwaste: {
    title: "SmartWasteX",
    category: "AI & Full-Stack Web",
    img: "assets/smartwaste.jpg",
    desc: "AI-Powered smart waste management and recycling ecosystem engineered to streamline municipal reporting and operations. Features real-time complaint tracking, automated worker dispatch, and GPS-enabled route optimization.",
    features: [
      "Real-time citizen waste complaint tracking with GPS location tagging.",
      "Automated worker assignment algorithm based on proximity and workload.",
      "Role-based administrative dashboards for municipal supervisors and field workers.",
      "Firebase real-time sync with MongoDB backend for high-throughput reporting."
    ],
    tech: ["React.js", "Node.js", "MongoDB", "Firebase", "Express.js", "Google Maps API", "REST APIs"]
  },
  samadhan: {
    title: "SamadhanAI",
    category: "AI & Natural Language Processing",
    img: "assets/samadhan.jpg",
    desc: "AI-based citizen grievance classification and smart routing platform. Uses Large Language Model APIs and NLP algorithms to analyze citizen complaints in real time, extract sentiment and urgency, and direct tickets to appropriate municipal departments.",
    features: [
      "Automated semantic categorization and NLP entity extraction for grievances.",
      "Smart priority scoring (High, Medium, Low) based on grievance urgency and citizen impact.",
      "Intelligent department routing engine reducing response times by over 40%.",
      "RESTful microservices architecture built with Python and modern web APIs."
    ],
    tech: ["Python", "LLM APIs", "NLP", "FastAPI / Flask", "REST Services", "Tailwind CSS"]
  },
  settlemate: {
    title: "SettleMate",
    category: "Web & FinTech Utility",
    img: "assets/settlemate.jpg",
    desc: "Smart roommate expense sharing platform engineered to eliminate financial friction in shared apartments. Tracks joint expenses, automatically calculates optimal minimal transactions to settle debts, and provides visual reconciliation charts.",
    features: [
      "Automated split algorithm that balances recurring and one-off group expenses.",
      "Individual contribution ledger with real-time balance calculations ('Who Owes Whom').",
      "Visual financial breakdown charts by category (Rent, Groceries, Utilities).",
      "One-click settlement tracking with instant transaction history logs."
    ],
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Chart.js", "REST APIs"]
  },
  college_erp: {
    title: "College ERP Management System",
    category: "Full-Stack Enterprise ERP",
    img: "assets/college_erp.jpg",
    desc: "Comprehensive full-stack College ERP platform designed for higher education institutions. Streamlines student admissions, fee tracking, faculty schedules, and automated email workflows with Google Drive cloud backups.",
    features: [
      "Secure role-based authentication using JWT and Google OAuth for Students, Faculty, and Admin.",
      "Integrated student admission processing, attendance monitoring, and fee status tracking.",
      "Automated email notifications and receipt dispatch via Gmail SMTP.",
      "Automated document archiving and cloud backups using Google Drive API."
    ],
    tech: ["Next.js", "React.js", "Node.js", "MongoDB Atlas", "JWT", "Google OAuth", "Google Drive API", "Vercel"]
  }
};

const PAGES_ORDER = ['home', 'about', 'projects', 'experience', 'skills', 'contact'];

// State Management
let currentPage = 'home';
let viewMode = 'page'; // 'page' or 'continuous'

// DOM Elements
const bodyEl = document.body;
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');
const viewModeBtn = document.getElementById('viewModeToggle');
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const dockCurPage = document.getElementById('dockCurrentPage');
const dockPageName = document.getElementById('dockPageName');
const btnPrevPage = document.getElementById('btnPrevPage');
const btnNextPage = document.getElementById('btnNextPage');
const toastEl = document.getElementById('toastNotice');

// Initialize Portfolio
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupRouting();
  setupViewModeToggle();
  setupProjectFilters();
  setupModals();
  setupContactForm();
  setupClipboardActions();
  setupScrollSpy();
});

// Setup Page Navigation & Hashes
function setupNavigation() {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.getAttribute('data-page');
      navigateTo(targetPage);
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  });

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // Prev / Next Page Dock Buttons
  if (btnPrevPage) {
    btnPrevPage.addEventListener('click', () => {
      const curIndex = PAGES_ORDER.indexOf(currentPage);
      const prevIndex = (curIndex - 1 + PAGES_ORDER.length) % PAGES_ORDER.length;
      navigateTo(PAGES_ORDER[prevIndex]);
    });
  }

  if (btnNextPage) {
    btnNextPage.addEventListener('click', () => {
      const curIndex = PAGES_ORDER.indexOf(currentPage);
      const nextIndex = (curIndex + 1) % PAGES_ORDER.length;
      navigateTo(PAGES_ORDER[nextIndex]);
    });
  }

  // Keyboard navigation (Left / Right Arrow) in page mode
  document.addEventListener('keydown', (e) => {
    // ignore if typing in inputs
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (viewMode !== 'page') return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      const curIndex = PAGES_ORDER.indexOf(currentPage);
      const nextIndex = (curIndex + 1) % PAGES_ORDER.length;
      navigateTo(PAGES_ORDER[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      const curIndex = PAGES_ORDER.indexOf(currentPage);
      const prevIndex = (curIndex - 1 + PAGES_ORDER.length) % PAGES_ORDER.length;
      navigateTo(PAGES_ORDER[prevIndex]);
    }
  });
}

// URL Hash routing
function setupRouting() {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (PAGES_ORDER.includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }

  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '').toLowerCase();
    if (PAGES_ORDER.includes(newHash) && newHash !== currentPage) {
      navigateTo(newHash, false);
    }
  });
}

// Navigate to a specific page
function navigateTo(pageId, updateHash = true) {
  if (!PAGES_ORDER.includes(pageId)) return;
  currentPage = pageId;

  // Dismiss any open modal dialogs when navigating
  closeAllModals();

  // Update hash
  if (updateHash) {
    history.pushState(null, null, `#${pageId}`);
  }

  // Update nav links active class
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (viewMode === 'page') {
    // Show only targeted section
    pageSections.forEach(section => {
      if (section.id === pageId) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update Dock
    const pageIndex = PAGES_ORDER.indexOf(pageId) + 1;
    if (dockCurPage) dockCurPage.textContent = pageIndex;
    if (dockPageName) dockPageName.textContent = capitalize(pageId);
  } else {
    // In continuous mode, smooth scroll to the section
    const targetSection = document.getElementById(pageId);
    if (targetSection) {
      const navHeight = document.getElementById('mainNavbar').offsetHeight || 70;
      const targetPos = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  });
}

// Toggle between Slide/Page Mode and Continuous Scroll Mode
function setupViewModeToggle() {
  if (!viewModeBtn) return;

  viewModeBtn.addEventListener('click', () => {
    if (viewMode === 'page') {
      viewMode = 'continuous';
      bodyEl.classList.remove('mode-page');
      bodyEl.classList.add('mode-continuous');
      viewModeBtn.querySelector('.view-mode-label').textContent = 'Continuous View';
      showToast('Switched to Continuous Scroll Mode');
      // Scroll to current page
      navigateTo(currentPage, false);
    } else {
      viewMode = 'page';
      bodyEl.classList.remove('mode-continuous');
      bodyEl.classList.add('mode-page');
      viewModeBtn.querySelector('.view-mode-label').textContent = 'Page View';
      showToast('Switched to Page-by-Page View');
      navigateTo(currentPage, false);
    }
  });
}

// Scroll Spy for Continuous Mode
function setupScrollSpy() {
  window.addEventListener('scroll', () => {
    if (viewMode !== 'continuous') return;

    const scrollPos = window.scrollY + 150;
    pageSections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        if (currentPage !== id) {
          currentPage = id;
          navLinks.forEach(link => {
            if (link.getAttribute('data-page') === id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      }
    });
  });
}

// Project Category Filtering
function setupProjectFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-card');
  const btnAll = document.getElementById('btnFilterAllProjects');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterVal = pill.getAttribute('data-filter');
      projectCards.forEach(card => {
        const cats = card.getAttribute('data-category').split(' ');
        if (filterVal === 'all' || cats.includes(filterVal)) {
          card.style.display = 'flex';
          card.style.animation = 'pageFadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  if (btnAll) {
    btnAll.addEventListener('click', () => {
      const allPill = document.querySelector('.filter-pill[data-filter="all"]');
      if (allPill) allPill.click();
    });
  }
}

// Modals Handling (Academic Details & Project Inspector)
function setupModals() {
  // Academic Modal
  const btnAcademic = document.getElementById('btnViewAcademicDetails');
  const academicModal = document.getElementById('academicModal');
  const btnCloseAcademic = document.getElementById('btnCloseAcademicModal');

  if (btnAcademic && academicModal) {
    btnAcademic.addEventListener('click', () => {
      academicModal.classList.add('open');
      academicModal.setAttribute('aria-hidden', 'false');
    });
  }

  if (btnCloseAcademic && academicModal) {
    btnCloseAcademic.addEventListener('click', () => {
      academicModal.classList.remove('open');
      academicModal.setAttribute('aria-hidden', 'true');
    });
  }

  // Project Detail Modal
  const projectModal = document.getElementById('projectModal');
  const btnCloseProject = document.getElementById('btnCloseProjectModal');
  const inspectButtons = document.querySelectorAll('[data-action="view-details"]');

  inspectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projKey = btn.getAttribute('data-project');
      openProjectModal(projKey);
    });
  });

  if (btnCloseProject && projectModal) {
    btnCloseProject.addEventListener('click', () => {
      projectModal.classList.remove('open');
      projectModal.setAttribute('aria-hidden', 'true');
    });
  }

  // Close modals on clicking backdrop
  [academicModal, projectModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (academicModal) academicModal.classList.remove('open');
      if (projectModal) projectModal.classList.remove('open');
    }
  });
}

function openProjectModal(projKey) {
  const data = PROJECTS_DATA[projKey];
  if (!data) return;

  const modal = document.getElementById('projectModal');
  document.getElementById('modalProjectTitle').textContent = data.title;
  document.getElementById('modalProjectTag').textContent = data.category;
  document.getElementById('modalProjectImg').src = data.img;
  document.getElementById('modalProjectDesc').textContent = data.desc;

  // Features list
  const featUl = document.getElementById('modalProjectFeatures');
  featUl.innerHTML = '';
  data.features.forEach(feat => {
    const li = document.createElement('li');
    li.textContent = feat;
    featUl.appendChild(li);
  });

  // Tech tags
  const techDiv = document.getElementById('modalProjectTech');
  techDiv.innerHTML = '';
  data.tech.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tech-item';
    span.textContent = t;
    techDiv.appendChild(span);
  });

  const contactBtn = document.getElementById('modalContactBtn');
  if (contactBtn) {
    contactBtn.onclick = () => {
      modal.classList.remove('open');
      navigateTo('contact');
    };
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

// Contact Form Submission & Validation
function setupContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccessMsg');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const msgInput = document.getElementById('userMessage');

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.closest('.form-group').classList.add('has-error');
      isValid = false;
    } else {
      nameInput.closest('.form-group').classList.remove('has-error');
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.closest('.form-group').classList.add('has-error');
      isValid = false;
    } else {
      emailInput.closest('.form-group').classList.remove('has-error');
    }

    // Validate Message
    if (!msgInput.value.trim()) {
      msgInput.closest('.form-group').classList.add('has-error');
      isValid = false;
    } else {
      msgInput.closest('.form-group').classList.remove('has-error');
    }

    if (isValid) {
      const submitBtn = document.getElementById('btnSubmitMessage');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending...</span>';
      submitBtn.disabled = true;

      // Simulate sending with realistic feedback
      setTimeout(() => {
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        successMsg.style.display = 'flex';
        showToast('Message sent successfully!');

        setTimeout(() => {
          successMsg.style.display = 'none';
        }, 6000);
      }, 700);
    }
  });

  // Remove error on input change
  ['userName', 'userEmail', 'userMessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.closest('.form-group').classList.remove('has-error');
      });
    }
  });
}

// Copy to Clipboard Helpers
function setupClipboardActions() {
  const copyButtons = document.querySelectorAll('.btn-copy-tile');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied: ${textToCopy}`);
        }).catch(() => {
          fallbackCopyText(textToCopy);
        });
      } else {
        fallbackCopyText(textToCopy);
      }
    });
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`Copied: ${text}`);
  } catch (err) {
    showToast("Failed to copy");
  }
  document.body.removeChild(textArea);
}

// Toast Notifications
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3200);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
