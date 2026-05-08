from fastapi import HTTPException, status


class CredentialsException(HTTPException):
    """Raised when authentication credentials are invalid or missing."""

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(HTTPException):
    """Raised when a user lacks the required permissions."""

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão insuficiente",
        )


class NotFoundException(HTTPException):
    """Raised when a requested resource does not exist."""

    def __init__(self, detail: str = "Recurso não encontrado") -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )


class ConflictException(HTTPException):
    """Raised when an operation conflicts with existing state (e.g. duplicate, stock)."""

    def __init__(self, detail: str = "Conflito com recurso existente") -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class BadRequestException(HTTPException):
    """Raised for invalid business logic operations."""

    def __init__(self, detail: str = "Requisição inválida") -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
