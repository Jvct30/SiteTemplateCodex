"""add product image urls

Revision ID: 5f4d1e9b8a10
Revises: 1d3c8b5a2f44
Create Date: 2026-05-09 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "5f4d1e9b8a10"
down_revision: str | Sequence[str] | None = "1d3c8b5a2f44"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("products") as batch_op:
        batch_op.add_column(sa.Column("image_urls", sa.JSON(), nullable=True))

    op.execute(
        """
        UPDATE products
        SET image_urls = json_array(image_url)
        WHERE image_url IS NOT NULL
          AND image_url != ''
          AND image_urls IS NULL
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_column("image_urls")
