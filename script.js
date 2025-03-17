/**
 * Toastmasters Flier Builder
 * JavaScript for data handling and logging
 */

// Logging system
const Logger = {
    levels: {
        INFO: 'INFO',
        WARNING: 'WARNING',
        ERROR: 'ERROR',
        DEBUG: 'DEBUG'
    },
    
    /**
     * Log a message with specified level and optional data
     * @param {string} level - Log level (INFO, WARNING, ERROR, DEBUG)
     * @param {string} message - Log message
     * @param {object} data - Optional data to log
     */
    log: function(level, message, data = null) {
        try {
            const timestamp = new Date().toISOString();
            const logEntry = `${timestamp} [${level}] ${message} ${data ? JSON.stringify(data) : ''}`;
            
            console.log(logEntry);
            
            if (level === this.levels.ERROR) {
                this.appendToErrorLog(logEntry);
            }
            
            return logEntry;
        } catch (error) {
            console.error('Logging error:', error);
            return null;
        }
    },
    
    /**
     * Append error message to error log
     * @param {string} message - Error message to append
     */
    appendToErrorLog: function(message) {
        try {
            // In browser environment, store in localStorage
            const errors = JSON.parse(localStorage.getItem('flier_errors') || '[]');
            errors.push(message);
            localStorage.setItem('flier_errors', JSON.stringify(errors));
            
            // Display in error log element if it exists
            const errorLogElement = document.getElementById('error-log');
            if (errorLogElement) {
                const errorItem = document.createElement('div');
                errorItem.textContent = message;
                errorLogElement.appendChild(errorItem);
            }
        } catch (error) {
            console.error('Error appending to error log:', error);
        }
    },
    
    /**
     * Log function entry with parameters
     * @param {string} funcName - Function name
     * @param {object} params - Function parameters
     */
    functionEntry: function(funcName, params = {}) {
        return this.log(this.levels.DEBUG, `ENTER ${funcName}`, params);
    },
    
    /**
     * Log function exit with result
     * @param {string} funcName - Function name
     * @param {object} result - Function result
     */
    functionExit: function(funcName, result = null) {
        return this.log(this.levels.DEBUG, `EXIT ${funcName}`, result);
    }
};

