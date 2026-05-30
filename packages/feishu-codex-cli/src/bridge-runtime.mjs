#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {
  createCodexInputText,
  parseFeishuContent,
  planFeishuReplies,
} from './message-format.mjs';

const WORKDIR = process.env.FEISHU_CODEX_WORKDIR || process.cwd();
const LARK_PROFILE = process.env.FEISHU_CODEX_LARK_PROFILE || 'codex-x';
const CHAT_ID = process.env.FEISHU_CODEX_CHAT_ID ?? '';
const USER_ID = process.env.FEISHU_CODEX_USER_ID ?? '';
const THREAD_NAME = process.env.FEISHU_CODEX_THREAD_NAME || 'Feishu - codex-x';
const PORT = process.env.FEISHU_CODEX_APP_SERVER_PORT || '54322';
const APP_SERVER_URL = process.env.FEISHU_CODEX_APP_SERVER_URL || `ws://127.0.0.1:${PORT}`;
const MODEL_PROVIDER = process.env.FEISHU_CODEX_MODEL_PROVIDER || 'custom';
const MODEL_PROVIDER_NAME = process.env.FEISHU_CODEX_MODEL_PROVIDER_NAME || MODEL_PROVIDER;
const MODEL_PROVIDER_BASE_URL = process.env.FEISHU_CODEX_MODEL_PROVIDER_BASE_URL || '';
const MODEL_PROVIDER_WIRE_API = process.env.FEISHU_CODEX_MODEL_PROVIDER_WIRE_API || '';
const LOG_DIR = process.env.FEISHU_CODEX_LOG_DIR || path.join(WORKDIR, '.codex-x', 'feishu-codex');
const ATTACHMENT_DIR = process.env.FEISHU_CODEX_ATTACHMENT_DIR || path.join(LOG_DIR, 'attachments');
const STATE_PATH = path.join(LOG_DIR, 'state.json');
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.FEISHU_CODEX_REQUEST_TIMEOUT_MS || '30000', 10);
const TURN_TIMEOUT_MS = Number.parseInt(process.env.FEISHU_CODEX_TURN_TIMEOUT_MS || '0', 10);
const TURN_STALL_TIMEOUT_MS = Number.parseInt(process.env.FEISHU_CODEX_TURN_STALL_TIMEOUT_MS || '240000', 10);
const TURN_RECOVERY_TIMEOUT_MS = Number.parseInt(process.env.FEISHU_CODEX_TURN_RECOVERY_TIMEOUT_MS || '600000', 10);
const TURN_RECOVERY_POLL_MS = Number.parseInt(process.env.FEISHU_CODEX_TURN_RECOVERY_POLL_MS || '2000', 10);
const APP_SERVER_READY_TIMEOUT_MS = Number.parseInt(process.env.FEISHU_CODEX_APP_SERVER_READY_TIMEOUT_MS || '60000', 10);
const SLOW_REPLY_MS = Number.parseInt(process.env.FEISHU_CODEX_SLOW_REPLY_MS || '0', 10);
const SLOW_REPLY_TEXT = process.env.FEISHU_CODEX_SLOW_REPLY_TEXT || '还在处理，稍等我一下。';
const POLL_INTERVAL_MS = Number.parseInt(process.env.FEISHU_CODEX_POLL_INTERVAL_MS || '0', 10);
const POLL_PAGE_SIZE = Number.parseInt(process.env.FEISHU_CODEX_POLL_PAGE_SIZE || '20', 10);
const PROCESSED_MESSAGE_LIMIT = Number.parseInt(process.env.FEISHU_CODEX_PROCESSED_MESSAGE_LIMIT || '500', 10);
const TYPING_REACTION_EMOJI = process.env.FEISHU_CODEX_TYPING_REACTION_EMOJI || 'Typing';
const PROGRESS_UPDATES_ENABLED = process.env.FEISHU_CODEX_PROGRESS_UPDATES !== '0';
const PROGRESS_MIN_INTERVAL_MS = Number.parseInt(process.env.FEISHU_CODEX_PROGRESS_MIN_INTERVAL_MS || '15000', 10);
const PROGRESS_MAX_PER_TURN = Number.parseInt(process.env.FEISHU_CODEX_PROGRESS_MAX_PER_TURN || '4', 10);
const PROGRESS_MAX_CHARS = Number.parseInt(process.env.FEISHU_CODEX_PROGRESS_MAX_CHARS || '220', 10);
const AUTO_BIND_FEISHU_CHAT = process.env.FEISHU_CODEX_AUTO_BIND === '1' || (!CHAT_ID && !USER_ID);

const BRIDGE_DEVELOPER_INSTRUCTIONS = [
  '这条 Codex thread 的入口和出口桥接到飞书。',
  '用户消息按普通 Codex 对话处理；不要在回复里说明消息来自飞书。',
  'final answer 会同步回飞书，所以保持短、清楚、适合直接发给用户。',
  '涉及破坏性操作、公开发布、远端写入、发送邮件/消息等离开本机的动作时，先要求用户确认，不要自行执行。',
].join('\n');

