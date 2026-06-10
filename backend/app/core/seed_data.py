"""
数据库种子脚本 - 初始化测试数据
"""
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Category, AIProvider, ECProTemplate, ProductProfile, VideoTemplate, User, UserPoints, PointTransaction
from app.core.security import get_password_hash
from datetime import datetime


def seed_categories(db: Session):
    """初始化品类数据"""
    categories = [
        {
            'name': '美妆护肤',
            'keywords': ['化妆品', '护肤品', '美容', '彩妆'],
            'daily_limit': 10
        },
        {
            'name': '服装穿搭',
            'keywords': ['服装', '穿搭', '时尚', '搭配'],
            'daily_limit': 10
        },
        {
            'name': '食品饮料',
            'keywords': ['食品', '饮料', '零食', '美食'],
            'daily_limit': 10
        },
        {
            'name': '食品零食',
            'keywords': ['零食', '食品', '休闲', '美食'],
            'daily_limit': 10
        },
        {
            'name': '调味品',
            'keywords': ['调味', '酱料', '香料', '厨房'],
            'daily_limit': 10
        },
        {
            'name': '家居生活',
            'keywords': ['家居', '生活用品', '收纳', '清洁'],
            'daily_limit': 10
        },
        {
            'name': '数码科技',
            'keywords': ['数码', '电子产品', '科技', '智能'],
            'daily_limit': 10
        },
    ]
    
    for cat_data in categories:
        existing = db.query(Category).filter(Category.name == cat_data['name']).first()
        if not existing:
            category = Category(**cat_data)
            db.add(category)
    
    db.commit()
    print(f"✓ 已初始化 {len(categories)} 个品类")


def seed_ai_providers(db: Session):
    """初始化AI供应商"""
    providers = [
        {
            'name': 'DeepSeek',
            'base_url': 'https://api.deepseek.com/v1',
            'supports_text': True,
            'supports_vision': True,
            'supports_audio': True,
            'supports_image_to_video': False,
            'supports_detail_page': False,
            'priority': 1
        },
        {
            'name': 'ECPro',
            'base_url': 'https://aigc-next.ecpro.com/api',
            'supports_text': False,
            'supports_vision': False,
            'supports_audio': False,
            'supports_image_to_video': False,
            'supports_detail_page': True,
            'priority': 2
        },
        {
            'name': 'iClip',
            'base_url': 'https://aigc-next.iclip.cn/mcp-tokens',
            'supports_text': False,
            'supports_vision': False,
            'supports_audio': False,
            'supports_image_to_video': True,
            'supports_detail_page': False,
            'priority': 3
        },
    ]
    
    for prov_data in providers:
        existing = db.query(AIProvider).filter(AIProvider.name == prov_data['name']).first()
        if not existing:
            provider = AIProvider(**prov_data)
            db.add(provider)
    
    db.commit()
    print(f"✓ 已初始化 {len(providers)} 个AI供应商")


def seed_ecpro_templates(db: Session):
    """初始化ECPro详情页模板"""
    templates = [
        {
            'name': '淘宝标准模板',
            'platform': ['taobao', 'tmall'],
            'is_default': True,
            'template_html': '<div class="detail-page"><!-- 淘宝标准模板 --></div>'
        },
        {
            'name': '京东简约模板',
            'platform': ['jd'],
            'is_default': False,
            'template_html': '<div class="detail-page"><!-- 京东简约模板 --></div>'
        },
        {
            'name': '抖音电商模板',
            'platform': ['douyin'],
            'is_default': False,
            'template_html': '<div class="detail-page"><!-- 抖音电商模板 --></div>'
        },
    ]
    
    for tmpl_data in templates:
        existing = db.query(ECProTemplate).filter(ECProTemplate.name == tmpl_data['name']).first()
        if not existing:
            template = ECProTemplate(**tmpl_data)
            db.add(template)
    
    db.commit()
    print(f"✓ 已初始化 {len(templates)} 个ECPro模板")


