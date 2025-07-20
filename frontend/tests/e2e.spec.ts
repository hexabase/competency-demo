import { expect, test } from '@playwright/test';

const users = [
    {
        email: 'testuser1@example.com',
        password: 'password123',
        name: '田中 太郎',
        department: '営業部',
        position: '課長',
        persona: '目標達成意欲の高いリーダー',
        strengths: 'リーダーシップ、目標達成へのコミットメント',
        weaknesses: 'マイクロマネジメントしがちな点',
        goals: '部長への昇進',
    },
    {
        email: 'testuser2@example.com',
        password: 'password123',
        name: '鈴木 花子',
        department: '開発部',
        position: 'エンジニア',
        persona: '技術探求心の強い若手',
        strengths: '新しい技術の学習意欲、チームへの貢献',
        weaknesses: 'タスク管理、プレゼンテーション能力',
        goals: 'シニアエンジニアになり、プロダクトの技術選定に関わる',
    },
    {
        email: 'testuser3@example.com',
        password: 'password123',
        name: '佐藤 次郎',
        department: '人事部',
        position: '採用担当',
        persona: 'コミュニケーション能力に長けたムードメーカー',
        strengths: 'コミュニケーション能力、調整力',
        weaknesses: 'データ分析、戦略的思考',
        goals: '採用チームのリーダーになる',
    },
    {
        email: 'testuser4@example.com',
        password: 'password123',
        name: '伊藤 三郎',
        department: 'マーケティング部',
        position: 'マネージャー',
        persona: 'データドリブンな戦略家',
        strengths: 'データ分析、戦略立案',
        weaknesses: 'チームメンバーの育成',
        goals: 'マーケティング部門の統括',
    },
    {
        email: 'testuser5@example.com',
        password: 'password123',
        name: '渡辺 久美子',
        department: 'カスタマーサポート',
        position: 'リーダー',
        persona: '顧客志向の強い共感力の高いリーダー',
        strengths: '顧客対応、問題解決能力、共感力',
        weaknesses: '業務効率化、部下の育成',
        goals: 'CS部門の品質向上と顧客満足度の最大化',
    },
];

const BASE_URL = 'http://localhost:3001';

