"""Script to seed competency items and questions."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.models import CompetencyItem, Question


def seed_competency_items_and_questions():
    """Create initial competency items and questions."""
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(CompetencyItem).count() > 0:
        print("Competency items already exist!")
        return
    
    # Define competency items with their questions
    competency_data = [
        {
            "name": "リーダーシップ",
            "description": "チームを導き、目標達成に向けて影響力を発揮する能力",
            "order": 1,
            "questions": [
                "チームメンバーに明確な方向性を示すことができる",
                "困難な状況でも冷静にチームを導くことができる",
                "メンバーの意見を聞き、適切な意思決定ができる"
            ]
        },
        {
            "name": "コミュニケーション",
            "description": "効果的に情報を伝達し、他者と良好な関係を築く能力",
            "order": 2,
            "questions": [
                "自分の考えを明確に伝えることができる",
                "相手の立場を理解して対話することができる",
                "フィードバックを適切に与え、受け取ることができる"
            ]
        },
        {
            "name": "問題解決",
            "description": "課題を分析し、効果的な解決策を見出す能力",
            "order": 3,
            "questions": [
                "問題の本質を的確に把握することができる",
                "複数の解決策を検討し、最適なものを選択できる",
                "実行可能な解決策を具体的に提示できる"
            ]
        },
        {
            "name": "チームワーク",
            "description": "他者と協力し、共通の目標に向かって働く能力",
            "order": 4,
            "questions": [
                "チームの一員として積極的に貢献できる",
                "他のメンバーと協力して仕事を進められる",
                "チームの成功を自分の成功と考えることができる"
            ]
        },
        {
            "name": "適応力",
            "description": "変化に対応し、新しい環境や状況に適応する能力",
            "order": 5,
            "questions": [
                "新しい環境や状況にすぐに適応できる",
                "変化を前向きに受け入れることができる",
                "予期せぬ事態にも柔軟に対応できる"
            ]
        },
        {
            "name": "専門知識",
            "description": "業務に必要な知識やスキルを持ち、活用する能力",
            "order": 6,
            "questions": [
                "業務に必要な専門知識を十分に持っている",
                "最新の知識や技術を積極的に学習している",
                "専門知識を実務に効果的に活用できる"
            ]
        },
        {
            "name": "イノベーション",
            "description": "新しいアイデアを生み出し、改善を推進する能力",
            "order": 7,
            "questions": [
                "既存の方法にとらわれず新しいアイデアを提案できる",
                "創造的な解決策を考えることができる",
                "改善提案を積極的に行うことができる"
            ]
        },
        {
            "name": "時間管理",
            "description": "効率的に時間を使い、期限を守って業務を遂行する能力",
            "order": 8,
            "questions": [
                "優先順位を適切に判断して業務を進められる",
                "締切を守って仕事を完成させることができる",
                "効率的に時間を使って業務を行える"
            ]
        },
        {
            "name": "責任感",
            "description": "自己の役割を理解し、責任を持って業務を遂行する能力",
            "order": 9,
            "questions": [
                "与えられた役割や責任を完全に果たすことができる",
                "ミスがあった場合、責任を持って対処できる",
                "約束や締切を必ず守ることができる"
            ]
        },
        {
            "name": "成長意欲",
            "description": "継続的に学習し、自己を向上させようとする姿勢",
            "order": 10,
            "questions": [
                "新しいスキルや知識を積極的に学ぼうとする",
                "フィードバックを成長の機会として活用できる",
                "自己の改善点を認識し、改善に取り組める"
            ]
        }
    ]
    
    # Create competency items and questions
    question_order = 1
    for comp_data in competency_data:
        # Create competency item
        competency_item = CompetencyItem(
            name=comp_data["name"],
            description=comp_data["description"],
            order=comp_data["order"]
        )
        db.add(competency_item)
        db.flush()  # Get the ID
        
        # Create questions for this competency
        for question_text in comp_data["questions"]:
            question = Question(
                text=question_text,
                competency_item_id=competency_item.id,
                order=question_order,
                max_score=5
            )
            db.add(question)
            question_order += 1
    
    db.commit()
    print(f"Created {len(competency_data)} competency items with {question_order - 1} questions")
    db.close()


if __name__ == "__main__":
    seed_competency_items_and_questions()