def seed_video_templates(db: Session):
    """初始化视频模板"""
    templates = [
        {
            'name': '15秒快速带货',
            'duration': '15s',
            'scene_type': 'product_showcase',
            'template_config': {
                'intro_duration': 3,
                'product_duration': 9,
                'cta_duration': 3
            }
        },
        {
            'name': '30秒详细评测',
            'duration': '30s',
            'scene_type': 'review',
            'template_config': {
                'intro_duration': 5,
                'product_duration': 20,
                'cta_duration': 5
            }
        },
        {
            'name': '微详情短视频',
            'duration': '15s',
            'scene_type': 'micro_detail',
            'template_config': {
                'intro_duration': 2,
                'product_duration': 11,
                'cta_duration': 2
            }
        },
    ]
    
    for tmpl_data in templates:
        existing = db.query(VideoTemplate).filter(VideoTemplate.name == tmpl_data['name']).first()
        if not existing:
            template = VideoTemplate(**tmpl_data)
            db.add(template)
    
    db.commit()
    print(f"✓ 已初始化 {len(templates)} 个视频模板")


def seed_users(db: Session):
    """初始化管理员用户"""
    admin_email = 'admin@creoai.com'
    admin_phone = '13800138000'  # 测试手机号
    admin_password = 'admin123'
    
    existing = db.query(User).filter(User.email == admin_email).first()
    if not existing:
        hashed_password = get_password_hash(admin_password)
        admin_user = User(
            email=admin_email,
            phone=admin_phone,
            password_hash=hashed_password,
            role='admin'
        )
        db.add(admin_user)
        db.commit()
        print(f"✓ 已创建管理员用户: {admin_email} / {admin_phone}")
    else:
        print(f"✓ 管理员用户已存在: {admin_email}")

    admin = db.query(User).filter(User.email == admin_email).first()
    if admin:
        seed_user_points(db, admin)


def seed_user_points(db: Session, user: User):
    """初始化用户积分"""
    existing = db.query(UserPoints).filter(UserPoints.user_id == user.id).first()
    if not existing:
        points = UserPoints(
            user_id=user.id,
            balance=1000,
            total_earned=1000,
            total_spent=0
        )
        db.add(points)
        # 记录初始积分
        transaction = PointTransaction(
            user_id=user.id,
            amount=1000,
            trans_type="earn",
            description="新用户注册奖励"
        )
        db.add(transaction)
        db.commit()
        print(f"✓ 已初始化用户积分: 1000点")
    else:
        print(f"✓ 用户积分已存在: {existing.balance}点")


def seed_products(db: Session):
    """初始化产品档案"""
    base_category = db.query(Category).filter(Category.name == '食品零食').first()
    if not base_category:
        return

    products = [
        {
            'name': '低脂鸡胸肉',
            'category_id': base_category.id,
            'target_audience': '健身人群、减脂人士、忙碌上班族',
            'selling_points': ['高蛋白低脂肪', '即食方便', '口味多样'],
            'pain_points': ['不想吃油腻', '减脂期缺乏优质蛋白', '准备时间长'],
            'usage_scenes': ['健身餐', '办公室加餐', '家庭轻食'],
            'forbidden_claims': ['夸大减肥效果', '医疗属性'],
            'tone_style': '亲和、专业、动力型',
            'image_url': 'https://example.com/images/low_fat_chicken.jpg',
        }
    ]

    for product_data in products:
        existing = db.query(ProductProfile).filter(ProductProfile.name == product_data['name']).first()
        if not existing:
            product = ProductProfile(**product_data)
            db.add(product)

    db.commit()
    print(f"✓ 已初始化 {len(products)} 个产品档案")


def run_seed():
    """运行所有种子数据"""
    db = SessionLocal()
    try:
        print("开始初始化种子数据...")
        seed_users(db)  # 首先创建用户
        seed_categories(db)
        seed_ai_providers(db)
        seed_ecpro_templates(db)
        seed_products(db)
        seed_video_templates(db)
        print("\n✅ 种子数据初始化完成！")
    except Exception as e:
        db.rollback()
        print(f"\n❌ 种子数据初始化失败: {e}")
        raise
    finally:
        db.close()


if __name__ == '__main__':
    run_seed()
