// Fonction pour entourer les chiffres dans tous les éléments du HTML avec un <span>
function wrapNumbersInSpan() {
  // Sélectionner tous les éléments contenant du texte (par exemple, tous les <p>, <h1>, etc.)
  const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, a'); // Tu peux ajouter plus de types d'éléments ici

  elements.forEach(element => {
    // Récupérer le texte brut de l'élément
    let textContent = element.textContent;

    // Remplacer tous les chiffres dans le texte par des balises <span class="numerique">
    textContent = textContent.replace(/(\d+)/g, '<span class="numerique">$1</span>');

    // Réinjecter le texte modifié dans l'élément
    element.innerHTML = textContent;
  });
}

// Appeler la fonction après le chargement du DOM
window.addEventListener('DOMContentLoaded', function() {
  wrapNumbersInSpan();  // Appeler la fonction quand le DOM est prêt
});



document.addEventListener('DOMContentLoaded', function() {
    console.log('Début initialisation modal');
    
    // Récupération des éléments
    const modalElement = document.getElementById('catalogueModal');
    const form = document.getElementById('catalogueForm');
    const emailInput = document.getElementById('emailInput');
    const acceptCheckbox = document.getElementById('acceptCheckbox');
    const submitBtn = document.getElementById('submitBtn');
    const successAlert = document.getElementById('successAlert');
    
    // Vérifier que tous les éléments existent
    console.log('Modal element:', modalElement);
    console.log('Form:', form);
    console.log('Email input:', emailInput);
    console.log('Checkbox:', acceptCheckbox);
    console.log('Submit button:', submitBtn);
    console.log('Success alert:', successAlert);
    
    if (!modalElement || !form || !emailInput || !acceptCheckbox || !submitBtn || !successAlert) {
        console.error('Un ou plusieurs éléments sont introuvables!');
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);

    // Validation du formulaire en temps réel
    function validateForm() {
        const email = emailInput.value.trim();
        const isAccepted = acceptCheckbox.checked;
        const isValid = email && isAccepted && emailInput.validity.valid;
        
        console.log('Validation:', {email, isAccepted, isValid});
        
        submitBtn.disabled = !isValid;
    }

    emailInput.addEventListener('input', function() {
        console.log('Email changé:', emailInput.value);
        validateForm();
    });
    
    acceptCheckbox.addEventListener('change', function() {
        console.log('Checkbox changée:', acceptCheckbox.checked);
        validateForm();
    });

    // Validation initiale
    validateForm();

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulaire soumis!');
        
        const email = emailInput.value.trim();
        const isAccepted = acceptCheckbox.checked;

        if (email && isAccepted) {
            console.log('Envoi des données:', {email, isAccepted});

            fetch('votre-url-backend.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    accepte_catalogue: isAccepted
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Succès:', data);
                showSuccess();
            })
            .catch((error) => {
                console.error('Erreur:', error);
                // Afficher quand même le succès pour test
                showSuccess();
            });
        }
    });

    // Fonction pour afficher le succès
    function showSuccess() {
        console.log('Affichage du message de succès');
        form.style.display = 'none';
        successAlert.classList.remove('d-none');
        
        setTimeout(function() {
            modal.hide();
            setTimeout(function() {
                form.reset();
                form.style.display = 'block';
                successAlert.classList.add('d-none');
                validateForm();
            }, 300);
        }, 2000);
    }

    // Réinitialiser le formulaire quand le modal est fermé
    modalElement.addEventListener('hidden.bs.modal', function() {
        console.log('Modal fermé - réinitialisation');
        form.reset();
        form.style.display = 'block';
        successAlert.classList.add('d-none');
        validateForm();
    });
    
    console.log('Initialisation terminée');
});


// JS POUR LA RECUPERATION DES ARTICLES 
const API_BASE_URL = 'https://www.tbads.eu/greta/kercode/ajax/';
const ARTICLES_TO_DISPLAY = 2;

// Fonction pour créer un extrait de texte
function createExcerpt(content, maxLength = 120) {
    return content.join(' ').length <= maxLength ? content.join(' ') : content.join(' ').substring(0, maxLength) + '...';
}

// Fonction pour convertir le nom du mois en numéro
function getMonthNumber(monthName) {
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return mois.indexOf(monthName.toLowerCase()) + 1;
}

// Récupérer un article
async function fetchArticle(articleNumber) {
    const response = await fetch(`${API_BASE_URL}?article=${articleNumber}`);
    const article = await response.json();
    const monthNumber = getMonthNumber(article.date.month);
    const articleDate = new Date(parseInt(article.date.year), monthNumber - 1, parseInt(article.date.day));
    return {
        number: articleNumber,
        data: article,
        timestamp: articleDate.getTime()
    };
}

// Récupérer et trier les articles
async function fetchAndSortArticles() {
    const promises = [1, 2, 3, 4, 5].map(i => fetchArticle(i));
    const articles = await Promise.all(promises);
    return articles.sort((a, b) => b.timestamp - a.timestamp);
}

// Afficher un article dans le modal
function showArticleModal(article) {
    const articleData = article.data;
    const dateFormatted = `${articleData.date.day} ${articleData.date.month} ${articleData.date.year}`;
    const modalContent = document.getElementById('modalArticleContent');
    
    let htmlContent = `<h4 class="fw-bold mb-3">${articleData.title}</h4>`;
    if (articleData.author) {
        htmlContent += `<p class="text-muted mb-2"><strong>Auteur :</strong> ${articleData.author.name} ${articleData.author.surname}</p>`;
    }
    htmlContent += `<p class="text-muted mb-3"><strong>Date :</strong> ${dateFormatted}</p>`;
    if (articleData.keyword) {
        htmlContent += `<div class="mb-3"><strong>Mots-clés :</strong> ${articleData.keyword.map(k => `<span class="badge bg-secondary me-1">${k}</span>`).join(' ')}</div>`;
    }
    if (articleData.picture) {
        htmlContent += `<img src="${articleData.picture}" class="img-fluid mb-4 rounded" alt="${articleData.title}">`;
    }
    htmlContent += `<hr class="my-4">${articleData.content.map(p => `<p class="mb-3">${p}</p>`).join('')}`;
    
    modalContent.innerHTML = htmlContent;
    new bootstrap.Modal(document.getElementById('articleModal')).show();
}

// Mettre à jour une carte HTML avec les données de l'article
function updateArticleCard(cardElement, article) {
    const articleData = article.data;
    const dateFormatted = `${articleData.date.day} ${articleData.date.month} ${articleData.date.year}`;
    const excerpt = createExcerpt(articleData.content);

    cardElement.querySelector('h6').textContent = dateFormatted;
    cardElement.querySelector('.card-text').textContent = excerpt;
    cardElement.querySelector('button').addEventListener('click', () => showArticleModal(article));
}

// Charger et afficher les articles
function loadLatestArticles() {
    const cards = document.querySelectorAll('.article-card');
    fetchAndSortArticles()
        .then(sortedArticles => {
            const latestArticles = sortedArticles.slice(0, ARTICLES_TO_DISPLAY);
            latestArticles.forEach((article, index) => updateArticleCard(cards[index], article));
        });
}

// Initialisation après le chargement du DOM
document.addEventListener('DOMContentLoaded', loadLatestArticles);
