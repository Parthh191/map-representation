# Map Representation

Live demo: [https://map-representation.vercel.app/](https://map-representation.vercel.app/)

## Overview

Map Representation is a web application that allows users to visualize geographical data by uploading spreadsheets containing location information. The application processes the data and displays it on an interactive map.

## Features

- File upload support for CSV and Excel files
- Geocoding of addresses to map coordinates
- Interactive map visualization
- Progress tracking during data processing
- Error handling and validation
- Responsive design

## File Format Requirements

The application accepts CSV or Excel files with the following columns:
- Name
- Street Address (optional)
- City
- State (optional)
- Country

Example format:
```csv
Name,Street,City,State,Country
John Doe,123 Main St,London,,UK
Jane Smith,,Paris,,France
```

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Geoapify API for geocoding
- xlsx for spreadsheet parsing

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/map-representation.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
GEOAPIFY_API_KEY=your_api_key_here
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
