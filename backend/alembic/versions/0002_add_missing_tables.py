"""add missing tables

Revision ID: 0002_add_missing_tables
Revises: 0001_initial
Create Date: 2026-06-07 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_add_missing_tables'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # 创建ai_models表
    op.create_table(
        'ai_models',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('provider_id', sa.Integer(), sa.ForeignKey('ai_providers.id'), nullable=False),
        sa.Column('task_type', sa.String(length=64), nullable=False),
        sa.Column('model_alias', sa.String(length=128), nullable=False),
        sa.Column('actual_model_name', sa.String(length=128), nullable=False),
        sa.Column('max_tokens', sa.Integer(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 创建ai_prompts表
    op.create_table(
        'ai_prompts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('version', sa.String(length=32), nullable=False),
        sa.Column('task_type', sa.String(length=64), nullable=False),
        sa.Column('system_prompt', sa.Text(), nullable=True),
        sa.Column('user_prompt_template', sa.Text(), nullable=True),
        sa.Column('json_schema', sa.JSON(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 创建cost_limits表
    op.create_table(
        'cost_limits',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('scope_type', sa.String(length=64), nullable=False),
        sa.Column('scope_id', sa.Integer(), nullable=True),
        sa.Column('daily_limit', sa.Integer(), nullable=True),
        sa.Column('monthly_limit', sa.Integer(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 创建ecpro_templates表
    op.create_table(
        'ecpro_templates',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('template_html', sa.Text(), nullable=True),
        sa.Column('platform', sa.JSON(), nullable=True),
        sa.Column('thumbnail', sa.String(length=1024), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 创建video_templates表
    op.create_table(
        'video_templates',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('template_config', sa.JSON(), nullable=True),
        sa.Column('duration', sa.String(length=16), nullable=True),
        sa.Column('scene_type', sa.String(length=64), nullable=True),
        sa.Column('thumbnail', sa.String(length=1024), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 创建crawl_jobs表
    op.create_table(
        'crawl_jobs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('platform', sa.String(length=64), nullable=True),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('run_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('target_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('success_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('failed_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='pending'),
        sa.Column('logs', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 创建job_logs表
    op.create_table(
        'job_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('job_id', sa.Integer(), nullable=True),
        sa.Column('task_type', sa.String(length=128), nullable=False),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )


def downgrade():
    op.drop_table('job_logs')
    op.drop_table('crawl_jobs')
    op.drop_table('video_templates')
    op.drop_table('ecpro_templates')
    op.drop_table('cost_limits')
    op.drop_table('ai_prompts')
    op.drop_table('ai_models')
