import os
import os.path
import warnings
from subprocess import Popen

import httpx
from pydantic import BaseModel
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import load_config, load_turn_config, EMountType
from static_files import FTPStaticFiles, SPAStaticFiles, PageStaticFiles


config = load_config("/configuration/interface.yaml")
turn_config = load_config("/configuration/turn.yaml")

if turn_config is None:
    print("[WARN]", "Cannot load TURN configuration")

templates = Jinja2Templates(directory="templates")

ssl = {
    "ssl_keyfile": os.path.join(os.getcwd(), config.ssl.key),
    "ssl_certfile": os.path.join(os.getcwd(), config.ssl.certificate)
}

app = FastAPI()

# region Models

class IceServers(BaseModel):
    urls: list[str]
    username: str
    credential: str

class IceServersResponse(BaseModel):
    iceServers: IceServers

# endregion

# region Routes

@app.get("/rxsioCA.pem")
async def download_certificate():
    certificate_path = os.path.join(os.getcwd(), config.ssl.root)
    return FileResponse(certificate_path)


@app.post("/networkTest")
async def network_test():
    return "Test passed"


@app.get("/getCamerasConfiguration")
async def get_cameras_configuration() -> IceServers:
    if turn_config is None or not turn_config.enable:
        raise HTTPException(status_code=501, detail="Not available")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {config_turn.apiToken}",
            "Content-Type": "application/json",
        }
        payload = {"ttl": 86400}

        try:
            response = await client.post(
                config_turn.url.format(TURN_TOKEN=config_turn.turnToken),
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json().get("iceServers")
        except httpx.HTTPStatusError as e:
            print("[ERROR]", str(e))
            raise HTTPException(status_code=501, detail="Not available")
        except httpx.RequestError as e:
            print("[ERROR]", str(e))
            raise HTTPException(status_code=501, detail="Not available")

# endregion

# region Handlers

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    print(dir(exc), exc)
    return templates.TemplateResponse(
        "error.jinja",
        {
            "request": request,
            "error": exc
        },
        status_code=404
    )

# endregion

# region Mounts

for mount in config.mounts:
    static_files = {
        EMountType.SPA: SPAStaticFiles,
        EMountType.FTP: FTPStaticFiles,
        EMountType.PAGE: PageStaticFiles
    }.get(mount.type, SPAStaticFiles)

    directory = os.path.join(os.getcwd(), mount.directory)
    if not os.path.exists(directory):
        warnings.warn(f"Cannot find directory {mount.directory} for mount {mount.path}")
        continue

    app.mount(
        mount.path,
        static_files(directory=directory),
        name=mount.name
    )

# endregion

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    Popen(["venv/bin/python", "-m", "http_bridge"])
    uvicorn.run(
        "main:app",
        port=443,
        host="0.0.0.0",
        **ssl
    )