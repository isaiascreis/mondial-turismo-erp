@ -15,31 +15,30 @@ const qrcode = require('qrcode');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const admin = require('firebase-admin');

const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const tmp = require('tmp');
const mime = require('mime-types');

// >>> FFMPEG estático
// >>> FFmpeg estático (no topo)
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
  ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic);
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

// ---------------------- Firebase ----------------------
let db;
try {
  // Conexão com Firebase via Service Account (env var)
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  const bucketNameFromEnv = (process.env.FIREBASE_STORAGE_BUCKET
  || `${serviceAccount.project_id}.appspot.com`)
  .replace('firebasestorage.app', 'appspot.com');

  
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucketNameFromEnv
  databaseURL: "https://mondialsistemamodular-default-rtdb.firebaseio.com",
  storageBucket: "mondialsistemamodular.appspot.com"
});

console.log('Bucket configurado:', admin.storage().bucket().name);
@ -50,9 +49,7 @@ console.log('Bucket configurado:', admin.storage().bucket().name);
  console.error('ERRO CRÍTICO: Falha ao ler FIREBASE_SERVICE_ACCOUNT.', error);
  process.exit(1);
}
}

// ---------------------- App Express ----------------------------------
// ---------------------- App Express + CORS ---------------------------
const app = express();
app.use(express.json({ limit: '25mb' }));
@ -71,12 +68,10 @@ app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Se preferir liberar geral, troque por: res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
@ -90,60 +85,50 @@ const port = process.env.PORT || 3000;
let qrCodeDataUrl = '';
let clientStatus = 'Iniciando servidor...';

    headless: true,
    timeout: 120000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote',
      '--single-process', '--disable-gpu',
    ],
  },
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        timeout: 120000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
    }
});

// ---------------------- Helpers (voz/mídia) ---------------------------
async function downloadToTemp(url, suggestedName = 'media') {
  const extFromUrl = (() => {
    try { return path.extname(new URL(url).pathname) || ''; } catch { return ''; }
  })();
  const extFromUrl = (() => { try { return path.extname(new URL(url).pathname) || ''; } catch { return ''; }})();
  const tmpFile = tmp.fileSync({ postfix: extFromUrl || '' });
  const writer = fs.createWriteStream(tmpFile.name);
  const resp = await axios.get(url, { responseType: 'stream' });
  resp.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  return tmpFile; // possui .name e .removeCallback()
  return tmpFile;
  }).then(() => tmpFile);
}

