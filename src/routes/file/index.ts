import Router from 'koa-router';
import multer from '@koa/multer';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { success, NotFoundError } from '../../utils/helper.js';

const uploadRoot = join(process.cwd(), 'public', 'uploads');

if (!existsSync(uploadRoot)) {
  mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${randomUUID()}${extname(file.originalname)}`);
  },
});

const upload = multer({ storage });
const router = new Router();

router.post('/file/upload/:moduleCode', upload.single('file'), async (ctx) => {
  const file = ctx.file;

  if (!file) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请选择上传文件', msg: '请选择上传文件', data: null };
    return;
  }

  ctx.body = success(`/bear-spark/uploads/${file.filename}`);
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
