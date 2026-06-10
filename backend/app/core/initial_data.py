from app.core.config import settings
from app.core.security import get_password_hash
from app.models import User
from app.db.session import SessionLocal
from app.core.seed_data import run_seed


def init_admin_user() -> None:
    """初始化管理员账号"""
    if not settings.admin_email or not settings.admin_password:
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.admin_email).first()
        if user:
            return
        admin = User(
            email=settings.admin_email,
            password_hash=get_password_hash(settings.admin_password),
            role='admin',
        )
        db.add(admin)
        db.commit()
        print(f"✓ 管理员账号已创建: {settings.admin_email}")
    finally:
        db.close()


def init_all_data() -> None:
    """初始化所有数据（管理员 + 种子数据）"""
    print("\n=== 开始初始化系统数据 ===")
    init_admin_user()
    run_seed()
    print("=== 系统数据初始化完成 ===\n")
