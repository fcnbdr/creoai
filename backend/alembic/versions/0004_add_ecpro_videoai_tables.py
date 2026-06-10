"""add_ecpro_videoai_tables

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite


# revision identifiers, used by Alembic.
revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """创建ECPro和Video AI相关表"""
    # image_tasks
    op.create_table('image_tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('task_type', sa.String(64), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('input_images', sa.JSON(), nullable=True),
        sa.Column('prompt', sa.Text(), nullable=True),
        sa.Column('params', sa.JSON(), nullable=True),
        sa.Column('output_images', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(64), nullable=False, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('points_cost', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['product_id'], ['product_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_image_tasks_id'), 'image_tasks', ['id'])

    # video_ai_tasks
    op.create_table('video_ai_tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('prompt_preset', sa.JSON(), nullable=True),
        sa.Column('generated_url', sa.String(1024), nullable=True),
        sa.Column('status', sa.String(64), nullable=False, server_default='pending'),
        sa.Column('safety_check', sa.Boolean(), nullable=True),
        sa.Column('safety_message', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('points_cost', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['product_id'], ['product_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_video_ai_tasks_id'), 'video_ai_tasks', ['id'])

    # video_prompts
    op.create_table('video_prompts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('category', sa.String(255), nullable=True),
        sa.Column('selling_points', sa.Text(), nullable=True),
        sa.Column('scenario', sa.Text(), nullable=True),
        sa.Column('prompts', sa.JSON(), nullable=True),
        sa.Column('style_count', sa.Integer(), nullable=True, server_default='6'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_video_prompts_id'), 'video_prompts', ['id'])

    # user_points
    op.create_table('user_points',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('balance', sa.Integer(), nullable=False, server_default='1000'),
        sa.Column('total_earned', sa.Integer(), nullable=False, server_default='1000'),
        sa.Column('total_spent', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_points_id'), 'user_points', ['id'])

    # point_transactions
    op.create_table('point_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('trans_type', sa.String(64), nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('related_task_id', sa.Integer(), nullable=True),
        sa.Column('related_task_type', sa.String(64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_point_transactions_id'), 'point_transactions', ['id'])

    # api_tokens
    op.create_table('api_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_name', sa.String(128), nullable=False),
        sa.Column('token_key', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_key')
    )
    op.create_index(op.f('ix_api_tokens_id'), 'api_tokens', ['id'])
    op.create_index(op.f('ix_api_tokens_token_key'), 'api_tokens', ['token_key'])

    # resource_items
    op.create_table('resource_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('res_type', sa.String(16), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('url', sa.String(1024), nullable=False),
        sa.Column('thumbnail', sa.String(1024), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('source_task_id', sa.Integer(), nullable=True),
        sa.Column('source_task_type', sa.String(64), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resource_items_id'), 'resource_items', ['id'])


def downgrade() -> None:
    """删除所有新增表"""
    op.drop_table('resource_items')
    op.drop_table('api_tokens')
    op.drop_table('point_transactions')
    op.drop_table('user_points')
    op.drop_table('video_prompts')
    op.drop_table('video_ai_tasks')
    op.drop_table('image_tasks')
