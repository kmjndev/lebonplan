
// --- FONCTIONS GLOBALES (Panier) ---

window.showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOutToast 0.5s ease-out forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

window.addToCart = (id) => {
    const ads = JSON.parse(localStorage.getItem('lbp_ads'));
    const cart = JSON.parse(localStorage.getItem('lbp_cart')) || [];
    const ad = ads.find(a => a.id === id);

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        showToast("Cet article est déjà dans votre panier.", "error");
        return;
    }
    
    // Since it's a single item, check if it's sold
    if (ad.status === 'sold') {
        showToast("Cet article a déjà été vendu.", "error");
        return;
    }

    const finalPrice = ad.promoPercentage ? ad.price * (1 - ad.promoPercentage / 100) : ad.price;
    cart.push({ id: ad.id, title: ad.title, price: finalPrice, qty: 1 });

    localStorage.setItem('lbp_cart', JSON.stringify(cart));
    updateCartCount();
    
    // Animation visuelle simple
    const btn = document.querySelector(`button[onclick="addToCart(${id})"]`);
    const originalText = btn.innerText;
    btn.innerText = "Ajouté !";
    btn.style.background = "var(--success)";
    setTimeout(() => { btn.innerText = originalText; btn.style.background = ""; }, 1000);
};

window.updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('lbp_cart')) || [];
    const count = cart.length;
    const badge = document.getElementById('cart-count');
    if(badge) badge.innerText = count;
};

window.renderCartPage = () => {
    const cart = JSON.parse(localStorage.getItem('lbp_cart')) || [];
    const wrapper = document.getElementById('cart-page-wrapper');
    if (!wrapper) return;
    
    if (cart.length === 0) {
        wrapper.innerHTML = "<p>Votre panier est vide.</p>";
        return;
    }

    let subtotal = 0;
    let totalDiscount = 0;

    const itemsHtml = cart.map((item, index) => {
        let itemTotal = item.price * item.qty;
        let itemDiscount = 0;
        let discountMsg = '';
        subtotal += itemTotal;
        totalDiscount += itemDiscount;

        return `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>${item.price.toFixed(2)}€</p>
                ${discountMsg}
            </div>
            <div style="display:flex; align-items:center;">
                <strong style="margin-right: 1rem;">${itemTotal.toFixed(2)}€</strong>
                <i class="fas fa-trash cart-remove" onclick="removeFromCart(${index})"></i>
            </div>
        </div>`;
    }).join('');

    const total = subtotal - totalDiscount;

    wrapper.innerHTML = `
        <div class="cart-page-grid">
            <div class="cart-items-list">${itemsHtml}</div>
            <div class="cart-summary">
                <h3>Résumé de la commande</h3>
                <div class="summary-line"><span>Sous-total</span> <span>${subtotal.toFixed(2)}€</span></div>
                <div class="summary-line"><span>Remises</span> <span style="color:var(--danger);">- ${totalDiscount.toFixed(2)}€</span></div>
                <div class="summary-line total"><span>Total</span> <span>${total.toFixed(2)}€</span></div>
                <button onclick="checkout()" class="btn-primary full-width">Valider la commande</button>
            </div>
        </div>`;
};

