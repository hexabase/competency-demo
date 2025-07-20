"""AI feedback service for competency evaluation."""
import json
from typing import Dict, List, Optional

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import CompanyAverageCompetency, CompetencyItem, UserCompetency, UserCareerPlan


class AIFeedbackService:
    """Service for generating AI-powered feedback and suggestions."""

    def __init__(self):
        """Initialize AI feedback service."""
        self.client = None
        # Re-enable OpenAI for enhanced feedback
        if settings.OPENAI_API_KEY:
            # Always try to create a new client instance for each call
            self.api_key = settings.OPENAI_API_KEY
            print("OpenAI API key configured for dynamic client creation")

    def generate_enhanced_competency_feedback(
        self,
        user_competencies: List[UserCompetency],
        company_averages: List[CompanyAverageCompetency],
        career_plan: Optional[UserCareerPlan] = None,
        user_name: str = "あなた",
    ) -> Dict[str, str]:
        """
        Generate enhanced personalized feedback with career plan consideration.
        """
        if not hasattr(self, 'api_key') or not self.api_key:
            return self._generate_enhanced_default_feedback(user_competencies, company_averages, career_plan)

        try:
            # Prepare comprehensive competency data
            competency_data = []
            for uc in user_competencies:
                company_avg = next(
                    (ca for ca in company_averages if ca.competency_item_id == uc.competency_item_id),
                    None
                )
                competency_data.append({
                    "name": uc.competency_item.name,
                    "description": uc.competency_item.description,
                    "user_score": uc.score,
                    "company_average": company_avg.average_score if company_avg else None,
                    "difference": uc.score - company_avg.average_score if company_avg else None,
                    "gap_analysis": "強み" if (company_avg and uc.score > company_avg.average_score) else "改善要",
                })

            # Generate enhanced feedback using OpenAI
            prompt = self._create_enhanced_feedback_prompt(competency_data, career_plan, user_name)
            
            print(f"🤖 [AI FEEDBACK] Starting OpenAI GPT-4 request for user: {user_name}")
            print(f"🤖 [AI FEEDBACK] Model: gpt-4, Max tokens: 2500, Temperature: 0.7")
            print(f"🤖 [AI FEEDBACK] Prompt length: {len(prompt)} characters")
            
            # Create a new OpenAI client for each request
            from openai import OpenAI
            temp_client = OpenAI(api_key=self.api_key)
            
            import time
            start_time = time.time()
            response = temp_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self._get_hr_consultant_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2500,
                temperature=0.7,
            )
            end_time = time.time()
            
            print(f"🤖 [AI FEEDBACK] OpenAI response received in {end_time - start_time:.2f} seconds")
            print(f"🤖 [AI FEEDBACK] Response tokens: {response.usage.total_tokens if response.usage else 'unknown'}")
            print(f"🤖 [AI FEEDBACK] Processing AI response...")
            
            feedback_text = response.choices[0].message.content
            return self._parse_enhanced_feedback(feedback_text)
            
        except Exception as e:
            print(f"Enhanced AI feedback generation failed: {e}")
            return self._generate_enhanced_default_feedback(user_competencies, company_averages, career_plan)

    def generate_competency_feedback(
        self,
        user_competencies: List[UserCompetency],
        company_averages: List[CompanyAverageCompetency],
        user_name: str = "あなた",
    ) -> Dict[str, str]:
        """
        Generate personalized feedback for user competencies.
        
        Args:
            user_competencies: User's competency scores
            company_averages: Company average scores
            user_name: User's name for personalization
            
        Returns:
            Dictionary with feedback for each competency and overall summary
        """
        if not hasattr(self, 'api_key') or not self.api_key:
            return self._generate_default_feedback(user_competencies, company_averages)

        try:
            # Prepare competency data
            competency_data = []
            for uc in user_competencies:
                company_avg = next(
                    (ca for ca in company_averages if ca.competency_item_id == uc.competency_item_id),
                    None
                )
                competency_data.append({
                    "name": uc.competency_item.name,
                    "description": uc.competency_item.description,
                    "user_score": uc.score,
                    "company_average": company_avg.average_score if company_avg else None,
                    "difference": uc.score - company_avg.average_score if company_avg else None,
                })

            # Generate feedback using OpenAI
            prompt = self._create_feedback_prompt(competency_data, user_name)
            
            # Create a new OpenAI client for each request
            from openai import OpenAI
            temp_client = OpenAI(api_key=self.api_key)
            response = temp_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "あなたは経験豊富なHR専門家です。従業員のコンピテンシー評価結果をもとに、建設的で実用的なフィードバックを提供してください。"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7,
            )
            
            feedback_text = response.choices[0].message.content
            return self._parse_ai_feedback(feedback_text, user_competencies)
            
        except Exception as e:
            print(f"AI feedback generation failed: {e}")
            return self._generate_default_feedback(user_competencies, company_averages)

    def _create_feedback_prompt(self, competency_data: List[Dict], user_name: str) -> str:
        """Create prompt for AI feedback generation."""
        data_str = json.dumps(competency_data, ensure_ascii=False, indent=2)
        
        return f"""
以下は{user_name}のコンピテンシー評価結果です：

{data_str}

各コンピテンシーについて、以下の形式で簡潔で具体的なフィードバックを提供してください：

1. **強み（3点以上のコンピテンシー）**: 
   - 何が優れているか
   - どのように活かせるか

2. **改善点（3点未満のコンピテンシー）**:
   - 具体的な改善方法
   - 取り組むべき行動

3. **総合評価**:
   - 全体的な傾向
   - 優先すべき成長領域

以下のフォーマットで回答してください：
STRENGTHS:
[強みの内容]

IMPROVEMENTS:
[改善点の内容]

OVERALL:
[総合評価]

各項目は200文字以内で、実用的で理解しやすい日本語で記述してください。
"""

    def _parse_ai_feedback(self, feedback_text: str, user_competencies: List[UserCompetency]) -> Dict[str, str]:
        """Parse AI feedback response into structured format."""
        sections = {
            "strengths": "",
            "improvements": "",
            "overall": "",
        }
        
        try:
            lines = feedback_text.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if line.startswith('STRENGTHS:'):
                    current_section = "strengths"
                elif line.startswith('IMPROVEMENTS:'):
                    current_section = "improvements"
                elif line.startswith('OVERALL:'):
                    current_section = "overall"
                elif current_section and line:
                    sections[current_section] += line + "\n"
            
            # Clean up sections
            for key in sections:
                sections[key] = sections[key].strip()
                
        except Exception as e:
            print(f"Failed to parse AI feedback: {e}")
            return self._generate_default_feedback(user_competencies, [])
        
        return sections

    def _generate_default_feedback(
        self,
        user_competencies: List[UserCompetency],
        company_averages: List[CompanyAverageCompetency],
    ) -> Dict[str, str]:
        """Generate default feedback when AI is not available."""
        strengths = []
        improvements = []
        
        for uc in user_competencies:
            company_avg = next(
                (ca for ca in company_averages if ca.competency_item_id == uc.competency_item_id),
                None
            )
            
            if uc.score >= 4.0:
                strengths.append(f"• {uc.competency_item.name}: 高いスコア（{uc.score:.1f}点）を獲得しています")
            elif uc.score < 3.0:
                improvements.append(f"• {uc.competency_item.name}: スコアの向上を目指しましょう（{uc.score:.1f}点）")
        
        avg_score = sum(uc.score for uc in user_competencies) / len(user_competencies)
        
        return {
            "strengths": "\n".join(strengths) if strengths else "継続的な学習と成長への意欲が見られます。",
            "improvements": "\n".join(improvements) if improvements else "全体的にバランスの取れた評価です。",
            "overall": f"平均スコア: {avg_score:.1f}点。継続的な成長と学習を通じて、さらなる向上を目指しましょう。",
        }

    def generate_career_suggestions(
        self,
        user_competencies: List[UserCompetency],
        user_department: Optional[str] = None,
        user_position: Optional[str] = None,
    ) -> List[str]:
        """Generate career development suggestions."""
        suggestions = []
        
        # Analyze top competencies
        top_competencies = sorted(user_competencies, key=lambda x: x.score, reverse=True)[:3]
        weak_competencies = sorted(user_competencies, key=lambda x: x.score)[:2]
        
        # Generate suggestions based on strengths
        for comp in top_competencies:
            if comp.competency_item.name == "リーダーシップ" and comp.score >= 4.0:
                suggestions.append("チームリーダーやプロジェクトマネージャーの役割にチャレンジしてみましょう")
            elif comp.competency_item.name == "コミュニケーション" and comp.score >= 4.0:
                suggestions.append("メンター役や新人教育担当として活躍できる可能性があります")
            elif comp.competency_item.name == "イノベーション" and comp.score >= 4.0:
                suggestions.append("新規事業開発や改善提案のプロジェクトに参加してみましょう")
        
        # Generate suggestions based on weaknesses
        for comp in weak_competencies:
            if comp.competency_item.name == "時間管理" and comp.score < 3.0:
                suggestions.append("タスク管理ツールの活用や時間管理研修の受講をおすすめします")
            elif comp.competency_item.name == "専門知識" and comp.score < 3.0:
                suggestions.append("業界の最新動向を学ぶための勉強会や研修への参加を検討しましょう")
        
        # Add general suggestions
        if not suggestions:
            suggestions.append("現在の強みを活かしつつ、新しい挑戦にも取り組んでみましょう")
        
        suggestions.append("定期的な振り返りと目標設定を行い、継続的な成長を目指しましょう")
        
        return suggestions[:5]  # Return top 5 suggestions

    def _get_hr_consultant_system_prompt(self) -> str:
        """Get system prompt for HR consultant persona."""
        return """
あなたは20年以上の経験を持つシニアHRコンサルタントです。以下の特徴を持っています：

【キャラクター設定】
- 実績豊富なHRプロフェッショナルとして、数百人のキャリア開発を支援
- 優しさと厳格さを併せ持つ、結果重視のコンサルタント
- 表面的な褒め言葉よりも、具体的で実践的なアドバイスを重視
- 「成長には痛みが伴う」という信念のもと、時に厳しい現実も伝える

【コンサルティング方針】
1. 甘い評価は本人の成長を阻害するため、現実的な評価を提供
2. 強みは最大限活用し、弱みは戦略的に補強する方法を提案
3. 個人の目標と組織の要求を両立させる実践的な解決策を提示
4. 短期・中期・長期の段階的な成長プランを提供
5. 具体的な行動計画、学習リソース、測定可能な目標を設定

【フィードバックスタイル】
- 結果重視：「なぜそれが重要なのか」を必ず説明
- 実践的：「具体的に何をすべきか」を明確に指示
- 厳格だが支援的：現実を受け入れさせつつ、希望も与える
- 個人に合わせた：その人の性格や学習スタイルに応じてアドバイスを調整

常に相手の立場に立って考え、その人が本当に成長できるフィードバックを提供してください。
"""

    def _create_enhanced_feedback_prompt(
        self, competency_data: List[Dict], career_plan: Optional[UserCareerPlan], user_name: str
    ) -> str:
        """Create enhanced prompt for AI feedback generation."""
        data_str = json.dumps(competency_data, ensure_ascii=False, indent=2)
        
        career_info = ""
        if career_plan:
            career_info = f"""
【キャリアプラン情報】
- 目指す方向性: {career_plan.career_direction or "未設定"}
- 目標ポジション: {career_plan.target_position or "未設定"}
- 達成時期: {career_plan.target_timeframe or "未設定"}
- 活かしたい強み: {career_plan.strengths_to_enhance or "未設定"}
- 克服したい弱み: {career_plan.weaknesses_to_overcome or "未設定"}
- 具体的な目標: {career_plan.specific_goals or "未設定"}
- 性格特性: {career_plan.personality_traits or "未設定"}
- 学習スタイル: {career_plan.preferred_learning_style or "未設定"}
- 現在の課題: {career_plan.challenges_faced or "未設定"}
- モチベーション要因: {career_plan.motivation_factors or "未設定"}
"""
        
        return f"""
【対象者】: {user_name}

【コンピテンシー評価結果】
{data_str}

{career_info}

【依頼内容】
上記の評価結果とキャリアプランを踏まえ、HRプロフェッショナルとして以下の観点から厳格かつ実践的なフィードバックを提供してください：

1. **現状分析**: 
   - 強みと弱みの客観的な分析
   - 目標達成に向けた現在地の評価
   - 会社平均との比較から見える課題

2. **戦略的アドバイス**:
   - 強みを最大限活用する具体的方法
   - 弱みを補強する実践的アプローチ
   - 他者との協働による弱み対策

3. **実行計画**:
   - 短期（3ヶ月）・中期（1年）・長期（3年）の目標設定
   - 具体的な行動ステップ
   - 進捗測定方法

4. **学習リソース**:
   - 推奨書籍（3冊程度）
   - 具体的な学習・トレーニング方法
   - 実践的なスキル習得方法

5. **厳格な評価**:
   - 現実的な課題と障害
   - 本人が向き合うべき厳しい現実
   - 成長に必要な意識改革

【出力フォーマット】
以下の形式で日本語で回答してください。セクションヘッダーは必ず英語で記述し、【】は使用しないでください：

STRENGTH_ANALYSIS:
[強みの分析と活用戦略]

WEAKNESS_STRATEGY:
[弱みの克服戦略と実践方法]

ACTION_PLAN:
[具体的な行動計画]

LEARNING_RESOURCES:
[学習リソースと推奨書籍]

REALITY_CHECK:
[厳格な現実評価と必要な意識改革]

OVERALL_STRATEGY:
[総合的な成長戦略]

重要: セクションヘッダーは必ず「STRENGTH_ANALYSIS:」「WEAKNESS_STRATEGY:」などの英語形式で記述してください。
各セクションは300文字以内で、具体的で実践的な内容にしてください。
"""

    def _parse_enhanced_feedback(self, feedback_text: str) -> Dict[str, str]:
        """Parse enhanced AI feedback response."""
        sections = {
            "strengths": "",
            "improvements": "",
            "action_plan": "",
            "learning_resources": "",
            "reality_check": "",
            "overall": "",
        }
        
        try:
            print(f"🔍 [AI FEEDBACK] Parsing feedback text (length: {len(feedback_text)})")
            print(f"🔍 [AI FEEDBACK] First 1000 characters: {feedback_text[:1000]}")
            
            lines = feedback_text.split('\n')
            current_section = None
            
            for i, line in enumerate(lines):
                line = line.strip()
                
                # Check for both English and Japanese-style section headers
                if (line.startswith('STRENGTH_ANALYSIS:') or 
                    line.startswith('【STRENGTH_ANALYSIS】:') or
                    line.startswith('【STRENGTH_ANALYSIS】') or
                    line.startswith('【現状分析】:') or
                    line.startswith('【現状分析】')):
                    current_section = "strengths"
                    print(f"🔍 [AI FEEDBACK] Found STRENGTH_ANALYSIS at line {i}")
                    # Add the content after the colon if present
                    if ':' in line:
                        content_after_colon = line.split(':', 1)[1].strip()
                        if content_after_colon:
                            sections[current_section] += content_after_colon + "\n"
                elif (line.startswith('WEAKNESS_STRATEGY:') or 
                      line.startswith('【WEAKNESS_STRATEGY】:') or
                      line.startswith('【WEAKNESS_STRATEGY】') or
                      line.startswith('【戦略的アドバイス】:') or
                      line.startswith('【戦略的アドバイス】')):
                    current_section = "improvements"
                    print(f"🔍 [AI FEEDBACK] Found WEAKNESS_STRATEGY at line {i}")
                    if ':' in line:
                        content_after_colon = line.split(':', 1)[1].strip()
                        if content_after_colon:
                            sections[current_section] += content_after_colon + "\n"
                elif (line.startswith('ACTION_PLAN:') or 
                      line.startswith('【ACTION_PLAN】:') or
                      line.startswith('【ACTION_PLAN】') or
                      line.startswith('【実行計画】:') or
                      line.startswith('【実行計画】')):
                    current_section = "action_plan"
                    print(f"🔍 [AI FEEDBACK] Found ACTION_PLAN at line {i}")
                    if ':' in line:
                        content_after_colon = line.split(':', 1)[1].strip()
                        if content_after_colon:
                            sections[current_section] += content_after_colon + "\n"
                elif (line.startswith('LEARNING_RESOURCES:') or 
                      line.startswith('【LEARNING_RESOURCES】:') or
                      line.startswith('【LEARNING_RESOURCES】') or
                      line.startswith('【学習リソース】:') or
                      line.startswith('【学習リソース】')):
                    current_section = "learning_resources"
                    print(f"🔍 [AI FEEDBACK] Found LEARNING_RESOURCES at line {i}")
                    if ':' in line:
                        content_after_colon = line.split(':', 1)[1].strip()
                        if content_after_colon:
                            sections[current_section] += content_after_colon + "\n"
                elif (line.startswith('REALITY_CHECK:') or 
                      line.startswith('【REALITY_CHECK】:') or
                      line.startswith('【REALITY_CHECK】') or
                      line.startswith('【厳格な評価】:') or
                      line.startswith('【厳格な評価】')):
                    current_section = "reality_check"
                    print(f"🔍 [AI FEEDBACK] Found REALITY_CHECK at line {i}")
                    if ':' in line:
                        content_after_colon = line.split(':', 1)[1].strip()
                        if content_after_colon:
                            sections[current_section] += content_after_colon + "\n"
                elif (line.startswith('OVERALL_STRATEGY:') or 
                      line.startswith('【OVERALL_STRATEGY】:') or
                      line.startswith('【OVERALL_STRATEGY】') or
                      line.startswith('【総合戦略】:') or
                      line.startswith('【総合戦略】')):
                    current_section = "overall"
                    print(f"🔍 [AI FEEDBACK] Found OVERALL_STRATEGY at line {i}")
                    if ':' in line:
                        content_after_colon = line.split(':', 1)[1].strip()
                        if content_after_colon:
                            sections[current_section] += content_after_colon + "\n"
                elif current_section and line:
                    sections[current_section] += line + "\n"
            
            # Clean up sections
            for key in sections:
                sections[key] = sections[key].strip()
                
            print(f"🔍 [AI FEEDBACK] Parsed sections:")
            for key, value in sections.items():
                print(f"  {key}: {len(value)} chars - '{value[:100]}{'...' if len(value) > 100 else ''}'")
                
        except Exception as e:
            print(f"❌ [AI FEEDBACK] Failed to parse enhanced AI feedback: {e}")
            print(f"❌ [AI FEEDBACK] Feedback text: {feedback_text[:500]}...")
            return self._generate_enhanced_default_feedback([], [], None)
        
        return sections

    def _generate_enhanced_default_feedback(
        self,
        user_competencies: List[UserCompetency],
        company_averages: List[CompanyAverageCompetency],
        career_plan: Optional[UserCareerPlan] = None,
    ) -> Dict[str, str]:
        """Generate enhanced default feedback when AI is not available."""
        strengths = []
        improvements = []
        
        for uc in user_competencies:
            company_avg = next(
                (ca for ca in company_averages if ca.competency_item_id == uc.competency_item_id),
                None
            )
            
            if uc.score >= 4.0:
                strengths.append(f"• {uc.competency_item.name}: 優秀なスコア（{uc.score:.1f}点）。この強みを活かして他者をサポートしましょう。")
            elif uc.score < 3.0:
                improvements.append(f"• {uc.competency_item.name}: 改善が必要です（{uc.score:.1f}点）。具体的な学習計画を立てて取り組みましょう。")
        
        career_context = ""
        if career_plan and career_plan.career_direction:
            career_context = f"目指す方向性「{career_plan.career_direction}」に向けて、"
        
        return {
            "strengths": "\n".join(strengths) if strengths else "継続的な努力が見られます。強みをさらに伸ばしていきましょう。",
            "improvements": "\n".join(improvements) if improvements else "全体的にバランスが取れています。より高いレベルを目指しましょう。",
            "action_plan": f"{career_context}短期目標として具体的なスキルアップ計画を立て、中期的にはリーダーシップを発揮する機会を積極的に求めましょう。",
            "learning_resources": "推奨書籍: 1)『7つの習慣』、2)『人を動かす』、3)『エッセンシャル思考』などの基本的なビジネススキル書籍から始めましょう。",
            "reality_check": "成長には継続的な努力と時には困難な挑戦が必要です。快適な環境から一歩踏み出し、新しいことに挑戦する覚悟を持ちましょう。",
            "overall": "現在の評価を踏まえ、計画的かつ戦略的にスキルアップを図り、組織での価値向上を目指しましょう。",
        }

    def generate_book_recommendations(self, competency_data: List[Dict], career_plan: Optional[UserCareerPlan] = None) -> List[Dict[str, str]]:
        """Generate book recommendations based on competency gaps and career goals."""
        # Default recommendations based on common business competencies
        recommendations = [
            {
                "title": "7つの習慣",
                "author": "スティーブン・R・コヴィー",
                "reason": "個人の効果性を高める基本的な原則を学べる必読書",
                "category": "自己啓発・リーダーシップ"
            },
            {
                "title": "人を動かす",
                "author": "デール・カーネギー",
                "reason": "対人関係とコミュニケーションスキルの向上に最適",
                "category": "コミュニケーション"
            },
            {
                "title": "エッセンシャル思考",
                "author": "グレッグ・マキューン",
                "reason": "重要なことに集中し、生産性を向上させる思考法",
                "category": "時間管理・生産性"
            }
        ]
        
        return recommendations


ai_feedback_service = AIFeedbackService()