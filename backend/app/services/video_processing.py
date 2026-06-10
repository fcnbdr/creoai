import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, BinaryIO
from datetime import timedelta

import ffmpeg
from fastapi import UploadFile

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_upload_file(upload_file: UploadFile) -> str:
    destination = UPLOAD_DIR / f"{uuid.uuid4().hex}_{Path(upload_file.filename).name}"
    with destination.open('wb') as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return str(destination)


def extract_audio(video_path: str, output_dir: Optional[str] = None) -> str:
    output_dir = Path(output_dir) if output_dir else UPLOAD_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    audio_path = output_dir / f"{uuid.uuid4().hex}.mp3"
    ffmpeg.input(video_path).output(str(audio_path), ac=1, ar='16000', format='mp3').run(overwrite_output=True)
    return str(audio_path)


def extract_keyframes(video_path: str, output_dir: Optional[str] = None) -> List[str]:
    """
    抽取关键帧：0s, 1s, 2s, 3s, 中段, 结尾
    """
    output_dir = Path(output_dir) if output_dir else UPLOAD_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 获取视频时长
    metadata = get_video_metadata(video_path)
    duration = metadata.get('duration', 0)
    
    if duration == 0:
        raise ValueError("无法获取视频时长")
    
    # 计算关键帧时间点
    timestamps = [0, 1, 2, 3]  # 前4秒每秒一帧
    
    # 中段（50%位置）
    mid_point = duration * 0.5
    if mid_point > 3:  # 避免与前4秒重复
        timestamps.append(mid_point)
    
    # 结尾（最后1秒）
    end_point = max(duration - 1, 0)
    if end_point > timestamps[-1]:  # 避免与中段重复
        timestamps.append(end_point)
    
    # 抽取关键帧
    frames = []
    for i, ts in enumerate(timestamps):
        frame_path = output_dir / f"{uuid.uuid4().hex}_frame_{i:03d}.jpg"
        try:
            ffmpeg.input(video_path, ss=ts).output(str(frame_path), vframes=1).run(overwrite_output=True, quiet=True)
            if frame_path.exists():
                frames.append(str(frame_path))
        except Exception as e:
            print(f"Failed to extract frame at {ts}s: {e}")
            continue
    
    return frames


def extract_keyframes_simple(video_path: str, output_dir: Optional[str] = None, count: int = 4) -> List[str]:
    """简单关键帧抽取（备用方法）"""
    output_dir = Path(output_dir) if output_dir else UPLOAD_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    frame_pattern = str(output_dir / f"{uuid.uuid4().hex}_frame_%03d.jpg")
    ffmpeg.input(video_path).filter('fps', fps=1).output(frame_pattern, vframes=count).run(overwrite_output=True)
    frames = sorted([str(path) for path in output_dir.glob('*_frame_*.jpg')])
    return frames[:count]


def generate_thumbnail(video_path: str, timestamp: float = 1.0) -> str:
    """生成视频缩略图"""
    output_dir = UPLOAD_DIR
    thumbnail_path = output_dir / f"{uuid.uuid4().hex}_thumb.jpg"
    try:
        ffmpeg.input(video_path, ss=timestamp).output(str(thumbnail_path), vframes=1).run(overwrite_output=True)
        return str(thumbnail_path)
    except Exception:
        # 如果指定时间戳失败，使用默认帧
        ffmpeg.input(video_path).output(str(thumbnail_path), vframes=1).run(overwrite_output=True)
        return str(thumbnail_path)


def get_video_metadata(video_path: str) -> dict:
    """获取视频元数据"""
    try:
        probe = ffmpeg.probe(video_path)
        video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
        if video_stream:
            return {
                'duration': float(probe['format']['duration']),
                'width': int(video_stream.get('width', 0)),
                'height': int(video_stream.get('height', 0)),
                'fps': eval(video_stream.get('r_frame_rate', '0/1')),
            }
    except Exception as e:
        print(f"Error getting video metadata: {e}")
    return {'duration': 0, 'width': 0, 'height': 0, 'fps': 0}


def build_public_url(file_path: str) -> str:
    path = Path(file_path)
    return f"/uploads/{path.name}"


def process_video_file(video_path: str) -> dict:
    """处理视频文件：抽音频+抽关键帧+生成缩略图"""
    output_dir = UPLOAD_DIR / f"video_assets_{uuid.uuid4().hex}"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 抽取音频
    audio_file = extract_audio(video_path, str(output_dir))
    
    # 抽取关键帧（特定时间点）
    keyframes = extract_keyframes(video_path, str(output_dir))
    
    # 生成缩略图
    thumbnail = generate_thumbnail(video_path)
    
    return {
        'audio_url': build_public_url(audio_file),
        'keyframe_urls': [build_public_url(path) for path in keyframes],
        'thumbnail_url': build_public_url(thumbnail),
    }
