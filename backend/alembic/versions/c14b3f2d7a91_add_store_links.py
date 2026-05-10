"""add store links

Revision ID: c14b3f2d7a91
Revises: 8ca0e11a22c1
Create Date: 2026-05-10 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c14b3f2d7a91"
down_revision: str | None = "8ca0e11a22c1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "store_links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("platform", sa.String(length=30), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("platform"),
    )
    op.create_index(op.f("ix_store_links_id"), "store_links", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_store_links_id"), table_name="store_links")
    op.drop_table("store_links")