mkdirSync(LOG_DIR, { recursive: true });
mkdirSync(ATTACHMENT_DIR, { recursive: true });
const runLog = createWriteStream(path.join(LOG_DIR, 'bridge.log'), { flags: 'a' });
const keepAlive = setInterval(() => {}, 60_000);

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.map(String).join(' ')}`;
  console.error(line);
  runLog.write(`${line}\n`);
}

if (process.env.FEISHU_CODEX_DRY_RUN === '1') {
  log('dry-run ok', `workdir=${WORKDIR}`, `profile=${LARK_PROFILE}`, `thread=${THREAD_NAME}`);
  clearInterval(keepAlive);
  process.stdout.write('dry-run ok\n');
  process.exit(0);
}

process.on('uncaughtException', (err) => {
  log('uncaughtException:', err.stack || err.message || err);
});

process.on('unhandledRejection', (reason) => {
  log('unhandledRejection:', reason?.stack || reason?.message || reason);
});

process.on('beforeExit', (code) => {
  log('beforeExit:', code);
});

process.on('exit', (code) => {
  runLog.write(`[${new Date().toISOString()}] exit: ${code}\n`);
});

function loadState() {
  if (!existsSync(STATE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch (err) {
    log('state read failed:', err.message);
    return {};
  }
}

function saveState(state) {
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function textInput(text) {
  return [{ type: 'text', text, text_elements: [] }];
}

function readTaskCompleteFromSession(sessionPath, turnId) {
  if (!sessionPath || !existsSync(sessionPath)) return null;
  const lines = readFileSync(sessionPath, 'utf8').split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line || !line.includes(turnId) || !line.includes('task_complete')) continue;
    try {
      const record = JSON.parse(line);
      const payload = record.payload || {};
      if (payload.type !== 'task_complete' || payload.turn_id !== turnId) continue;
      return {
        completedAt: record.timestamp || '',
        message: typeof payload.last_agent_message === 'string' ? payload.last_agent_message : '',
      };
    } catch {
      // Keep scanning older lines; session JSONL can contain large records.
    }
  }
  return null;
}

async function waitForTaskCompleteInSession(sessionPath, turnId, timeoutMs = TURN_RECOVERY_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() <= deadline) {
    const completed = readTaskCompleteFromSession(sessionPath, turnId);
    if (completed) return completed;
    await sleep(TURN_RECOVERY_POLL_MS);
  }
  return null;
}

function loadOpenAIKeyFromAuth() {
  const keyFile = process.env.FEISHU_CODEX_OPENAI_API_KEY_FILE;
  if (keyFile) {
    try {
      const raw = readFileSync(keyFile.replace(/^~/, process.env.HOME || ''), 'utf8');
      const trimmed = raw.trim();
      if (trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed.OPENAI_API_KEY === 'string' && parsed.OPENAI_API_KEY) return parsed.OPENAI_API_KEY;
        if (typeof parsed.api_key === 'string' && parsed.api_key) return parsed.api_key;
      }
      if (/^[A-Za-z0-9._~+/=-]{12,}$/.test(trimmed) && !trimmed.includes('\n')) return trimmed;
      const lines = raw.split(/\r?\n/);
      const apiKeysAt = lines.findIndex((line) => line.trim() === 'api-keys:');
      if (apiKeysAt >= 0) {
        for (const line of lines.slice(apiKeysAt + 1)) {
          if (/^\S/.test(line) && line.trim() && !line.trim().startsWith('-')) break;
          const match = line.match(/^\s*-\s*['"]?([^'"\s#]+)['"]?/);
          if (match?.[1]) return match[1];
        }
      }
    } catch (err) {
      log('openai key file read failed:', err.message);
    }
  }
  try {
    const auth = JSON.parse(readFileSync(path.join(process.env.HOME || '', '.codex', 'auth.json'), 'utf8'));
    return typeof auth.OPENAI_API_KEY === 'string' && auth.OPENAI_API_KEY ? auth.OPENAI_API_KEY : null;
  } catch (err) {
    log('codex auth read failed:', err.message);
    return null;
  }
}

class CodexAppClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.connecting = null;
    this.nextId = 1;
    this.pending = new Map();
    this.activeTurn = null;
    this.lastError = null;
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async connect() {
    if (this.isOpen()) return;
    if (this.connecting) {
      await this.connecting;
      return;
    }
    this.connecting = this.openWebSocket();
    try {
      await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  async openWebSocket() {
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.addEventListener('message', (event) => this.onMessage(event));
    ws.addEventListener('error', (event) => {
      const message = event.message || event.type || 'Codex WebSocket error';
      log('codex ws error:', message);
      this.recoverActiveTurn(new Error(message));
    });
    ws.addEventListener('close', (event) => {
      const message = `Codex WebSocket closed (${event.code || 'no-code'} ${event.reason || ''})`.trim();
      log('codex ws close:', message);
      if (this.ws === ws) this.ws = null;
      this.connecting = null;
      this.recoverActiveTurn(new Error(message));
      this.rejectPending(new Error(message));
    });
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
    await this.request('initialize', {
      clientInfo: { name: 'feishu-codex-app-bridge', version: '0.1.0', title: 'Feishu Codex Bridge' },
      capabilities: { experimentalApi: true },
    });
    ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'initialized' }));
    log('codex ws connected');
  }

  async ensureReady(threadId) {
    if (this.isOpen()) return;
    await this.connect();
    await this.request('thread/resume', {
      threadId,
      cwd: WORKDIR,
      approvalPolicy: 'never',
      sandbox: 'danger-full-access',
      developerInstructions: BRIDGE_DEVELOPER_INSTRUCTIONS,
      persistExtendedHistory: true,
    });
  }

  failActiveTurn(err) {
    if (!this.activeTurn) return;
    const turn = this.activeTurn;
    this.activeTurn = null;
    if (turn.timeout) clearTimeout(turn.timeout);
    if (turn.stallTimeout) clearTimeout(turn.stallTimeout);
    if (turn.sessionPoll) clearInterval(turn.sessionPoll);
    turn.reject(err);
  }

  completeActiveTurnFromSession(turn, completed) {
    if (this.activeTurn?.turnId !== turn.turnId) return;
    this.activeTurn = null;
    if (turn.timeout) clearTimeout(turn.timeout);
    if (turn.stallTimeout) clearTimeout(turn.stallTimeout);
    if (turn.sessionPoll) clearInterval(turn.sessionPoll);
    log('turn completed from session:', turn.turnId, completed.completedAt || '');
    const answer = (completed.message || turn.final || turn.lastAgent || turn.delta || '').trim();
    turn.resolve(answer || '我这边完成了，但没有拿到可发送的文本回复。');
  }

  recoverActiveTurn(err) {
    if (!this.activeTurn) return;
    const turn = this.activeTurn;
    if (turn.recovering) return;
    turn.recovering = true;
    turn.lastError = err;
    if (turn.stallTimeout) {
      clearTimeout(turn.stallTimeout);
      turn.stallTimeout = null;
    }
    log('turn recovery started:', turn.turnId, err.message);
    turn.onProgress?.('连接有点抖，我还在等 Codex 完成结果。');
    waitForTaskCompleteInSession(turn.sessionPath, turn.turnId)
      .then((completed) => {
        if (this.activeTurn?.turnId !== turn.turnId) return;
        this.activeTurn = null;
        if (turn.timeout) clearTimeout(turn.timeout);
        if (turn.stallTimeout) clearTimeout(turn.stallTimeout);
        if (turn.sessionPoll) clearInterval(turn.sessionPoll);
        if (!completed) {
          turn.reject(new Error(`Codex WebSocket closed and recovery timed out after ${Math.round(TURN_RECOVERY_TIMEOUT_MS / 1000)}s`));
          return;
        }
        log('turn recovered from session:', turn.turnId, completed.completedAt || '');
        const answer = (completed.message || turn.final || turn.lastAgent || turn.delta || '').trim();
        turn.resolve(answer || '我这边完成了，但没有拿到可发送的文本回复。');
      })
      .catch((recoveryErr) => {
        if (this.activeTurn?.turnId !== turn.turnId) return;
        this.activeTurn = null;
        if (turn.timeout) clearTimeout(turn.timeout);
        if (turn.stallTimeout) clearTimeout(turn.stallTimeout);
        if (turn.sessionPoll) clearInterval(turn.sessionPoll);
        turn.reject(recoveryErr);
      });
  }

  touchActiveTurn() {
    if (!this.activeTurn?.refreshStallTimeout) return;
    this.activeTurn.refreshStallTimeout();
  }

  rejectPending(err) {
    for (const [id, pending] of this.pending.entries()) {
      this.pending.delete(id);
      clearTimeout(pending.timeout);
      pending.reject(err);
    }
  }

  request(method, params) {
    if (!this.isOpen()) return Promise.reject(new Error('Codex WebSocket is not connected'));
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`${method} timed out after ${REQUEST_TIMEOUT_MS}ms`));
      }, REQUEST_TIMEOUT_MS);
      this.pending.set(id, { method, resolve, reject, timeout });
    });
  }

  onMessage(event) {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (err) {
      log('codex message parse failed:', err.message);
      return;
    }

    if (msg.id && this.pending.has(msg.id)) {
      this.touchActiveTurn();
      const pending = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      clearTimeout(pending.timeout);
      if (msg.error) pending.reject(new Error(`${pending.method}: ${JSON.stringify(msg.error)}`));
      else pending.resolve(msg.result);
      return;
    }

    if (msg.id && msg.method) {
      this.touchActiveTurn();
      this.answerServerRequest(msg);
      return;
    }

    if (msg.method === 'item/agentMessage/delta' && this.activeTurn?.turnId === msg.params.turnId) {
      this.touchActiveTurn();
      this.activeTurn.delta += msg.params.delta;
      return;
    }

    if (msg.method === 'item/completed' && this.activeTurn?.turnId === msg.params.turnId) {
      this.touchActiveTurn();
      const item = msg.params.item;
      if (item?.type === 'agentMessage') {
        if (item.phase === 'final_answer') this.activeTurn.final = item.text || '';
        else {
          this.activeTurn.lastAgent = item.text || this.activeTurn.lastAgent || '';
          if (item.phase === 'commentary') this.activeTurn.onProgress?.(item.text);
        }
      } else {
        const summary = summarizeCodexItem(item);
        if (summary) this.activeTurn.onProgress?.(summary);
      }
      return;
    }

    if (msg.method === 'turn/completed' && this.activeTurn?.turnId === msg.params.turn.id) {
      const turn = this.activeTurn;
      this.activeTurn = null;
      if (turn.timeout) clearTimeout(turn.timeout);
      if (turn.stallTimeout) clearTimeout(turn.stallTimeout);
      if (turn.sessionPoll) clearInterval(turn.sessionPoll);
      const answer = (turn.final || turn.lastAgent || turn.delta || '').trim();
      if (!answer && turn.lastError) {
        turn.reject(turn.lastError);
        return;
      }
      turn.resolve(answer || '我这边完成了，但没有拿到可发送的文本回复。');
    }

    if (msg.method === 'error') {
      this.touchActiveTurn();
      log('codex error notification:', JSON.stringify(msg.params));
      const turnId = msg.params?.turnId;
      if (this.activeTurn && (!turnId || this.activeTurn.turnId === turnId)) {
        const message = msg.params?.error?.additionalDetails
          || msg.params?.error?.message
          || msg.params?.message
          || 'Codex turn failed';
        this.activeTurn.lastError = new Error(message);
      }
    }
  }

  answerServerRequest(msg) {
    const method = msg.method;
    log('server request:', method);
    let result = {};
    if (method === 'item/commandExecution/requestApproval' || method === 'item/fileChange/requestApproval') {
      result = { decision: 'cancel' };
    } else if (method === 'item/permissions/requestApproval') {
      result = { permissions: {}, scope: 'turn' };
    } else if (method === 'execCommandApproval' || method === 'applyPatchApproval') {
      result = { decision: 'abort' };
    } else if (method === 'item/tool/requestUserInput') {
      result = { answers: {} };
    } else {
      this.ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: msg.id,
        error: { code: -32000, message: `Bridge cannot handle server request: ${method}` },
      }));
      return;
    }
    this.ws.send(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result }));
  }

  async ensureThread(state) {
    if (state.threadId) {
      try {
        await this.request('thread/resume', {
          threadId: state.threadId,
          cwd: WORKDIR,
          approvalPolicy: 'never',
          sandbox: 'danger-full-access',
          developerInstructions: BRIDGE_DEVELOPER_INSTRUCTIONS,
          persistExtendedHistory: true,
        });
        return state.threadId;
      } catch (err) {
        log('thread resume failed; starting a new thread:', err.message);
      }
    }

    const started = await this.request('thread/start', {
      cwd: WORKDIR,
      approvalPolicy: 'never',
      sandbox: 'danger-full-access',
      ephemeral: false,
      experimentalRawEvents: false,
      persistExtendedHistory: true,
      sessionStartSource: 'startup',
      developerInstructions: BRIDGE_DEVELOPER_INSTRUCTIONS,
    });
    const threadId = started.thread.id;
    await this.request('thread/name/set', { threadId, name: THREAD_NAME }).catch((err) => {
      log('thread name set failed:', err.message);
    });
    state.threadId = threadId;
    state.threadPath = started.thread.path;
    state.createdAt = new Date().toISOString();
    saveState(state);
    return threadId;
  }

  async runTurn(threadId, text, options = {}) {
    if (this.activeTurn) throw new Error('Codex turn already running');
    await this.ensureReady(threadId);
    const response = await this.request('turn/start', {
      threadId,
      cwd: WORKDIR,
      input: textInput(text),
      approvalPolicy: 'never',
      sandboxPolicy: { type: 'dangerFullAccess' },
    });
    const turnId = response.turn.id;
    log('turn started:', turnId);
    return await new Promise((resolve, reject) => {
      const timeout = TURN_TIMEOUT_MS > 0 ? setTimeout(async () => {
          if (this.activeTurn?.turnId !== turnId) return;
          log('turn timed out:', turnId);
          const turn = this.activeTurn;
          this.activeTurn = null;
          if (turn?.sessionPoll) clearInterval(turn.sessionPoll);
          await this.request('turn/interrupt', { threadId, turnId }).catch((err) => {
            log('turn interrupt failed:', err.message);
          });
          reject(new Error(`Codex turn timed out after ${Math.round(TURN_TIMEOUT_MS / 1000)}s`));
        }, TURN_TIMEOUT_MS) : null;
      let stallTimeout = null;
      const refreshStallTimeout = () => {
        if (TURN_STALL_TIMEOUT_MS <= 0) return;
        if (stallTimeout) clearTimeout(stallTimeout);
        stallTimeout = setTimeout(async () => {
          if (this.activeTurn?.turnId !== turnId) return;
          log('turn stalled:', turnId, `no codex event for ${TURN_STALL_TIMEOUT_MS}ms`);
          const turn = this.activeTurn;
          this.activeTurn = null;
          if (turn?.sessionPoll) clearInterval(turn.sessionPoll);
          await this.request('turn/interrupt', { threadId, turnId }).catch((err) => {
            log('stalled turn interrupt failed:', err.message);
          });
          reject(new Error(`Codex turn stalled after ${Math.round(TURN_STALL_TIMEOUT_MS / 1000)}s without events`));
        }, TURN_STALL_TIMEOUT_MS);
        if (this.activeTurn?.turnId === turnId) this.activeTurn.stallTimeout = stallTimeout;
      };
      this.activeTurn = {
        turnId,
        sessionPath: options.sessionPath || '',
        delta: '',
        final: '',
        lastAgent: '',
        lastError: null,
        recovering: false,
        onProgress: options.onProgress,
        resolve,
        reject,
        timeout,
        stallTimeout,
        refreshStallTimeout,
      };
      if (this.activeTurn.sessionPath) {
        this.activeTurn.sessionPoll = setInterval(() => {
          const turn = this.activeTurn;
          if (!turn || turn.turnId !== turnId) return;
          const completed = readTaskCompleteFromSession(turn.sessionPath, turn.turnId);
          if (completed) this.completeActiveTurnFromSession(turn, completed);
        }, TURN_RECOVERY_POLL_MS);
      }
      refreshStallTimeout();
    });
  }
}

function startCodexServer() {
  const env = { ...process.env };
  const openAIKey = env.OPENAI_API_KEY || loadOpenAIKeyFromAuth();
  const args = ['app-server', '--listen', APP_SERVER_URL];
  if (openAIKey) {
    env.OPENAI_API_KEY = openAIKey;
    args.push('-c', `model_provider="${MODEL_PROVIDER}"`);
    args.push(
      '-c',
      `model_providers.${MODEL_PROVIDER}.name="${MODEL_PROVIDER_NAME}"`,
      '-c',
      `model_providers.${MODEL_PROVIDER}.env_key="OPENAI_API_KEY"`,
      '-c',
      `model_providers.${MODEL_PROVIDER}.requires_openai_auth=false`,
    );
    if (MODEL_PROVIDER_BASE_URL) {
      args.push('-c', `model_providers.${MODEL_PROVIDER}.base_url="${MODEL_PROVIDER_BASE_URL}"`);
    }
    if (MODEL_PROVIDER_WIRE_API) {
      args.push('-c', `model_providers.${MODEL_PROVIDER}.wire_api="${MODEL_PROVIDER_WIRE_API}"`);
    }
  }
  const server = spawn('codex', args, {
    cwd: WORKDIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => runLog.write(`[codex stdout] ${chunk}`));
  server.stderr.on('data', (chunk) => runLog.write(`[codex stderr] ${chunk}`));
  server.on('error', (err) => log('codex app-server spawn error:', err.stack || err.message));
  server.on('exit', (code, signal) => log('codex app-server exited:', code, signal));
  server.on('close', (code, signal) => log('codex app-server closed:', code, signal));
  return server;
}

async function waitForCodexServerReady() {
  const readyzUrl = `http://127.0.0.1:${PORT}/readyz`;
  const deadline = Date.now() + APP_SERVER_READY_TIMEOUT_MS;
  let lastErr = null;
  while (Date.now() <= deadline) {
    try {
      const response = await fetch(readyzUrl);
      if (response.ok) return;
      lastErr = new Error(`${readyzUrl} -> ${response.status}`);
    } catch (err) {
      lastErr = err;
    }
    await sleep(500);
  }
  throw new Error(`codex app-server not ready after ${Math.round(APP_SERVER_READY_TIMEOUT_MS / 1000)}s: ${lastErr?.message || 'unknown error'}`);
}

