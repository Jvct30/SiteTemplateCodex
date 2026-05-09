"""add order support request

Revision ID: 9f1d2a7c4b30
Revises: 26efa041cb09
Create Date: 2026-05-09 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9f1d2a7c4b30"
down_revision: str | Sequence[str] | None = "26efa041cb09"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("orders") as batch_op:
        batch_op.add_column(sa.Column("support_request_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_orders_support_request_id_custom_requests",
            "custom_requests",
            ["support_request_id"],
            ["id"],
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_constraint(
            "fk_orders_support_request_id_custom_requests",
            type_="foreignkey",
        )
        batch_op.drop_column("support_request_id")
