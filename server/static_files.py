import os
import os.path

from fastapi import HTTPException
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from starlette.responses import HTMLResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.types import Scope

from starlette.staticfiles import StaticFiles

PhotoExtensions = ["jpg"]

class FTPStaticFiles(StaticFiles):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.templates = Jinja2Templates(directory="templates", auto_reload=True)

    async def get_response(self, path: str, scope: Scope):
        full_path = os.path.join(self.directory, path)

        if os.path.isdir(full_path) and os.path.exists(full_path):
            return await self.directory_template_response(path, scope)
        elif os.path.isfile(full_path):
            return await super().get_response(path, scope)

        raise HTTPException(status_code=404, detail="File or directory not found")

    async def directory_template_response(self, path: str, scope: Scope) -> HTMLResponse:
        full_path = os.path.join(self.directory, path)
        items = os.listdir(full_path)
        directories = [item for item in items if os.path.isdir(os.path.join(full_path, item))]
        files = [item for item in items if os.path.isfile(os.path.join(full_path, item))]

        try:
            context = {
                "path": path,
                "files": files,
                "directories": directories,
                "is_360_photo": lambda x: any(x.lower().endswith(y) for y in PhotoExtensions)
            }
            return self.templates.TemplateResponse(
                "ftp.jinja",
                {
                    "request": Request(scope, receive=None),
                    **context
                }
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


class PageStaticFiles(FTPStaticFiles):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def get_response(self, path: str, scope):
        full_path = os.path.join(self.directory, path)

        if os.path.isdir(full_path) and os.path.exists(full_path):
            index_path = os.path.join(path, "index.html")

            try:
                return await super().get_response(index_path, scope)
            except:
                pass

        return await super().get_response(path, scope)


class SPAStaticFiles(StaticFiles):

    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (HTTPException, StarletteHTTPException) as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise ex
