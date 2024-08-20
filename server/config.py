import json
from enum import Enum
from pydantic import BaseModel, FilePath, DirectoryPath


class SslConfig(BaseModel):
    key: FilePath
    certificate: FilePath
    root: FilePath


class TurnConfig(BaseModel):
    url: str
    apiToken: str
    turnToken: str


class EMountType(Enum):
    SPA = "SPA"
    FTP = "FTP"
    PAGE = "PAGE"


class Mount(BaseModel):
    name: str
    type: EMountType
    path: str
    directory: str


class Config(BaseModel):
    ssl: SslConfig
    turn: TurnConfig
    mounts: list[Mount]
    origins: list[str]


def load_config(filepath: FilePath) -> Config:
    with open(filepath, "r") as handle:
        data = json.load(handle)

    return Config(**data)