import Router from 'koa-router';
import { success } from '../../utils/helper.js';

const router = new Router();

const emojiNames = [
  'grinning-face',
  'face-with-tears-of-joy',
  'red-heart',
  'thumbs-up',
  'thinking-face',
  'pleading-face',
  'partying-face',
  'smiling-face-with-heart-eyes',
  'face-blowing-a-kiss',
  'folded-hands',
  'hundred-points',
];

router.get('/happening/emojiList', async (ctx) => {
  ctx.body = success({
    emojiUrlList: emojiNames.map((name) => `/imgs/emojis/${name}.png`),
  });
});

export { router as emojiRouter };
