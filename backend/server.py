from pathlib import Path
import sys
from importlib import import_module


BACKEND_SRC = Path(__file__).resolve().parent / "src"
if str(BACKEND_SRC) not in sys.path:
    sys.path.insert(0, str(BACKEND_SRC))

app = import_module("app.main").app