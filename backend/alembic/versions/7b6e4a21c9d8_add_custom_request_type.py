"""add custom request type

Revision ID: 7b6e4a21c9d8
Revises: 9f1d2a7c4b30
Create Date: 2026-05-09 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7b6e4a21c9d8"
down_revision: str | Sequence[str] | None = "9f1d2a7c4b30"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("custom_requests") as batch_op:
        batch_op.add_column(
            sa.Column(
                "request_type",
                sa.String(length=30),
                nullable=False,
                server_default="custom_order",
            )
        )

    op.execute(
        """
        UPDATE custom_requests
        SET request_type = 'order_support'
        WHERE subject LIKE 'Acompanhamento do Pedido #%'
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("custom_requests") as batch_op:
        batch_op.drop_column("request_type")
