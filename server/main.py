import os
import os.path
from subprocess import Popen

import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from config import load_config, EMountType
from static_files import FTPStaticFiles, SPAStaticFiles


config = load_config("config.json")

ssl = {
    "ssl_keyfile": os.path.join(os.getcwd(), config.ssl.key),
    "ssl_certfile": os.path.join(os.getcwd(), config.ssl.certificate)
}

app = FastAPI()


@app.get("/rxsioCA.pem")
async def download_certificate():
    certificate_path = os.path.join(os.getcwd(), config.ssl.root)
    return FileResponse(certificate_path)


@app.post("/networkTest")
async def network_test():
    return "Test passed"


for mount in config.mounts:
    static_files = {
        EMountType.SPA: SPAStaticFiles,
        EMountType.FTP: FTPStaticFiles
    }.get(mount.type, SPAStaticFiles)

    app.mount(
        mount.path,
        static_files(directory=os.path.join(os.getcwd(), mount.directory)),
        name=mount.name
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    Popen(["python", "-m", "http_bridge"])
    uvicorn.run(
        "main:app",
        port=443,
        host="0.0.0.0",
        **ssl
    )