async function connectCodexWithRetry(codex) {
  const deadline = Date.now() + APP_SERVER_READY_TIMEOUT_MS;
  let lastErr = null;
  while (Date.now() <= deadline) {
    try {
      await codex.connect();
      return;
    } catch (err) {
      lastErr = err;
      await sleep(1000);
    }
  }
  throw lastErr || new Error('Codex WebSocket connect failed');
}

function startLarkEvents() {
  const child = spawn('lark-cli', [
    '--profile', LARK_PROFILE,
    'event', '+subscribe',
    '--as', 'bot',
    '--compact',
    '--event-types', 'im.message.receive_v1',
  ], { cwd: WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stderr.on('data', (chunk) => runLog.write(`[lark stderr] ${chunk}`));
  child.on('error', (err) => log('lark event subscriber spawn error:', err.stack || err.message));
  child.on('exit', (code, signal) => log('lark event subscriber exited:', code, signal));
  child.on('close', (code, signal) => log('lark event subscriber closed:', code, signal));
  return child;
}

async function replyToFeishu(messageId, text) {
  return await new Promise((resolve, reject) => {
    const child = spawn('lark-cli', [
      '--profile', LARK_PROFILE,
      'im', '+messages-reply',
      '--as', 'bot',
      '--message-id', messageId,
      '--text', text.slice(0, 4000),
    ], { cwd: WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (spawnErr) => reject(spawnErr));
    child.on('exit', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || out || `lark reply exited ${code}`));
    });
  });
}

