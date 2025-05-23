// Data default
let profileData = {
    name: "Nama Anda",
    bio: "Deskripsi singkat tentang diri Anda atau bisnis Anda",
    location: "Jakarta, Indonesia",
    avatar: "👤",
    links: [
        { name: "Instagram", url: "https://instagram.com/username", icon: "📷", class: "instagram" },
        { name: "Twitter", url: "https://twitter.com/username", icon: "🐦", class: "twitter" },
        { name: "YouTube", url: "https://youtube.com/c/username", icon: "📺", class: "youtube" },
        { name: "LinkedIn", url: "https://linkedin.com/in/username", icon: "💼", class: "linkedin" },
        { name: "Website", url: "https://website.com", icon: "🌐", class: "website" },
        { name: "Email", url: "mailto:email@example.com", icon: "✉️", class: "email" }
    ]
};

// Admin System
let adminKey = 'admin_' + Math.random().toString(36).substring(2, 15);
let isAdminMode = false;

// Initialize on page load
window.onload = function() {
    // Load saved data from localStorage if available
    const savedData = localStorage.getItem('linktreeProfile');
    if (savedData) {
        profileData = JSON.parse(savedData);
    }
    
    // Check for admin access
    checkURLForAdmin();
    
    // Initialize display
    updateDisplay();
    
    // Check if admin mode was previously enabled
    if (localStorage.getItem('adminMode') === 'true') {
        enableAdminMode();
    }
};

