from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import Analysis, Replication, Video, VideoAsset
from app.services.ai_gateway import AIGateway


def _build_attachment_url(path: str) -> str:
    if path.startswith('/'):
        return f'http://localhost:8000{path}'
    return path


def analyze_video_content(db: Session, video: Video) -> Analysis:
    gateway = AIGateway(db)
    asset: Optional[VideoAsset] = video.asset
    if not asset or not asset.audio_url:
        raise ValueError('Video asset is missing processed audio')
    audio_url = _build_attachment_url(asset.audio_url)
    transcript = gateway.transcribe_audio(audio_url)

    hook_schema = {
        'hook': 'string',
        'pain_point': 'string',
        'selling_point': 'string',
        'trust_proof': 'string',
        'call_to_action': 'string',
    }
    structure_schema = {
        'hook': 'string',
        'pain': 'string',
        'selling_point': 'string',
        'trust': 'string',
        'conversion': 'string',
        'summary': 'string',
    }
    shot_schema = {
        'shot_1': 'string',
        'shot_2': 'string',
        'shot_3': 'string',
        'shot_4': 'string',
    }

    hook_analysis = gateway.generate_json('hook_analysis', f'请根据以下转写内容提取钩子、痛点、卖点、信任证明和转化：{transcript}', hook_schema)
    script_structure = gateway.generate_json('script_structure', f'请根据以下转写内容生成爆款脚本结构：{transcript}', structure_schema)
    camera_analysis_text = gateway.analyze_images('camera_analysis', asset.keyframe_urls or [], '请分析关键帧镜头语言，并给出逐段镜头描述。')
    camera_analysis = {'summary': camera_analysis_text}
    spoken_copy = gateway.generate_text('spoken_copy', f'请根据以下转写与结构生成完成口播文案：{transcript}')
    viral_reason = gateway.generate_text('viral_reason', f'请说明该视频为何具备爆款潜力，并给出优化建议：{transcript}')
    replication_score = min(100, max(0, len(transcript) // 5))

    analysis = db.query(Analysis).filter(Analysis.video_id == video.id).first()
    if not analysis:
        analysis = Analysis(video_id=video.id)
        db.add(analysis)
    analysis.hook_analysis = hook_analysis
    analysis.script_structure = script_structure
    analysis.spoken_copy = spoken_copy
    analysis.camera_analysis = camera_analysis
    analysis.viral_reason = viral_reason
    analysis.replication_score = replication_score
    video.status = 'analyzed'
    db.commit()
    db.refresh(analysis)
    return analysis


def generate_replication_script(db: Session, video: Video, product_id: Optional[int] = None, duration: int = 15) -> Replication:
    gateway = AIGateway(db)
    existing_analysis = video.analyses[-1] if video.analyses else None
    context_text = existing_analysis.spoken_copy if existing_analysis and existing_analysis.spoken_copy else ''
    prompt = f'请基于视频分析结果生成{duration}秒复刻脚本。内容参考：{context_text}'
    script_15s = gateway.generate_json('replicate_15s', prompt, {'lines': 'string', 'duration': 'string'})
    script_30s = gateway.generate_json('replicate_30s', prompt, {'lines': 'string', 'duration': 'string'})
    shot_list = gateway.generate_json('shot_list', prompt, {'shots': 'string', 'cut_instructions': 'string'})
    shooting_notes = gateway.generate_text('shooting_notes', f'请为该脚本生成拍摄建议与剪辑说明：{prompt}')

    replication = Replication(
        video_id=video.id,
        product_id=product_id,
        script_15s=script_15s,
        script_30s=script_30s,
        shot_list=shot_list,
        spoken_copy=context_text,
        shooting_notes=shooting_notes,
    )
    db.add(replication)
    video.status = 'script_generated'
    db.commit()
    db.refresh(replication)
    return replication