async function transcodeToOpusOgg(inputPath) {
  const outPath = path.join(os.tmpdir(), `voice_${Date.now()}.ogg`);
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec('libopus')
      .audioBitrate('32k')
      .format('ogg')
      .audioChannels(1).audioFrequency(16000).audioCodec('libopus')
      .audioBitrate('32k').format('ogg')
      .on('error', reject)
      .on('end', resolve)
      .save(outPath);
  });
  try {
    const size = fs.statSync(outPath).size;
    console.log('[FFMPEG] OGG gerado com', size, 'bytes');
  } catch (e) {
    console.warn('[FFMPEG] Não foi possível ler tamanho do OGG:', e?.message || e);
  }
  } catch (e) { console.warn('[FFMPEG] stat OGG:', e?.message || e); }
  return outPath;
}
@ -151,61 +136,48 @@ async function transcodeToOpusOgg(inputPath) {
function guessIsAudio(mediaType, fileName) {
  const mt = String(mediaType || '').toLowerCase();
  const ext = (fileName ? path.extname(fileName) : '').toLowerCase();
  return (
    mt.startsWith('audio/') ||
    ['.webm', '.ogg', '.m4a', '.mp3', '.wav', '.aac', '.amr', '.3gp'].includes(ext)
  );
  return mt.startsWith('audio/') || ['.webm','.ogg','.m4a','.mp3','.wav','.aac','.amr','.3gp'].includes(ext);
}

function makeWaId(toRaw) {
  if (String(toRaw).includes('@')) return String(toRaw); // mantém @g.us quando vier grupo
  const digits = String(toRaw).replace(/\D/g, '');
  return `${digits}@c.us`;
}
function makeWaId(toRaw) { if (String(toRaw).includes('@')) return String(toRaw); return `${String(toRaw).replace(/\D/g,'')}@c.us`; }

// Retry para envios de mídia (mitiga "Evaluation failed" intermitente)
async function sendWithRetry(id, payload, opts = {}, retries = 1) {
async function safePush(ref, data) { try { await ref.push(data); } catch (e) { console.warn('[WARN] RTDB push falhou:', e?.message || e); } }
async function safeUpload(bucket, localPath, remotePath, contentType) {
  try {
    return await client.sendMessage(id, payload, opts);
  } catch (err) {
    if (retries > 0) {
      console.warn('[sendWithRetry] falha, tentando novamente em 800ms:', err?.message || err);
      await new Promise(r => setTimeout(r, 800));
      return sendWithRetry(id, payload, opts, retries - 1);
    try {
        return await client.sendMessage(id, payload, opts);
    } catch (err) {
        if (retries > 0) {
        console.warn('[sendWithRetry] falha, tentando novamente em 800ms:', err?.message || err);
        await new Promise(r => setTimeout(r, 800));
        return sendWithRetry(id, payload, opts, retries - 1);
        }
        throw err;
    }
    throw err;
    await bucket.upload(localPath, { destination: remotePath, metadata: { contentType } });
    const file = bucket.file(remotePath);
    const [signedUrl] = await file.getSignedUrl({ action:'read', expires: '03-09-2491' });
    return signedUrl;
  } catch (e) {
    console.warn('[WARN] upload falhou:', e?.message || e);
    return null;
  }
}

// ---------------------- Eventos WhatsApp ------------------------------
// -------- Idempotência simples por janela de 2 minutos (evita duplicar no retry) -----
const recentSends = new Map();
function isDuplicateKey(key) {
  const now = Date.now();
  const prev = recentSends.get(key);
  if (prev && now - prev < 120000) return true;
  recentSends.set(key, now);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [k,v] of recentSends) if (now - v > 120000) recentSends.delete(k);
}, 60000);
// ---------------------- Eventos de conexão ---------------------------
client.on('qr', async (qr) => {
  try {
    console.log('QR Code recebido, gerando imagem...');
    qrCodeDataUrl = await qrcode.toDataURL(qr);
    clientStatus = 'Aguardando escaneamento do QR Code.';
  } catch (e) { console.error('Erro ao gerar QR Code:', e); }
});

// ---------------------- Recebimento e persistência --------------------
client.on('ready', () => { console.log('Cliente do WhatsApp está pronto e conectado!'); qrCodeDataUrl = ''; clientStatus = 'Conectado'; });
client.on('auth_failure', (msg) => { console.error('Falha de autenticação:', msg); clientStatus = 'Falha de autenticação'; });
client.on('disconnected', (reason) => {
  console.warn('WhatsApp desconectado:', reason);
  clientStatus = `Desconectado: ${reason || 'motivo não informado'}`;
  client.initialize().catch((err) => console.error('Erro ao reinicializar cliente:', err));
});

client.initialize().catch((err) => { console.error('ERRO AO INICIALIZAR O CLIENTE:', err); clientStatus = `Erro na inicialização: ${err.message}`; });

// ======================================================================
// LÓGICA DE RECEBIMENTO DE MENSAGEM COM LOGS DE DEPURAÇÃO
// ======================================================================
client.on('message', async (message) => {
  console.log(`Mensagem recebida de: ${message.from}`);
  console.log(`[RECEBIMENTO] Nova mensagem recebida de: ${message.from}`);
  const sanitizedFrom = message.from.split('@')[0];
  const chatRef = db.ref(`erp/whatsapp/conversas/${sanitizedFrom}`);

@ -214,262 +186,173 @@ client.on('message', async (message) => {
    timestamp: message.timestamp * 1000,
  };

  let messageData = { fromMe: false, timestamp: message.timestamp * 1000 };
  try {
    if (message.hasMedia) {
      console.log('Mensagem com mídia detectada. Baixando...');
      console.log('[RECEBIMENTO] Mensagem com mídia detectada. Iniciando download...');
      const media = await message.downloadMedia();

      // LOG 1: Verificar se a mídia foi baixada
      if (media) {
        console.log('[RECEBIMENTO] Download da mídia concluído. Detalhes:', {
            mimetype: media.mimetype,
            filename: media.filename,
            size: media.size
        });

        const bucket = admin.storage().bucket();
        const filenameOnly = media.filename || 'file';
        // Garante um nome de arquivo, mesmo que venha nulo
        const filenameOnly = media.filename || `audio_${Date.now()}.ogg`;
        const pathInBucket = `erp/whatsapp/${sanitizedFrom}/${Date.now()}_${filenameOnly}`;
        const file = bucket.file(pathInBucket);

        console.log(`[RECEBIMENTO] Preparando para salvar no Storage em: ${pathInBucket}`);
        const buffer = Buffer.from(media.data, 'base64');
        await file.save(buffer, { metadata: { contentType: media.mimetype } });

        // LOG 2: Verificar se salvou no Storage
        console.log('[RECEBIMENTO] Mídia salva no Storage com sucesso.');

        const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });

        const [signedUrl] = await file.getSignedUrl({ action:'read', expires: '03-09-2491' });
        // LOG 3: Verificar se a URL foi gerada
        console.log('[RECEBIMENTO] URL de download gerada:', signedUrl ? 'Sim' : 'Não, FALHOU AQUI!');
        
        messageData.type = (media.mimetype && media.mimetype.split('/')[0]) || 'file';
        messageData.url = signedUrl;
        messageData.filename = filenameOnly;
        messageData.body = message.body || ''; // Legenda da mídia
      } else {
        console.warn('[RECEBIMENTO AVISO] message.hasMedia era true, mas downloadMedia() retornou nulo.');
        // Se o download falhar, salvamos como uma mensagem de texto com um aviso
        messageData.type = 'text';
        messageData.body = `(Mídia recebida não pôde ser processada: ${message.type})`;
      }
    } else {
      messageData.type = 'text';
      messageData.body = message.body || '';
    }

    await chatRef.push(messageData);
    console.log(`Mensagem de ${sanitizedFrom} salva no Firebase.`);
  } catch (error) {
  }
});
    console.log(`[RECEBIMENTO] Mensagem de ${sanitizedFrom} salva no Firebase com sucesso.`);

