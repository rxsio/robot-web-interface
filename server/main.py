import os
import os.path
from subprocess import Popen

import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from spa_staticfiles import SPAStaticFiles

distribution_directory = os.path.join(os.getcwd(), "..", "dist")
certificate_directory = os.path.join(os.getcwd(), "..", "..", "certificates")
ssl = {
    "ssl_keyfile": os.path.join(certificate_directory, "firo.key"),
    "ssl_certfile": os.path.join(certificate_directory, "firo.crt")
}
origins = [
    "http://localhost",
    "https://localhost",
    "http://localhost:80",
    "https://localhost:443"
]

app = FastAPI()


@app.get("/rxsioCA.pem")
async def download_certificate():
    certificate_path = os.path.join(certificate_directory, "RootCA.pem")
    return FileResponse(certificate_path)


@app.post("/networkTest")
async def network_test():
    return "Test passed"


app.mount("/", SPAStaticFiles(directory=distribution_directory, html=True),
          name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
