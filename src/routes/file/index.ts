import Router from 'koa-router';
import multer from '@koa/multer';
import {
  appendFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { success, NotFoundError } from '../../utils/helper.js';

const uploadRoot = join(process.cwd(), 'public', 'uploads');
const chunkRoot = join(process.cwd(), 'public', 'chunks');
const maxUploadSize = 10 * 1024 * 1024;

if (!existsSync(uploadRoot)) {
  mkdirSync(uploadRoot, { recursive: true });
}

if (!existsSync(chunkRoot)) {
  mkdirSync(chunkRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${randomUUID()}${extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadSize,
  },
});
const chunkUpload = multer({ storage: multer.memoryStorage() });
const router = new Router();

function normalizeHash(hash: unknown) {
  return String(hash || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

function getExtension(fileName: unknown, mimeType?: string) {
  const nameExt = extname(String(fileName || ''));
  if (nameExt) return nameExt;

  switch (mimeType) {
    case 'video/mp4':
      return '.mp4';
    case 'video/webm':
      return '.webm';
    case 'video/ogg':
      return '.ogv';
    case 'image/png':
      return '.png';
    case 'image/jpeg':
      return '.jpg';
    case 'image/webp':
      return '.webp';
    default:
      return '';
  }
}

const uploadSingleFile = upload.single('file');

router.post('/file/upload/:moduleCode', async (ctx, next) => {
  try {
    await uploadSingleFile(ctx as any, next);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'LIMIT_FILE_SIZE') {
      ctx.status = 400;
      ctx.body = { code: 400, message: '上传图片不能超过10MB', msg: '上传图片不能超过10MB', data: null };
      return;
    }

    throw error;
  }
}, async (ctx) => {
  const file = (ctx as any).file;

  if (!file) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请选择上传文件', msg: '请选择上传文件', data: null };
    return;
  }

  ctx.body = success(`/bear-spark/uploads/${file.filename}`);
});

router.post('/chunk', chunkUpload.single('file'), async (ctx) => {
  const file = ctx.file;
  const body = ctx.request.body as Record<string, unknown>;
  const fileHash = normalizeHash(body.fileHash);
  const chunkIndex = Number(body.chunkIndex);
  const totalChunks = Number(body.totalChunks);

  if (!file || !fileHash || !Number.isInteger(chunkIndex) || !Number.isInteger(totalChunks)) {
    ctx.status = 400;
    ctx.body = { success: false, message: '分片参数不完整' };
    return;
  }

  const chunkDir = join(chunkRoot, fileHash);
  if (!existsSync(chunkDir)) {
    mkdirSync(chunkDir, { recursive: true });
  }

  writeFileSync(join(chunkDir, String(chunkIndex)), file.buffer);

  const isComplete = Array.from({ length: totalChunks }).every((_, index) =>
    existsSync(join(chunkDir, String(index)))
  );

  if (!isComplete) {
    ctx.body = { success: true, merged: false };
    return;
  }

  const extension = getExtension(body.fileName, file.mimetype);
  const filename = `${fileHash}${extension}`;
  const outputPath = join(uploadRoot, filename);

  if (existsSync(outputPath)) {
    rmSync(outputPath, { force: true });
  }

  for (let index = 0; index < totalChunks; index += 1) {
    appendFileSync(outputPath, readFileSync(join(chunkDir, String(index))));
  }

  rmSync(chunkDir, { recursive: true, force: true });

  ctx.body = {
    success: true,
    merged: true,
    data: `/bear-spark/uploads/${filename}`,
  };
});

router.get('/uploads/:filename', async (ctx) => {
  const filename = ctx.params.filename;
  if (!filename) {
    throw new NotFoundError('文件不存在');
  }

  const filePath = join(uploadRoot, filename);

  if (!existsSync(filePath)) {
    throw new NotFoundError('文件不存在');
  }

  ctx.body = createReadStream(filePath);
});

export { router as fileRouter };