// Update the display with current data
function updateDisplay() {
    // Update profile
    document.getElementById('name').textContent = profileData.name;
    document.getElementById('bio').textContent = profileData.bio;
    document.getElementById('location').innerHTML = `📍 ${profileData.location}`;
    
    // Update avatar/logo
    const avatarElement = document.getElementById('avatar');
    if (profileData.avatar.startsWith('http') || profileData.avatar.startsWith('data:')) {
        avatarElement.innerHTML = `<img src="${profileData.avatar}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        avatarElement.textContent = profileData.avatar;
    }
    
    // Update links
    const linksContainer = document.getElementById('linksContainer');
    linksContainer.innerHTML = '';
    
    profileData.links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.className = `link-item ${link.class}`;
        linkElement.target = '_blank';
        linkElement.innerHTML = `
            <span class="link-icon">${link.icon}</span>
            ${link.name}
        `;
        linksContainer.appendChild(linkElement);
    });
    
    // Save to localStorage
    localStorage.setItem('linktreeProfile', JSON.stringify(profileData));
}

// Modal Functions
function openEditModal() {
    document.getElementById('editName').value = profileData.name;
    document.getElementById('editBio').value = profileData.bio;
    document.getElementById('editLocation').value = profileData.location;
    document.getElementById('editAvatar').value = profileData.avatar;
    
    populateLinkEditor();
    updateAdminLinkDisplay();
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function populateLinkEditor() {
    const linkEditor = document.getElementById('linkEditor');
    linkEditor.innerHTML = '';
    
    profileData.links.forEach((link, index) => {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'link-editor';
        linkDiv.innerHTML = `
            <button class="delete-link" onclick="deleteLink(${index})">×</button>
            <div class="form-group">
                <label>Nama Link:</label>
                <input type="text" id="linkName${index}" value="${link.name}">
            </div>
            <div class="form-group">
                <label>URL:</label>
                <input type="text" id="linkUrl${index}" value="${link.url}">
            </div>
            <div class="form-group">
                <label>Icon (emoji):</label>
                <input type="text" id="linkIcon${index}" value="${link.icon}" maxlength="2">
            </div>
            <div class="form-group">
                <label>Class (instagram, twitter, etc):</label>
                <input type="text" id="linkClass${index}" value="${link.class}">
            </div>
        `;
        linkEditor.appendChild(linkDiv);
    });
}

function addNewLink() {
    profileData.links.push({
        name: "Link Baru",
        url: "https://example.com",
        icon: "🔗",
        class: "website"
    });
    populateLinkEditor();
}

function deleteLink(index) {
    profileData.links.splice(index, 1);
    populateLinkEditor();
}

function saveChanges() {
    // Update profile data
    profileData.name = document.getElementById('editName').value;
    profileData.bio = document.getElementById('editBio').value;
    profileData.location = document.getElementById('editLocation').value;
    profileData.avatar = document.getElementById('editAvatar').value;
    
    // Update links
    profileData.links = [];
    const linkEditors = document.querySelectorAll('.link-editor');
    
    linkEditors.forEach((editor, index) => {
        profileData.links.push({
            name: document.getElementById(`linkName${index}`).value,
            url: document.getElementById(`linkUrl${index}`).value,
            icon: document.getElementById(`linkIcon${index}`).value,
            class: document.getElementById(`linkClass${index}`).value
        });
    });
    
    updateDisplay();
    closeEditModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeEditModal();
    }
    
    const adminLogin = document.getElementById('adminLogin');
    if (event.target == adminLogin) {
        closeAdminLogin();
    }
}

// Admin Functions
function checkURLForAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const keyParam = urlParams.get('key');
    
    if (adminParam === 'true' && keyParam === adminKey) {
        enableAdminMode();
    } else if (adminParam === 'login') {
        showAdminLogin();
    }
}

function showAdminLogin() {
    document.getElementById('adminLogin').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('adminLogin').style.display = 'none';
}

function handleAdminKeyPress(event) {
    if (event.key === 'Enter') {
        checkAdminLogin();
    }
}

function checkAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === adminKey) {
        enableAdminMode();
        document.getElementById('adminLogin').style.display = 'none';
    } else {
        alert('❌ Password salah!');
        document.getElementById('adminPassword').value = '';
    }
}

function enableAdminMode() {
    isAdminMode = true;
    document.getElementById('editControls').style.display = 'flex';
    document.getElementById('adminStatus').style.display = 'block';
    localStorage.setItem('adminMode', 'true');
    
    // Update URL without admin params for security
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
}

function logoutAdmin() {
    isAdminMode = false;
    document.getElementById('editControls').style.display = 'none';
    document.getElementById('adminStatus').style.display = 'none';
    localStorage.removeItem('adminMode');
}

function generateAdminLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?admin=true&key=${adminKey}`;
}

function copyAdminLink() {
    const link = generateAdminLink();
    navigator.clipboard.writeText(link).then(() => {
        alert('🎉 Admin link berhasil di-copy!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('🎉 Admin link berhasil di-copy!');
    });
}

function generateNewAdminKey() {
    adminKey = 'admin_' + Math.random().toString(36).substring(2, 15);
    updateAdminLinkDisplay();
    alert('🔑 Admin key baru telah di-generate!\nJangan lupa copy link yang baru.');
}

function updateAdminLinkDisplay() {
    const adminLinkElement = document.getElementById('adminLink');
    if (adminLinkElement) {
        adminLinkElement.textContent = generateAdminLink();
    }
}

// Export Functions
function exportHTML() {
    const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profileData.name} - My Links</title>
    <style>
        ${document.querySelector('style').innerHTML}
    </style>
</head>
<body>
    <div class="container">
        <div class="profile-section">
            <div class="avatar">
                ${profileData.avatar.startsWith('http') || profileData.avatar.startsWith('data:') 
                    ? `<img src="${profileData.avatar}" alt="${profileData.name} Logo">` 
                    : profileData.avatar}
            </div>
            <div class="name">${profileData.name}</div>
            <div class="bio">${profileData.bio}</div>
            <div class="location">📍 ${profileData.location}</div>
        </div>
        
        <div class="links-section">
            ${profileData.links.map(link => `
            <a href="${link.url}" class="link-item ${link.class}" target="_blank">
                <span class="link-icon">${link.icon}</span>
                ${link.name}
            </a>`).join('')}
        </div>
        
        <div class="footer">
            <p>Dibuat dengan ❤️</p>
        </div>
    </div>
</body>
</html>`;

    // Create and download file
    const blob = new Blob([htmlTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profileData.name.replace(/\s+/g, '_').toLowerCase()}_linktree.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also export config
    exportConfig();
    
    alert('🎉 HTML dan Config berhasil di-export!\n\nFile HTML siap untuk di-upload ke Vercel/Netlify.');
}

function exportConfig() {
    const configData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        profile: profileData,
        adminKey: adminKey
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profileData.name.replace(/\s+/g, '_').toLowerCase()}_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import Functions
function importConfig() {
    document.getElementById('configFileInput').click();
}

function handleConfigImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const configData = JSON.parse(e.target.result);
            if (configData.profile) {
                profileData = configData.profile;
                
                // Update admin key if included
                if (configData.adminKey) {
                    adminKey = configData.adminKey;
                }
                
                updateDisplay();
                alert('✅ Konfigurasi berhasil di-import!');
            } else {
                alert('❌ Format file tidak valid!');
            }
        } catch (error) {
            alert('❌ Error membaca file: ' + error.message);
        }
    };
    reader.readAsText(file);
}