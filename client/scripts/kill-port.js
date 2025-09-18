#!/usr/bin/env node
import { exec } from 'child_process';

const port = process.argv[2] || 5173;

exec(`lsof -ti:${port}`, (error, stdout) => {
  if (stdout) {
    const pids = stdout.trim().split('\n');
    pids.forEach(pid => {
      exec(`kill -9 ${pid}`, (killError) => {
        if (!killError) {
          console.log(`Killed process ${pid} on port ${port}`);
        }
      });
    });
  }
});