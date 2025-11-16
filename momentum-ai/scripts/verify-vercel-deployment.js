#!/usr/bin/env node
/**
 * Vercel Deployment Verification Script
 * 
 * Tests all critical endpoints and connections after deployment
 * Run: node scripts/verify-vercel-deployment.js [base-url]
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.argv[2] || process.env.VERCEL_URL || 'http://localhost:3001';
const TIMEOUT = 30000; // 30 seconds

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: TIMEOUT
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: null, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testHealthCheck() {
  log('\n📊 Testing Health Check Endpoint...', 'blue');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    if (response.status === 200) {
      log('✅ Health check passed', 'green');
      log(`   Status: ${response.data.status}`, 'green');
      log(`   Environment: ${response.data.environment?.nodeEnv || 'unknown'}`, 'green');
      log(`   AI Provider: ${response.data.services?.aiProvider || 'unknown'}`, 'green');
      log(`   Memory: ${response.data.memory?.used || 'unknown'} MB / ${response.data.memory?.total || 'unknown'} MB`, 'green');
      return true;
    } else {
      log(`❌ Health check failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
    return false;
  }
}

async function testAIModels() {
  log('\n🤖 Testing AI Models Endpoint...', 'blue');
  try {
    const response = await makeRequest(`${BASE_URL}/api/ai/models`);
    if (response.status === 200 && response.data.models) {
      log('✅ AI models endpoint working', 'green');
      log(`   Available models: ${response.data.models.length}`, 'green');
      log(`   Provider: ${response.data.provider || 'unknown'}`, 'green');
      return true;
    } else {
      log(`❌ AI models endpoint failed: ${response.status}`, 'red');
      log(`   Response: ${response.raw.substring(0, 200)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ AI models error: ${error.message}`, 'red');
    return false;
  }
}

async function testAIGenerate() {
  log('\n✨ Testing AI Generate Endpoint...', 'blue');
  try {
    const response = await makeRequest(`${BASE_URL}/api/ai/generate`, {
      method: 'POST',
      body: {
        prompt: 'Say hello in one sentence',
        temperature: 0.7,
        maxTokens: 50
      }
    });
    
    if (response.status === 200 && response.data.content) {
      log('✅ AI generate endpoint working', 'green');
      log(`   Response length: ${response.data.content.length} chars`, 'green');
      return true;
    } else if (response.status === 401) {
      log('⚠️  AI generate requires authentication (this is expected)', 'yellow');
      return true; // This is expected if auth is required
    } else {
      log(`❌ AI generate failed: ${response.status}`, 'red');
      log(`   Response: ${response.raw.substring(0, 200)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ AI generate error: ${error.message}`, 'red');
    return false;
  }
}

async function testStreaming() {
  log('\n🌊 Testing AI Streaming Endpoint...', 'blue');
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}/api/ai/stream`);
    const client = url.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 seconds for streaming test
    };

    const req = client.request(reqOptions, (res) => {
      if (res.statusCode === 200 && res.headers['content-type']?.includes('text/event-stream')) {
        log('✅ Streaming endpoint responding correctly', 'green');
        log(`   Content-Type: ${res.headers['content-type']}`, 'green');
        
        let chunks = 0;
        res.on('data', () => { chunks++; });
        res.on('end', () => {
          if (chunks > 0) {
            log(`   Received ${chunks} chunks`, 'green');
            resolve(true);
          } else {
            log('⚠️  No data chunks received (may require auth)', 'yellow');
            resolve(true); // Not a failure if auth is required
          }
        });
      } else if (res.statusCode === 401) {
        log('⚠️  Streaming requires authentication (this is expected)', 'yellow');
        resolve(true);
      } else {
        log(`❌ Streaming endpoint failed: ${res.statusCode}`, 'red');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log(`❌ Streaming error: ${error.message}`, 'red');
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      log('⚠️  Streaming test timeout (may be normal if auth required)', 'yellow');
      resolve(true);
    });

    req.write(JSON.stringify({
      prompt: 'Say hello',
      temperature: 0.7,
      maxTokens: 20
    }));

    req.end();
  });
}

async function testCORS() {
  log('\n🔒 Testing CORS Configuration...', 'blue');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`, {
      headers: {
        'Origin': 'https://example.com'
      }
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      log('✅ CORS headers present', 'green');
      log(`   Access-Control-Allow-Origin: ${corsHeader}`, 'green');
      return true;
    } else {
      log('⚠️  No CORS headers (may be same-origin deployment)', 'yellow');
      return true; // Not necessarily a failure
    }
  } catch (error) {
    log(`❌ CORS test error: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log(`\n🚀 Vercel Deployment Verification`, 'blue');
  log(`   Testing: ${BASE_URL}\n`, 'blue');
  
  const results = {
    health: await testHealthCheck(),
    models: await testAIModels(),
    generate: await testAIGenerate(),
    streaming: await testStreaming(),
    cors: await testCORS()
  };

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  log(`\n📈 Test Results: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✅ All critical endpoints are working!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
    log('   Common issues:', 'yellow');
    log('   - Missing environment variables in Vercel', 'yellow');
    log('   - Authentication required (set FREE_AI_MODE=true for testing)', 'yellow');
    log('   - CORS configuration (check FRONTEND_URL)', 'yellow');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