// Flier Generator
const FlierGenerator = {
    /**
     * Initialize the flier generator
     */
    init: function() {
        Logger.functionEntry('init');
        try {
            this.loadData()
                .then(() => {
                    this.renderFlier();
                    Logger.log(Logger.levels.INFO, 'Flier initialized successfully');
                })
                .catch(error => {
                    Logger.log(Logger.levels.ERROR, 'Failed to initialize flier', { error: error.message });
                });
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Initialization error', { error: error.message });
        }
        Logger.functionExit('init');
    },
    
    /**
     * Load data from localStorage, global variables, or data.json
     */
    loadData: async function() {
        Logger.functionEntry('loadData');
        try {
            // If data is already set (e.g., from preview data in localStorage), use it
            if (this.data) {
                Logger.log(Logger.levels.INFO, 'Using already set data');
                Logger.functionExit('loadData', { success: true });
                return;
            }
            
            // Check if data is defined globally
            if (typeof clubInfo !== 'undefined' && 
                typeof meetingInfo !== 'undefined' && 
                typeof theme !== 'undefined' && 
                typeof tmod !== 'undefined' && 
                typeof contactPersons !== 'undefined') {
                
                this.data = {
                    clubInfo,
                    meetingInfo,
                    theme,
                    tmod,
                    contactPersons
                };
                
                Logger.log(Logger.levels.INFO, 'Data loaded from global variables');
                Logger.functionExit('loadData', { success: true });
                return;
            }
            
            // Otherwise try to fetch data.json
            try {
                const response = await fetch('data.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Try to parse as standard JSON first
                try {
                    const jsonData = await response.json();
                    this.data = jsonData;
                    Logger.log(Logger.levels.INFO, 'Data loaded from data.json as standard JSON');
                    Logger.functionExit('loadData', { success: true });
                    return;
                } catch (jsonError) {
                    // If standard JSON parsing fails, try the non-standard format
                    const jsonText = await response.text();
                    
                    // Parse the non-standard JSON format
                    const dataObj = {};
                    const sections = jsonText.split('\n\n');
                    
                    for (const section of sections) {
                        if (section.trim().startsWith('clubInfo')) {
                            dataObj.clubInfo = this.parseJsonSection(section);
                        } else if (section.trim().startsWith('meetingInfo')) {
                            dataObj.meetingInfo = this.parseJsonSection(section);
                        } else if (section.trim().startsWith('theme')) {
                            dataObj.theme = this.parseJsonSection(section);
                        } else if (section.trim().startsWith('tmod')) {
                            dataObj.tmod = this.parseJsonSection(section);
                        } else if (section.trim().startsWith('contactPersons')) {
                            dataObj.contactPersons = this.parseJsonSection(section);
                        }
                    }
                    
                    this.data = dataObj;
                    Logger.log(Logger.levels.INFO, 'Data loaded from data.json as non-standard format');
                }
            } catch (error) {
                Logger.log(Logger.levels.ERROR, 'Failed to load data from data.json', { error: error.message });
                
                // Use default data as a last resort
                this.data = {
                    clubInfo: {
                        name: "TOASTMASTERS CLUB",
                        number: "12345",
                        area: "1",
                        division: "A",
                        district: "100"
                    },
                    meetingInfo: {
                        number: "1",
                        date: new Date().toISOString().split('T')[0],
                        timeStart: "7:00 PM",
                        timeEnd: "9:00 PM",
                        location: "Meeting Room"
                    },
                    theme: {
                        lines: [
                            {text: "THEME LINE 1", size: 44, color: "#FFDF6C", offset: {x: 0, y: 0}, 
                             hasDecoration: true, decoration: {type: "circles", position: "topRight"}},
                            {text: "THEME LINE 2", size: 44, color: "#FFDF6C", offset: {x: 0, y: 30}, 
                             hasDecoration: true, decoration: {type: "circle", position: "right"}},
                            {text: "THEME LINE 3", size: 52, color: "#FFDF6C", offset: {x: 0, y: 60}, 
                             hasDecoration: true, decoration: {type: "rays", position: "rightBottom"}}
                        ]
                    },
                    tmod: {
                        name: "TOASTMASTER",
                        photoPath: ""
                    },
                    contactPersons: [
                        {name: "Contact 1", phone: "+1234567890"},
                        {name: "Contact 2", phone: "+0987654321"}
                    ]
                };
                
                Logger.log(Logger.levels.INFO, 'Using default data as fallback');
            }
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Failed to load data', { error: error.message });
            throw error;
        }
        Logger.functionExit('loadData', { success: true });
    },
    
    /**
     * Parse a section of the non-standard JSON format
     * @param {string} section - JSON section text
     * @returns {object} Parsed object
     */
    parseJsonSection: function(section) {
        Logger.functionEntry('parseJsonSection', { sectionLength: section.length });
        try {
            // Convert to standard JSON and parse
            const standardJson = section
                .replace(/(\w+):/g, '"$1":')
                .replace(/'/g, '"')
                .replace(/(\w+) = {/g, '{"$1": {')
                .replace(/\n/g, '')
                .replace(/,\s*}/g, '}');
                
            return JSON.parse(standardJson);
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Failed to parse JSON section', { 
                error: error.message,
                section: section
            });
            return {};
        }
        Logger.functionExit('parseJsonSection');
    },
    
    /**
     * Format date string to readable format
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @returns {string} Formatted date
     */
    formatDate: function(dateStr) {
        Logger.functionEntry('formatDate', { dateStr });
        try {
            const date = new Date(dateStr);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);
            Logger.functionExit('formatDate', { result: formattedDate });
            return formattedDate;
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Date formatting error', { error: error.message });
            Logger.functionExit('formatDate', { error: true });
            return dateStr;
        }
    },
    
    /**
     * Format club details string
     * @param {object} clubInfo - Club information object
     * @returns {string} Formatted club details
     */
    formatClubDetails: function(clubInfo) {
        Logger.functionEntry('formatClubDetails', { clubInfo });
        try {
            const details = `Club No ${clubInfo.number} Area ${clubInfo.area} Division ${clubInfo.division} District ${clubInfo.district}`;
            Logger.functionExit('formatClubDetails', { result: details });
            return details;
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Club details formatting error', { error: error.message });
            Logger.functionExit('formatClubDetails', { error: true });
            return '';
        }
    },
    
    /**
     * Render the flier based on loaded data
     */
    renderFlier: function() {
        Logger.functionEntry('renderFlier');
        try {
            const flierContainer = document.getElementById('flier-container');
            if (!flierContainer) {
                throw new Error('Flier container element not found');
            }
            
            if (!this.data) {
                throw new Error('No data available for rendering');
            }
            
            // Clear container
            flierContainer.innerHTML = '';
            
            // Create flier elements
            this.createHeader(flierContainer);
            this.createMainContent(flierContainer);
            this.createFooter(flierContainer);
            
            Logger.log(Logger.levels.INFO, 'Flier rendered successfully');
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Failed to render flier', { error: error.message });
        }
        Logger.functionExit('renderFlier');
    },
    
    /**
     * Create header section of the flier
     * @param {HTMLElement} container - Container element
     */
    createHeader: function(container) {
        Logger.functionEntry('createHeader');
        try {
            const header = document.createElement('header');
            header.className = 'flier-header';
            
            // Club name
            const clubName = document.createElement('h1');
            clubName.className = 'club-name';
            clubName.textContent = this.data.clubInfo.name;
            header.appendChild(clubName);
            
            // Club details
            const clubDetails = document.createElement('div');
            clubDetails.className = 'club-details';
            clubDetails.textContent = this.formatClubDetails(this.data.clubInfo);
            header.appendChild(clubDetails);
            
            // Meeting number
            const meetingNumber = document.createElement('div');
            meetingNumber.className = 'meeting-number';
            meetingNumber.textContent = `MEETING NO. ${this.data.meetingInfo.number}`;
            header.appendChild(meetingNumber);
            
            // Logo placeholder
            const logo = document.createElement('div');
            logo.className = 'tm-logo';
            logo.innerHTML = '<div class="logo-placeholder">TM</div>';
            header.appendChild(logo);
            
            container.appendChild(header);
            Logger.log(Logger.levels.INFO, 'Header created successfully');
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Failed to create header', { error: error.message });
        }
        Logger.functionExit('createHeader');
    },
    
    /**
     * Create main content section of the flier
     * @param {HTMLElement} container - Container element
     */
    createMainContent: function(container) {
        Logger.functionEntry('createMainContent');
        try {
            const mainContent = document.createElement('main');
            mainContent.className = 'flier-content';
            
            // TMOD section
            const tmodSection = document.createElement('section');
            tmodSection.className = 'tmod-section';
            
            const tmodPhoto = document.createElement('div');
            tmodPhoto.className = 'tmod-photo';
            
            // Check if we have a photo path
            if (this.data.tmod.photoPath && this.data.tmod.photoPath.trim() !== '') {
                // If it's a URL, use an img element
                if (this.data.tmod.photoPath.startsWith('http')) {
                    tmodPhoto.innerHTML = `<img src="${this.data.tmod.photoPath}" alt="${this.data.tmod.name}" />`;
                    Logger.log(Logger.levels.INFO, 'Using URL image for TMOD photo');
                } else {
                    // Otherwise try to load a local file
                    try {
                        tmodPhoto.innerHTML = `<img src="${this.data.tmod.photoPath}" alt="${this.data.tmod.name}" />`;
                        Logger.log(Logger.levels.INFO, 'Using local image for TMOD photo');
                    } catch (error) {
                        // If that fails, use a placeholder
                        tmodPhoto.classList.add('photo-placeholder');
                        tmodPhoto.textContent = this.data.tmod.name.split(' ').map(n => n[0]).join('');
                        Logger.log(Logger.levels.WARNING, 'Failed to load TMOD photo, using placeholder', { path: this.data.tmod.photoPath });
                    }
                }
            } else {
                // No photo path, use a placeholder
                tmodPhoto.classList.add('photo-placeholder');
                tmodPhoto.textContent = this.data.tmod.name.split(' ').map(n => n[0]).join('');
                Logger.log(Logger.levels.INFO, 'No photo path provided, using placeholder');
            }
            
            const tmodLabel = document.createElement('div');
            tmodLabel.className = 'tmod-label';
            tmodLabel.textContent = 'TMOD';
            
            const tmodName = document.createElement('div');
            tmodName.className = 'tmod-name';
            tmodName.textContent = `TM ${this.data.tmod.name}`;
            
            tmodSection.appendChild(tmodPhoto);
            tmodSection.appendChild(tmodLabel);
            tmodSection.appendChild(tmodName);
            
            // Theme section
            const themeSection = document.createElement('section');
            themeSection.className = 'theme-section';
            
            if (this.data.theme && this.data.theme.lines) {
                this.data.theme.lines.forEach((line, index) => {
                    const themeText = document.createElement('div');
                    themeText.className = `theme-line theme-line-${index + 1}`;
                    themeText.textContent = line.text;
                    
                    // Apply styling from theme data
                    themeText.style.fontSize = `${line.size}px`;
                    
                    // Handle color (string or array)
                    if (Array.isArray(line.color)) {
                        // For gradient or multiple colors, use the first one
                        themeText.style.color = line.color[0] === 'WHITE' ? '#FFFFFF' : line.color[0];
                    } else {
                        themeText.style.color = line.color === 'WHITE' ? '#FFFFFF' : line.color;
                    }
                    
                    // Apply offset if specified
                    if (line.offset) {
                        themeText.style.transform = `translate(${line.offset.x}px, ${line.offset.y}px)`;
                    }
                    
                    // Add decoration if specified
                    if (line.hasDecoration && line.decoration) {
                        const decoration = document.createElement('div');
                        decoration.className = `decoration ${line.decoration.type} ${line.decoration.position}`;
                        themeText.appendChild(decoration);
                    }
                    
                    themeSection.appendChild(themeText);
                });
            }
            
            // Add decorative elements
            const leftDecoration = document.createElement('div');
            leftDecoration.className = 'decoration-dots left';
            
            const rightDecoration = document.createElement('div');
            rightDecoration.className = 'decoration-dots right';
            
            mainContent.appendChild(tmodSection);
            mainContent.appendChild(themeSection);
            mainContent.appendChild(leftDecoration);
            mainContent.appendChild(rightDecoration);
            
            container.appendChild(mainContent);
            Logger.log(Logger.levels.INFO, 'Main content created successfully');
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Failed to create main content', { error: error.message });
        }
        Logger.functionExit('createMainContent');
    },
    
    /**
     * Create footer section of the flier
     * @param {HTMLElement} container - Container element
     */
    createFooter: function(container) {
        Logger.functionEntry('createFooter');
        try {
            const footer = document.createElement('footer');
            footer.className = 'flier-footer';
            
            // Date and time
            const dateTime = document.createElement('div');
            dateTime.className = 'date-time';
            dateTime.textContent = `${this.formatDate(this.data.meetingInfo.date)}, ${this.data.meetingInfo.timeStart} - ${this.data.meetingInfo.timeEnd}`;
            
            const separator1 = document.createElement('div');
            separator1.className = 'separator';
            
            // Location
            const location = document.createElement('div');
            location.className = 'location';
            location.textContent = this.data.meetingInfo.location;
            
            const separator2 = document.createElement('div');
            separator2.className = 'separator';
            
            // Contact information
            const contactInfo = document.createElement('div');
            contactInfo.className = 'contact-info';
            
            if (this.data.contactPersons && this.data.contactPersons.length > 0) {
                const contacts = this.data.contactPersons.map(person => 
                    `TM ${person.name} ${person.phone}`
                ).join('  ');
                contactInfo.textContent = contacts;
            }
            
            footer.appendChild(dateTime);
            footer.appendChild(separator1);
            footer.appendChild(location);
            footer.appendChild(separator2);
            footer.appendChild(contactInfo);
            
            container.appendChild(footer);
            Logger.log(Logger.levels.INFO, 'Footer created successfully');
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Failed to create footer', { error: error.message });
        }
        Logger.functionExit('createFooter');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Logger.log(Logger.levels.INFO, 'DOM loaded, initializing flier generator');
    
    // Check if preview data exists in localStorage
    const previewData = localStorage.getItem('previewData');
    console.log('Preview data in localStorage:', previewData);
    
    if (previewData) {
        try {
            // Parse the preview data
            const data = JSON.parse(previewData);
            console.log('Parsed preview data:', data);
            
            // Set the data for the flier generator
            FlierGenerator.data = data;
            
            // Don't clear the preview data from localStorage immediately
            // This allows refreshing the page to still show the preview
            // localStorage.removeItem('previewData');
            
            Logger.log(Logger.levels.INFO, 'Using preview data from data entry form');
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Failed to parse preview data', { error: error.message });
        }
    } else {
        console.log('No preview data found in localStorage');
    }
    
    FlierGenerator.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Logger,
        FlierGenerator
    };
}
