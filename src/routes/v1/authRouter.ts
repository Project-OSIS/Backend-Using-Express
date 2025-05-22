import { Router } from 'express'
import { getUser, login,register,logout } from '../../controller/Auth/authController'
import { checkJwt } from '../../utils/checkJwt'

const router = Router()

router.get('/me', [checkJwt ,getUser])
router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)



export default router
