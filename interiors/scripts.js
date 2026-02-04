// Attend que tout le DOM (HTML) soit complètement chargé avant d'exécuter le code
// Cela garantit que tous les éléments HTML existent avant qu'on essaie de les manipuler
document.addEventListener('DOMContentLoaded', function() {
    
    // === RÉCUPÉRATION DES ÉLÉMENTS HTML ===
    // Récupère la référence vers le modal dans le DOM
    const modalElement = document.getElementById('catalogueModal');
    
    // Récupère la référence vers le formulaire
    const form = document.getElementById('catalogueForm');
    
    // Récupère la référence vers la zone d'alerte de succès (le message "Merci...")
    const successAlert = document.getElementById('successAlert');
    
    
    // === INITIALISATION DU MODAL BOOTSTRAP ===
    // Crée une instance Bootstrap Modal pour pouvoir contrôler le modal programmatiquement
    // (l'ouvrir, le fermer, etc. avec du JavaScript)
    const modal = new bootstrap.Modal(modalElement);

    
    // === ÉVÉNEMENT 1 : SOUMISSION DU FORMULAIRE ===
    // Écoute l'événement "submit" qui se déclenche quand on clique sur le bouton OK
    form.addEventListener('submit', function(e) {
        
        // Empêche le comportement par défaut du formulaire
        // (qui rechargerait la page ou enverrait les données à un serveur)
        e.preventDefault();
        
        // Masque le formulaire en changeant son style CSS display à "none"
        form.style.display = 'none';
        
        // Affiche le message de succès en retirant la classe Bootstrap "d-none" (display: none)
        successAlert.classList.remove('d-none');
        
        // Programme la fermeture automatique du modal après 10 secondes (10000 millisecondes)
        // setTimeout est une fonction qui exécute du code après un délai
        // La flèche => est une fonction fléchée ES6 qui appelle modal.hide()
        setTimeout(() => modal.hide(), 10000);
    });

    
    // === ÉVÉNEMENT 2 : FERMETURE DU MODAL ===
    // Écoute l'événement "hidden.bs.modal" qui se déclenche quand le modal est complètement fermé
    // (après l'animation de fermeture)
    modalElement.addEventListener('hidden.bs.modal', function() {
        
        // Réinitialise tous les champs du formulaire (vide les inputs et décoche les checkbox)
        form.reset();
        
        // Réaffiche le formulaire en restaurant son style display à "block"
        form.style.display = 'block';
        
        // Cache à nouveau le message de succès en ajoutant la classe "d-none"
        successAlert.classList.add('d-none');
        
        // Résultat : le modal est prêt à être réutilisé dans son état initial
    });
});


// === RÉCUPÉRATION ET AFFICHAGE DES ARTICLES ===

// Attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', function() {
    
    // URL de l'API
    const urlAPI = 'https://www.tbads.eu/greta/kercode/ajax/';
    
    // Récupère les 2 cartes d'articles dans la page
    const cartes = document.querySelectorAll('.article-card');
    
    // Récupère les éléments du modal
    const articleModal = document.getElementById('articleModal');
    const modalContent = document.getElementById('modalArticleContent');
    const modalTitle = document.getElementById('articleModalLabel');
    
    
    // === FONCTION : Charge un article depuis l'API ===
    async function chargerArticle(numeroArticle) {
        // Appelle l'API et attend la réponse
        const response = await fetch(urlAPI + '?article=' + numeroArticle);
        
        // Convertit la réponse en JSON
        const data = await response.json();
        return data;
    }
    
    
    // === FONCTION : Convertit le nom du mois en numéro (janvier = 1, décembre = 12) ===
    function obtenirNumeroMois(nomMois) {
        const mois = [
            'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
        ];
        
        // Trouve la position du mois dans le tableau (indexOf)
        // +1 car janvier doit être 1 et non 0
        return mois.indexOf(nomMois.toLowerCase()) + 1;
    }
    
    
    // === FONCTION : Convertit une date en timestamp (nombre) pour pouvoir la comparer ===
    function obtenirTimestamp(dateObjet) {
        // Récupère le numéro du mois
        const numeroMois = obtenirNumeroMois(dateObjet.month);
        
        // Crée un objet Date JavaScript
        // Attention : les mois JavaScript commencent à 0, donc on enlève 1
        const dateJS = new Date(
            parseInt(dateObjet.year),    // Année : 2020
            numeroMois - 1,               // Mois : 9 pour octobre (car 10-1=9)
            parseInt(dateObjet.day)       // Jour : 21
        );
        
        // Retourne le timestamp (nombre de millisecondes depuis 1970)
        return dateJS.getTime();
    }
    
    
    // === FONCTION : Crée un résumé court du contenu ===
    function creerResume(contenuTableau) {
        // Joint tous les paragraphes en un seul texte
        const texteComplet = contenuTableau.join(' ');
        
        // Si le texte fait moins de 120 caractères, on le retourne tel quel
        if (texteComplet.length <= 120) {
            return texteComplet;
        }
        
        // Sinon, on coupe à 120 caractères et on ajoute "..."
        return texteComplet.substring(0, 120) + '...';
    }
    
    
    // === FONCTION : Formate la date pour l'affichage ===
    function formaterDate(dateObjet) {
        // Construit une date au format : "21 octobre 2020"
        return dateObjet.day + ' ' + dateObjet.month + ' ' + dateObjet.year;
    }
    
    
    // === FONCTION : Met à jour une carte avec les données de l'article ===
    function mettreAJourCarte(carte, article) {
        // Formate la date
        const dateFormatee = formaterDate(article.date);
        
        // Crée un résumé du contenu
        const resume = creerResume(article.content);
        
        // Met à jour le HTML de la carte
        carte.querySelector('h6').innerHTML = '<span class="numeric">' + dateFormatee + '</span>';
        carte.querySelector('.card-text').textContent = resume;
        
        // Ajoute l'événement clic sur le bouton "+ D'INFOS"
        const bouton = carte.querySelector('button');
        bouton.addEventListener('click', function() {
            afficherArticleComplet(article);
        });
    }
    
    
  // === FONCTION : Affiche l'article complet dans le modal ===