// ---------------------- Eventos de conexão ---------------------------
client.on('qr', async (qr) => {
  try {
    console.log('QR Code recebido, gerando imagem...');
    qrCodeDataUrl = await qrcode.toDataURL(qr);
    clientStatus = 'Aguardando escaneamento do QR Code.';
  } catch (e) {
    console.error('Erro ao gerar QR Code:', e);
  } catch (error) {
    console.error('[RECEBIMENTO ERRO FATAL] Ocorreu um erro grave ao processar a mensagem recebida:', error);
    // Mesmo em caso de erro, tentamos salvar um log no chat para não perder a mensagem
    try {
        await chatRef.push({
            fromMe: false,
            timestamp: Date.now(),
            type: 'text',
            body: `(Ocorreu um erro ao processar uma mídia recebida. Error: ${error.message})`
        });
    } catch (pushError) {
        console.error('[RECEBIMENTO ERRO FATAL] Não foi possível nem salvar o erro no chat.', pushError);
    }
  }
});

client.on('ready', () => {
  console.log('Cliente do WhatsApp está pronto e conectado!');
  qrCodeDataUrl = '';
  clientStatus = 'Conectado';
  } catch (e) { console.error('Erro ao gerar QR Code:', e); }
});

client.on('auth_failure', (msg) => {
  console.error('Falha de autenticação:', msg);
  clientStatus = 'Falha de autenticação';
});

client.on('ready', () => { console.log('Cliente do WhatsApp está pronto e conectado!'); qrCodeDataUrl = ''; clientStatus = 'Conectado'; });
client.on('auth_failure', (msg) => { console.error('Falha de autenticação:', msg); clientStatus = 'Falha de autenticação'; });
client.on('disconnected', (reason) => {
  console.warn('WhatsApp desconectado:', reason);
  clientStatus = `Desconectado: ${reason || 'motivo não informado'}`;
  client.initialize().catch((err) => {
    console.error('Erro ao reinicializar cliente:', err);
  });
});

client.initialize().catch((err) => {
  console.error('ERRO AO INICIALIZAR O CLIENTE:', err);
  clientStatus = `Erro na inicialização: ${err.message}`;
  client.initialize().catch((err) => console.error('Erro ao reinicializar cliente:', err));
});
client.initialize().catch((err) => { console.error('ERRO AO INICIALIZAR O CLIENTE:', err); clientStatus = `Erro na inicialização: ${err.message}`; });

// ---------------------- Rotas API -------------------------------------
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.send(`Status do Servidor: ${clientStatus}`);
});

app.get('/healthz', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, status: clientStatus });
});

app.get('/qrcode', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.send({ qrUrl: qrCodeDataUrl, status: clientStatus });
});
app.get('/', (req, res) => { res.set('Cache-Control','no-store'); res.send(`Status do Servidor: ${clientStatus}`); });
app.get('/qrcode', (req, res) => { res.set('Cache-Control','no-store'); res.send({ qrUrl: qrCodeDataUrl, status: clientStatus }); });
// Health check que não depende do WhatsApp
app.get('/qrcode', (req, res) => { res.set('Cache-Control','no-store'); res.json({ qrUrl: qrCodeDataUrl, status: clientStatus }); });
app.get('/healthz', (req, res) => { res.set('Cache-Control','no-store'); res.json({ ok:true, status: clientStatus, ts: Date.now() }); });

