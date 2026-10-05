from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.ml.model_registry import model_registry
from backend.app.services.catalog_service import catalog_service

from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.catalog import router as catalog_router
from backend.app.api.routes.recommendations import router as recommend_router
from backend.app.api.routes.models import router as models_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing FastAPI Backend Application...")
    catalog_service.load_catalog()
    model_registry.load_all_models()
    logger.info("Startup complete. API is ready to serve requests.")

from fastapi.encoders import jsonable_encoder

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Request validation failed.",
            "details": jsonable_encoder(exc.errors())
        }
    )

# Include Routers
app.include_router(health_router, tags=["Health"])
app.include_router(catalog_router, prefix=settings.API_PREFIX, tags=["Catalog"])
app.include_router(recommend_router, prefix=settings.API_PREFIX, tags=["Recommendations"])
app.include_router(models_router, prefix=settings.API_PREFIX, tags=["Models"])

@app.get("/")
def root():
    return {
        "message": "Cloud Server Recommendation System API",
        "health": "/health",
        "docs": "/docs"
    }
