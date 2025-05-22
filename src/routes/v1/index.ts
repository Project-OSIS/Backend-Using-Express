import { Router } from 'express'
import RouteAuth from './authRouter'
import RouteStructure from './structureRouter'
import RouteProker from './prokerRouter'
import RouteUser from './userManagementRouter'







const router = Router()

router.use('/auth', RouteAuth)
router.use('/structure', RouteStructure)
router.use('/proker', RouteProker)
router.use('/user', RouteUser)





export default router

