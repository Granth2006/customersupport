/**
 * Customer Helper - Login & Profile User Info Only
 * Shows login modal on first load until user signs in with Google
 * Displays user info in profile.html after login
 */

const loginModal = document.getElementById('loginModal');

// =========================================
// GOOGLE SIGN-IN + MODAL LOGIC
// =========================================

// Check if user is already signed in
function isUserSignedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Show modal only if user has NOT signed in yet
function showLoginModalIfNeeded() {
    if (!isUserSignedIn()) {
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    } else {
        if (loginModal) {
            loginModal.style.display = 'none';
        }
    }
}

// Handle successful Google Sign-In
function handleCredentialResponse(response) {
    const idToken = response.credential;

    // For demo: decode basic user info from ID token (JWT)
    // In production: send token to your backend for proper verification
    try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));

        const user = {
            name: payload.name || (payload.given_name + " " + (payload.family_name || "")),
            email: payload.email,
            picture: payload.picture,
            id: payload.sub
        };

        // Save login state & user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('googleUser', JSON.stringify(user));

        // Close modal
        if (loginModal) {
            loginModal.style.display = 'none';
        }

        // If we're on profile page → show user info immediately
        if (window.location.pathname.includes('profile.html')) {
            showUserInfoInProfile();
        }

        console.log("Signed in successfully:", user.name);
    } catch (err) {
        console.error("Error decoding Google response:", err);
        alert("Login failed. Please try again.");
    }
}

// Display user information in profile.html
function showUserInfoInProfile() {
    const userData = localStorage.getItem('googleUser');
    const infoSection = document.getElementById('userProfileInfo');
    const guestPlaceholder = document.getElementById('guestPlaceholder');

    if (!userData || !infoSection || !guestPlaceholder) {
        return;
    }

    const user = JSON.parse(userData);

    // Fill the profile elements
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const pictureEl = document.getElementById('userPicture');

    if (nameEl) nameEl.textContent = user.name || "User";
    if (emailEl) emailEl.textContent = user.email || "No email";
    if (pictureEl) pictureEl.src = user.picture || 'https://via.placeholder.com/80?text=User';

    // Show profile info, hide guest message
    infoSection.style.display = 'flex';
    guestPlaceholder.style.display = 'none';

    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('googleUser');
            window.location.reload();
        });
    }
}

// Initialize Google Sign-In button & logic
function initGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) {
        console.warn("Google Identity Services not loaded yet.");
        return;
    }

    google.accounts.id.initialize({
        client_id: '618760627892-3sigk02k7pphk907pnc475j2fr0au0h1.apps.googleusercontent.com',
        callback: handleCredentialResponse
    });

    const buttonContainer = document.getElementById("googleSignInButton");
    if (buttonContainer) {
        google.accounts.id.renderButton(
            buttonContainer,
            {
                theme: "outline",
                size: "large",
                text: "signin_with",
                shape: "rectangular"
            }
        );
    }
}

// =========================================
// PAGE LOAD – START EVERYTHING
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Google Sign-In
    initGoogleSignIn();

    // Show modal only if not signed in
    showLoginModalIfNeeded();

    // If on profile page → show user info
    if (window.location.pathname.includes('profile.html')) {
        showUserInfoInProfile();
    }
});