document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les données si vides
    if (!localStorage.getItem('lbp_ads')) {
        const initialData = [
            { id: 1, title: 'MacBook Pro M1 (Lot de 5)', price: 850.00, quantity: 5, category: 'Électronique', brand: 'Apple', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', description: 'Modèles reconditionnés à neuf. Parfait pour revendeurs.', condition: 'Reconditionné', status: 'approved', seller: 'system@lebonplan.fr' },
            { id: 2, title: 'Sneakers Nike Air (Vrac)', price: 45.00, quantity: 20, category: 'Vêtements', brand: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', description: 'Retour de stock magasin. Tailles variées (40-45).', condition: 'Neuf', status: 'approved', seller: 'system@lebonplan.fr' }
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
            { email: 'system@lebonplan.fr', password: 'system_password', firstName: 'LeBonPlan', lastName: 'Official', birthDate: '2023-01-01', city: 'Paris', postalCode: '75001' }
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

        const announcements = JSON.parse(localStorage.getItem('lbp_system_announcements')) || [];
        const activeAnnouncement = announcements.find(ann => ann.active);

        if (activeAnnouncement) {
            const promoContent = promoBar.querySelector('.promo-content');
            if (promoContent) {
                promoContent.innerHTML = `<div style="width:100%; text-align:center; font-weight:bold;"><i class="fa-solid fa-bullhorn"></i> &nbsp; ${activeAnnouncement.content}</div>`;
                promoBar.style.background = 'var(--danger)'; // Make it stand out
            }
        }
    };
    displaySystemAnnouncement(); // Call it on every page load
    
    const updateUserUI = () => {
        const userAccountLinks = document.getElementById('user-account-links');
        if (!userAccountLinks) return;
        if (currentUser) {
            // User is logged in
            const user = users.find(u => u.email === currentUser);
            const username = user ? user.firstName : currentUser.split('@')[0];
            userAccountLinks.innerHTML = `
                <div class="user-menu">
                    <a href="profile.html" class="btn-secondary"><i class="fa-solid fa-user"></i> Mon Profil</a>
                    <button id="logout-btn" class="btn-secondary">Déconnexion</button>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        } else {
            // User is logged out
            userAccountLinks.innerHTML = `
                <button id="login-register-btn" class="btn-secondary"><i class="fa-solid fa-user"></i> Connexion</button>
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

        users.push({ email, password, firstName, lastName, birthDate, city, postalCode });
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

    // --- GESTION DES MODALES (GLOBAL) ---
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
    window.addEventListener('click', (event) => {
        if (event.target == accountModal) accountModal.style.display = "none";
        if (document.getElementById('filterModal') && event.target == document.getElementById('filterModal')) document.getElementById('filterModal').style.display = "none";
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
                            <div style="display:flex; justify-content:space-between; width:100%;">
                                <span class="card-category"><i class="fa-solid ${categoryIcon}"></i> ${ad.category}</span>
                                ${ad.isPromo ? '<span class="badge-promo">PROMO</span>' : ''}
                            </div>
                            <h3 class="card-title">${ad.title}</h3>
                            <p class="card-price">${parseFloat(ad.price).toFixed(2)} € <span class="unit">/ unité</span></p>
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
            const urlParams = new URLSearchParams(window.location.search);
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

        if (ad) {
            const categoryIcon = getCategoryIcon(ad.category);
            const sellerInfo = users.find(u => u.email === ad.seller);
            const sellerName = sellerInfo ? `${sellerInfo.firstName} ${sellerInfo.lastName}` : 'Vendeur inconnu';

            container.innerHTML = `
                <div class="product-detail-wrapper">
                    <div class="product-image">
                        <img src="${ad.image}" alt="${ad.title}">
                    </div>
                    <div class="product-info">
                        <h1>${ad.title}</h1>
                        <div class="product-meta-tags">
                                ${ad.isPromo ? '<span class="badge-promo" style="font-size:1rem; padding:5px 10px;">PROMO</span>' : ''}
                            <span class="badge-state large" style="background:#f1f5f9; color:#334155;"><i class="fa-solid ${categoryIcon}"></i>${ad.category || 'Autre'}</span>
                            <span class="badge-state large"><i class="fa-solid fa-award"></i>${ad.condition || 'Bon état'}</span>
                            <span class="badge-state large"><i class="fa-solid fa-tag"></i>${ad.brand || 'N/A'}</span>
                            <span class="badge-stock large ${ad.quantity < 10 ? 'low' : ''}">${ad.quantity > 0 ? 'En stock (' + ad.quantity + ')' : 'Épuisé'}</span>
                            ${ad.isAuthentic === true ? '<span class="badge-auth large"><i class="fa-solid fa-certificate"></i> Authentifié</span>' : (ad.status === 'approved' ? '<span class="badge-unauth large"><i class="fa-solid fa-question-circle"></i> Non authentifié</span>' : '')}
                        </div>

                        <!-- Vendeur -->
                        <div style="margin-bottom: 1rem; font-size: 0.9rem; color: #4B5563;">
                            Vendu par : <strong style="color: var(--primary);">${sellerName}</strong>
                        </div>

                        <p class="product-price">${parseFloat(ad.price).toFixed(2)} € <span class="unit">/ pièce</span></p>
                        
                        <div class="product-description">
                            <h3>Description</h3>
                            <p>${ad.description}</p>
                        </div>

                        <div class="buy-box">
                            <label>Quantité :</label>
                            <div class="input-group large">
                                <input type="number" id="qty-${ad.id}" min="1" max="${ad.quantity}" value="1">
                                <button onclick="addToCart(${ad.id})" class="btn-primary ${ad.quantity === 0 ? 'disabled' : ''}" ${ad.quantity === 0 ? 'disabled' : ''}>Ajouter au panier</button>
                            </div>
                            <p class="promo-text"><i class="fas fa-fire"></i> -5% dès 2, -10% dès 3, -20% dès 6 !</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = "<p>Produit introuvable.</p>";
        }
    }

    // --- LOGIQUE PAGE PUBLIER (publish.html) ---
    if (path.includes('publish.html')) {
        // Vérifier si l'utilisateur est connecté
        if (!currentUser) {
            // Cacher le formulaire et afficher un message
            const formContainer = document.querySelector('.card');
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
            return; // On arrête l'exécution du reste du script pour cette page
        }
        const categorySelect = document.getElementById('category');
        const clothingAuth = document.getElementById('auth-clothing-fields');
        const electronicsAuth = document.getElementById('auth-electronics-fields');

        const handleAuthFields = () => {
            if (!categorySelect || !clothingAuth || !electronicsAuth) return;
            const selectedCategory = categorySelect.value;
            if (selectedCategory === 'Électronique') {
                clothingAuth.style.display = 'none';
                electronicsAuth.style.display = 'block';
            } else { // Vêtements, Maison, Autre
                clothingAuth.style.display = 'block';
                electronicsAuth.style.display = 'none';
            }
        };

        if (categorySelect) categorySelect.addEventListener('change', handleAuthFields);
        handleAuthFields(); // Appel initial pour définir le bon état

        const form = document.getElementById('adForm');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const newAd = {
                    id: Date.now(),
                    title: document.getElementById('title').value,
                    price: document.getElementById('price').value,
                    quantity: document.getElementById('quantity').value,
                    category: document.getElementById('category').value,
                    brand: document.getElementById('brand').value,
                    condition: document.getElementById('condition').value,
                    image: document.getElementById('image').value,
                    description: document.getElementById('description').value,
                    // Données de vérification
                    store: document.getElementById('store').value,
                    purchaseDate: document.getElementById('purchaseDate').value,
                    invoiceUrl: document.getElementById('invoiceUrl').value,
                    // Champs spécifiques
                    angleFront: document.getElementById('angleFront').value,
                    angleSide: document.getElementById('angleSide').value,
                    angleSole: document.getElementById('angleSole').value,
                    angleLabel: document.getElementById('angleLabel').value,
                    serialNumber: document.getElementById('serialNumber').value,
                    videoProofUrl: document.getElementById('videoProofUrl').value,
                    status: 'pending',
                    seller: currentUser // Ajout de l'information du vendeur
                };
                
                ads.push(newAd);
                localStorage.setItem('lbp_ads', JSON.stringify(ads));
                
                showToast('Annonce envoyée pour validation !', 'success');
                setTimeout(() => window.location.href = 'index.html', 2000);
            });
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

        const profileContainer = document.getElementById('profile-container');
        const user = users.find(u => u.email === currentUser);

        if (user && profileContainer) {
            const userAds = ads.filter(ad => ad.seller === currentUser && ad.status === 'approved');
            
            const profileHtml = `
                <div class="profile-header">
                    <div class="profile-avatar">${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}</div>
                    <div class="profile-info">
                        <h1>${user.firstName} ${user.lastName}</h1>
                        <p><i class="fa-solid fa-location-dot"></i> Habite à ${user.city} (${user.postalCode})</p>
                    </div>
                </div>
                <div class="profile-ads">
                    <h2>Mes annonces en ligne (${userAds.length})</h2>
                    <div id="user-ads-container" class="grid-container">
                        <!-- Annonces de l'utilisateur -->
                    </div>
                </div>
            `;
            profileContainer.innerHTML = profileHtml;

            const userAdsContainer = document.getElementById('user-ads-container');
            if (userAds.length > 0) {
                // Re-using displayAds logic structure
                userAdsContainer.innerHTML = userAds.map((ad, index) => {
                    const categoryIcon = getCategoryIcon(ad.category);
                    return `
                    <article class="card" style="animation-delay: ${index * 50}ms">
                        <a href="product.html?id=${ad.id}" title="${ad.title}">
                            <img src="${ad.image}" alt="${ad.title}">
                            <div class="card-body">
                                <h3 class="card-title">${ad.title}</h3>
                                <p class="card-price">${parseFloat(ad.price).toFixed(2)} € <span class="unit">/ unité</span></p>
                            </div>
                        </a>
                    </article>`;
                }).join('');
            } else {
                userAdsContainer.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Vous n\'avez aucune annonce en ligne pour le moment. <a href="publish.html">Publier ma première annonce</a>.</p>';
            }
        }
    }

    // --- LOGIQUE PAGE ADMIN (admin.html) ---
    if (path.includes('admin.html')) {
        const root = document.getElementById('admin-root');
        const adminLoginModal = document.getElementById('adminLoginModal');
        const closeAdminLogin = document.getElementsByClassName('close-admin-login')[0];
        const adminLoginForm = document.getElementById('adminLoginForm');

        // Initialiser les messages (Mock Data)
        if (!localStorage.getItem('lbp_messages')) {
            localStorage.setItem('lbp_messages', JSON.stringify([
                {id: 1, from: 'Jean Dupont', subject: 'Question stock', content: 'Bonjour, avez-vous plus de MacBook ?', date: '2023-10-20'},
                {id: 2, from: 'Sophie Martin', subject: 'Problème commande', content: 'Je n\'ai pas reçu mon colis.', date: '2023-10-21'}
            ]));
        }
        const messages = JSON.parse(localStorage.getItem('lbp_messages'));

        // Initialiser les annonces système (juste pour la variable locale)
        const systemAnnouncements = JSON.parse(localStorage.getItem('lbp_system_announcements'));

        // Variables pour les conteneurs dynamiques
        let pendingContainer, activeContainer;
        
        // Gestion Modal Edit
        const editModal = document.getElementById('editModal');
        const editForm = document.getElementById('editForm');
        const closeEdit = document.getElementsByClassName('close-edit')[0];
        
        // Gestion Modal Detail (Inspection)
        const detailModal = document.getElementById('detailModal');
        const closeDetail = document.getElementsByClassName('close-detail')[0];
        
        if(closeAdminLogin) closeAdminLogin.onclick = () => adminLoginModal.style.display = "none";
        if(closeEdit) closeEdit.onclick = () => editModal.style.display = "none";
        if(closeDetail) closeDetail.onclick = () => detailModal.style.display = "none";
        
        window.onclick = (event) => { 
            if (event.target == adminLoginModal) adminLoginModal.style.display = "none";
            if (event.target == editModal) editModal.style.display = "none"; 
            if (event.target == detailModal) detailModal.style.display = "none";
        };

        if(editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = parseInt(document.getElementById('editId').value);
                const ad = ads.find(a => a.id === id);
                ad.title = document.getElementById('editTitle').value;
                ad.brand = document.getElementById('editBrand').value;
                ad.price = parseFloat(document.getElementById('editPrice').value);
                ad.quantity = parseInt(document.getElementById('editQty').value);
                ad.condition = document.getElementById('editCondition').value;
                ad.description = document.getElementById('editDesc').value;
                
                localStorage.setItem('lbp_ads', JSON.stringify(ads));
                editModal.style.display = "none";
                window.renderAdManagement(true);
                showToast("Annonce modifiée avec succès", "success");
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
                    <button class="btn-secondary" onclick="renderAdManagement(true)">Annonces</button>
                    <button class="btn-secondary" onclick="renderMessageManagement(true)">Messagerie</button>
                    <button class="btn-secondary" onclick="renderSystemAnnouncements()">Système</button>
                </div>
                <div id="dashboard-content" class="admin-dashboard-content">
                    <!-- Contenu par défaut -->
                </div>
            `;
            window.renderAdManagement(true);
        };

        // 5. Fonctions de rendu pour chaque section
        // Note: We attach these to window to ensure onclick attributes work
        window.renderAdManagement = (canManage) => { // Make it global
            const content = document.getElementById('dashboard-content');
            content.innerHTML = `
                <div class="admin-section">
                    <h3><i class="fa-solid fa-hourglass-half"></i> Annonces en attente</h3>
                    <div id="pending-container" class="list-container"></div>
                </div>
                <div class="admin-section">
                    <h3><i class="fa-solid fa-check-circle"></i> Annonces en ligne</h3>
                    <div id="active-container" class="list-container"></div>
                </div>
            `;
            pendingContainer = document.getElementById('pending-container');
            activeContainer = document.getElementById('active-container');
            renderAdsList(canManage);
        };

        window.renderMessageManagement = (canManage) => { // Make it global
            const content = document.getElementById('dashboard-content');
            content.innerHTML = `
                <div class="admin-section">
                    <h3><i class="fa-solid fa-envelope"></i> Messagerie</h3>
                    ${canManage ? '<button class="btn-primary" style="margin-bottom:1rem;" onclick="showToast(\'Message envoyé (simulation)\')">Nouveau Message</button>' : ''}
                    <div class="list-container">
                        ${messages.length ? messages.map(m => `
                            <div class="message-item">
                                <div class="message-meta"><strong>${m.from}</strong> <span>${m.date}</span></div>
                                <p><strong>${m.subject}</strong>: ${m.content}</p>
                            </div>
                        `).join('') : '<p>Aucun message.</p>'}
                    </div>
                </div>
            `;
        };

        // --- GESTION DES ANNONCES SYSTÈME ---
        window.renderSystemAnnouncements = () => { // Make it global
            const content = document.getElementById('dashboard-content');
            content.innerHTML = `
                <div class="admin-section">
                    <h3><i class="fa-solid fa-bullhorn"></i> Annonces Système</h3>
                    <p>L'annonce active (une seule possible) remplacera la barre de promo en haut du site.</p>
                    <div class="system-announcement-form">
                        <textarea id="new-announcement-text" placeholder="Contenu de l'annonce (ex: Maintenance prévue ce soir à 23h)..." rows="2"></textarea>
                        <button class="btn-primary" onclick="addSystemAnnouncement()">Ajouter</button>
                    </div>
                    <div id="system-announcements-list"></div>
                </div>
            `;
            window.renderSystemAnnouncementsList();
        };

        window.renderSystemAnnouncementsList = () => { // Make it global
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
            let announcements = JSON.parse(localStorage.getItem('lbp_system_announcements')) || [];
            announcements = announcements.filter(ann => ann.id !== id);
            localStorage.setItem('lbp_system_announcements', JSON.stringify(announcements));
            window.renderSystemAnnouncementsList();
        };

        // --- Fonctions de gestion des annonces produits (inchangées) ---
        window.renderAdsList = (canManage) => { // Make it global
            // Re-fetch ads from memory to ensure we have latest state
            const pendingAds = ads.filter(ad => ad.status === 'pending');
            if (!pendingContainer) return;
            if (pendingAds.length === 0) { 
                pendingContainer.innerHTML = '<p>Aucune annonce en attente.</p>';
            } else {
                pendingContainer.innerHTML = pendingAds.map(ad => `
                    <div class="list-item">
                        <div class="item-info">
                            <h3>${ad.title} (${ad.quantity} pcs) - ${ad.price}€</h3>
                            <p>${ad.description.substring(0, 50)}...</p>
                        </div>
                        <div class="item-actions">
                            ${canManage ? `<button onclick="inspectAd(${ad.id})" class="btn-primary">Inspecter</button>` : '<span class="badge">Lecture seule</span>'}
                        </div>
                    </div>
                `).join('');
            }

            const activeAds = ads.filter(ad => ad.status === 'approved' || ad.status === 'suspended');
            if (!activeContainer) return;
            if (activeAds.length === 0) {
                activeContainer.innerHTML = '<p>Aucune annonce en ligne.</p>';
            } else {
                activeContainer.innerHTML = activeAds.map(ad => `
                <div class="list-item ${ad.status === 'suspended' ? 'suspended-item' : ''}">
                    <div class="item-info">
                        <h3>${ad.title} <span class="badge-state">${ad.status === 'suspended' ? 'SUSPENDU' : 'EN LIGNE'}</span></h3>
                        <p>Marque: ${ad.brand || 'N/A'} | Stock: ${ad.quantity} | Prix: ${ad.price}€</p>
                    </div>
                    <div class="item-actions">
                        ${canManage ? `
                            <button onclick="modifyAd(${ad.id})" class="btn-secondary">Gérer</button>
                            <button onclick="togglePromo(${ad.id})" class="btn-warning" style="background:${ad.isPromo ? '#EF4444' : '#8B5CF6'}">${ad.isPromo ? 'Stop Promo' : 'Promo'}</button>
                            <button onclick="updateStatus(${ad.id}, '${ad.status === 'suspended' ? 'approved' : 'suspended'}')" class="btn-warning">${ad.status === 'suspended' ? 'Activer' : 'Suspendre'}</button>
                            <button onclick="deleteAd(${ad.id})" class="btn-danger">Supprimer</button>
                        ` : '<span class="badge">Lecture seule</span>'}
                    </div>
                </div>
            `).join('');
            }
        };

        // Fonctions globales pour les boutons onclick
        window.updateStatus = (id, status) => {
            const index = ads.findIndex(ad => ad.id === id);
            if (index !== -1) {
                ads[index].status = status;
                localStorage.setItem('lbp_ads', JSON.stringify(ads));
                // Refresh the view
                window.renderAdsList(true); 
            }
        };

        window.togglePromo = (id) => {
            const index = ads.findIndex(ad => ad.id === id);
            if (index !== -1) {
                ads[index].isPromo = !ads[index].isPromo;
                localStorage.setItem('lbp_ads', JSON.stringify(ads));
                showToast(ads[index].isPromo ? "Produit en promotion !" : "Promotion retirée");
                window.renderAdsList(true);
            }
        };

        window.validateAndCertify = (id) => {
            const index = ads.findIndex(ad => ad.id === id);
            if (index !== -1) {
                ads[index].status = 'approved';
                ads[index].isAuthentic = true;
                localStorage.setItem('lbp_ads', JSON.stringify(ads));
                window.renderAdManagement(true);
            }
        };

        window.deleteAd = (id) => {
            ads = ads.filter(ad => ad.id !== id); // Update local memory
            localStorage.setItem('lbp_ads', JSON.stringify(ads)); // Update storage
            window.renderAdsList(true); // Re-render without reload
            showToast("Annonce supprimée");
        };

        window.modifyAd = (id) => {
            const ad = ads.find(a => a.id === id);
            if(!ad) return; 
            document.getElementById('editId').value = ad.id;
            document.getElementById('editTitle').value = ad.title;
            document.getElementById('editBrand').value = ad.brand || '';
            document.getElementById('editPrice').value = ad.price;
            document.getElementById('editQty').value = ad.quantity;
            document.getElementById('editCondition').value = ad.condition || 'Bon état';
            document.getElementById('editDesc').value = ad.description;
            document.getElementById('editModal').style.display = "block";
        };

        window.inspectAd = (id) => {
            const ad = ads.find(a => a.id === id);
            if(!ad) return;
            
            const content = document.getElementById('detail-content');
            const actions = document.getElementById('detail-actions');
            
            // On réutilise le style de la page produit mais adapté à la modale
            let proofHtml = `
                <div style="margin-top:1rem; border-top:1px solid #eee; padding-top:1rem;">
                    <h3 style="font-size:1.1rem; margin-bottom:0.5rem;">Preuves d'authenticité</h3>
                    <p><strong>Magasin:</strong> ${ad.store || 'N/A'} | <strong>Date:</strong> ${ad.purchaseDate || 'N/A'}</p>
                    <p><strong>Facture:</strong> ${ad.invoiceUrl ? `<a href="${ad.invoiceUrl}" target="_blank">Voir le document</a>` : 'Non fournie'}</p>
            `;

            if (ad.category === 'Électronique') {
                proofHtml += `
                    <p><strong>Numéro de série:</strong> ${ad.serialNumber || 'N/A'}</p>
                    <p><strong>Vidéo:</strong> ${ad.videoProofUrl ? `<a href="${ad.videoProofUrl}" target="_blank">Voir la vidéo</a>` : 'Non fournie'}</p>
                `;
            } else { // Vêtements et autres
                proofHtml += `
                    <h4 style="font-size:1rem; margin-top:0.5rem;">Photos de vérification :</h4>
                    <div class="proof-grid">
                        ${ad.angleFront ? `<a href="${ad.angleFront}" target="_blank"><img src="${ad.angleFront}" class="proof-img" title="Face"></a>` : ''}
                        ${ad.angleSide ? `<a href="${ad.angleSide}" target="_blank"><img src="${ad.angleSide}" class="proof-img" title="Profil"></a>` : ''}
                        ${ad.angleSole ? `<a href="${ad.angleSole}" target="_blank"><img src="${ad.angleSole}" class="proof-img" title="Semelle"></a>` : ''}
                        ${ad.angleLabel ? `<a href="${ad.angleLabel}" target="_blank"><img src="${ad.angleLabel}" class="proof-img" title="Étiquette"></a>` : ''}
                    </div>
                    ${!ad.angleFront && !ad.angleSide && !ad.angleSole && !ad.angleLabel ? '<p style="color:#666; font-style:italic;">Aucune photo fournie.</p>' : ''}
                `;
            }
            proofHtml += `</div>`;

            content.innerHTML = `
                <div class="product-detail-wrapper" style="box-shadow:none; padding:0;">
                    <div class="product-image">
                        <img src="${ad.image}" alt="${ad.title}" style="max-height:300px;">
                    </div>
                    <div class="product-info">
                        <h2 style="font-size:1.8rem;">${ad.title}</h2>
                        <p class="product-price">${parseFloat(ad.price).toFixed(2)} € <span class="unit">/ unité</span></p>
                        <p><strong>Marque:</strong> ${ad.brand || 'N/A'} | <strong>Stock:</strong> ${ad.quantity} | <strong>État:</strong> ${ad.condition || 'N/A'}</p>
                        <div style="margin-top:1rem; background:#f9f9f9; padding:1rem; border-radius:8px;">
                            <p>${ad.description}</p>
                        </div>
                        ${proofHtml}
                    </div>
                </div>
            `;
            
            actions.innerHTML = `
                <button onclick="deleteAd(${ad.id}); document.getElementById('detailModal').style.display='none'" class="btn-danger">Refuser l'annonce</button>
                <div style="display:flex; gap:10px;">
                    <button onclick="updateStatus(${ad.id}, 'approved'); document.getElementById('detailModal').style.display='none'" class="btn-secondary">Publier (Non Authentifié)</button>
                    <button onclick="validateAndCertify(${ad.id}); document.getElementById('detailModal').style.display='none'" class="btn-success"><i class="fa-solid fa-certificate"></i> Valider & Certifier</button>
                </div>
            `;
            
            document.getElementById('detailModal').style.display = "block";
        };

        // Point d'entrée initial : Afficher la modale de connexion
        adminLoginModal.style.display = 'block';
    }
});


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
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = parseInt(qtyInput.value);

    // Vérifier stock global
    const existingItem = cart.find(item => item.id === id);
    const currentQtyInCart = existingItem ? existingItem.qty : 0;

    if (qty + currentQtyInCart > ad.quantity) { showToast("Stock insuffisant !", "error"); return; }
    if (qty <= 0 || isNaN(qty)) { showToast("Quantité invalide", "error"); return; }

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ id: ad.id, title: ad.title, price: ad.price, qty: qty });
    }

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
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
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
        // Promo logic
        if (item.qty >= 2 && item.qty < 3) {
             itemDiscount = itemTotal * 0.05;
             discountMsg = `<span style="color:var(--danger); font-size:0.8em">Remise 5%: -${itemDiscount.toFixed(2)}€</span>`;
        } else if (item.qty >= 3 && item.qty <= 5) {
             itemDiscount = itemTotal * 0.10;
             discountMsg = `<span style="color:var(--danger); font-size:0.8em">Remise 10%: -${itemDiscount.toFixed(2)}€</span>`;
        } else if (item.qty > 5) {
             itemDiscount = itemTotal * 0.20;
             discountMsg = `<span style="color:var(--danger); font-size:0.8em">Remise 20%: -${itemDiscount.toFixed(2)}€</span>`;
        }
        subtotal += itemTotal;
        totalDiscount += itemDiscount;

        return `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>${item.qty} x ${item.price.toFixed(2)}€</p>
                ${discountMsg}
            </div>
            <div style="display:flex; align-items:center;">
                <strong style="margin-right: 1rem;">${(itemTotal - itemDiscount).toFixed(2)}€</strong>
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
            ads[adIndex].quantity -= item.qty;
        }
    });

    localStorage.setItem('lbp_ads', JSON.stringify(ads));
    localStorage.setItem('lbp_cart', JSON.stringify([])); // Vider panier
    
    showToast("Commande validée avec succès !", "success");
    setTimeout(() => location.reload(), 2000);
};
