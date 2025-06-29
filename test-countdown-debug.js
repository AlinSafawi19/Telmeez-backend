// Simple test to verify countdown timer logic
function testCountdownLogic() {
    console.log('🧪 Testing Countdown Timer Logic...\n');

    // Simulate the countdown logic
    let remainingMinutes = 15;
    const initialMinutes = remainingMinutes;
    
    console.log(`Starting countdown from ${remainingMinutes} minutes`);
    
    const timer = setInterval(() => {
        remainingMinutes--;
        const progress = Math.max(0, (remainingMinutes / Math.max(initialMinutes, 1)) * 100);
        
        console.log(`Time remaining: ${remainingMinutes} minutes - Progress: ${progress.toFixed(1)}%`);
        
        if (remainingMinutes <= 0) {
            clearInterval(timer);
            console.log('✅ Countdown completed!');
        }
    }, 1000); // Use 1 second for testing instead of 1 minute
}

// Run the test
testCountdownLogic(); 