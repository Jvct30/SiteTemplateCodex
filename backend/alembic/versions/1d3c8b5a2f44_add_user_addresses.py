"""add user addresses

Revision ID: 1d3c8b5a2f44
Revises: 7b6e4a21c9d8
Create Date: 2026-05-09 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1d3c8b5a2f44"
down_revision: str | Sequence[str] | None = "7b6e4a21c9d8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("email", sa.String(length=255), nullable=True))
        batch_op.create_unique_constraint("uq_users_email", ["email"])

    op.create_table(
        "user_addresses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=80), nullable=False),
        sa.Column("street", sa.String(length=255), nullable=False),
        sa.Column("number", sa.String(length=20), nullable=False),
        sa.Column("complement", sa.String(length=100), nullable=True),
        sa.Column("neighborhood", sa.String(length=100), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=2), nullable=False),
        sa.Column("zip_code", sa.String(length=9), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    with op.batch_alter_table("orders") as batch_op:
        batch_op.add_column(sa.Column("shipping_address_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_orders_shipping_address_id_user_addresses",
            "user_addresses",
            ["shipping_address_id"],
            ["id"],
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("orders") as batch_op:
        batch_op.drop_constraint(
            "fk_orders_shipping_address_id_user_addresses",
            type_="foreignkey",
        )
        batch_op.drop_column("shipping_address_id")

    op.drop_table("user_addresses")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_constraint("uq_users_email", type_="unique")
        batch_op.drop_column("email")
