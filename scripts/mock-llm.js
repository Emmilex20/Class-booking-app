#!/usr/bin/env node
// Minimal mock LLM server for local testing
// Usage: node scripts/mock-llm.js

const http = require('http');
const port = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && (req.url === '/generate' || req.url === '/api/v1/generate')) {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const messages = payload.messages || [];
        const lastUser = (messages.filter((m) => m.role === 'user').slice(-1)[0] || {}).content || '';

        // Simple rule-based canned replies for local dev (avoid echoing back the user's message)
        const lower = lastUser.toLowerCase();
        let replyText = '';

        if (!lastUser) {
          replyText = "Hi! I'm Fitness Assistant. I can help you find classes, check bookings, or recommend classes. What can I do for you today?";
        } else if (lower.includes('yoga')) {
          replyText =
            "We have several yoga classes: Morning Flow (Mon/Wed/Fri 7:00 AM) - 45m - All levels; Gentle Yoga (Tue/Thu 6:00 PM) - 60m - Relaxing; Power Yoga (Sat 9:00 AM) - 45m - Advanced. Would you like details or to book one?";
        } else if (lower.includes('what classes') || lower.includes('what do you have') || (lower.includes('classes') && lower.length < 40)) {
          replyText =
            "Here's a quick list of classes currently available: Yoga, HIIT, Cycling, Strength, Pilates, Boxing. Tell me which one you'd like to explore and I can show upcoming sessions and availability.";
        } else if (lower.includes('book') || lower.includes('booking')) {
          replyText =
            "To book a class, tell me which class or date you'd like and I'll check availability. You can also view your upcoming bookings in your profile.";
        } else if (lower.includes('price') || lower.includes('subscribe') || lower.includes('subscription')) {
          replyText =
            "Subscription tiers: Basic — 5 classes/month; Performance — 12 classes/month; Champion — Unlimited. Want pricing or to compare features?";
        } else {
          replyText =
            "Hi — I'm Fitness Assistant. I can help find classes near you, recommend classes based on your goals, check bookings, and help with subscriptions. How can I assist?";
        }

        const reply = `${replyText} (at ${new Date().toISOString()})`;

        // Return name and text so the frontend can display a friendly assistant name
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ name: 'Fitness Assistant', text: reply }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON');
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`Mock LLM server listening at http://localhost:${port}/generate`);
  console.log('Send POST { "messages": [{"role":"user","content":"hi"}] }');
});
