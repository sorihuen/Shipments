import { Router } from 'express';
import { AuthController } from '../controller/AuthController';


const router = Router();

// Usar bind para vincular el contexto del método estático
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));


export default router;
