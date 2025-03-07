from contextlib import asynccontextmanager

from agenta_backend import celery_config
from agenta_backend.routers import (
    app_router,
    container_router,
    environment_router,
    evaluation_router,
    human_evaluation_router,
    evaluators_router,
    testset_router,
    user_profile,
    variants_router,
    bases_router,
    configs_router,
    health_router,
    permissions_router,
    projects_router,
)
from agenta_backend.open_api import open_api_tags_metadata
from agenta_backend.utils.common import isEE, isCloudProd, isCloudDev, isOss, isCloudEE
from agenta_backend.migrations.postgres.utils import (
    check_for_new_migrations,
    check_if_templates_table_exist,
)

if isEE() or isCloudProd():
    from agenta_backend.commons.services import templates_manager
elif isCloudDev() or isOss():
    from agenta_backend.services import templates_manager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from celery import Celery


from agenta_backend.dbs.postgres.observability.dao import ObservabilityDAO
from agenta_backend.core.observability.service import ObservabilityService
from agenta_backend.apis.fastapi.observability.router import ObservabilityRouter


origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://0.0.0.0:3000",
    "http://0.0.0.0:3001",
]


celery_app = Celery("agenta_app")
celery_app.config_from_object(celery_config)


@asynccontextmanager
async def lifespan(application: FastAPI, cache=True):
    """
    Lifespan initializes the database engine and load the default llm templates.

    Args:
        application: FastAPI application.
        cache: A boolean value that indicates whether to use the cached data or not.
    """

    await check_for_new_migrations()
    if await check_if_templates_table_exist():
        await templates_manager.update_and_sync_templates(cache=cache)

    yield


app = FastAPI(lifespan=lifespan, openapi_tags=open_api_tags_metadata)

allow_headers = ["Content-Type"]


if not isCloudEE():
    from agenta_backend.services.auth_helper import authentication_middleware

    app.middleware("http")(authentication_middleware)

if isCloudEE():
    import agenta_backend.cloud.main as cloud

    app, allow_headers = cloud.extend_main(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=allow_headers,
)

app.include_router(health_router.router, prefix="/health")
app.include_router(
    permissions_router.router,
    prefix="/permissions",
    tags=["Access Control"],
)
app.include_router(
    projects_router.router,
    prefix="/projects",
    tags=["Scopes"],
)
app.include_router(user_profile.router, prefix="/profile")
app.include_router(app_router.router, prefix="/apps", tags=["Apps"])
app.include_router(variants_router.router, prefix="/variants", tags=["Variants"])
app.include_router(
    evaluation_router.router, prefix="/evaluations", tags=["Evaluations"]
)
app.include_router(
    human_evaluation_router.router,
    prefix="/human-evaluations",
    tags=["Human-Evaluations"],
)
app.include_router(evaluators_router.router, prefix="/evaluators", tags=["Evaluators"])
app.include_router(testset_router.router, prefix="/testsets", tags=["Testsets"])
app.include_router(container_router.router, prefix="/containers", tags=["Containers"])
app.include_router(
    environment_router.router, prefix="/environments", tags=["Environments"]
)
app.include_router(bases_router.router, prefix="/bases", tags=["Bases"])
app.include_router(configs_router.router, prefix="/configs", tags=["Configs"])


observability = ObservabilityRouter(ObservabilityService(ObservabilityDAO()))

app.include_router(
    router=observability.router, prefix="/observability/v1", tags=["Observability"]
)

if isCloudEE():
    import agenta_backend.cloud.main as cloud

    app = cloud.extend_app_schema(app)