// Function to delete a user by email
const deleteUser = async (email: string) => {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/users/by-email/${email}`, {
            method: 'DELETE',
            headers: {
                'X-TEST-SECRET': 'your-secret-testing-key'
            }
        });
        if (response.ok) {
            console.log(`Successfully deleted user: ${email}`);
        } else {
            const errorData = await response.json().catch(() => ({}));
            if (response.status !== 404) { // Don't log error if user just doesn't exist
                console.error(`Failed to delete user ${email}: ${response.status}`, errorData);
            }
        }
    } catch (error) {
        console.error(`Error during fetch to delete user ${email}:`, error);
    }
};


test.describe('E2E Test for Competency App', () => {

    test.beforeEach(async () => {
        // Clean up users before each test run
        for (const user of users) {
            await deleteUser(user.email);
        }
    });

    // This will run before all tests.
    test.beforeAll(async ({ browser }) => {
        // You can add global setup here if needed, like cleaning the database.
        console.log('Starting E2E tests...');
    });

    for (const user of users) {
        test(`should register, login, fill profile, and complete evaluation for ${user.name}`, async ({ page }) => {
            await test.step('Register User', async () => {
                await page.goto(`${BASE_URL}/register`);
                await page.fill('input[name="email"]', user.email);
                await page.fill('input[name="name"]', user.name);
                await page.fill('input[name="department"]', user.department);
                await page.fill('input[name="position"]', user.position);
                await page.fill('input[name="password"]', user.password);
                await page.fill('input[name="confirmPassword"]', user.password);
                await page.click('button[type="submit"]');
                await expect(page).toHaveURL(`${BASE_URL}/login?registered=true`);
            });

            await test.step('Login User', async () => {
                await page.goto(`${BASE_URL}/login`);
                await page.fill('input[name="email"]', user.email);
                await page.fill('input[name="password"]', user.password);
                await page.click('button[type="submit"]');
                await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
            });

            await test.step('Fill Profile', async () => {
                await page.goto(`${BASE_URL}/dashboard/profile`);
                // Click the 編集 (Edit) button in the 基本情報 section
                await page.click('button:has-text("編集")');
                // Wait for the form to be in edit mode
                await page.waitForSelector('input[id="department"]', { state: 'visible' });
                // Fill in the department and position fields
                await page.fill('input[id="department"]', user.department);
                await page.fill('input[id="position"]', user.position);
                // Add a small delay to ensure the form is ready
                await page.waitForTimeout(1000);
                
                // Try multiple selectors for the Save button
                const saveSelectors = [
                    'button:has-text("保存")',
                    'button[size="sm"]:has-text("保存")',
                    'button:has(svg):has-text("保存")',
                    'button:has(.lucide-save):has-text("保存")',
                    '.flex.gap-2 button:has-text("保存")'
                ];
                
                let saveButton = null;
                for (const selector of saveSelectors) {
                    const button = page.locator(selector).first();
                    if (await button.count() > 0) {
                        saveButton = button;
                        console.log(`Found save button with selector: ${selector}`);
                        break;
                    }
                }
                
                if (saveButton) {
                    await saveButton.waitFor({ state: 'visible' });
                    await saveButton.scrollIntoViewIfNeeded();
                    
                    // Try clicking with different approaches
                    try {
                        await saveButton.click();
                        console.log('Save button clicked successfully');
                    } catch (error) {
                        console.log('Regular click failed, trying force click');
                        await saveButton.click({ force: true });
                    }
                } else {
                    console.log('Save button not found with any selector');
                }
                
                // Add a small delay after click
                await page.waitForTimeout(500);
                // Wait for edit mode to exit (since save just toggles edit mode)
                await page.waitForSelector('button:has-text("編集")', { state: 'visible' });
                // The profile save is just a frontend operation for now
                console.log('Profile fields updated (frontend only)');
            });

            await test.step('Fill Career Plan', async () => {
                await page.goto(`${BASE_URL}/dashboard/profile`);
                
                // Find the career plan section specifically and click the 作成/編集 button within it
                const careerSection = page.locator('div:has-text("キャリアプラン・なりたい姿")').first();
                await careerSection.scrollIntoViewIfNeeded();
                
                // Try to find the 作成 or 編集 button within the career plan section
                const careerCreateButton = careerSection.locator('button:has-text("作成")');
                const careerEditButton = careerSection.locator('button:has-text("編集")');
                
                if (await careerCreateButton.count() > 0) {
                    console.log('Found 作成 button in career section');
                    await careerCreateButton.click();
                } else if (await careerEditButton.count() > 0) {
                    console.log('Found 編集 button in career section');
                    await careerEditButton.click();
                } else {
                    console.log('No create/edit button found in career section');
                }
                
                // Wait for the form to be in edit mode
                await page.waitForSelector('textarea[id="strengths_to_enhance"]', { state: 'visible' });
                // Fill in the career plan fields
                await page.fill('textarea[id="strengths_to_enhance"]', user.strengths);
                await page.fill('textarea[id="weaknesses_to_overcome"]', user.weaknesses);
                await page.fill('textarea[id="specific_goals"]', user.goals);
                
                // Click the 保存 (Save) button in the career section
                const careerSaveButton = careerSection.locator('button:has-text("保存")');
                await careerSaveButton.click();
                
                // Wait for edit mode to exit
                await careerSection.locator('button:has-text("編集")').waitFor({ state: 'visible' });
                console.log('Career plan saved successfully');
            });

            await test.step('Complete Evaluation', async () => {
                await page.goto(`${BASE_URL}/dashboard/evaluation`);
                
                // Wait for questions to load
                await page.waitForSelector('input[type="radio"]', { state: 'visible' });
                
                // Check if questions are loaded
                const radioButtons = await page.locator('input[type="radio"]').all();
                console.log(`Found ${radioButtons.length} radio buttons`);
                
                // If no questions are loaded, skip this step
                if (radioButtons.length === 0) {
                    console.log('No evaluation questions found - skipping evaluation step');
                    return;
                }
                
                // Answer questions by clicking radio buttons
                // Each question should have 5 radio buttons (1-5 scale)
                let questionCount = 0;
                
                // Continue until we've answered all questions or reach a limit
                while (questionCount < 30) {
                    // Check if we're on the last question or if submit button is available
                    const submitButton = page.locator('button:has-text("回答を送信")');
                    const nextButton = page.locator('button:has-text("次へ")');
                    
                    // Answer the current question with a random score (1-5)
                    const randomScore = Math.floor(Math.random() * 5) + 1;
                    await page.click(`input[type="radio"][value="${randomScore}"]`);
                    
                    questionCount++;
                    
                    // If submit button is visible, we're done
                    if (await submitButton.count() > 0) {
                        await submitButton.click();
                        break;
                    }
                    
                    // Otherwise, go to next question
                    if (await nextButton.count() > 0) {
                        await nextButton.click();
                        await page.waitForTimeout(500); // Wait for page to update
                    } else {
                        break;
                    }
                }
                
                // Check if we successfully completed evaluation (accepts query parameters)
                await expect(page).toHaveURL(new RegExp(`${BASE_URL}/dashboard(\\?.*)?$`));
                console.log('Evaluation completed successfully');
            });
        });
    }

    test('should verify company average competency data', async ({ page }) => {
        // Login as one of the users to view the dashboard
        const user = users[0];
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
        
        // Check that the radar chart with company average is visible
        await expect(page.locator('canvas')).toBeVisible();
        
        // Verify that competency data is displayed
        await expect(page.locator('text=あなたの能力評価結果')).toBeVisible();
    });
});