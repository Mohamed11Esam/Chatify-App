import Router from 'express'
import { getAllContacts, getChatParteners, getMessageByUserId, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import arcjetProtection from '../middleware/arcjet.middleware.js';

const router = Router();   

router.use(arcjetProtection,protectRoute)
router.get('/contact',getAllContacts);
router.get('/chats',getChatParteners);
router.get('/:id',getMessageByUserId)
router.post('/send/:id',sendMessage)
export default router;