function safeFileName(value) {
  return String(value || 'attachment').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 160) || 'attachment';
}

function relativePathForLarkCli(filePath) {
  const rel = path.relative(WORKDIR, filePath);
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) return rel || path.basename(filePath);
  const target = path.join(ATTACHMENT_DIR, `outgoing-${Date.now()}-${safeFileName(path.basename(filePath))}`);
  copyFileSync(filePath, target);
  return path.relative(WORKDIR, target);
}

function downloadedPathFromOutput(outputRel, stdout) {
  const parsed = (() => {
    try {
      return JSON.parse(stdout);
    } catch {
      return null;
    }
  })();
  const directPath = parsed?.path || parsed?.file || parsed?.output || parsed?.data?.path || parsed?.data?.file;
  if (directPath) return path.isAbsolute(directPath) ? directPath : path.resolve(WORKDIR, directPath);
  const abs = path.resolve(WORKDIR, outputRel);
  if (existsSync(abs)) return abs;
  const dir = path.dirname(abs);
  const base = path.basename(abs);
  try {
    const match = readdirSync(dir).find((name) => name === base || name.startsWith(`${base}.`));
    if (match) return path.join(dir, match);
  } catch {
    // Fall through to the requested path for a clearer downstream error.
  }
  return abs;
}

async function downloadFeishuAttachment(messageId, attachment) {
  if (!attachment?.fileKey) return attachment;
  const resourceType = attachment.type === 'image' ? 'image' : 'file';
  const ext = attachment.name ? path.extname(attachment.name) : (resourceType === 'image' ? '.png' : '');
  const outputName = `${safeFileName(messageId)}-${safeFileName(attachment.fileKey)}${ext || ''}`;
  const outputRel = path.join(path.relative(WORKDIR, ATTACHMENT_DIR), outputName);
  const output = await new Promise((resolve, reject) => {
    const child = spawn('lark-cli', [
      '--profile', LARK_PROFILE,
      'im', '+messages-resources-download',
      '--as', 'bot',
      '--message-id', messageId,
      '--file-key', attachment.fileKey,
      '--type', resourceType,
      '--output', outputRel,
    ], { cwd: WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (spawnErr) => reject(spawnErr));
    child.on('exit', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || out || `lark resource download exited ${code}`));
    });
  });
  return {
    ...attachment,
    path: downloadedPathFromOutput(outputRel, output),
  };
}

