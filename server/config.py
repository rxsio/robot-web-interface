import yaml
from enum import Enum
from typing import Optional
from pydantic import BaseModel, FilePath, DirectoryPath


class SslConfig(BaseModel):
    key: FilePath
    certificate: FilePath
    root: FilePath


class EMountType(Enum):
    SPA = "SPA"
    FTP = "FTP"
    PAGE = "PAGE"


class Mount(BaseModel):
    name: str
    type: EMountType
    path: str
    directory: str


class TurnConfig(BaseModel):
    url: str
    apiToken: str
    turnToken: str


class Config(BaseModel):
    ssl: SslConfig
    mounts: list[Mount]
    origins: list[str]


def load_config(filepath: FilePath) -> Config:
    with open(filepath, "r") as handle:
        data = yaml.safe_load(handle)

    return Config(**data)


def load_turn_config(filepath: FilePath) -> Optional[TurnConfig]:
    try:
        with open(filepath, "r") as handle:
            data = yaml.safe_load(handle)

        return TurnConfig(**data)
    except:
        return None