function afficherArticleComplet(article) {
    const dateFormatee = formaterDate(article.date);
    
    // Change le titre du modal
    modalTitle.textContent = article.title;
    
    // Construit le contenu avec des balises sémantiques
    let html = '<div class="container-fluid px-3 px-lg-4">';
    
    // En-tête de l'article (date)
    html += '<header class="bg-light border border-4 rounded-0 p-3 mb-4">';
    html += '<h6 class="fw-bold mb-0"><span class="numeric">' + dateFormatee + '</span></h6>';
    html += '</header>';
    
    // Auteur si présent
    if (article.author) {
        html += '<p class="text-muted mb-3"><strong>Auteur :</strong> ' + 
                article.author.name + ' ' + article.author.surname + '</p>';
    }
    
    // Image si présente
    if (article.picture) {
        html += '<figure class="mb-4">';
        html += '<img src="' + article.picture + '" class="img-fluid rounded-0" alt="' + article.title + '">';
        html += '</figure>';
        html += '<hr class="border-top border-4 mb-4">';
    }
    
    // Contenu de l'article
    html += '<section>';
    article.content.forEach(function(paragraphe) {
        html += '<p class="mb-3">' + paragraphe + '</p>';
    });
    html += '</section>';
    
    // Fin d'article
    html += '<hr class="border-top border-4 mt-4">';
    html += '</div>';
    
    // Affiche le contenu
    modalContent.innerHTML = html;
    
    // Ouvre le modal
    const modal = new bootstrap.Modal(articleModal);
    modal.show();
}
    
    // === FONCTION PRINCIPALE : Charge tous les articles, les trie, et affiche les 2 plus récents ===
    async function chargerLesArticles() {
        try {
            // Étape 1 : Charger tous les articles (5 articles au total)
            const article1 = await chargerArticle(1);
            const article2 = await chargerArticle(2);
            const article3 = await chargerArticle(3);
            const article4 = await chargerArticle(4);
            const article5 = await chargerArticle(5);
            
            // Étape 2 : Mettre tous les articles dans un tableau
            const tousLesArticles = [article1, article2, article3, article4, article5];
            
            // Étape 3 : Trier les articles du plus récent au plus ancien
            // La fonction sort() compare les timestamps de chaque article
            tousLesArticles.sort(function(articleA, articleB) {
                const timestampA = obtenirTimestamp(articleA.date);
                const timestampB = obtenirTimestamp(articleB.date);
                
                // Si timestampB > timestampA, articleB est plus récent et passe avant
                return timestampB - timestampA;
            });
            
            // Étape 4 : Prendre les 2 articles les plus récents
            const deuxPlusRecents = [tousLesArticles[0], tousLesArticles[1]];
            
            // Étape 5 : Afficher les 2 articles dans les cartes
            mettreAJourCarte(cartes[0], deuxPlusRecents[0]);  // Premier article le plus récent
            mettreAJourCarte(cartes[1], deuxPlusRecents[1]);  // Deuxième article le plus récent
            
            console.log('Articles chargés et triés avec succès !');
            
        } catch (error) {
            // En cas d'erreur, affiche un message dans la console
            console.error('Erreur lors du chargement des articles:', error);
        }
    }
    
    
    // === DÉMARRAGE : Charge et affiche les articles ===
    chargerLesArticles();
});
