import { Router } from 'express'
import RouteAuth from './authRouter'




const router = Router()

router.use('/auth', RouteAuth)


export default router