// ======================================================================
// /send-message — texto, mídia e VOZ (OGG/Opus 16k) com base64 + fallbacks
// + CORS, idempotência e retry de mídia
// /send-message — Rota de envio
// ======================================================================
const SEEN_TTL_MS = 30_000;
const recentRequests = new Map();

app.post('/send-message', async (req, res) => {
  const { to, body, mediaUrl, mediaType, fileName, clientMsgId } = req.body;
  const { to, body, mediaUrl, mediaType, fileName } = req.body;
  if (!to) return res.status(400).json({ status:'error', message:'O número de destino (to) é obrigatório.' });

  if (!to) {
    return res.status(400).json({ status: 'error', message: 'O número de destino (to) é obrigatório.' });
  }
  if (!to) return res.status(400).json({ status: 'error', message: 'O número de destino (to) é obrigatório.' });

  // Monta o WA ID corretamente (mantém @g.us quando vier grupo)
  const whatsappId = makeWaId(to);
  const sanitizedTo = whatsappId.split('@')[0];
  const chatRef = db.ref(`erp/whatsapp/conversas/${sanitizedTo}`);

  // --- Idempotência: evita duplicatas em janelas curtas ---
  const dedupeKey = clientMsgId
    ? `id:${clientMsgId}`
    : `auto:${sanitizedTo}|${mediaUrl || ''}|${body || ''}|${fileName || ''}`;
  // --- Idempotência ---
  const dedupeKey = clientMsgId ? `id:${clientMsgId}` : `auto:${sanitizedTo}|${mediaUrl || ''}|${body || ''}|${fileName || ''}`;
  const now = Date.now();
  const prev = recentRequests.get(dedupeKey);
  if (prev && (now - prev) < SEEN_TTL_MS) {
    return res.json({ status: 'success', message: 'Duplicata ignorada (idempotência).', stage: 'dedupe_skip' });
  // Idempotência simples: a mesma mídia (mesmo URL) para o mesmo destinatário em 2min não reenvia
  const dedupeKey = mediaUrl ? `${sanitizedTo}|${mediaUrl}` : null;
  if (dedupeKey && isDuplicateKey(dedupeKey)) {
    console.warn('[DEDUPE] Ignorando retry de mídia já enviada:', dedupeKey);
    return res.json({ status:'success', message:'Pedido duplicado ignorado.' });
  }
  recentRequests.set(dedupeKey, now);
  setTimeout(() => recentRequests.delete(dedupeKey), SEEN_TTL_MS);

  // Pré-checagem: número registrado (se falhar, seguimos mesmo assim)
  // Checa se o número existe no WhatsApp (quando disponível)
  try {
    const registered = await client.isRegisteredUser(whatsappId);
    if (!registered) {
      return res.status(400).json({
        status: 'error',
        message: 'O número informado não é registrado no WhatsApp ou está inválido.',
      });
      return res.status(400).json({ status:'error', message:'O número informado não é registrado no WhatsApp ou está inválido.' });
      return res.status(400).json({ status: 'error', message: 'O número informado não é registrado no WhatsApp ou está inválido.' });
    }
  } catch (e) {
    console.warn('[WARN] isRegisteredUser falhou, prosseguindo mesmo assim:', e?.message || e);
  }
  } catch (e) { console.warn('[WARN] isRegisteredUser falhou, prosseguindo:', e?.message || e); }

  const reply = (obj) => res.status(obj.http || 200).json(obj);
  // Helper de resposta sem quebrar após o envio ao WhatsApp
  const ok = (message, extra={}) => res.json({ status:'success', message, ...extra });
  const fail = (message, http=500, extra={}) => res.status(http).json({ status:'error', message, ...extra });

  try {
    // ---------------- MÍDIA TEM PRIORIDADE ----------------
    // ======== MÍDIA TEM PRIORIDADE ========
    if (mediaUrl) {
      const mt = String(mediaType || '').toLowerCase();
      console.log(`[SEND] start | to=${sanitizedTo} | mediaType=${mt} | file=${fileName || ''}`);

      // ================= ÁUDIO COMO VOZ =================
      // ---------- ÁUDIO → VOZ ----------
      if (guessIsAudio(mediaType, fileName)) {
        let tempIn, oggPath;
        let tempIn, oggPath, voiceFileName, base64;
        try {
          tempIn = await downloadToTemp(mediaUrl, fileName || 'audio');
          console.log('[VOZ] Download ok:', tempIn.name);
        } catch (e) {
          console.error('[ERROR] download:', e?.message || e);
          // Fallback: enviar ORIGINAL como documento
          try {
            const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true, filename: fileName || undefined });
            await sendWithRetry(whatsappId, media, { sendMediaAsDocument: true });
            await chatRef.push({
              fromMe: true, timestamp: Date.now(), type: 'file',
              body: fileName || 'Anexo', url: mediaUrl, filename: fileName || 'Anexo'
            });
            return reply({ status: 'success', message: 'Anexo enviado (fallback: download falhou).', stage: 'fallback_doc_download' });
          } catch (e2) {
            console.error('[ERROR] fallback doc após download fail:', e2?.message || e2);
            return reply({ http: 500, status: 'error', message: 'Falha no download e no fallback como documento.' });
          }
            console.error('[ERROR] download:', e?.message || e);
            // Fallback
            try {
              const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true, filename: fileName || undefined });
              await sendWithRetry(whatsappId, media, { sendMediaAsDocument: true });
              await chatRef.push({ fromMe: true, timestamp: Date.now(), type: 'file', body: fileName || 'Anexo', url: mediaUrl, filename: fileName || 'Anexo' });
              return reply({ status: 'success', message: 'Anexo enviado (fallback: download falhou).', stage: 'fallback_doc_download' });
            } catch (e2) {
              console.error('[ERROR] fallback doc após download fail:', e2?.message || e2);
              return reply({ http: 500, status: 'error', message: 'Falha no download e no fallback como documento.' });
            }
        }

        try {
          console.log('[VOZ] download ok:', tempIn.name);
          oggPath = await transcodeToOpusOgg(tempIn.name);
          const size = fs.statSync(oggPath).size;
          console.log('[VOZ] OGG ok | size=', size);
          if (!size) throw new Error('Arquivo OGG 0 bytes');
          voiceFileName = (fileName ? path.parse(fileName).name : 'audio') + '.ogg';
          base64 = fs.readFileSync(oggPath).toString('base64');
        } catch (e) {
          console.error('[ERROR] transcode:', e?.message || e);
          // Fallback: enviar ORIGINAL como documento
          console.error('[ERROR] download/transcode:', e?.message || e);
          // fallback: enviar ORIGINAL como DOCUMENTO (sem encerrar com erro)
          // Fallback
          try {
            const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true, filename: fileName || undefined });
            await sendWithRetry(whatsappId, media, { sendMediaAsDocument: true });
            await chatRef.push({
              fromMe: true, timestamp: Date.now(), type: 'file',
              body: fileName || 'Anexo', url: mediaUrl, filename: fileName || 'Anexo'
            const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime:true, filename:fileName || undefined });
            await client.sendMessage(whatsappId, media, { sendMediaAsDocument:true });
            await safePush(chatRef, {
              fromMe:true, timestamp:Date.now(), type:'file',
              body:fileName || 'Anexo', url:mediaUrl, filename:fileName || 'Anexo'
            });
            try { tempIn.removeCallback(); } catch {}
            await chatRef.push({ fromMe: true, timestamp: Date.now(), type: 'file', body: fileName || 'Anexo', url: mediaUrl, filename: fileName || 'Anexo' });
            return reply({ status: 'success', message: 'Anexo enviado (fallback: transcode falhou).', stage: 'fallback_doc_transcode' });
            return ok('Anexo enviado (fallback por falha no download/transcode).');
          } catch (e2) {
            console.error('[ERROR] fallback doc após transcode fail:', e2?.message || e2);
            try { tempIn.removeCallback(); } catch {}
            return reply({ http: 500, status: 'error', message: 'Falha na transcodificação e no fallback como documento.' });
            console.error('[ERROR] fallback doc após falha no transcode:', e2?.message || e2);
            return fail('Falha no download/transcode e no fallback como documento.');
          }
        } finally {
          try { tempIn?.removeCallback?.(); } catch {}
            try { tempIn?.removeCallback?.(); } catch {}
        }

        // Envia VOZ (base64)
        // Tenta VOICE
        let sentAsVoice = false;
        // Tenta enviar como VOZ
        try {
          const oggBuf = fs.readFileSync(oggPath);
          const base64 = oggBuf.toString('base64');
          const base64 = fs.readFileSync(oggPath, { encoding: 'base64' });
          const voiceFileName = (fileName ? path.parse(fileName).name : 'audio') + '.ogg';
          const voiceMedia = new MessageMedia('audio/ogg; codecs=opus', base64, voiceFileName);
          await sendWithRetry(whatsappId, voiceMedia, { sendAudioAsVoice: true });

          // Sobe no Storage e persiste no RTDB
          const bucket = admin.storage().bucket();
          const remotePath = `erp/whatsapp/${sanitizedTo}/${Date.now()}_${voiceFileName}`;
          await bucket.upload(oggPath, { destination: remotePath, metadata: { contentType: 'audio/ogg; codecs=opus' } });
          const file = bucket.file(remotePath);
          const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });

          await chatRef.push({
            fromMe: true, timestamp: Date.now(), type: 'audio',
            body: voiceFileName, url: signedUrl, filename: voiceFileName, voiceNote: true
          });

          try { fs.unlinkSync(oggPath); } catch {}
          try { tempIn.removeCallback(); } catch {}
          const [signedUrl] = await bucket.file(remotePath).getSignedUrl({ action: 'read', expires: '03-09-2491' });

          await chatRef.push({ fromMe: true, timestamp: Date.now(), type: 'audio', body: voiceFileName, url: signedUrl, filename: voiceFileName, voiceNote: true });
          return reply({ status: 'success', message: 'Áudio enviado como VOZ.', stage: 'voice_sent' });
          await client.sendMessage(whatsappId, voiceMedia, { sendAudioAsVoice: true });
          sentAsVoice = true;
        } catch (e) {
          console.warn('[WARN] send voice falhou:', e?.message || e);
          // Fallback: OGG como DOCUMENTO
          console.warn('[WARN] send voice falhou, tentando documento:', e?.message || e);
          // Fallback: OGG como DOCUMENTO
          try {
            const oggBuf = fs.readFileSync(oggPath);
            const base64 = oggBuf.toString('base64');
            const base64 = fs.readFileSync(oggPath, { encoding: 'base64' });
            const voiceFileName = (fileName ? path.parse(fileName).name : 'audio') + '.ogg';
            const docMedia = new MessageMedia('audio/ogg; codecs=opus', base64, voiceFileName);
            await sendWithRetry(whatsappId, docMedia, { sendMediaAsDocument: true });
@ -477,131 +360,60 @@ app.post('/send-message', async (req, res) => {
            const bucket = admin.storage().bucket();
            const remotePath = `erp/whatsapp/${sanitizedTo}/${Date.now()}_${voiceFileName}`;
            await bucket.upload(oggPath, { destination: remotePath, metadata: { contentType: 'audio/ogg; codecs=opus' } });
            const file = bucket.file(remotePath);
            const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });

            await chatRef.push({
              fromMe: true, timestamp: Date.now(), type: 'audio',
              body: voiceFileName, url: signedUrl, filename: voiceFileName, voiceNote: false
            });

            try { fs.unlinkSync(oggPath); } catch {}
            try { tempIn.removeCallback(); } catch {}
            const [signedUrl] = await bucket.file(remotePath).getSignedUrl({ action: 'read', expires: '03-09-2491' });

            await chatRef.push({ fromMe: true, timestamp: Date.now(), type: 'audio', body: voiceFileName, url: signedUrl, filename: voiceFileName, voiceNote: false });
            return reply({ status: 'success', message: 'Áudio enviado como DOCUMENTO (fallback).', stage: 'voice_fallback_document' });
            await client.sendMessage(whatsappId, docMedia, { sendMediaAsDocument: true });
            sentAsVoice = false;
          } catch (e2) {
            console.error('[ERROR] fallback document após send voice fail:', e2?.message || e2);
            console.error('[ERROR] fallback doc após voice falhar também:', e2?.message || e2);
            try { fs.unlinkSync(oggPath); } catch {}
            try { tempIn.removeCallback(); } catch {}
            return reply({ http: 500, status: 'error', message: 'Falha ao enviar voz e fallback documento.' });
            return fail('Falha ao enviar voz e fallback documento.');
          }
        } finally {
            try { fs.unlinkSync(oggPath); } catch {}
        }

        // Persistência (não fatal)
        const bucket = admin.storage().bucket();
        const remotePath = `erp/whatsapp/${sanitizedTo}/${Date.now()}_${voiceFileName}`;
        const signedUrl = await safeUpload(bucket, oggPath, remotePath, 'audio/ogg; codecs=opus');
        await safePush(chatRef, {
          fromMe:true, timestamp:Date.now(), type:'audio',
          body:voiceFileName, url:signedUrl, filename:voiceFileName, voiceNote:sentAsVoice
        });

        try { fs.unlinkSync(oggPath); } catch {}

        return ok(sentAsVoice ? 'Áudio enviado como VOZ.' : 'Áudio enviado como DOCUMENTO (fallback).');
      }

      // ================= OUTRA MÍDIA (imagem/vídeo/doc) =================
      console.log('[STAGE] non-audio media');
      // ---------- NÃO ÁUDIO → mídia normal com caption (com fallback p/ documento) ----------
      // ---------- NÃO ÁUDIO → mídia normal com caption ----------
      let media;
      try {
        media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true, filename: fileName || undefined });
        media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime:true, filename:fileName || undefined });
      } catch (e) {
        console.error('[ERROR] fromUrl media:', e?.message || e);
        return reply({ http: 500, status: 'error', message: 'Falha ao baixar/empacotar a mídia.', stage: 'fromUrl_fail' });
        return fail('Falha ao baixar/empacotar a mídia.');
      }

      const opts = {};
      if (body) opts.caption = body;
      if (req.body.body) opts.caption = req.body.body;

      const mimeToCheck = (String(mediaType || media?.mimetype || '')).toLowerCase();
      let sent = false;
      const sendOnce = async (asDocument=false) => {
        const o = { ...opts };
        if (asDocument) o.sendMediaAsDocument = true;
        await client.sendMessage(whatsappId, media, o);
      };

      // 1ª tentativa: normal (com caption)
      
      try {
        await sendWithRetry(whatsappId, media, opts);
        sent = true;
      } catch (err) {
        console.error('[ERROR] sendMessage media normal:', err?.message || err);
      }

      // Se falhou OU mimetype suspeito, tenta como documento
      if (!sent || !mimeToCheck || /octet-stream/.test(mimeToCheck) || /audio\/webm|x-webm/.test(mimeToCheck)) {
        console.warn('[WARN] tentando enviar como DOCUMENTO… mimetype=', mimeToCheck);
        await sendOnce(false);
      } catch (e) {
        console.error('[ERROR] send media normal, tentando documento:', e?.message || e);
        try {
          await sendWithRetry(whatsappId, media, { ...opts, sendMediaAsDocument: true });
          sent = true;
        } catch (err) {
          console.error('[ERROR] sendMessage media documento:', err?.message || err);
          await sendOnce(true);
        } catch (e2) {
          console.error('[ERROR] send media como documento também falhou:', e2?.message || e2);
          return fail('Falha ao enviar a mídia.');
          return reply({ http: 500, status: 'error', message: 'Falha ao enviar a mídia.', stage: 'send_media_fail_all' });
        }
      }

      if (!sent) {
        return reply({ http: 500, status: 'error', message: 'Falha ao enviar a mídia.', stage: 'send_media_fail' });
      }

      await chatRef.push({
        fromMe: true, timestamp: Date.now(),
        type: (mimeToCheck.split('/')[0] || 'file'),
        body: body || (fileName || 'Anexo'), url: mediaUrl, filename: fileName || 'Anexo'
      await safePush(chatRef, {
        fromMe:true, timestamp:Date.now(),
        type:(mimeToCheck.split('/')[0] || 'file'),
        body:req.body.body || (fileName || 'Anexo'),
        url:mediaUrl, filename:fileName || 'Anexo'
      });

      const mimeToCheck = (String(mediaType || media?.mimetype || '')).toLowerCase();
      await chatRef.push({ fromMe: true, timestamp: Date.now(), type: (mimeToCheck.split('/')[0] || 'file'), body: body || (fileName || 'Anexo'), url: mediaUrl, filename: fileName || 'Anexo' });
      return reply({ status: 'success', message: 'Mídia enviada com sucesso.', stage: 'media_sent' });
      return ok('Mídia enviada com sucesso.');
    }

    // ---------------- TEXTO SIMPLES ----------------
    // ======== TEXTO ========
    if (body) {
      await client.sendMessage(whatsappId, body);
      await chatRef.push({ fromMe: true, timestamp: Date.now(), type: 'text', body, url: null, filename: null });
      return reply({ status: 'success', message: 'Texto enviado com sucesso.', stage: 'text_sent' });
      await safePush(chatRef, { fromMe:true, timestamp:Date.now(), type:'text', body, url:null, filename:null });
      return ok('Texto enviado com sucesso.');
    }

    return reply({ http: 400, status: 'error', message: 'Envie uma mensagem (body) ou uma mídia (mediaUrl).', stage: 'invalid_request' });
    return fail('Envie uma mensagem (body) ou uma mídia (mediaUrl).', 400);

  } catch (error) {
    console.error('[FATAL] /send-message:', error?.message || error);
    return reply({ http: 500, status: 'error', message: 'Falha ao processar a mensagem no servidor.', stage: 'fatal' });
    return fail('Falha ao processar a mensagem no servidor.');
  }
});

