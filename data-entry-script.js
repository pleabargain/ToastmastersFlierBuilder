// JavaScript for data-entry.html
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentData = null;
    let errorLog = [];
    
    // DOM Elements
    const loadJsonBtn = document.getElementById('load-json');
    const saveJsonBtn = document.getElementById('save-json');
    const previewFlierBtn = document.getElementById('preview-flier');
    const newFlierBtn = document.getElementById('new-flier');
    const jsonFileInput = document.getElementById('json-file-input');
    const errorLogElement = document.getElementById('error-log');
    const errorLogContent = document.getElementById('error-log-content');
    const tmodPhotoType = document.getElementById('tmod-photo-type');
    const tmodPhotoLocalGroup = document.getElementById('tmod-photo-local-group');
    const tmodPhotoUrlGroup = document.getElementById('tmod-photo-url-group');
    const tmodPhotoLocal = document.getElementById('tmod-photo-local');
    const tmodPhotoUrl = document.getElementById('tmod-photo-url');
    const tmodPhotoPath = document.getElementById('tmod-photo-path');
    const tmodPhotoPreview = document.getElementById('tmod-photo-preview');
    
    // Logger functions
    const Logger = {
        log: function(level, message, data = null) {
            const timestamp = new Date().toISOString();
            const logEntry = `${timestamp} [${level}] ${message} ${data ? JSON.stringify(data) : ''}`;
            
            console.log(logEntry);
            
            if (level === 'ERROR') {
                this.appendToErrorLog(logEntry);
            }
            
            return logEntry;
        },
        
        appendToErrorLog: function(message) {
            errorLog.push(message);
            this.updateErrorLogDisplay();
            this.saveErrorLog();
        },
        
        updateErrorLogDisplay: function() {
            if (errorLog.length > 0) {
                errorLogElement.style.display = 'block';
                errorLogContent.innerHTML = '';
                
                errorLog.forEach(entry => {
                    const errorItem = document.createElement('div');
                    errorItem.textContent = entry;
                    errorLogContent.appendChild(errorItem);
                });
            } else {
                errorLogElement.style.display = 'none';
            }
        },
        
        saveErrorLog: function() {
            try {
                const logText = errorLog.join('\n');
                const blob = new Blob([logText], { type: 'text/plain' });
                
                // Create download link for error log
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dataentry-errorlog.txt';
                
                // Only trigger download if there are errors and user confirms
                if (errorLog.length > 0) {
                    // We don't auto-download, just keep the log ready
                    // User can manually save the log if needed
                }
                
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error saving error log:', error);
            }
        },
        
        downloadErrorLog: function() {
            try {
                const logText = errorLog.join('\n');
                const blob = new Blob([logText], { type: 'text/plain' });
                
                // Create download link for error log
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dataentry-errorlog.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading error log:', error);
            }
        }
    };
    
    // File operations
    const FileHandler = {
        loadJsonFile: function(file) {
            Logger.log('INFO', 'Loading JSON file', { filename: file.name });
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    try {
                        const jsonText = event.target.result;
                        const jsonData = JSON.parse(jsonText);
                        Logger.log('INFO', 'JSON file loaded successfully');
                        resolve(jsonData);
                    } catch (error) {
                        Logger.log('ERROR', 'Failed to parse JSON file', { error: error.message });
                        reject(error);
                    }
                };
                
                reader.onerror = function(event) {
                    Logger.log('ERROR', 'Failed to read JSON file', { error: event.target.error });
                    reject(new Error('Failed to read file'));
                };
                
                reader.readAsText(file);
            });
        },
        
        saveJsonFile: function(data) {
            Logger.log('INFO', 'Saving JSON file');
            
            try {
                // Validate JSON data
                if (!this.validateJsonData(data)) {
                    Logger.log('ERROR', 'Invalid JSON data');
                    return false;
                }
                
                // Generate filename based on club name and date
                let filename = 'toastmasters-flier';
                if (data.clubInfo && data.clubInfo.name) {
                    filename = data.clubInfo.name.replace(/\s+/g, '-').toLowerCase();
                }
                if (data.meetingInfo && data.meetingInfo.date) {
                    filename += '-' + data.meetingInfo.date;
                }
                filename += '.json';
                
                // Create JSON string
                const jsonString = JSON.stringify(data, null, 4);
                const blob = new Blob([jsonString], { type: 'application/json' });
                
                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                Logger.log('INFO', 'JSON file saved successfully', { filename });
                return true;
            } catch (error) {
                Logger.log('ERROR', 'Failed to save JSON file', { error: error.message });
                return false;
            }
        },
        
        validateJsonData: function(data) {
            try {
                // Check if data is an object
                if (typeof data !== 'object' || data === null) {
                    Logger.log('ERROR', 'Data is not an object');
                    return false;
                }
                
                // Check required sections
                if (!data.clubInfo || !data.meetingInfo || !data.theme || !data.tmod || !data.contactPersons) {
                    Logger.log('ERROR', 'Missing required sections in data');
                    return false;
                }
                
                // Check clubInfo
                if (!data.clubInfo.name || !data.clubInfo.number || !data.clubInfo.area || 
                    !data.clubInfo.division || !data.clubInfo.district) {
                    Logger.log('ERROR', 'Missing required fields in clubInfo');
                    return false;
                }
                
                // Check meetingInfo
                if (!data.meetingInfo.number || !data.meetingInfo.date || !data.meetingInfo.timeStart || 
                    !data.meetingInfo.timeEnd || !data.meetingInfo.location) {
                    Logger.log('ERROR', 'Missing required fields in meetingInfo');
                    return false;
                }
                
                // Check theme
                if (!Array.isArray(data.theme.lines) || data.theme.lines.length === 0) {
                    Logger.log('ERROR', 'Theme lines must be a non-empty array');
                    return false;
                }
                
                // Check tmod
                if (!data.tmod.name) {
                    Logger.log('ERROR', 'Missing required fields in tmod');
                    return false;
                }
                
                // Check contactPersons
                if (!Array.isArray(data.contactPersons) || data.contactPersons.length === 0) {
                    Logger.log('ERROR', 'Contact persons must be a non-empty array');
                    return false;
                }
                
                return true;
            } catch (error) {
                Logger.log('ERROR', 'Error validating JSON data', { error: error.message });
                return false;
            }
        }
    };
    
    // Form operations
    const FormHandler = {
        populateForm: function(data) {
            Logger.log('INFO', 'Populating form with data');
            
            try {
                // Club Info
                document.getElementById('club-name').value = data.clubInfo.name || '';
                document.getElementById('club-number').value = data.clubInfo.number || '';
                document.getElementById('club-area').value = data.clubInfo.area || '';
                document.getElementById('club-division').value = data.clubInfo.division || '';
                document.getElementById('club-district').value = data.clubInfo.district || '';
                
                // Meeting Info
                document.getElementById('meeting-number').value = data.meetingInfo.number || '';
                document.getElementById('meeting-date').value = data.meetingInfo.date || '';
                document.getElementById('meeting-time-start').value = data.meetingInfo.timeStart || '';
                document.getElementById('meeting-time-end').value = data.meetingInfo.timeEnd || '';
                document.getElementById('meeting-location').value = data.meetingInfo.location || '';
                
                // Theme Lines
                if (data.theme && data.theme.lines) {
                    data.theme.lines.forEach((line, index) => {
                        if (index < 3) { // Max 3 theme lines
                            document.getElementById(`theme-text-${index}`).value = line.text || '';
                            document.getElementById(`theme-size-${index}`).value = line.size || 44;
                            
                            // Handle color (string or array)
                            let color = line.color;
                            if (Array.isArray(color)) {
                                color = color[0] === 'WHITE' ? '#FFFFFF' : color[0];
                            } else if (color === 'WHITE') {
                                color = '#FFFFFF';
                            }
                            
                            document.getElementById(`theme-color-${index}`).value = color || '#FFDF6C';
                            document.getElementById(`theme-color-text-${index}`).value = color || '#FFDF6C';
                            
                            document.getElementById(`theme-offset-x-${index}`).value = line.offset?.x || 0;
                            document.getElementById(`theme-offset-y-${index}`).value = line.offset?.y || (index * 30);
                            
                            if (line.hasDecoration && line.decoration) {
                                document.getElementById(`theme-decoration-type-${index}`).value = line.decoration.type || 'none';
                                document.getElementById(`theme-decoration-position-${index}`).value = line.decoration.position || 'topRight';
                            }
                        }
                    });
                }
                
                // TMOD
                document.getElementById('tmod-name').value = data.tmod.name || '';
                document.getElementById('tmod-photo-path').value = data.tmod.photoPath || '';
                
                // Set photo type based on path
                if (!data.tmod.photoPath) {
                    document.getElementById('tmod-photo-type').value = 'none';
                    tmodPhotoLocalGroup.classList.add('hidden');
                    tmodPhotoUrlGroup.classList.add('hidden');
                } else if (data.tmod.photoPath.startsWith('http')) {
                    document.getElementById('tmod-photo-type').value = 'url';
                    document.getElementById('tmod-photo-url').value = data.tmod.photoPath;
                    tmodPhotoLocalGroup.classList.add('hidden');
                    tmodPhotoUrlGroup.classList.remove('hidden');
                    this.previewImage(data.tmod.photoPath);
                } else {
                    document.getElementById('tmod-photo-type').value = 'local';
                    tmodPhotoLocalGroup.classList.remove('hidden');
                    tmodPhotoUrlGroup.classList.add('hidden');
                }
                
                // Contact Persons
                if (data.contactPersons && data.contactPersons.length > 0) {
                    data.contactPersons.forEach((person, index) => {
                        if (index < 2) { // Max 2 contact persons
                            document.getElementById(`contact-name-${index}`).value = person.name || '';
                            document.getElementById(`contact-phone-${index}`).value = person.phone || '';
                        }
                    });
                }
                
                Logger.log('INFO', 'Form populated successfully');
            } catch (error) {
                Logger.log('ERROR', 'Failed to populate form', { error: error.message });
            }
        },
        
        collectFormData: function() {
            Logger.log('INFO', 'Collecting form data');
            
            try {
                const data = {
                    clubInfo: {
                        name: document.getElementById('club-name').value,
                        number: document.getElementById('club-number').value,
                        area: document.getElementById('club-area').value,
                        division: document.getElementById('club-division').value,
                        district: document.getElementById('club-district').value
                    },
                    meetingInfo: {
                        number: document.getElementById('meeting-number').value,
                        date: document.getElementById('meeting-date').value,
                        timeStart: document.getElementById('meeting-time-start').value,
                        timeEnd: document.getElementById('meeting-time-end').value,
                        location: document.getElementById('meeting-location').value
                    },
                    theme: {
                        lines: []
                    },
                    tmod: {
                        name: document.getElementById('tmod-name').value,
                        photoPath: document.getElementById('tmod-photo-path').value
                    },
                    contactPersons: []
                };
                
                // Theme Lines
                for (let i = 0; i < 3; i++) {
                    const text = document.getElementById(`theme-text-${i}`).value;
                    if (text) {
                        const themeLine = {
                            text: text,
                            size: parseInt(document.getElementById(`theme-size-${i}`).value) || 44,
                            color: document.getElementById(`theme-color-text-${i}`).value,
                            offset: {
                                x: parseInt(document.getElementById(`theme-offset-x-${i}`).value) || 0,
                                y: parseInt(document.getElementById(`theme-offset-y-${i}`).value) || (i * 30)
                            },
                            hasDecoration: document.getElementById(`theme-decoration-type-${i}`).value !== 'none',
                            decoration: {
                                type: document.getElementById(`theme-decoration-type-${i}`).value,
                                position: document.getElementById(`theme-decoration-position-${i}`).value
                            }
                        };
                        
                        data.theme.lines.push(themeLine);
                    }
                }
                
                // Contact Persons
                for (let i = 0; i < 2; i++) {
                    const name = document.getElementById(`contact-name-${i}`).value;
                    const phone = document.getElementById(`contact-phone-${i}`).value;
                    
                    if (name && phone) {
                        data.contactPersons.push({
                            name: name,
                            phone: phone
                        });
                    }
                }
                
                Logger.log('INFO', 'Form data collected successfully');
                return data;
            } catch (error) {
                Logger.log('ERROR', 'Failed to collect form data', { error: error.message });
                return null;
            }
        },
        
        previewImage: function(src) {
            if (!src) {
                tmodPhotoPreview.style.display = 'none';
                return;
            }
            
            tmodPhotoPreview.src = src;
            tmodPhotoPreview.style.display = 'block';
            
            // Handle image load error
            tmodPhotoPreview.onerror = function() {
                Logger.log('WARNING', 'Failed to load image preview', { src });
                tmodPhotoPreview.style.display = 'none';
            };
        },
        
        resetForm: function() {
            Logger.log('INFO', 'Resetting form');
            
            try {
                // Use embedded blank template instead of fetching to avoid CORS issues
                const blankTemplate = {
                    "clubInfo": {
                        "name": "",
                        "number": "",
                        "area": "",
                        "division": "",
                        "district": ""
                    },
                    "meetingInfo": {
                        "number": "",
                        "date": "",
                        "timeStart": "",
                        "timeEnd": "",
                        "location": ""
                    },
                    "theme": {
                        "lines": [
                            {
                                "text": "",
                                "size": 44,
                                "color": "#FFDF6C",
                                "offset": {"x": 0, "y": 0},
                                "hasDecoration": true,
                                "decoration": {"type": "circles", "position": "topRight"}
                            },
                            {
                                "text": "",
                                "size": 44,
                                "color": "#FFDF6C",
                                "offset": {"x": 0, "y": 30},
                                "hasDecoration": true,
                                "decoration": {"type": "circle", "position": "right"}
                            },
                            {
                                "text": "",
                                "size": 52,
                                "color": "#FFDF6C",
                                "offset": {"x": 0, "y": 60},
                                "hasDecoration": true,
                                "decoration": {"type": "rays", "position": "rightBottom"}
                            }
                        ]
                    },
                    "tmod": {
                        "name": "",
                        "photoPath": ""
                    },
                    "contactPersons": [
                        {"name": "", "phone": ""},
                        {"name": "", "phone": ""}
                    ]
                };
                
                currentData = blankTemplate;
                this.populateForm(blankTemplate);
                Logger.log('INFO', 'Form reset with blank template');
            } catch (error) {
                Logger.log('ERROR', 'Failed to reset form', { error: error.message });
            }
        }
    };
    
    // Image Handler
    const ImageHandler = {
        handleLocalImage: function(file) {
            Logger.log('INFO', 'Handling local image', { filename: file.name });
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    try {
                        const dataUrl = event.target.result;
                        FormHandler.previewImage(dataUrl);
                        
                        // Set the photo path to the file name
                        tmodPhotoPath.value = file.name;
                        
                        Logger.log('INFO', 'Local image loaded successfully');
                        resolve(file.name);
                    } catch (error) {
                        Logger.log('ERROR', 'Failed to process local image', { error: error.message });
                        reject(error);
                    }
                };
                
                reader.onerror = function(event) {
                    Logger.log('ERROR', 'Failed to read local image', { error: event.target.error });
                    reject(new Error('Failed to read image file'));
                };
                
                reader.readAsDataURL(file);
            });
        },
        
        handleUrlImage: function(url) {
            Logger.log('INFO', 'Handling URL image', { url });
            
            return new Promise((resolve, reject) => {
                // Create a test image to check if URL is valid
                const testImage = new Image();
                
                testImage.onload = function() {
                    FormHandler.previewImage(url);
                    tmodPhotoPath.value = url;
                    
                    Logger.log('INFO', 'URL image loaded successfully');
                    resolve(url);
                };
                
                testImage.onerror = function() {
                    Logger.log('ERROR', 'Failed to load URL image', { url });
                    reject(new Error('Failed to load image from URL'));
                };
                
                testImage.src = url;
            });
        }
    };
    
    // Preview Handler
    const PreviewHandler = {
        openPreview: function(data) {
            Logger.log('INFO', 'Opening preview');
            
            try {
                // Store current form data in localStorage
                localStorage.setItem('previewData', JSON.stringify(data));
                
                // Open index.html in a new tab
                window.open('index.html', '_blank');
                
                Logger.log('INFO', 'Preview opened successfully');
                return true;
            } catch (error) {
                Logger.log('ERROR', 'Failed to open preview', { error: error.message });
                return false;
            }
        }
    };
    
    // Event Listeners
    loadJsonBtn.addEventListener('click', function() {
        jsonFileInput.click();
    });
    
    jsonFileInput.addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            
            FileHandler.loadJsonFile(file)
                .then(data => {
                    currentData = data;
                    FormHandler.populateForm(data);
                })
                .catch(error => {
                    alert('Error loading JSON file: ' + error.message);
                });
        }
    });
    
    saveJsonBtn.addEventListener('click', function() {
        const data = FormHandler.collectFormData();
        if (data) {
            currentData = data;
            FileHandler.saveJsonFile(data);
        } else {
            alert('Error collecting form data. Please check the form and try again.');
        }
    });
    
    previewFlierBtn.addEventListener('click', function() {
        const data = FormHandler.collectFormData();
        if (data) {
            currentData = data;
            PreviewHandler.openPreview(data);
        } else {
            alert('Error collecting form data. Please check the form and try again.');
        }
    });
    
    newFlierBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to create a new flier? Any unsaved changes will be lost.')) {
            FormHandler.resetForm();
        }
    });
    
    tmodPhotoType.addEventListener('change', function() {
        const photoType = this.value;
        
        if (photoType === 'local') {
            tmodPhotoLocalGroup.classList.remove('hidden');
            tmodPhotoUrlGroup.classList.add('hidden');
        } else if (photoType === 'url') {
            tmodPhotoLocalGroup.classList.add('hidden');
            tmodPhotoUrlGroup.classList.remove('hidden');
        } else {
            tmodPhotoLocalGroup.classList.add('hidden');
            tmodPhotoUrlGroup.classList.add('hidden');
            tmodPhotoPath.value = '';
            tmodPhotoPreview.style.display = 'none';
        }
    });
    
    tmodPhotoLocal.addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            
            ImageHandler.handleLocalImage(file)
                .catch(error => {
                    alert('Error loading image: ' + error.message);
                });
        }
    });
    
    tmodPhotoUrl.addEventListener('change', function() {
        const url = this.value;
        
        if (url) {
            ImageHandler.handleUrlImage(url)
                .catch(error => {
                    alert('Error loading image from URL: ' + error.message);
                });
        }
    });
    
    // Color input synchronization
    document.querySelectorAll('input[type="color"]').forEach(colorInput => {
        const index = colorInput.id.split('-').pop();
        const textInput = document.getElementById(`theme-color-text-${index}`);
        
        colorInput.addEventListener('input', function() {
            textInput.value = this.value;
        });
        
        textInput.addEventListener('input', function() {
            colorInput.value = this.value;
        });
    });
    
    // Initialize form with LUMINOUS-JLT-DUBAI.json data
    fetch('LUMINOUS-JLT-DUBAI.json')
        .then(response => response.json())
        .then(data => {
            currentData = data;
            FormHandler.populateForm(data);
            Logger.log('INFO', 'Form initialized with LUMINOUS-JLT-DUBAI.json data');
        })
        .catch(error => {
            Logger.log('ERROR', 'Failed to load LUMINOUS-JLT-DUBAI.json', { error: error.message });
            // Fallback to blank template
            FormHandler.resetForm();
        });
});
