# Product Attribute Extractor (产品属性提取助手)

An intelligent tool that uses LLMs (DeepSeek, OpenAI) to extract structured product attributes from unstructured text descriptions. Features a modern React UI and a robust Flask backend.

![UI Preview](static/screenshot.png) <!-- Ideally we would have a screenshot here, but I'll leave the placeholder -->

## ✨ Features
- **Modern UI**: Built with React 18, TypeScript, TailwindCSS, and Shadcn/ui.
- **Intelligent Extraction**: Uses DeepSeek or OpenAI to parse product details.
- **Batch Processing**: Upload Excel/CSV files for bulk processing.
- **Real-time Progress**: Visual progress tracking and status updates.
- **Dockerized**: Easy deployment with Docker.

## 🚀 Quick Start

### 1. Requirements
- Docker (Recommended)
- OR Node.js 16+ & Python 3.9+ for local development

### 2. Run with Docker (Recommended)

Requires a DeepSeek API Key.

```bash
# Build the image
docker build -t product-extractor .

# Run the container (Replace YOUR_API_KEY)
docker run -d \
  --name product-extractor \
  -p 5001:5001 \
  -e DEEPSEEK_API_KEY=YOUR_API_KEY \
  product-extractor
```

Access the application at: `http://localhost:5001`

**Management Script**:
You can also use the included helper script:
```bash
./docker-manager.sh start   # Start container
./docker-manager.sh restart # Restart container
./docker-manager.sh logs    # View logs
```

### 3. Local Development

**Backend**:
```bash
# Setup venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run API
export DEEPSEEK_API_KEY="your-key"
python api_app.py
```
Backend runs on `http://localhost:5001`.

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## 🛠 Project Structure
```
product-attribute-extractor/
├── api_app.py              # Main Flask API Application
├── frontend/               # React Frontend Source
├── Dockerfile              # Docker Configuration
├── docker-manager.sh       # Docker Helper Script
├── requirements.txt        # Python Dependencies
├── uploads/                # Temporary Upload Directory
└── results/                # Processing Results Directory
```

## 🔌 API Endpoints
- `GET /api/health`: Health check
- `POST /api/tasks`: Create extraction task
- `GET /api/tasks/{id}`: Check task status
- `GET /api/download/{filename}`: Download results

## 🔧 Configuration
Environment variables:
- `DEEPSEEK_API_KEY`: Required for extraction.
- `PORT`: Server port (default 5001).
- `FLASK_ENV`: `production` or `development`.

## 📦 Deployment
This project is ready for deployment on:
- **Docker**: See Quick Start.
- **Railway**: Connect your GitHub repo and set `DEEPSEEK_API_KEY`.
- **Sealos/K8s**: Use the provided `Dockerfile` or `sealos-deploy.yaml`.