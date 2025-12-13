import 'dotenv/config';
import axios from 'axios';
import prisma from '../lib/prisma';

// --- 1. The Pinging Function ---
async function performPing(apiId: string, url: string) {
  let latencyMs: number;
  let statusCode: number;

  console.log(`Pinging: ${url}`);
  
  try {
    const startTime = Date.now();
    
    // Send a simple HEAD request for speed, or GET if HEAD is insufficient
    const response = await axios.get(url, {
      timeout: 10000, 
      validateStatus: () => true, 
    });

    latencyMs = Date.now() - startTime;
    statusCode = response.status;
  } catch (error) {
    // If request fails completely (e.g., DNS error, network timeout)
    latencyMs = 99999; // Assign a very high latency
    statusCode = 0; // Use 0 to denote a network/timeout failure
    console.error(`Error pinging ${url}:`, error instanceof Error ? error.message : String(error));
  }

  // --- 2. Save the Result to the Database ---
  try {
    await prisma.performanceTest.create({
      data: {
        apiId: apiId,
        latencyMs: latencyMs,
        statusCode: statusCode,
      },
    });
    console.log(`Saved result for ${url}: Latency=${latencyMs}ms, Status=${statusCode}`);
  } catch (dbError) {
    console.error(`Failed to save test result for ${apiId}:`, dbError);
  }
}


// --- 3. Main Runner Function ---
async function runPinger() {
  console.log('--- Starting API Performance Pinger ---');
  
  try {
    // Fetch all APIs that need to be tested
    const apis = await prisma.api.findMany({
      select: {
        id: true,
        url: true,
      },
    });

    if (apis.length === 0) {
      console.log('No APIs found to test. Exiting.');
      return;
    }

    // Run tests concurrently to save time
    const pingPromises = apis.map(api => performPing(api.id, api.url));
    await Promise.all(pingPromises);

  } catch (error) {
    console.error('Pinger encountered a major error:', error);
  } finally {
    // Ensure the database connection is closed after all work is done
    await prisma.$disconnect();
    console.log('--- Pinger Finished. DB connection closed. ---');
  }
}

// Execute the script
runPinger();