window.removeFromCart = (index) => {
    const cart = JSON.parse(localStorage.getItem('lbp_cart'));
    cart.splice(index, 1);
    localStorage.setItem('lbp_cart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
};

window.checkout = () => {
    const cart = JSON.parse(localStorage.getItem('lbp_cart'));
    const ads = JSON.parse(localStorage.getItem('lbp_ads'));

    // Mise à jour des stocks
    cart.forEach(item => {
        const adIndex = ads.findIndex(a => a.id === item.id);
        if (adIndex !== -1) {
            ads[adIndex].status = 'sold';
        }
    });

    localStorage.setItem('lbp_ads', JSON.stringify(ads));
    localStorage.setItem('lbp_cart', JSON.stringify([])); // Vider panier
    
    showToast("Commande validée avec succès !", "success");
    setTimeout(() => location.reload(), 2000);
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les données si vides
    if (!localStorage.getItem('lbp_ads')) {
        const initialData = [
            { id: 1, title: 'MacBook Pro M1', price: 850.00, category: 'Électronique', brand: 'Apple', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?ixlib=rb-1.2.1&auto=format=fit=crop&w=500&q=60', description: 'Modèle reconditionné à neuf.', condition: 'Reconditionné', status: 'approved', seller: 'system@lebonplan.fr', promoPercentage: 10 },
            { id: 2, title: 'Sneakers Nike Air', price: 45.00, category: 'Vêtements', brand: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format=fit=crop&w=500&q=60', description: 'Jamais portées. Taille 42.', condition: 'Neuf', status: 'approved', seller: 'system@lebonplan.fr', promoPercentage: 0 }
        ];
        localStorage.setItem('lbp_ads', JSON.stringify(initialData));
    }
    
    // Initialiser le panier
    if (!localStorage.getItem('lbp_cart')) localStorage.setItem('lbp_cart', JSON.stringify([]));
    // Initialiser les annonces système
    if (!localStorage.getItem('lbp_system_announcements')) {
        localStorage.setItem('lbp_system_announcements', JSON.stringify([]));
    }
    // Initialiser les utilisateurs
    if (!localStorage.getItem('lbp_users')) {
        const initialUsers = [
            { email: 'system@lebonplan.fr', password: 'system_password', firstName: 'LeBonPlan', lastName: 'Official', birthDate: '2023-01-01', city: 'Paris', postalCode: '75001', pdpUrl: null }
        ];
        localStorage.setItem('lbp_users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('lbp_currentUser')) localStorage.setItem('lbp_currentUser', JSON.stringify(null));

    let ads = JSON.parse(localStorage.getItem('lbp_ads')); // Changed to let for updates
    let cart = JSON.parse(localStorage.getItem('lbp_cart'));
    let users = JSON.parse(localStorage.getItem('lbp_users'));
    let currentUser = JSON.parse(localStorage.getItem('lbp_currentUser'));
    const path = window.location.pathname;

    const accountModal = document.getElementById('accountModal');

    // --- LOGIQUE GLOBALE ---

    const displaySystemAnnouncement = () => {
        const promoBar = document.querySelector('.promo-bar');
        if (!promoBar) return;
        const promoContent = promoBar.querySelector('.promo-content');
        if (!promoContent) return;

        const announcements = JSON.parse(localStorage.getItem('lbp_system_announcements')) || [];
        const activeAnnouncement = announcements.find(ann => ann.active);

        if (activeAnnouncement) {
            promoContent.innerHTML = `<div style="width:100%; text-align:center; font-weight:bold;"><i class="fa-solid fa-bullhorn"></i> &nbsp; ${activeAnnouncement.content}</div>`;
            promoBar.style.background = 'var(--danger)'; // Make it stand out
        } else {
            promoContent.innerHTML = `<span>🔥 <b>LeBonPlan :</b> Acheter moins cher !</span>`;
            promoBar.style.background = 'var(--accent)';
        }
    };
    displaySystemAnnouncement(); // Call it on every page load
    
    const updateUserUI = () => {
        const userAccountLinks = document.getElementById('user-account-links');
        if (!userAccountLinks) return;
        if (currentUser) {
            // User is logged in
            const user = users.find(u => u.email === currentUser);
            const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '??';
            const pdpAvatar = user && user.pdpUrl ? `<img src="${user.pdpUrl}" alt="Photo de profil">` : initials;

            userAccountLinks.innerHTML = `
                <div class="user-profile-menu">
                    <div class="pdp-avatar" id="pdp-avatar-trigger">
                        ${pdpAvatar}
                    </div>
                    <div class="dropdown-menu" id="user-dropdown">
                        <a href="profile.html"><i class="fa-solid fa-user-circle"></i> Mon Profil</a>
                        <a href="#" id="logout-btn-dropdown"><i class="fa-solid fa-right-from-bracket"></i> Déconnexion</a>
                    </div>
                </div>
            `;

            const avatarTrigger = document.getElementById('pdp-avatar-trigger');
            const dropdown = document.getElementById('user-dropdown');
            if(avatarTrigger && dropdown) {
                avatarTrigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                });
            }
            document.getElementById('logout-btn-dropdown').addEventListener('click', handleLogout);
        } else {
            // User is logged out
            userAccountLinks.innerHTML = `
                <button id="login-register-btn" class="btn-secondary"><i class="fa-solid fa-user"></i> Connexion / Inscription</button>
            `;
            const loginBtn = document.getElementById('login-register-btn');
            if(loginBtn) loginBtn.addEventListener('click', () => {
                if(accountModal) accountModal.style.display = 'block';
            });
        }
    };

    const handleRegistration = (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const birthDate = document.getElementById('registerBirthDate').value;
        const city = document.getElementById('registerCity').value;
        const postalCode = document.getElementById('registerPostalCode').value;

        if (users.find(user => user.email === email)) {
            showToast("Cette adresse mail est déjà utilisée.", "error");
            return;
        }

        users.push({ email, password, firstName, lastName, birthDate, city, postalCode, pdpUrl: null });
        localStorage.setItem('lbp_users', JSON.stringify(users));

        // Log in the new user
        currentUser = email;
        localStorage.setItem('lbp_currentUser', JSON.stringify(currentUser));

        showToast("Inscription réussie ! Vous êtes connecté.", "success");
        if(accountModal) accountModal.style.display = 'none';
        updateUserUI();
        if (path.includes('publish.html')) {
            location.reload();
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user.email;
            localStorage.setItem('lbp_currentUser', JSON.stringify(currentUser));
            showToast("Connexion réussie !", "success");
            if(accountModal) accountModal.style.display = 'none';
            updateUserUI();
            if (path.includes('publish.html')) {
                location.reload();
            }
        } else {
            showToast("Email ou mot de passe incorrect.", "error");
        }
    };

    const handleLogout = () => {
        currentUser = null;
        localStorage.setItem('lbp_currentUser', JSON.stringify(null));
        showToast("Vous avez été déconnecté.", "success");
        updateUserUI();
        // Optionnel: rediriger vers la page d'accueil
        if (!path.includes('index.html') && path !== '/' && !path.endsWith('/')) {
            window.location.href = 'index.html';
        }
    };

    updateUserUI(); // Initial UI update

    // Helper pour les icônes de catégorie
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Électronique': return 'fa-laptop';
            case 'Vêtements': return 'fa-shirt';
            case 'Maison': return 'fa-couch';
            default: return 'fa-box';
        }
    };

    // Helper pour afficher le prix (avec promo)
    const getPriceHtml = (ad, baseClass = 'card-price') => {
        const finalPrice = ad.promoPercentage ? ad.price * (1 - ad.promoPercentage / 100) : ad.price;
        if (ad.promoPercentage && ad.promoPercentage > 0) {
            return `
                <div class="price-container">
                    <span class="${baseClass}">${finalPrice.toFixed(2)} €</span>
                    <span class="original-price">${ad.price.toFixed(2)} €</span>
                </div>`;
        }
        return `<span class="${baseClass}">${finalPrice.toFixed(2)} €</span>`;
    };

    // --- Confirmation Modal Logic ---
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        const confirmTitle = document.getElementById('confirmModalTitle');
        const confirmText = document.getElementById('confirmModalText');
        const confirmBtn = document.getElementById('confirmModalConfirmBtn');
        const cancelBtn = document.getElementById('confirmModalCancelBtn');
        const closeConfirm = confirmModal.querySelector('.close-confirm');

        const hideConfirmModal = () => confirmModal.style.display = 'none';

        cancelBtn.onclick = hideConfirmModal;
        closeConfirm.onclick = hideConfirmModal;

        window.showConfirmModal = (title, text, onConfirm) => {
            confirmTitle.innerText = title;
            confirmText.innerText = text;
            
            confirmModal.style.display = 'block';

            confirmBtn.onclick = () => {
                onConfirm();
                hideConfirmModal();
            };
        };
    } else {
        window.showConfirmModal = (title, text, onConfirm) => {
            if (confirm(`${title}\n\n${text}`)) onConfirm();
        }
    }

    // --- GESTION DES MODALES (GLOBAL) ---

    // --- GLOBAL MODAL & FORM LOGIC (accessible everywhere) ---
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const closeEdit = document.getElementsByClassName('close-edit')[0];

    if(editModal && closeEdit) closeEdit.onclick = () => editModal.style.display = "none";

    window.modifyAd = (id, isUserEdit = false) => {
        const ad = ads.find(a => a.id === id);
        if(!ad || !editModal) return; 
        document.getElementById('editId').value = ad.id;
        document.getElementById('isUserEdit').value = isUserEdit;
        document.getElementById('editModalTitle').innerText = isUserEdit ? 'Modifier mon annonce' : 'Gestion complète de l\'annonce';
        document.getElementById('editTitle').value = ad.title;
        document.getElementById('editBrand').value = ad.brand || '';
        document.getElementById('editPrice').value = ad.price;
        document.getElementById('editCondition').value = ad.condition || 'Neuf';
        document.getElementById('editDesc').value = ad.description;
        editModal.style.display = "block";
    };

    if(editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('editId').value);
            const isUserEdit = document.getElementById('isUserEdit').value === 'true';
            const ad = ads.find(a => a.id === id);

            ad.title = document.getElementById('editTitle').value;
            ad.brand = document.getElementById('editBrand').value;
            ad.price = parseFloat(document.getElementById('editPrice').value);
            ad.condition = document.getElementById('editCondition').value;
            ad.description = document.getElementById('editDesc').value;

            if (isUserEdit) {
                ad.status = 'pending-modification';
                showToast("Annonce modifiée et soumise pour validation.", "success");
            } else {
                showToast("Annonce modifiée avec succès", "success");
            }
            
            localStorage.setItem('lbp_ads', JSON.stringify(ads));
            if(editModal) editModal.style.display = "none";
            
            if (isUserEdit) { if(typeof window.renderProfilePage === 'function') window.renderProfilePage(); } 
            else { if(typeof window.renderAdminAdsPage === 'function') window.renderAdminAdsPage(); }
        });
    }

    if (accountModal) {
        const closeAccountBtn = document.querySelector('.close-account');
        const showRegisterLink = document.getElementById('show-register-form');
        const showLoginLink = document.getElementById('show-login-form');
        const loginFormContainer = document.getElementById('login-form-container');
        const registerFormContainer = document.getElementById('register-form-container');
        const loginUserForm = document.getElementById('loginUserForm');
        const registerUserForm = document.getElementById('registerUserForm');

        if(closeAccountBtn) closeAccountBtn.onclick = () => accountModal.style.display = 'none';
        if(showRegisterLink) showRegisterLink.onclick = (e) => {
            e.preventDefault();
            if(loginFormContainer) loginFormContainer.style.display = 'none';
            if(registerFormContainer) registerFormContainer.style.display = 'block';
        };
        if(showLoginLink) showLoginLink.onclick = (e) => {
            e.preventDefault();
            if(registerFormContainer) registerFormContainer.style.display = 'none';
            if(loginFormContainer) loginFormContainer.style.display = 'block';
        };
        if(loginUserForm) loginUserForm.addEventListener('submit', handleLogin);
        if(registerUserForm) registerUserForm.addEventListener('submit', handleRegistration);
    }
    window.addEventListener('click', (event) => { // Consolidated click handler
        if (accountModal && event.target == accountModal) accountModal.style.display = "none";
        
        const filterModal = document.getElementById('filterModal');
        if (filterModal && event.target == filterModal) filterModal.style.display = "none";
        
        const adminLoginModal = document.getElementById('adminLoginModal');
        if (adminLoginModal && event.target == adminLoginModal) adminLoginModal.style.display = "none";
        
        if (editModal && event.target == editModal) editModal.style.display = "none"; 
        
        const detailModal = document.getElementById('detailModal');
        if (detailModal && event.target == detailModal) detailModal.style.display = "none";

        const promoModal = document.getElementById('promoModal');
        if (promoModal && event.target == promoModal) promoModal.style.display = "none";

        const profileEditModal = document.getElementById('profileEditModal');
        if (profileEditModal && event.target == profileEditModal) profileEditModal.style.display = "none";

        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal && event.target == confirmModal) confirmModal.style.display = "none";

        const dropdown = document.getElementById('user-dropdown');
        const avatarTrigger = document.getElementById('pdp-avatar-trigger');
        if (dropdown && dropdown.style.display === 'block' && !event.target.closest('.user-profile-menu')) dropdown.style.display = 'none';
    });

    // --- LOGIQUE PAGE D'ACCUEIL (index.html) ---
    if (path.includes('index.html') || path.includes('search.html') || path === '/' || path.endsWith('/')) {
        const container = document.getElementById('ads-container');
        updateCartCount();
        
        // Afficher les annonces approuvées
        const approvedAds = ads.filter(ad => ad.status === 'approved');
        
        // Fonction d'affichage filtrée
        const displayAds = (adsToDisplay) => {
            if(!container) return;
            if(adsToDisplay.length === 0) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Aucun produit ne correspond à votre recherche.</p>';
                return;
            }
            container.innerHTML = adsToDisplay.map((ad, index) => {
                const categoryIcon = getCategoryIcon(ad.category);
                return `
                <article class="card" style="animation-delay: ${index * 150}ms">
                    <a href="product.html?id=${ad.id}">
                        <img src="${ad.image}" alt="${ad.title}">
                        <div class="card-body">
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                                <span class="card-category"><i class="fa-solid ${categoryIcon}"></i> ${ad.category}</span>
                                ${ad.promoPercentage > 0 ? `<span class="badge-promo-percent">-${ad.promoPercentage}%</span>` : ''}
                            </div>
                            <h3 class="card-title">${ad.title}</h3>
                            <div class="price-container">${getPriceHtml(ad)}</div>
                        </div>
                    </a>
                </article>
            `;
            }).join('');
        };

        // Fonction pour peupler les filtres dynamiquement
        const populateFilters = (ads) => {
            const brandFilter = document.getElementById('brandFilter');
            if (!brandFilter) return;

            // Liste de base + marques des annonces
            const predefinedBrands = ['Apple', 'Samsung', 'Sony', 'LG', 'HP', 'Dell', 'Lenovo', 'Asus', 'Nike', 'Adidas', 'Puma', 'The North Face', 'Levi\'s', 'Zara', 'H&M', 'Uniqlo', 'Gucci', 'Louis Vuitton', 'Rolex', 'Ikea', 'Maisons du Monde', 'Tefal', 'Lego', 'Playstation', 'Xbox', 'Nintendo'];
            const brandsFromAds = ads.map(ad => ad.brand).filter(Boolean); // .filter(Boolean) removes null/undefined/empty strings
            const allBrands = [...new Set([...predefinedBrands, ...brandsFromAds])];
            allBrands.sort();
            
            // Vider les options existantes (sauf la première)
            brandFilter.innerHTML = '<option value="">Toutes les marques</option>';
            allBrands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandFilter.appendChild(option);
            });
        };

        // Affichage initial
        displayAds(approvedAds);
        populateFilters(approvedAds);

        
        // Éléments de filtre dans la modale
        const categoryFilter = document.getElementById('categoryFilter');
        const brandFilter = document.getElementById('brandFilter');
        const conditionFilter = document.getElementById('conditionFilter');
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');

        const filterAds = () => {
            const searchTerm = document.getElementById('mainSearchInput') ? document.getElementById('mainSearchInput').value.toLowerCase() : '';
            const category = categoryFilter.value;
            const brand = brandFilter.value;
            const condition = conditionFilter.value;
            const minPrice = parseFloat(minPriceInput.value);
            const maxPrice = parseFloat(maxPriceInput.value);

            const filtered = approvedAds.filter(ad => {
                const matchesSearch = ad.title.toLowerCase().includes(searchTerm) || (ad.brand && ad.brand.toLowerCase().includes(searchTerm)) || ad.description.toLowerCase().includes(searchTerm);
                const matchesCategory = category === "" || ad.category === category;
                const matchesBrand = brand === "" || ad.brand === brand;
                const matchesCondition = condition === "" || ad.condition === condition;
                const matchesMinPrice = isNaN(minPrice) || ad.price >= minPrice;
                const matchesMaxPrice = isNaN(maxPrice) || ad.price <= maxPrice;
                return matchesSearch && matchesCategory && matchesBrand && matchesCondition && matchesMinPrice && matchesMaxPrice;
            });
            displayAds(filtered);
        };

        // --- LOGIQUE DE RECHERCHE (HEADER) ---
        const mainSearchInput = document.getElementById('mainSearchInput');
        const mainSearchActionBtn = document.getElementById('mainSearchActionBtn');

        const performSearchRedirect = () => {
            const query = mainSearchInput.value;
            if(query.trim() !== "") {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        };

        if(mainSearchActionBtn) mainSearchActionBtn.onclick = performSearchRedirect;
        if(mainSearchInput) {
            mainSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearchRedirect();
                }
            });
        }

        // Gestion de la Modal Filtres
        const filterModal = document.getElementById('filterModal');
        const openFilterBtn = document.getElementById('openFilterPanelBtn');
        const closeFilter = document.getElementsByClassName('close-filter')[0];
        const filterForm = document.getElementById('filterForm');

        if(openFilterBtn) openFilterBtn.onclick = () => filterModal.style.display = "block";
        if(closeFilter) closeFilter.onclick = () => filterModal.style.display = "none";
        if(filterForm) filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            filterAds();
            filterModal.style.display = "none";
        });

        // Auto-recherche si on est sur search.html avec un paramètre
        if (path.includes('search.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            if (query) {
                if(document.getElementById('mainSearchInput')) document.getElementById('mainSearchInput').value = query;
                // filterAds sera appelé par le displayAds initial mais avec le filtre vide, donc on rappelle :
                setTimeout(filterAds, 50);
            }

            // Auto-open login modal if param is present
            if (urlParams.has('login')) {
                if(accountModal) accountModal.style.display = 'block';
            }
        }
    }

    // --- LOGIQUE PAGE PRODUIT (product.html) ---
    if (path.includes('product.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = parseInt(urlParams.get('id'));
        const ad = ads.find(a => a.id === id);
        const container = document.getElementById('product-detail-container');
        updateCartCount();

        const imageGalleryHtml = (ad) => {
            const images = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
            return `
                <div class="product-image-gallery">
                    <div class="main-image">
                        <img src="${images[0]}" alt="${ad.title}" id="mainProductImage">
                    </div>
                    <div class="thumbnail-images">
                        ${images.map(img => `<img src="${img}" alt="Miniature du produit" class="thumbnail" onclick="document.getElementById('mainProductImage').src='${img}'">`).join('')}
                    </div>
                </div>`;
        };

        if (ad) {
            const categoryIcon = getCategoryIcon(ad.category);
            const sellerInfo = users.find(u => u.email === ad.seller);
            const sellerName = sellerInfo ? `${sellerInfo.firstName} ${sellerInfo.lastName}` : 'Vendeur inconnu';

            container.innerHTML = `
                <div class="product-detail-wrapper">
                    ${imageGalleryHtml(ad)}
                    <div class="product-info">
                        <h1>${ad.title}</h1>
                        <div class="product-meta-tags">
                            ${ad.promoPercentage > 0 ? `<span class="badge-promo-percent" style="font-size:1rem; padding:5px 10px;">-${ad.promoPercentage}%</span>` : ''}
                            <span class="badge-state large" style="background:#f1f5f9; color:#334155;"><i class="fa-solid ${categoryIcon}"></i>${ad.category || 'Autre'}</span>
                            <span class="badge-state large"><i class="fa-solid fa-award"></i>${ad.condition || 'Bon état'}</span>
                            <span class="badge-state large"><i class="fa-solid fa-tag"></i>${ad.brand || 'N/A'}</span>
                            ${ad.isAuthentic === true ? '<span class="badge-auth large"><i class="fa-solid fa-certificate"></i> Authentifié</span>' : (ad.status === 'approved' && ad.status !== 'sold' ? '<span class="badge-unauth large"><i class="fa-solid fa-question-circle"></i> Non authentifié</span>' : '')}
                        </div>

                        <!-- Vendeur -->
                        <div style="margin-bottom: 1rem; font-size: 0.9rem; color: #4B5563;">
                            Vendu par : <strong style="color: var(--primary);">${sellerName}</strong>
                        </div>

                        ${getPriceHtml(ad, 'product-price')}
                        
                        <div class="product-description">
                            <h3>Description</h3>
                            <p>${ad.description}</p>
                        </div>

                        <div class="buy-box">
                            <button onclick="addToCart(${ad.id})" class="btn-primary full-width ${ad.status === 'sold' ? 'disabled' : ''}" ${ad.status === 'sold' ? 'disabled' : ''}>
                                ${ad.status === 'sold' ? 'Vendu' : 'Ajouter au panier'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = "<p>Produit introuvable.</p>";
        }
    }

    if (path.includes('publish')) {
        // --- LOGIQUE PAGE PUBLIER (publish.html) ---
        let uploadedPhotos = [];
        let isAuthSelected = false;

        const renderPhotoPreviews = () => {
            const previewContainer = document.getElementById('photo-preview-container');
            if (!previewContainer) return;

            previewContainer.innerHTML = uploadedPhotos.map((photo, index) => `
                <div class="photo-preview-item">
                    <img src="${photo}">
                    <div class="remove-photo" onclick="removePhoto(${index})"><i class="fa-solid fa-times"></i></div>
                </div>
            `).join('');
            
            const photoError = document.getElementById('photo-error');
            if (photoError) {
                if (uploadedPhotos.length >= 2 && uploadedPhotos.length <= 5) {
                    photoError.style.display = 'none';
                }
            }
        };

        window.nextStep = (step) => {
            // Validation simple
            if (step === 1) {
                const title = document.getElementById('title');
                const cat = document.getElementById('category');
                if (!title || !cat || !title.value || !cat.value) { showToast("Veuillez remplir les champs obligatoires", "error"); return; }
            }
            if (step === 2) {
                const price = document.getElementById('price');
                const desc = document.getElementById('description');
                if (!price || !desc || !price.value || !desc.value) { showToast("Veuillez remplir les champs obligatoires", "error"); return; }
            }
            if (step === 3) {
                const photoError = document.getElementById('photo-error');
                if (uploadedPhotos.length < 2) {
                    if(photoError) {
                        photoError.style.display = 'block';
                        photoError.innerText = "Il faut minimum 2 photos.";
                    }
                    return;
                }
                if (uploadedPhotos.length > 5) {
                    if(photoError) {
                        photoError.style.display = 'block';
                        photoError.innerText = "Maximum 5 photos autorisées.";
                    }
                    return;
                }
                if(photoError) photoError.style.display = 'none';
            }

            const currentStepEl = document.getElementById(`step-${step}`);
            const nextStepEl = document.getElementById(`step-${step + 1}`);
            
            if (currentStepEl && nextStepEl) {
                currentStepEl.classList.remove('active');
                nextStepEl.classList.add('active');
                window.scrollTo(0, 0);
            }
        };

        window.prevStep = (step) => {
            const currentStepEl = document.getElementById(`step-${step}`);
            const prevStepEl = document.getElementById(`step-${step - 1}`);
            
            if (currentStepEl && prevStepEl) {
                currentStepEl.classList.remove('active');
                prevStepEl.classList.add('active');
                window.scrollTo(0, 0);
            }
        };

        window.removePhoto = (index) => {
            uploadedPhotos.splice(index, 1);
            renderPhotoPreviews();
        };

        window.selectAuthOption = (verify) => {
            isAuthSelected = verify;
            const noVerifyCard = document.getElementById('choice-no-verify');
            const verifyCard = document.getElementById('choice-verify');
            const authForm = document.getElementById('auth-form-container');
            const dynamicFields = document.getElementById('dynamic-auth-fields');
            const category = document.getElementById('category').value;

            if (verify) {
                verifyCard.classList.add('selected');
                noVerifyCard.classList.remove('selected');
                authForm.style.display = 'block';

                // Render dynamic fields based on category
                if (category === 'Électronique') {
                    dynamicFields.innerHTML = `
                        <div class="form-group">
                            <label>Numéro de série</label>
                            <input type="text" id="serialNumber" placeholder="S/N...">
                        </div>
                    `;
                } else { // Vêtements, etc.
                    dynamicFields.innerHTML = `
                        <p style="margin-bottom:0.5rem; font-weight:500;">Photos supplémentaires requises :</p>
                        <div class="form-group"><label>Photo de l'étiquette</label><input type="file" id="proofLabel" accept="image/*"></div>
                        <div class="form-group"><label>Photo de la semelle / couture</label><input type="file" id="proofDetail" accept="image/*"></div>
                    `;
                }
            } else {
                noVerifyCard.classList.add('selected');
                verifyCard.classList.remove('selected');
                authForm.style.display = 'none';
            }
        };

        window.submitWizardAd = async () => {
            // Helper to read file as Data URL
            const readFileAsDataURL = (file) => {
                return new Promise((resolve) => {
                    if (!file) {
                        resolve(null);
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => resolve(null); // Resolve with null on error
                    reader.readAsDataURL(file);
                });
            };

            const newAd = {
                id: Date.now(),
                title: document.getElementById('title').value,
                category: document.getElementById('category').value,
                brand: document.getElementById('brand').value,
                price: parseFloat(document.getElementById('price').value),
                condition: document.getElementById('condition').value,
                description: document.getElementById('description').value,
                image: uploadedPhotos[0], // Main image
                images: uploadedPhotos,   // All images
                status: 'pending',
                seller: currentUser,
                isAuthentic: false, // Will be true if approved by admin
                wantsAuthentication: isAuthSelected
            };

            // Add Auth Data if selected
            if (isAuthSelected) {
                const invoiceFile = document.getElementById('invoiceFile').files[0];
                const proofLabelFile = document.getElementById('proofLabel') ? document.getElementById('proofLabel').files[0] : null;
                const proofDetailFile = document.getElementById('proofDetail') ? document.getElementById('proofDetail').files[0] : null;

                newAd.authData = {
                    store: document.getElementById('store').value,
                    purchaseDate: document.getElementById('purchaseDate').value,
                    serialNumber: document.getElementById('serialNumber') ? document.getElementById('serialNumber').value : null,
                    invoiceUrl: await readFileAsDataURL(invoiceFile),
                    proofLabelUrl: await readFileAsDataURL(proofLabelFile),
                    proofDetailUrl: await readFileAsDataURL(proofDetailFile)
                };
            }

            ads.push(newAd);
            localStorage.setItem('lbp_ads', JSON.stringify(ads));
            showToast('Annonce envoyée pour validation !', 'success');
            setTimeout(() => window.location.href = 'index.html', 2000);
        };

        // Vérifier si l'utilisateur est connecté
        if (!currentUser) {
            // Cacher le formulaire et afficher un message
            const formContainer = document.querySelector('.wizard-container');
            if (formContainer) {
                formContainer.innerHTML = `
                    <div style="text-align:center; padding: 2rem;">
                        <h2>Connectez-vous pour publier</h2>
                        <p>Pour déposer une annonce, vous devez avoir un compte et être connecté.</p>
                        <button id="publish-login-btn" class="btn-primary" style="margin-top: 1rem;">Se connecter / S'inscrire</button>
                    </div>
                `;
                document.getElementById('publish-login-btn').addEventListener('click', () => {
                    const modal = document.getElementById('accountModal');
                    if (modal) {
                        modal.style.display = 'block';
                    }
                });
            }
            // On n'arrête plus l'exécution ici car les fonctions sont déjà définies, mais on ne veut pas attacher les listeners
        } else {
            // --- PHOTO HANDLING ---
            const photoInput = document.getElementById('photoInput');

            if (photoInput) {
                photoInput.addEventListener('change', function(e) {
                    const files = Array.from(e.target.files);
                    if (uploadedPhotos.length + files.length > 5) {
                        showToast("Maximum 5 photos au total", "error");
                        return;
                    }

                    files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            uploadedPhotos.push(e.target.result);
                            renderPhotoPreviews();
                        };
                        reader.readAsDataURL(file);
                    });
                });
            }
        }
    }

    // --- LOGIQUE PAGE PANIER (cart.html) ---
    if (path.includes('cart.html')) {
        updateCartCount();
        renderCartPage();
    }

    // --- LOGIQUE PAGE PROFIL (profile.html) ---
    if (path.includes('profile.html')) {
        updateCartCount();
        updateUserUI();

        if (!currentUser) {
            window.location.href = 'index.html?login=true';
            return;
        }

        window.renderProfilePage = () => {
            const profileContainer = document.getElementById('profile-container');
            const user = users.find(u => u.email === currentUser);

            if (user && profileContainer) {
                const userAds = ads.filter(ad => ad.seller === currentUser).sort((a, b) => b.id - a.id);
                const pdpAvatar = user && user.pdpUrl ? `<img src="${user.pdpUrl}" alt="Photo de profil">` : `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`;
            
                const profileHtml = `
                <div class="profile-grid">
                    <aside class="profile-sidebar">
                        <div class="profile-card">
                            <div class="profile-avatar">${pdpAvatar}</div>
                            <h1>${user.firstName} ${user.lastName}</h1>
                            <p><i class="fa-solid fa-location-dot"></i> Habite à ${user.city} (${user.postalCode})</p>
                            <p style="font-size:0.8rem; margin-top:0.5rem;"><i class="fa-solid fa-envelope"></i> ${user.email}</p>
                            <button id="edit-profile-btn" class="btn-secondary" style="margin-top: 1rem;"><i class="fa-solid fa-user-pen"></i> Modifier le profil</button>
                        </div>
                    </aside>
                    <div class="profile-content">
                        <h2>Mes annonces (${userAds.length})</h2>
                        <div id="user-ads-container">
                            <!-- Annonces de l'utilisateur -->
                        </div>
                    </div>
                </div>
                `;
                profileContainer.innerHTML = profileHtml;

                document.getElementById('edit-profile-btn').addEventListener('click', openProfileEditModal);

                const userAdsContainer = document.getElementById('user-ads-container');
                if (userAds.length > 0) {
                    userAdsContainer.innerHTML = userAds.map((ad, index) => {
                        const statusBadges = {
                            'pending': '<span class="badge-state" style="background:#FEF3C7; color:#92400E;">En attente</span>',
                            'pending-modification': '<span class="badge-state" style="background:#E0E7FF; color:#3730A3;">Modif. en attente</span>',
                            'approved': '<span class="badge-state" style="background:#D1FAE5; color:#065F46;">En ligne</span>',
                            'suspended': '<span class="badge-state" style="background:#FEE2E2; color:#991B1B;">Suspendue</span>',
                        };

                        return `
                        <article class="user-ad-card" style="animation-delay: ${index * 50}ms">
                            <img src="${ad.image}" alt="${ad.title}">
                            <div class="user-ad-details">
                                <h3>${ad.title}</h3>
                                <div class="user-ad-meta">
                                    ${statusBadges[ad.status] || ''}
                                    <span>${getPriceHtml(ad, 'card-price')}</span>
                                    ${ad.promoPercentage > 0 ? `<span class="badge-promo-percent">-${ad.promoPercentage}%</span>` : ''}
                                </div>
                                <div class="user-ad-actions">
                                    <button class="btn-secondary" onclick="openUserAdEditModal(${ad.id})"><i class="fa-solid fa-pen"></i> Modifier</button>
                                    <button class="btn-warning" onclick="setUserAdPromo(${ad.id})"><i class="fa-solid fa-tags"></i> Promo</button>
                                    <button class="btn-danger" onclick="deleteUserAd(${ad.id})"><i class="fa-solid fa-trash"></i> Supprimer</button>
                                </div>
                            </div>
                        </article>`;
                    }).join('');
                } else {
                    userAdsContainer.innerHTML = '<p style="text-align:center; padding: 2rem; background: #f8fafc; border-radius: var(--radius);">Vous n\'avez aucune annonce pour le moment. <a href="publish.html">Publier ma première annonce</a>.</p>';
                }
            }
        };

        renderProfilePage();

        window.deleteUserAd = (id) => {
            showConfirmModal(
                'Supprimer l\'annonce',
                'Êtes-vous sûr de vouloir supprimer cette annonce définitivement ? Cette action est irréversible.',
                () => {
                    ads = ads.filter(ad => ad.id !== id);
                    localStorage.setItem('lbp_ads', JSON.stringify(ads));
                    showToast("Annonce supprimée.", "success");
                    renderProfilePage();
                }
            );
        };

        window.setUserAdPromo = (id) => {
            const ad = ads.find(a => a.id === id);
            if (!ad) return;
            const promoModal = document.getElementById('promoModal');
            if (!promoModal) return;

            document.getElementById('promoAdId').value = ad.id;
            document.getElementById('promoPercentage').value = ad.promoPercentage || 0;
            promoModal.style.display = 'block';
        };

        window.openUserAdEditModal = (id) => {
            window.modifyAd(id, true); // true to indicate it's a user edit
        };

        function openProfileEditModal() {
            const user = users.find(u => u.email === currentUser);
            const modal = document.getElementById('profileEditModal');
            if (!user || !modal) return;

            document.getElementById('editPdpUrl').value = user.pdpUrl || '';
            document.getElementById('editFirstName').value = user.firstName;
            document.getElementById('editLastName').value = user.lastName;
            document.getElementById('editCity').value = user.city;
            document.getElementById('editPostalCode').value = user.postalCode;

            modal.style.display = 'block';
        };

        // --- Event Listeners for new modals ---
        const promoForm = document.getElementById('promoForm');
        if (promoForm) {
            promoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = parseInt(document.getElementById('promoAdId').value);
                const percentage = document.getElementById('promoPercentage').value;
                const ad = ads.find(a => a.id === id);
                
                if (ad) {
                    const promoValue = parseInt(percentage);
                    if (!isNaN(promoValue) && promoValue >= 0 && promoValue < 100) {
                        ad.promoPercentage = promoValue;
                        localStorage.setItem('lbp_ads', JSON.stringify(ads));
                        showToast(promoValue > 0 ? `Promotion de ${promoValue}% appliquée !` : "Promotion retirée.", "success");
                        renderProfilePage();
                    } else {
                        showToast("Veuillez entrer un nombre valide entre 0 et 99.", "error");
                    }
                }
                document.getElementById('promoModal').style.display = 'none';
            });
        }

        const profileEditForm = document.getElementById('profileEditForm');
        if (profileEditForm) {
            profileEditForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const userIndex = users.findIndex(u => u.email === currentUser);
                if (userIndex === -1) return;

                users[userIndex].pdpUrl = document.getElementById('editPdpUrl').value || null;
                users[userIndex].firstName = document.getElementById('editFirstName').value;
                users[userIndex].lastName = document.getElementById('editLastName').value;
                users[userIndex].city = document.getElementById('editCity').value;
                users[userIndex].postalCode = document.getElementById('editPostalCode').value;

                localStorage.setItem('lbp_users', JSON.stringify(users));
                showToast("Profil mis à jour avec succès !", "success");
                document.getElementById('profileEditModal').style.display = 'none';
                renderProfilePage();
                updateUserUI();
            });
        }

        const closePromo = document.querySelector('.close-promo');
        if(closePromo) closePromo.onclick = () => document.getElementById('promoModal').style.display = 'none';
        const closeProfileEdit = document.querySelector('.close-profile-edit');
        if(closeProfileEdit) closeProfileEdit.onclick = () => document.getElementById('profileEditModal').style.display = 'none';
    }


    // --- LOGIQUE PAGE ADMIN (admin.html) ---
    if (path.includes('admin.html')) {
        const root = document.getElementById('admin-root');
        const adminLoginModal = document.getElementById('adminLoginModal');
        const closeAdminLogin = document.getElementsByClassName('close-admin-login')[0];
        const adminLoginForm = document.getElementById('adminLoginForm');

        // Initialiser les annonces système (juste pour la variable locale)
        const systemAnnouncements = JSON.parse(localStorage.getItem('lbp_system_announcements'));

        // Gestion Modal Detail (Inspection)
        const detailModal = document.getElementById('detailModal');
        const closeDetail = document.getElementsByClassName('close-detail')[0];
        
        if(closeAdminLogin) closeAdminLogin.onclick = () => adminLoginModal.style.display = "none";
        if(closeDetail) closeDetail.onclick = () => detailModal.style.display = "none";

        // Promo Modal Logic for Admin
        const promoModal = document.getElementById('promoModal');
        const promoForm = document.getElementById('promoForm');
        const closePromo = promoModal ? promoModal.querySelector('.close-promo') : null;
        if(closePromo) closePromo.onclick = () => promoModal.style.display = 'none';

        if (promoForm) {
            promoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = parseInt(document.getElementById('promoAdId').value);
                const percentage = document.getElementById('promoPercentage').value;
                const ad = ads.find(a => a.id === id);
                
                if (ad) {
                    const promoValue = parseInt(percentage);
                    if (!isNaN(promoValue) && promoValue >= 0 && promoValue < 100) {
                        ad.promoPercentage = promoValue;
                        localStorage.setItem('lbp_ads', JSON.stringify(ads));
                        showToast(promoValue > 0 ? `Promotion de ${promoValue}% appliquée !` : "Promotion retirée.", "success");
                        renderAdminAdsPage();
                    } else {
                        showToast("Veuillez entrer un nombre valide entre 0 et 99.", "error");
                    }
                }
                promoModal.style.display = 'none';
            });
        }

        // --- FLUX DE CONNEXION SIMPLIFIÉ ---

        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('adminId').value;
                const pass = document.getElementById('adminPass').value;

                if (id === 'admin' && pass === '123') {
                    adminLoginModal.style.display = 'none';
                    adminLoginForm.reset();
                    renderDashboard();
                } else {
                    showToast("Identifiants incorrects", "error");
                }
            });
        }

        // Afficher le dashboard directement
        const renderDashboard = () => {
            root.innerHTML = `
                <h2>Administration</h2>
                <div style="margin-bottom: 1rem; display:flex; gap:10px;">
                    <button class="btn-secondary" onclick="renderAdminAdsPage()">Gestion des Annonces</button>
                    <button class="btn-secondary" onclick="renderSystemAnnouncements()">Système</button>
                </div>
                <div id="dashboard-content" class="admin-dashboard-content">
                    <!-- Contenu par défaut -->
                </div>
            `;
            window.renderAdminAdsPage();
        };

        window.renderAdminAdsPage = () => { // Now attached to window
            const content = document.getElementById('dashboard-content');
            content.innerHTML = `
                <div class="admin-tabs">
                    <button class="tab-link active" onclick="openAdminTab(event, 'pending')">Annonces en attente</button>
                    <button class="tab-link" onclick="openAdminTab(event, 'modification')">Modifications à valider</button>
                    <button class="tab-link" onclick="openAdminTab(event, 'published')">Annonces publiées</button>
                </div>

                <div id="pending" class="tab-content active"></div>
                <div id="modification" class="tab-content"></div>
                <div id="published" class="tab-content"></div>
            `;
            renderAdsListByStatus('pending', document.getElementById('pending'));
            renderAdsListByStatus('pending-modification', document.getElementById('modification'));
            renderAdsListByStatus('published', document.getElementById('published'));
        };

        // --- GESTION DES ANNONCES SYSTÈME ---
        window.renderSystemAnnouncements = () => {
            const content = document.getElementById('dashboard-content');
            content.innerHTML = `
                <div class="admin-section">
                    <h3><i class="fa-solid fa-bullhorn"></i> Annonces Système</h3>
                    <div class="system-announcement-form">
                        <textarea id="new-announcement-text" placeholder="Contenu de l'annonce (ex: Maintenance prévue ce soir à 23h)..." rows="2"></textarea>
                        <button class="btn-primary" onclick="addSystemAnnouncement()">Ajouter</button>
                    </div>
                    <div id="system-announcements-list"></div>
                </div>
            `;
            window.renderSystemAnnouncementsList();
        };

        window.renderSystemAnnouncementsList = () => {
            const listContainer = document.getElementById('system-announcements-list');
            const announcements = JSON.parse(localStorage.getItem('lbp_system_announcements')) || [];
            if (!listContainer) return;
            if (announcements.length === 0) {
                listContainer.innerHTML = '<p>Aucune annonce système.</p>';
                return;
            }
            listContainer.innerHTML = announcements.map(ann => `
                <div class="system-announcement-item ${!ann.active ? 'inactive' : ''}">
                    <p>${ann.content}</p>
                    <div class="item-actions">
                        <button class="btn-secondary" onclick="toggleSystemAnnouncement(${ann.id})">${ann.active ? 'Désactiver' : 'Activer'}</button>
                        <button class="btn-danger" onclick="deleteSystemAnnouncement(${ann.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        };

        window.addSystemAnnouncement = () => {
            const text = document.getElementById('new-announcement-text').value;
            if (!text.trim()) return;
            const announcements = JSON.parse(localStorage.getItem('lbp_system_announcements')) || [];
            const newAnn = { id: Date.now(), content: text, active: false };
            announcements.unshift(newAnn);
            localStorage.setItem('lbp_system_announcements', JSON.stringify(announcements));
            window.renderSystemAnnouncementsList();
            document.getElementById('new-announcement-text').value = '';
        };

        window.toggleSystemAnnouncement = (id) => {
            let announcements = JSON.parse(localStorage.getItem('lbp_system_announcements')) || [];
            let wasActivated = false;
            announcements = announcements.map(ann => {
                if (ann.id === id) {
                    ann.active = !ann.active;
                    if (ann.active) wasActivated = true;
                }
                return ann;
            });
            // S'assurer qu'une seule annonce est active
            if (wasActivated) {
                announcements.forEach(ann => {
                    if (ann.id !== id) ann.active = false;
                });
            }
            localStorage.setItem('lbp_system_announcements', JSON.stringify(announcements));
            window.renderSystemAnnouncementsList();
        };

        window.deleteSystemAnnouncement = (id) => {
            showConfirmModal(
                'Supprimer l\'annonce système',
                'Êtes-vous sûr de vouloir supprimer cette annonce système ?',
                () => {
                    let announcements = JSON.parse(localStorage.getItem('lbp_system_announcements')) || [];
                    announcements = announcements.filter(ann => ann.id !== id);
                    localStorage.setItem('lbp_system_announcements', JSON.stringify(announcements));
                    window.renderSystemAnnouncementsList();
                }
            );
        };

        window.openAdminTab = (evt, tabName) => {
            let i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-link");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className += " active";
        };

        const renderAdsListByStatus = (status, container) => {
            let adsToRender;
            if (status === 'published') {
                adsToRender = ads.filter(ad => ['approved', 'suspended'].includes(ad.status));
            } else {
                adsToRender = ads.filter(ad => ad.status === status);
            }

            if (!container) return;

            if (adsToRender.length === 0) {
                container.innerHTML = '<p>Aucune annonce dans cette catégorie.</p>';
            } else {
                container.innerHTML = adsToRender.map(ad => {
                    const isPublishedTab = status === 'published';
                    return `
                    <div class="list-item ${ad.status === 'suspended' ? 'suspended-item' : ''}">
                        <div class="item-info">
                            <h3>${ad.title} ${isPublishedTab ? `<span class="badge-state">${ad.status === 'suspended' ? 'SUSPENDU' : 'EN LIGNE'}</span>` : ''}</h3>
                            <p>Vendeur: ${ad.seller} | Marque: ${ad.brand || 'N/A'} | Prix: ${ad.price}€</p>
                        </div>
                        <div class="item-actions">
                            ${isPublishedTab ? `
                                <button onclick="window.modifyAd(${ad.id}, false)" class="btn-secondary">Gérer</button>
                                <button onclick="managePromo(${ad.id})" class="btn-warning">${ad.promoPercentage > 0 ? `Promo ${ad.promoPercentage}%` : 'Créer Promo'}</button>
                                <button onclick="updateStatus(${ad.id}, '${ad.status === 'suspended' ? 'approved' : 'suspended'}')" class="btn-warning">${ad.status === 'suspended' ? 'Activer' : 'Suspendre'}</button>
                                <button onclick="deleteAd(${ad.id})" class="btn-danger">Supprimer</button>
                            ` : `
                                <button onclick="inspectAd(${ad.id})" class="btn-primary">Inspecter</button>
                            `}
                        </div>
                    </div>
                `}).join('');
            }
        };

        // Fonctions globales pour les boutons onclick
        window.updateStatus = (id, status) => {
            const ad = ads.find(ad => ad.id === id);
            if (ad) {
                ad.status = status;
                localStorage.setItem('lbp_ads', JSON.stringify(ads));
                window.renderAdminAdsPage(); 
            }
        };

        window.managePromo = (id) => {
            const ad = ads.find(a => a.id === id);
            if (!ad) return;
            const promoModal = document.getElementById('promoModal');
            if (!promoModal) return;

            document.getElementById('promoAdId').value = ad.id;
            document.getElementById('promoPercentage').value = ad.promoPercentage || 0;
            promoModal.style.display = 'block';
        };

        window.validateAndCertify = (id) => {
            const index = ads.findIndex(ad => ad.id === id);
            if (index !== -1) {
                ads[index].status = 'approved';
                ads[index].isAuthentic = true;
                localStorage.setItem('lbp_ads', JSON.stringify(ads));
                window.renderAdminAdsPage();
            }
        };

        window.deleteAd = (id) => {
            showConfirmModal(
                'Supprimer l\'annonce',
                'Êtes-vous sûr de vouloir supprimer cette annonce définitivement ? Cette action est irréversible.',
                () => {
                    ads = ads.filter(ad => ad.id !== id); // Update local memory
                    localStorage.setItem('lbp_ads', JSON.stringify(ads)); // Update storage
                    window.renderAdminAdsPage(); // Re-render without reload
                    showToast("Annonce supprimée");
                }
            );
        };

        window.inspectAd = (id) => {
            const ad = ads.find(a => a.id === id);
            if(!ad) return;
            
            const content = document.getElementById('detail-content');
            const actions = document.getElementById('detail-actions');
            
            // 1. Image gallery for admin modal
            const images = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
            const imageGalleryHtml = `
                <div class="proof-grid" style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));">
                    ${images.map(img => `<a href="${img}" target="_blank"><img src="${img}" class="proof-img" style="height: 120px;"></a>`).join('')}
                </div>
            `;

            // 2. Proofs HTML based on ad.wantsAuthentication
            let proofHtml = '';
            if (ad.wantsAuthentication && ad.authData) {
                proofHtml = `
                    <div style="margin-top:1rem; border-top:1px solid #eee; padding-top:1rem;">
                        <h3 style="font-size:1.1rem; margin-bottom:0.5rem; color: var(--accent);">Demande d'authentification</h3>
                        <p><strong>Magasin:</strong> ${ad.authData.store || 'N/A'} | <strong>Date:</strong> ${ad.authData.purchaseDate || 'N/A'}</p>
                        ${ad.authData.serialNumber ? `<p><strong>Numéro de série:</strong> ${ad.authData.serialNumber}</p>` : ''}
                        
                        <h4 style="font-size:1rem; margin-top:0.5rem;">Documents fournis :</h4>
                        <div class="proof-grid">
                            ${ad.authData.invoiceUrl ? `<a href="${ad.authData.invoiceUrl}" target="_blank"><img src="${ad.authData.invoiceUrl}" class="proof-img" title="Facture"></a>` : ''}
                            ${ad.authData.proofLabelUrl ? `<a href="${ad.authData.proofLabelUrl}" target="_blank"><img src="${ad.authData.proofLabelUrl}" class="proof-img" title="Étiquette"></a>` : ''}
                            ${ad.authData.proofDetailUrl ? `<a href="${ad.authData.proofDetailUrl}" target="_blank"><img src="${ad.authData.proofDetailUrl}" class="proof-img" title="Détail (couture/semelle)"></a>` : ''}
                        </div>
                        ${!ad.authData.invoiceUrl && !ad.authData.proofLabelUrl && !ad.authData.proofDetailUrl ? '<p style="color:#666; font-style:italic;">Aucun document fourni.</p>' : ''}
                    </div>
                `;
            } else {
                proofHtml = `
                    <div style="margin-top:1rem; border-top:1px solid #eee; padding-top:1rem;">
                        <h3 style="font-size:1.1rem; margin-bottom:0.5rem;">Demande de publication simple</h3>
                        <p style="color:#666; font-style:italic;">L'utilisateur n'a pas demandé de vérification d'authenticité.</p>
                    </div>
                `;
            }

            content.innerHTML = `
                <div class="product-detail-wrapper" style="box-shadow:none; padding:0; grid-template-columns: 300px 1fr; gap: 1.5rem;">
                    <div class="product-image">
                        <h4>Photos du produit</h4>
                        ${imageGalleryHtml}
                    </div>
                    <div class="product-info">
                        <h2 style="font-size:1.8rem;">${ad.title}</h2>
                        <p class="product-price">${parseFloat(ad.price).toFixed(2)} € <span class="unit">/ unité</span></p>
                        <p><strong>Marque:</strong> ${ad.brand || 'N/A'} | <strong>État:</strong> ${ad.condition || 'N/A'}</p>
                        <div style="margin-top:1rem; background:#f9f9f9; padding:1rem; border-radius:8px;">
                            <p>${ad.description}</p>
                        </div>
                        ${proofHtml}
                    </div>
                </div>
            `;
            
            if (ad.wantsAuthentication) {
                actions.innerHTML = `
                    <button onclick="deleteAd(${ad.id}); document.getElementById('detailModal').style.display='none'" class="btn-danger">Refuser l'annonce</button>
                    <div style="display:flex; gap:10px;">
                        <button onclick="updateStatus(${ad.id}, 'approved'); document.getElementById('detailModal').style.display='none'" class="btn-secondary">Publier (Non Authentifié)</button>
                        <button onclick="validateAndCertify(${ad.id}); document.getElementById('detailModal').style.display='none'" class="btn-success"><i class="fa-solid fa-certificate"></i> Valider & Certifier</button>
                    </div>
                `;
            } else {
                actions.innerHTML = `
                    <button onclick="deleteAd(${ad.id}); document.getElementById('detailModal').style.display='none'" class="btn-danger">Refuser</button>
                    <button onclick="updateStatus(${ad.id}, 'approved'); document.getElementById('detailModal').style.display='none'" class="btn-primary">Valider et Publier</button>
                `;
            }
            
            document.getElementById('detailModal').style.display = "block";
        };

        // Point d'entrée initial : Afficher la modale de connexion
        adminLoginModal.style.display = 'block';
    }
});