async function hydrateFeishuEvent(event) {
  const attachments = [];
  for (const attachment of event.attachments || []) {
    attachments.push(await downloadFeishuAttachment(event.messageId, attachment));
  }
  return { ...event, attachments };
}

async function replySegmentToFeishu(messageId, segment) {
  if (!segment) return '';
  if (segment.type === 'text') return await replyToFeishu(messageId, segment.text || '');
  const args = ['--profile', LARK_PROFILE, 'im', '+messages-reply', '--as', 'bot', '--message-id', messageId];
  if (segment.type === 'markdown') {
    args.push('--markdown', String(segment.text || '').slice(0, 4000));
  } else if (segment.type === 'interactive') {
    args.push('--msg-type', 'interactive', '--content', JSON.stringify(segment.content || {}));
  } else if (segment.type === 'image') {
    args.push('--image', relativePathForLarkCli(segment.path));
  } else if (segment.type === 'file') {
    args.push('--file', relativePathForLarkCli(segment.path));
  } else if (segment.type === 'audio') {
    args.push('--audio', relativePathForLarkCli(segment.path));
  } else if (segment.type === 'video') {
    args.push('--video', relativePathForLarkCli(segment.path));
  } else {
    args.push('--text', JSON.stringify(segment).slice(0, 4000));
  }
  return await new Promise((resolve, reject) => {
    const child = spawn('lark-cli', args, { cwd: WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (spawnErr) => reject(spawnErr));
    child.on('exit', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || out || `lark reply exited ${code}`));
    });
  });
}

