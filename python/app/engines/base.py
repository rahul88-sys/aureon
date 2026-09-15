from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.schemas import PageResult


class PdfEngine(ABC):
    name: str

    @abstractmethod
    def available(self) -> bool:
        ...

    @abstractmethod
    def extract(self, pdf_bytes: bytes) -> list[PageResult]:
        ...
