"""add_phone_to_users

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002_add_missing_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """添加phone字段到users表"""
    op.add_column('users', sa.Column('phone', sa.String(20), nullable=True))
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)


def downgrade() -> None:
    """回滚:删除phone字段"""
    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_column('users', 'phone')
