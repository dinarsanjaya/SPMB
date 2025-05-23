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
        try {
            const parsedData = JSON.parse(savedData);
            profileData = parsedData;
            
            // Jika ada adminKey yang disimpan, gunakan itu
            if (parsedData.adminKey) {
                adminKey = parsedData.adminKey;
            }
        } catch (e) {
            console.error("Error parsing saved data:", e);
        }
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
    document.getElementById('name').textContent = profileData.name || "Nama Anda";
    document.getElementById('bio').textContent = profileData.bio || "Deskripsi singkat";
    document.getElementById('location').innerHTML = `📍 ${profileData.location || "Lokasi"}`;
    
    // Update avatar/logo
    const avatarElement = document.getElementById('avatar');
    if (!avatarElement) return;
    
    if (profileData.avatar?.startsWith('http') || profileData.avatar?.startsWith('data:')) {
        avatarElement.innerHTML = `<img src="${profileData.avatar}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        avatarElement.textContent = profileData.avatar || "👤";
    }
    
    // Update links
    const linksContainer = document.getElementById('linksContainer');
    if (!linksContainer) return;
    
    linksContainer.innerHTML = '';
    
    (profileData.links || []).forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url || "#";
        linkElement.className = `link-item ${link.class || ""}`;
        linkElement.target = '_blank';
        linkElement.innerHTML = `
            <span class="link-icon">${link.icon || "🔗"}</span>
            ${link.name || "Link"}
        `;
        linksContainer.appendChild(linkElement);
    });
    
    // Save to localStorage
    localStorage.setItem('linktreeProfile', JSON.stringify({
        ...profileData,
        adminKey: adminKey
    }));
}

// Modal Functions
function openEditModal() {
    const modal = document.getElementById('editModal');
    if (!modal) return;
    
    document.getElementById('editName').value = profileData.name || "";
    document.getElementById('editBio').value = profileData.bio || "";
    document.getElementById('editLocation').value = profileData.location || "";
    document.getElementById('editAvatar').value = profileData.avatar || "";
    
    populateLinkEditor();
    updateAdminLinkDisplay();
    modal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
}

function populateLinkEditor() {
    const linkEditor = document.getElementById('linkEditor');
    if (!linkEditor) return;
    
    linkEditor.innerHTML = '';
    
    (profileData.links || []).forEach((link, index) => {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'link-editor';
        linkDiv.innerHTML = `
            <button class="delete-link" onclick="deleteLink(${index})">×</button>
            <div class="form-group">
                <label>Nama Link:</label>
                <input type="text" id="linkName${index}" value="${link.name || ""}">
            </div>
            <div class="form-group">
                <label>URL:</label>
                <input type="text" id="linkUrl${index}" value="${link.url || ""}">
            </div>
            <div class="form-group">
                <label>Icon (emoji):</label>
                <input type="text" id="linkIcon${index}" value="${link.icon || ""}" maxlength="2">
            </div>
            <div class="form-group">
                <label>Class (instagram, twitter, etc):</label>
                <input type="text" id="linkClass${index}" value="${link.class || ""}">
            </div>
        `;
        linkEditor.appendChild(linkDiv);
    });
}

function addNewLink() {
    if (!profileData.links) profileData.links = [];
    profileData.links.push({
        name: "Link Baru",
        url: "https://example.com",
        icon: "🔗",
        class: "website"
    });
    populateLinkEditor();
}

function deleteLink(index) {
    if (profileData.links && profileData.links.length > index) {
        profileData.links.splice(index, 1);
        populateLinkEditor();
    }
}

function saveChanges() {
    // Update profile data
    profileData = {
        ...profileData,
        name: document.getElementById('editName')?.value || "Nama Anda",
        bio: document.getElementById('editBio')?.value || "Deskripsi singkat",
        location: document.getElementById('editLocation')?.value || "Lokasi",
        avatar: document.getElementById('editAvatar')?.value || "👤"
    };
    
    // Update links
    const linkEditors = document.querySelectorAll('.link-editor');
    profileData.links = [];
    
    linkEditors.forEach((editor, index) => {
        profileData.links.push({
            name: document.getElementById(`linkName${index}`)?.value || "Link",
            url: document.getElementById(`linkUrl${index}`)?.value || "#",
            icon: document.getElementById(`linkIcon${index}`)?.value || "🔗",
            class: document.getElementById(`linkClass${index}`)?.value || ""
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
    const adminLogin = document.getElementById('adminLogin');
    if (adminLogin) adminLogin.style.display = 'flex';
}

function closeAdminLogin() {
    const adminLogin = document.getElementById('adminLogin');
    if (adminLogin) adminLogin.style.display = 'none';
}

function handleAdminKeyPress(event) {
    if (event.key === 'Enter') {
        checkAdminLogin();
    }
}

function checkAdminLogin() {
    const passwordInput = document.getElementById('adminPassword');
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    if (password === adminKey) {
        enableAdminMode();
        closeAdminLogin();
    } else {
        alert('❌ Password salah!');
        passwordInput.value = '';
    }
}

function enableAdminMode() {
    isAdminMode = true;
    
    const editControls = document.getElementById('editControls');
    const adminStatus = document.getElementById('adminStatus');
    
    if (editControls) editControls.style.display = 'flex';
    if (adminStatus) adminStatus.style.display = 'block';
    
    localStorage.setItem('adminMode', 'true');
    
    // Update URL without admin params for security
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
}

function logoutAdmin() {
    isAdminMode = false;
    
    const editControls = document.getElementById('editControls');
    const adminStatus = document.getElementById('adminStatus');
    
    if (editControls) editControls.style.display = 'none';
    if (adminStatus) adminStatus.style.display = 'none';
    
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
    updateDisplay(); // Save new admin key
    alert('🔑 Admin key baru telah di-generate!\nJangan lupa copy link yang baru.');
}

function updateAdminLinkDisplay() {
    const adminLinkElement = document.getElementById('adminLink');
    if (adminLinkElement) {
        adminLinkElement.textContent = generateAdminLink();
    }
}

// Export Functions
function exportJSON() {
    const configData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        profile: profileData,
        adminKey: adminKey
    };
    
    try {
        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(profileData.name || "linktree").replace(/\s+/g, '_').toLowerCase()}_config.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error("Export error:", error);
        alert(`❌ Gagal export: ${error.message}`);
    }
}

// Import Functions
function importConfig() {
    const fileInput = document.getElementById('configFileInput');
    if (fileInput) {
        fileInput.value = ''; // Reset untuk memungkinkan import file yang sama
        fileInput.click();
    }
}

function handleConfigImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const configData = JSON.parse(e.target.result);
            if (configData.profile) {
                // Update profile data
                profileData = configData.profile;
                
                // Update admin key if included
                if (configData.adminKey) {
                    adminKey = configData.adminKey;
                }
                
                // Update form fields in modal if it's open
                const modal = document.getElementById('editModal');
                if (modal && modal.style.display === 'block') {
                    document.getElementById('editName').value = profileData.name || "";
                    document.getElementById('editBio').value = profileData.bio || "";
                    document.getElementById('editLocation').value = profileData.location || "";
                    document.getElementById('editAvatar').value = profileData.avatar || "";
                    populateLinkEditor();
                }
                
                // Update display
                updateDisplay();
                alert('✅ Konfigurasi berhasil di-import!');
            } else {
                alert('❌ Format file tidak valid!');
            }
        } catch (error) {
            console.error("Import error:", error);
            alert('❌ Error membaca file: ' + error.message);
        }
    };
    reader.onerror = function() {
        alert('❌ Gagal membaca file!');
    };
    reader.readAsText(file);
}
