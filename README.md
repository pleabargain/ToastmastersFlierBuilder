# Toastmasters Flier Builder

A lightweight HTML-based tool for generating Toastmasters meeting fliers with minimal code.

## Overview

This tool generates visually appealing fliers for Toastmasters club meetings based on JSON data. It features:

- Data-driven flier generation
- Responsive design
- Customizable themes and styling
- Extensive logging for debugging
- Data entry form for easy content creation
- Preview functionality

## Core Components

The application consists of several key files:

- **index.html**: The main flier template that renders data from data.json
- **data.json**: Contains all the meeting and club information in standard JSON format
- **script.js**: Handles data loading, parsing, and dynamic flier generation
- **data-entry.html**: Provides a user-friendly form for creating and editing flier data
- **data-entry-script.js**: Manages the data entry form functionality

## Usage

### Basic Usage

1. Update the `data.json` file with your club and meeting information
2. Open `index.html` in a web browser
3. The flier will be generated automatically
4. Save or print the page as needed

### Using the Data Entry Form

1. Open `data-entry.html` in a web browser
2. Fill in the form with your club and meeting details
3. Click "Preview Flier" to see how your flier will look
4. Click "Save JSON" to download the data file
5. (Optional) Click "Load JSON" to load previously saved data

## Data Format

The `data.json` file uses standard JSON format with the following structure:

```json
{
    "clubInfo": {
        "name": "CLUB NAME",
        "number": "CB-XXXXXXXX",
        "area": "XX",
        "division": "X",
        "district": "XXX"
    },
    "meetingInfo": {
        "number": "XX",
        "date": "YYYY-MM-DD",
        "timeStart": "X.XX PM",
        "timeEnd": "X.XX PM",
        "location": "Meeting location details"
    },
    "theme": {
        "lines": [
            {
                "text": "THEME TEXT",
                "size": 44,
                "color": "#XXXXXX",
                "offset": {"x": 0, "y": 0},
                "hasDecoration": true,
                "decoration": {"type": "TYPE", "position": "POSITION"}
            }
        ]
    },
    "tmod": {
        "name": "TMOD NAME",
        "photoPath": "photo_filename.jpg"
    },
    "contactPersons": [
        {"name": "Name", "phone": "+XXXXXXXXXXX"},
        {"name": "Name", "phone": "+XXXXXXXXXXX"}
    ]
}
```

### Theme Decoration Types

Available decoration types:
- `circles`: Multiple small circles
- `circle`: Single circle
- `rays`: Radiating lines

### Theme Decoration Positions

Available positions:
- `topRight`, `right`, `rightBottom`, etc.

## Preview Functionality

The application supports previewing fliers before saving:

1. When using the data entry form, click "Preview Flier"
2. The form data is temporarily stored in localStorage
3. The index.html page loads this data and renders the flier
4. You can make adjustments and preview again as needed

## Logging

The application logs extensive information to help with debugging:
- Function entry/exit points
- Parameter values
- Timing information
- Errors (also saved to error.log)

## Troubleshooting

If the flier doesn't render correctly:
1. Check the browser console for errors
2. Verify the data.json format is correct
3. Check error.log for detailed error information
4. Ensure all referenced image files exist in the correct location

## Running Locally

For the best experience, run the application using a local web server:

```
python -m http.server
```

Then access the application at http://localhost:8000/

## Future Enhancements

- Export to PDF/PNG
- Template selection
- Custom color schemes
- More decoration options
- Multi-language support