async function replyPlannedSegmentsWithRetry(messageId, answer, label) {
  const segments = planFeishuReplies(answer, { cwd: WORKDIR });
  for (let index = 0; index < segments.length; index += 1) {
    await replyToFeishuWithRetry(messageId, segments[index], `${label} segment ${index + 1}/${segments.length}`, replySegmentToFeishu);
  }
}

async function replyToFeishuWithRetry(messageId, payload, label, sender = replyToFeishu) {
  const delays = [0, 1500, 5000];
  let lastErr;
  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt] > 0) await sleep(delays[attempt]);
    try {
      return await sender(messageId, payload);
    } catch (err) {
      lastErr = err;
      log(`${label} reply failed:`, messageId, `attempt=${attempt + 1}`, err.message);
    }
  }
  throw lastErr;
}

function redactSensitiveText(text) {
  return String(text || '')
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, 'sk-***')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/gi, 'Bearer ***')
    .replace(/\bOPENAI_API_KEY\s*=\s*[^\s"'`]+/gi, 'OPENAI_API_KEY=***')
    .replace(/\b(feishu|lark|app|tenant|user|refresh|access|api)[_-]?token\s*[:=]\s*[A-Za-z0-9._~+/=-]{12,}\b/gi, '$1_token=***')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, (email) => {
      const [name, domain] = email.split('@');
      if (!name || !domain) return email;
      return `${name.slice(0, 2)}***@${domain}`;
    });
}

function sanitizeProgressText(text) {
  const redacted = redactSensitiveText(text)
    .replace(/```[\s\S]*?```/g, '[代码块]')
    .replace(/\s+/g, ' ')
    .trim();
  if (!redacted) return '';
  if (redacted.length <= PROGRESS_MAX_CHARS) return redacted;
  return `${redacted.slice(0, Math.max(0, PROGRESS_MAX_CHARS - 1)).trim()}…`;
}

function commandVerb(cmd) {
  const trimmed = String(cmd || '').trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts[0] === 'sed' || parts[0] === 'cat' || parts[0] === 'tail' || parts[0] === 'head' || parts[0] === 'nl') {
    return '正在读取本机文件。';
  }
  if (parts[0] === 'rg' || parts[0] === 'find' || parts[0] === 'grep') return '正在搜索本机文件。';
  if (parts[0] === 'node' || parts[0] === 'npm' || parts[0] === 'pnpm' || parts[0] === 'yarn') return `正在运行 ${parts[0]}。`;
  if (parts[0] === 'git') return '正在查看 git 状态。';
  return `正在运行命令：${parts.slice(0, 3).join(' ')}`;
}