@ -612,7 +424,6 @@ app.post('/send-message', async (req, res) => {
app.post('/verificar-vencimentos', async (req, res) => {
    console.log('[CRON] Iniciando verificação de vencimentos...');
    
    // Pega a data de amanhã no formato YYYY-MM-DD
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const vencimentoAmanha = amanha.toISOString().split('T')[0];
@ -632,23 +443,18 @@ app.post('/verificar-vencimentos', async (req, res) => {
        for (const lancId in lancamentos) {
            const lanc = lancamentos[lancId];

            // Filtra apenas contas a RECEBER e PENDENTES
            if (lanc.tipo === 'receber' && lanc.status === 'Pendente' && lanc.vendaRelacionada) {
                // Busca a venda para pegar o ID do cliente
                const vendaSnapshot = await db.ref(`erp/vendas/${lanc.vendaRelacionada}`).once('value');
                if (!vendaSnapshot.exists()) continue;
                const venda = vendaSnapshot.val();

                // Busca o cliente para pegar o telefone
                const clienteSnapshot = await db.ref(`erp/clientes/${venda.clienteId}`).once('value');
                if (!clienteSnapshot.exists()) continue;
                const cliente = clienteSnapshot.val();
                
                if (cliente.telefone) {
                    const whatsappId = `${String(cliente.telefone).replace(/\D/g, '')}@c.us`;
                    
                    const valorFormatado = (lanc.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    const mensagem = `Olá, ${venda.clienteNome}! Passando para lembrar do seu pagamento referente à sua viagem, no valor de ${valorFormatado}, que vence amanhã. Agradecemos a sua atenção! 😊`;

                    await client.sendMessage(whatsappId, mensagem);
@ -666,85 +472,6 @@ app.post('/verificar-vencimentos', async (req, res) => {
    }
});

// ======================================================================
// LÓGICA DE RECEBIMENTO DE MENSAGEM COM LOGS DE DEPURAÇÃO
// ======================================================================
client.on('message', async (message) => {
  console.log(`[RECEBIMENTO] Nova mensagem recebida de: ${message.from}`);
  const sanitizedFrom = message.from.split('@')[0];
  const chatRef = db.ref(`erp/whatsapp/conversas/${sanitizedFrom}`);

  let messageData = {
    fromMe: false,
    timestamp: message.timestamp * 1000,
  };

  try {
    if (message.hasMedia) {
      console.log('[RECEBIMENTO] Mensagem com mídia detectada. Iniciando download...');
      const media = await message.downloadMedia();

      // LOG 1: Verificar se a mídia foi baixada
      if (media) {
        console.log('[RECEBIMENTO] Download da mídia concluído. Detalhes:', {
            mimetype: media.mimetype,
            filename: media.filename,
            size: media.size
        });

        const bucket = admin.storage().bucket();
        // Garante um nome de arquivo, mesmo que venha nulo
        const filenameOnly = media.filename || `audio_${Date.now()}.ogg`;
        const pathInBucket = `erp/whatsapp/${sanitizedFrom}/${Date.now()}_${filenameOnly}`;
        const file = bucket.file(pathInBucket);

        console.log(`[RECEBIMENTO] Preparando para salvar no Storage em: ${pathInBucket}`);
        const buffer = Buffer.from(media.data, 'base64');
        await file.save(buffer, { metadata: { contentType: media.mimetype } });

        // LOG 2: Verificar se salvou no Storage
        console.log('[RECEBIMENTO] Mídia salva no Storage com sucesso.');

        const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });

        // LOG 3: Verificar se a URL foi gerada
        console.log('[RECEBIMENTO] URL de download gerada:', signedUrl ? 'Sim' : 'Não, FALHOU AQUI!');
        
        messageData.type = (media.mimetype && media.mimetype.split('/')[0]) || 'file';
        messageData.url = signedUrl;
        messageData.filename = filenameOnly;
        messageData.body = message.body || ''; // Legenda da mídia
      } else {
        console.warn('[RECEBIMENTO AVISO] message.hasMedia era true, mas downloadMedia() retornou nulo.');
        // Se o download falhar, salvamos como uma mensagem de texto com um aviso
        messageData.type = 'text';
        messageData.body = `(Mídia recebida não pôde ser processada: ${message.type})`;
      }
    } else {
      messageData.type = 'text';
      messageData.body = message.body || '';
    }

    await chatRef.push(messageData);
    console.log(`[RECEBIMENTO] Mensagem de ${sanitizedFrom} salva no Firebase com sucesso.`);

  } catch (error) {
    console.error('[RECEBIMENTO ERRO FATAL] Ocorreu um erro grave ao processar a mensagem recebida:', error);
    // Mesmo em caso de erro, tentamos salvar um log no chat para não perder a mensagem
    try {
        await chatRef.push({
            fromMe: false,
            timestamp: Date.now(),
            type: 'text',
            body: `(Ocorreu um erro ao processar uma mídia recebida. Error: ${error.message})`
        });
    } catch (pushError) {
        console.error('[RECEBIMENTO ERRO FATAL] Não foi possível nem salvar o erro no chat.', pushError);
    }
  }
});


// ---------------------- Server ---------------------------------------
app.listen(port, () => {
  console.log(`Servidor iniciado e escutando na porta ${port}`);