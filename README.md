# VA ST² - Variable Analysis System for Time Series & Transients

## Overview
VA ST² (Variable Analysis System for Time Series & Transients) is a comprehensive web-based platform for analyzing time series data in astrophysics. It provides an integrated environment for data ingestion, analysis, visualization, and modeling of astronomical time series data, with a particular focus on high-energy astrophysics.

## Features

### Data Management
- Support for multiple file formats (FITS, CSV, TXT, ASCII)
- User authentication and file ownership
- Public/private data sharing options
- Metadata extraction and storage

### Analysis Capabilities
- **QuickLook Analysis**:
  - Event List Analysis
  - Light Curve Generation
  - Power Spectrum Analysis
  - Cross-Spectrum Analysis
  - Averaged Power & Cross Spectra
  - Dynamical Power Spectra
  - Coherence Analysis
  - Cross/Auto Correlation Functions
  - Dead Time Corrections
  - Bispectrum
  - Covariance Spectra
  - Variable Energy Spectra
  - RMS & Lag-Energy Spectra
  - Excess Variance Spectra

- **Utilities**:
  - Statistical Functions
  - Good Time Interval (GTI) Handling
  - I/O Functionality
  - Mission-Specific I/O Adapters
  - Miscellaneous Data Tools

- **Modeling**:
  - Six different modeling approaches for time series data

- **Specialized Analysis**:
  - Pulsar Analysis
  - Time Series Simulation

### Technical Architecture
- **Frontend**: React.js with Material UI, TypeScript, and Vite
- **Backend**: Django with Django REST Framework
- **Analysis Core**: Modular system supporting multiple analysis backends
  - Stingray backend
  - Lightkurve backend
  - Astropy backend
- **Data Processing**: Asynchronous processing with Celery and Redis
- **Visualization**: Interactive plotting with Bokeh

## System Requirements
- Python 3.10+
- Node.js 18.0+
- Redis (for Celery task queue)

## Installation

### Backend Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/VAST.git
cd VAST
```

2. Set up a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Apply database migrations:
```bash
cd backend
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Start the backend server:
```bash
python manage.py runserver
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage
1. Access the web interface at `http://localhost:5173`
2. Log in with your credentials
3. Upload your time series data files
4. Select an analysis method from the available options
5. Configure analysis parameters and run the analysis
6. View and interpret results through interactive visualizations
7. Save and export your results

## Project Structure
```
VAST/
├── backend/               # Django backend
│   ├── accounts_app/      # User authentication and management
│   ├── analysis_app/      # Analysis request handling
│   ├── data_app/          # Data file management
│   ├── analysis_core/     # Core analysis functionality
│   │   ├── stingray_backend.py   # Stingray library integration
│   │   ├── lightkurve_backend.py # Lightkurve library integration
│   │   ├── astropy_backend.py    # Astropy library integration
│   │   ├── base.py               # Abstract base classes
│   │   ├── param_defs.py         # Parameter definitions
│   │   ├── plot_util.py          # Plotting utilities
│   │   └── tests/                # Unit tests for analysis core
│   ├── vast/              # Django project settings
│   ├── manage.py          # Django management script
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment variables template
├── frontend/              # React + Vite frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── store/         # State management
│   │   ├── utils/         # Utility functions
│   │   ├── pages/         # Application pages
│   │   │   ├── data-ingestion/  # Data upload and management
│   │   │   ├── home/            # Dashboard
│   │   │   ├── modeling/        # Model fitting
│   │   │   ├── pulsar/          # Pulsar analysis
│   │   │   ├── quicklook/       # Quick analysis tools
│   │   │   ├── simulator/       # Data simulation
│   │   │   └── utilities/       # Utility functions
│   │   └── types/         # TypeScript type definitions
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.js     # Vite configuration
│   └── .env.example       # Environment variables template
└── README.md              # Project documentation
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
[Include your license information here]

## Acknowledgments
- [Stingray](https://stingray.readthedocs.io/) - Spectral-timing software package for astrophysical data
- [Lightkurve](https://docs.lightkurve.org/) - Python package for Kepler & TESS time series analysis
- [Astropy](https://www.astropy.org/) - Community Python library for astronomy

## Contact
[Your contact information or project maintainer details] 