function summarizeCodexItem(item) {
  if (!item || typeof item !== 'object') return '';
  const type = item.type || '';
  if (type === 'commandExecution') return commandVerb(item.command || item.cmd || item.input);
  if (type === 'functionCall' || type === 'customToolCall' || type === 'toolCall') {
    const name = item.name || item.toolName || '';
    if (name === 'exec_command') {
      try {
        const args = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : item.arguments;
        return commandVerb(args?.cmd || args?.command);
      } catch {
        return '正在运行本机命令。';
      }
    }
    if (name === 'apply_patch') return '正在修改本机文件。';
    if (name) return `正在调用工具：${name}`;
  }
  return '';
}

function createProgressReporter(messageId) {
  let count = 0;
  let lastSentAt = 0;
  let lastText = '';
  let closed = false;
  return {
    send(text) {
      if (closed) return;
      if (!PROGRESS_UPDATES_ENABLED || PROGRESS_MAX_PER_TURN <= 0) return;
      const sanitized = sanitizeProgressText(text);
      if (!sanitized || sanitized === lastText) return;
      const now = Date.now();
      if (count > 0 && now - lastSentAt < PROGRESS_MIN_INTERVAL_MS) return;
      if (count >= PROGRESS_MAX_PER_TURN) return;
      count += 1;
      lastSentAt = now;
      lastText = sanitized;
      replyToFeishu(messageId, sanitized)
        .then(() => log('progress replied:', messageId, `count=${count}`))
        .catch((err) => log('progress reply failed:', messageId, err.message));
    },
    close() {
      closed = true;
    },
  };
}

async function addTypingReaction(messageId) {
  return await new Promise((resolve, reject) => {
    const child = spawn('lark-cli', [
      '--profile', LARK_PROFILE,
      'im', 'reactions', 'create',
      '--as', 'bot',
      '--params', JSON.stringify({ message_id: messageId }),
      '--data', JSON.stringify({ reaction_type: { emoji_type: TYPING_REACTION_EMOJI } }),
    ], { cwd: WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (spawnErr) => reject(spawnErr));
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(err || out || `lark reaction create exited ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(out);
        const reactionId = parsed.data?.reaction_id || parsed.reaction_id;
        if (!reactionId) {
          reject(new Error(`lark reaction create returned no reaction_id: ${out.slice(0, 300)}`));
          return;
        }
        resolve(reactionId);
      } catch (parseErr) {
        reject(new Error(`lark reaction create parse failed: ${parseErr.message}`));
      }
    });
  });
}

async function deleteTypingReaction(messageId, reactionId) {
  if (!reactionId) return;
  return await new Promise((resolve, reject) => {
    const child = spawn('lark-cli', [
      '--profile', LARK_PROFILE,
      'im', 'reactions', 'delete',
      '--as', 'bot',
      '--params', JSON.stringify({ message_id: messageId, reaction_id: reactionId }),
    ], { cwd: WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (spawnErr) => reject(spawnErr));
    child.on('exit', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || out || `lark reaction delete exited ${code}`));
    });
  });
}

async function listRecentFeishuMessages(chatId) {
  if (!chatId) return [];
  return await new Promise((resolve, reject) => {
    const child = spawn('lark-cli', [
      '--profile', LARK_PROFILE,
      'im', '+chat-messages-list',
      '--as', 'user',
      '--chat-id', chatId,
      '--page-size', String(POLL_PAGE_SIZE),
      '--sort', 'desc',
      '--format', 'json',
    ], { cwd: WORKDIR, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (spawnErr) => reject(spawnErr));
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(err || out || `lark messages list exited ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(out);
        resolve(parsed.data?.messages || []);
      } catch (parseErr) {
        reject(new Error(`lark messages list parse failed: ${parseErr.message}`));
      }
    });
  });
}

function normalizeFeishuEvent(line, binding) {
  if (!line.trim().startsWith('{')) return null;
  const event = JSON.parse(line);
  if (event.type !== 'im.message.receive_v1') return null;
  if (binding.chatId && event.chat_id !== binding.chatId) return null;
  if (binding.userId && event.sender_id !== binding.userId) return null;
  if (!binding.chatId && AUTO_BIND_FEISHU_CHAT && event.chat_type !== 'p2p') return null;
  const { text, attachments } = parseFeishuContent(event.message_type, event.content);
  if (!text && attachments.length === 0) return null;
  return {
    text,
    attachments,
    messageType: event.message_type,
    messageId: event.message_id || event.id,
    chatId: event.chat_id,
    senderId: event.sender_id,
    raw: event,
  };
}

function normalizePolledFeishuMessage(message, binding) {
  if (message.sender?.sender_type !== 'user') return null;
  if (binding.userId && message.sender?.id !== binding.userId) return null;
  if (message.deleted) return null;
  const { text, attachments } = parseFeishuContent(message.msg_type, message.content);
  if (!text && attachments.length === 0) return null;
  return {
    text,
    attachments,
    messageType: message.msg_type,
    messageId: message.message_id,
    chatId: message.chat_id,
    senderId: message.sender?.id,
    raw: message,
  };
}

