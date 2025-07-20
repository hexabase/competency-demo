const fetch = require('node-fetch');

async function testAIFeedback() {
    try {
        // Login to get access token
        const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'username=testuser2@example.com&password=password123'
        });

        if (!loginResponse.ok) {
            console.error('Login failed:', await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        const accessToken = loginData.access_token;

        // Request AI feedback regeneration
        console.log('🔄 Requesting AI feedback regeneration...');
        const feedbackResponse = await fetch('http://localhost:8000/api/v1/competencies/feedback?force_regenerate=true', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!feedbackResponse.ok) {
            console.error('Feedback request failed:', await feedbackResponse.text());
            return;
        }

        const feedbackData = await feedbackResponse.json();
        console.log('✅ AI feedback generated successfully!');
        console.log('Feedback sections:');
        console.log(`- Strengths: ${feedbackData.feedback.strengths ? feedbackData.feedback.strengths.length : 0} chars`);
        console.log(`- Improvements: ${feedbackData.feedback.improvements ? feedbackData.feedback.improvements.length : 0} chars`);
        console.log(`- Action Plan: ${feedbackData.feedback.action_plan ? feedbackData.feedback.action_plan.length : 0} chars`);
        console.log(`- Learning Resources: ${feedbackData.feedback.learning_resources ? feedbackData.feedback.learning_resources.length : 0} chars`);
        console.log(`- Reality Check: ${feedbackData.feedback.reality_check ? feedbackData.feedback.reality_check.length : 0} chars`);
        console.log(`- Overall: ${feedbackData.feedback.overall ? feedbackData.feedback.overall.length : 0} chars`);
        
        // Show actual content for debugging
        console.log('\n=== Actual Content ===');
        console.log('Strengths:', feedbackData.feedback.strengths || 'EMPTY');
        console.log('Improvements:', feedbackData.feedback.improvements || 'EMPTY');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testAIFeedback();