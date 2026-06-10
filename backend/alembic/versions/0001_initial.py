"""initial migration

Revision ID: 0001_initial
Revises: 
Create Date: 2026-06-07 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=128), nullable=False, unique=True),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('daily_limit', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'product_profiles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('target_audience', sa.String(length=255), nullable=True),
        sa.Column('selling_points', sa.JSON(), nullable=True),
        sa.Column('pain_points', sa.JSON(), nullable=True),
        sa.Column('usage_scenes', sa.JSON(), nullable=True),
        sa.Column('forbidden_claims', sa.JSON(), nullable=True),
        sa.Column('tone_style', sa.String(length=128), nullable=True),
        sa.Column('image_url', sa.String(length=1024), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'videos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('platform', sa.String(length=64), nullable=True),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('source_url', sa.String(length=1024), nullable=True),
        sa.Column('file_path', sa.String(length=1024), nullable=True),
        sa.Column('title', sa.String(length=512), nullable=True),
        sa.Column('author', sa.String(length=255), nullable=True),
        sa.Column('cover_url', sa.String(length=1024), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'video_assets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('video_id', sa.Integer(), sa.ForeignKey('videos.id'), nullable=False),
        sa.Column('audio_url', sa.String(length=1024), nullable=True),
        sa.Column('keyframe_urls', sa.JSON(), nullable=True),
        sa.Column('transcript_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'analyses',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('video_id', sa.Integer(), sa.ForeignKey('videos.id'), nullable=False),
        sa.Column('hook_analysis', sa.JSON(), nullable=True),
        sa.Column('script_structure', sa.JSON(), nullable=True),
        sa.Column('spoken_copy', sa.Text(), nullable=True),
        sa.Column('camera_analysis', sa.JSON(), nullable=True),
        sa.Column('viral_reason', sa.Text(), nullable=True),
        sa.Column('replication_score', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'replications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('video_id', sa.Integer(), sa.ForeignKey('videos.id'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('product_profiles.id'), nullable=True),
        sa.Column('script_15s', sa.JSON(), nullable=True),
        sa.Column('script_30s', sa.JSON(), nullable=True),
        sa.Column('shot_list', sa.JSON(), nullable=True),
        sa.Column('spoken_copy', sa.Text(), nullable=True),
        sa.Column('shooting_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'topic_recommendations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('product_profiles.id'), nullable=True),
        sa.Column('source_video_id', sa.Integer(), sa.ForeignKey('videos.id'), nullable=True),
        sa.Column('title', sa.String(length=512), nullable=False),
        sa.Column('recommend_reason', sa.Text(), nullable=True),
        sa.Column('score', sa.JSON(), nullable=True),
        sa.Column('difficulty', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'ai_providers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=128), nullable=False, unique=True),
        sa.Column('base_url', sa.String(length=1024), nullable=True),
        sa.Column('api_key_encrypted', sa.String(length=1024), nullable=True),
        sa.Column('supports_text', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('supports_vision', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('supports_audio', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('supports_image_to_video', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('supports_detail_page', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('priority', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'ai_calls',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('task_type', sa.String(length=128), nullable=False),
        sa.Column('provider_id', sa.Integer(), sa.ForeignKey('ai_providers.id'), nullable=True),
        sa.Column('model', sa.String(length=128), nullable=True),
        sa.Column('tokens', sa.Integer(), nullable=True),
        sa.Column('cost_estimate', sa.String(length=64), nullable=True),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'iclip_token_quota',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('total_quota', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('used_quota', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('plan_type', sa.String(length=64), nullable=True),
        sa.Column('expire_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'ecpro_content_jobs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('product_profiles.id'), nullable=False),
        sa.Column('job_type', sa.String(length=64), nullable=False),
        sa.Column('platform_targets', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='pending'),
        sa.Column('content_urls', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'iclip_video_jobs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('script_id', sa.Integer(), sa.ForeignKey('replications.id'), nullable=True),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('product_profiles.id'), nullable=True),
        sa.Column('video_type', sa.String(length=64), nullable=True),
        sa.Column('assets', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='pending'),
        sa.Column('video_url', sa.String(length=1024), nullable=True),
        sa.Column('token_cost', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'content_distributions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('content_type', sa.String(length=64), nullable=False),
        sa.Column('content_id', sa.Integer(), nullable=False),
        sa.Column('platform', sa.String(length=64), nullable=False),
        sa.Column('target_shop_id', sa.String(length=128), nullable=True),
        sa.Column('publish_status', sa.String(length=64), nullable=False, server_default='pending'),
        sa.Column('publish_result', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'platform_credentials',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('platform', sa.String(length=64), nullable=False),
        sa.Column('app_key_encrypted', sa.String(length=1024), nullable=True),
        sa.Column('app_secret_encrypted', sa.String(length=1024), nullable=True),
        sa.Column('access_token_encrypted', sa.String(length=1024), nullable=True),
        sa.Column('shop_id', sa.String(length=128), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )


def downgrade():
    op.drop_table('platform_credentials')
    op.drop_table('content_distributions')
    op.drop_table('iclip_video_jobs')
    op.drop_table('ecpro_content_jobs')
    op.drop_table('iclip_token_quota')
    op.drop_table('ai_calls')
    op.drop_table('ai_providers')
    op.drop_table('topic_recommendations')
    op.drop_table('replications')
    op.drop_table('analyses')
    op.drop_table('video_assets')
    op.drop_table('videos')
    op.drop_table('product_profiles')
    op.drop_table('categories')
    op.drop_table('users')