async function main() {
  log('starting bridge in', WORKDIR);
  const state = loadState();
  const processedMessages = new Set(Array.isArray(state.processedMessageIds) ? state.processedMessageIds : []);
  const queuedMessages = new Set();
  const currentBinding = () => ({
    chatId: CHAT_ID || state.feishuChatId || '',
    userId: USER_ID || state.feishuUserId || '',
  });
  const rememberBinding = (event) => {
    if (!AUTO_BIND_FEISHU_CHAT || state.feishuChatId) return;
    if (!event.chatId || !event.senderId) return;
    state.feishuChatId = event.chatId;
    state.feishuUserId = event.senderId;
    state.feishuBoundAt = new Date().toISOString();
    saveState(state);
    log('feishu channel auto-bound:', event.chatId, event.senderId);
  };
  const rememberProcessed = (messageId) => {
    if (!messageId) return;
    processedMessages.add(messageId);
    state.processedMessageIds = Array.from(processedMessages).slice(-PROCESSED_MESSAGE_LIMIT);
    saveState(state);
  };
  const shouldStartServer = !process.env.FEISHU_CODEX_APP_SERVER_URL;
  const server = shouldStartServer ? startCodexServer() : null;
  if (server) await waitForCodexServerReady();
  const codex = new CodexAppClient(APP_SERVER_URL);
  await connectCodexWithRetry(codex);
  const threadId = await codex.ensureThread(state);
  log('codex thread ready:', threadId);

  const lark = startLarkEvents();
  const rl = readline.createInterface({ input: lark.stdout });
  let queue = Promise.resolve();

  const enqueueEvent = (event, source) => {
    if (!event?.messageId) return;
    rememberBinding(event);
    if (processedMessages.has(event.messageId) || queuedMessages.has(event.messageId)) {
      if (source !== 'poll') log('skip duplicate message:', event.messageId, source);
      return;
    }
    queuedMessages.add(event.messageId);
    queue = queue.then(async () => {
      log('feishu message:', event.messageId, `[${source}]`, event.messageType || 'unknown', event.text || `[${event.attachments?.length || 0} attachment(s)]`);
      const progress = createProgressReporter(event.messageId);
      let typingReactionId = null;
      try {
        typingReactionId = await addTypingReaction(event.messageId);
        log('typing reaction added:', event.messageId, typingReactionId);
      } catch (err) {
        log('typing reaction add failed:', event.messageId, err.message);
      }
      let slowReplySent = false;
      const slowReplyTimer = SLOW_REPLY_MS > 0 ? setTimeout(() => {
        slowReplySent = true;
        replyToFeishuWithRetry(event.messageId, SLOW_REPLY_TEXT, 'slow').catch((err) => {
          log('slow reply exhausted:', event.messageId, err.message);
        });
      }, SLOW_REPLY_MS) : null;
      try {
        const hydratedEvent = await hydrateFeishuEvent(event);
        const prompt = createCodexInputText(hydratedEvent);
        const answer = await codex.runTurn(threadId, prompt, {
          onProgress: progress.send,
          sessionPath: state.threadPath,
        });
        progress.close();
        if (slowReplyTimer) clearTimeout(slowReplyTimer);
        await deleteTypingReaction(event.messageId, typingReactionId).catch((err) => {
          log('typing reaction delete failed:', event.messageId, err.message);
        });
        typingReactionId = null;
        await replyPlannedSegmentsWithRetry(event.messageId, answer, 'final');
        rememberProcessed(event.messageId);
        log('replied:', event.messageId, slowReplySent ? '(after slow reply)' : '');
      } catch (err) {
        progress.close();
        if (slowReplyTimer) clearTimeout(slowReplyTimer);
        await deleteTypingReaction(event.messageId, typingReactionId).catch((deleteErr) => {
          log('typing reaction delete failed:', event.messageId, deleteErr.message);
        });
        typingReactionId = null;
        log('turn failed:', err.stack || err.message);
        await replyToFeishuWithRetry(event.messageId, `这条消息桥接到 Codex 时失败了：${err.message}`, 'failure').catch((replyErr) => {
          log('failure reply failed:', replyErr.message);
        });
        rememberProcessed(event.messageId);
      } finally {
        queuedMessages.delete(event.messageId);
      }
    });
  };

  rl.on('line', (line) => {
    runLog.write(`[lark stdout] ${line}\n`);
    let event;
    try {
      event = normalizeFeishuEvent(line, currentBinding());
    } catch (err) {
      log('feishu event parse failed:', err.message);
      return;
    }
    if (!event) return;

    enqueueEvent(event, 'event');
  });

  const pollRecentMessages = async () => {
    try {
      const binding = currentBinding();
      const messages = await listRecentFeishuMessages(binding.chatId);
      for (const message of messages.reverse()) {
        const event = normalizePolledFeishuMessage(message, binding);
        if (event) enqueueEvent(event, 'poll');
      }
    } catch (err) {
      log('feishu poll failed:', err.message);
    }
  };
  const poller = POLL_INTERVAL_MS > 0 ? setInterval(pollRecentMessages, POLL_INTERVAL_MS) : null;
  if (process.env.FEISHU_CODEX_POLL_ON_STARTUP !== '0') pollRecentMessages();

  const shutdown = () => {
    log('shutting down');
    clearInterval(keepAlive);
    if (poller) clearInterval(poller);
    lark.kill('SIGTERM');
    if (server) server.kill('SIGTERM');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  log('fatal:', err.stack || err.message);
  process.exit(1);
});
