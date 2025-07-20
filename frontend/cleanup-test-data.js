#!/usr/bin/env node

const users = [
    'testuser1@example.com',
    'testuser2@example.com',
    'testuser3@example.com',
    'testuser4@example.com',
    'testuser5@example.com',
];

const BACKEND_URL = 'http://localhost:8002';

// Function to delete a user by email
const deleteUser = async (email) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/users/by-email/${email}`, {
            method: 'DELETE',
            headers: {
                'X-TEST-SECRET': 'your-secret-testing-key'
            }
        });
        
        if (response.ok) {
            console.log(`✓ Successfully deleted user: ${email}`);
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) {
                console.log(`- User not found (already deleted): ${email}`);
                return true;
            } else {
                console.error(`✗ Failed to delete user ${email}: ${response.status}`, errorData);
                return false;
            }
        }
    } catch (error) {
        console.error(`✗ Error during fetch to delete user ${email}:`, error.message);
        return false;
    }
};

// Main cleanup function
const cleanupTestData = async () => {
    console.log('🧹 Starting test data cleanup...');
    console.log('=====================================');
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const email of users) {
        const success = await deleteUser(email);
        if (success) {
            successCount++;
        } else {
            failureCount++;
        }
    }
    
    console.log('=====================================');
    console.log(`✅ Cleanup completed: ${successCount} successful, ${failureCount} failed`);
    
    if (failureCount > 0) {
        console.log('⚠️  Some users could not be deleted. Please check the backend logs.');
        process.exit(1);
    }
    
    console.log('🎉 All test data cleaned up successfully!');
};

// Run cleanup
cleanupTestData().catch(error => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
});