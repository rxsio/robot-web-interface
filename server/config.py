import json
from pydantic import BaseModel, FilePath, DirectoryPath


class SslConfig(BaseModel):
    key: FilePath
    certificate: FilePath
    root: FilePath


class Mount(BaseModel):
    name: str
    path: str
    directory: DirectoryPath


class Config(BaseModel):
    ssl: SslConfig
    mounts: list[Mount]
    origins: list[str]


def load_config(filepath: FilePath) -> Config:
    with open(filepath, "r") as handle:
        data = json.load(handle)

    return Config(**data)