import json
from pathlib import Path
from typing import List, Optional
from app.core.config import settings
from app.schemas.analysis import PredictResponse

class ArtifactService:
    def __init__(self):
        self.artifacts_dir = Path(settings.ARTIFACTS_DIR)
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)
        self.history_index_file = self.artifacts_dir / "history_index.json"

    def get_analysis_dir(self, analysis_id: str) -> Path:
        target = (self.artifacts_dir / analysis_id).resolve()
        # Security check: ensure path is within artifacts_dir
        if not str(target).startswith(str(self.artifacts_dir.resolve())):
            raise ValueError("Invalid analysis ID or path traversal attempt.")
        target.mkdir(parents=True, exist_ok=True)
        return target

    def save_metadata(self, response: PredictResponse) -> None:
        analysis_dir = self.get_analysis_dir(response.id)
        metadata_file = analysis_dir / "metadata.json"
        with open(metadata_file, "w", encoding="utf-8") as f:
            f.write(response.model_dump_json(indent=2))
        
        # Update history index
        self._add_to_history_index(response)

    def _add_to_history_index(self, response: PredictResponse) -> None:
        records = []
        if self.history_index_file.exists():
            try:
                with open(self.history_index_file, "r", encoding="utf-8") as f:
                    records = json.load(f)
            except Exception:
                records = []
        
        # Prepend new item
        summary = response.model_dump()
        records = [r for r in records if r.get("id") != response.id]
        records.insert(0, summary)
        
        # Keep top 100
        records = records[:100]
        with open(self.history_index_file, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)

    def get_history(self) -> List[dict]:
        if not self.history_index_file.exists():
            return []
        try:
            with open(self.history_index_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def get_analysis(self, analysis_id: str) -> Optional[dict]:
        analysis_dir = self.get_analysis_dir(analysis_id)
        metadata_file = analysis_dir / "metadata.json"
        if not metadata_file.exists():
            return None
        with open(metadata_file, "r", encoding="utf-8") as f:
            return json.load(f)

artifact_service = ArtifactService()
